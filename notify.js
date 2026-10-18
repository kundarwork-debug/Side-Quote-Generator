/* =====================================================================
   APML download alerts (Telegram)
   Sends a short Telegram message whenever a file is downloaded (a PDF made in the
   editor, or a file taken from the Drive or the Gallery) and when someone opens the
   portal. The Worker adds the live numbers to every message: people online now (the same
   count the home page shows), total PDFs generated and total media downloaded.

   It also shows announcements: a message sent to the Telegram group with /announce is pinned in
   the floating avatar's speech bubble on every page, and stays there until it expires (12 hours
   by default) or /cancel is sent.

   The message goes to your Cloudflare Worker (/notify), which holds the bot token
   as a secret and talks to Telegram. No token or chat id is ever in a web page.

   Pages call:  APMNotify.send({ type: 'drive', title: '...', file: '...', folder: '...' })
   It never gets in the way: any problem here is ignored and the download carries on.
   ===================================================================== */
(function () {
  'use strict';

  // ---------------- settings ----------------
  var ENABLED = { pdf: true, drive: true, gallery: true, visit: true };   // switch a kind off with false

  // "Someone is online": one alert per device, then quiet for this many hours, however many pages they open
  var VISIT = { cooldownHours: 0.5, delayMs: 1500 };

  // Announcements: pinned in the floating avatar. The page asks your Worker whether one is live.
  var ANNOUNCE = {
    enabled: true,
    url: 'https://apml-drive-api.kundar-work.workers.dev/announcement',
    pollSeconds: 60        // how often a visible page checks for a new or cancelled announcement
  };

  // Limits that keep us well inside Telegram's rules (about 1 message a second per chat and
  // 20 a minute in a group). A quick burst of downloads becomes ONE summary message.
  var TELEGRAM = {
    url: 'https://apml-drive-api.kundar-work.workers.dev/notify',
    minGapMs: 1500,        // least time between two messages from one device
    maxPerMinute: 10,      // messages per minute from one device
    maxPerDay: 150,        // messages per day from one device
    digestMax: 15          // downloads shown in one summary message
  };

  // Silence the alerts on one device (your own computer): open any page once with ?notify=off
  // and switch them back on with ?notify=on
  try {
    var q = new URLSearchParams(window.location.search).get('notify');
    if (q === 'off') localStorage.setItem('apml_notify_off', '1');
    if (q === 'on') localStorage.removeItem('apml_notify_off');
  } catch (e) {}
  function muted() {
    try { return localStorage.getItem('apml_notify_off') === '1'; } catch (e) { return false; }
  }

  // ---------------- queue ----------------
  var recent = {};
  var pending = [], timer = null, lastSent = 0, sentTimes = [], pausedUntil = 0, retries = 0;

  // The floating avatar reacts to what just happened, whether or not Telegram alerts are muted on this device:
  // a PDF was made -> happy;  a file was downloaded -> alert (bounces and glows red)
  function reactAvatar(evt) {
    try {
      var m = window.APMLMascot;
      if (!m) return;
      if (evt.type === 'pdf' && typeof m.happy === 'function') m.happy('🎉 PDF ready, nice work! 👍');
      else if ((evt.type === 'drive' || evt.type === 'gallery') && typeof m.alert === 'function') m.alert();
    } catch (e) { /* never block a download */ }
  }

  function send(evt) {
    try {
      if (evt && evt.type) reactAvatar(evt);
      if (!evt || !evt.type || ENABLED[evt.type] === false) return;
      if (muted()) return;
      var key = evt.type + '|' + (evt.file || '');
      var now = Date.now();
      if (recent[key] && now - recent[key] < DEDUPE_SECONDS * 1000) return;
      recent[key] = now;

      pending.push({
        type: evt.type,
        title: evt.title || 'File downloaded',
        file: evt.file || '',
        folder: evt.folder || (evt.details && evt.details.Folder) || ''
      });
      schedule();
    } catch (e) { /* never block a download */ }
  }

  function dayAllowed() {
    try {
      var day = new Date().toISOString().slice(0, 10);
      var s = JSON.parse(localStorage.getItem('apml_tg_count') || '{}');
      if (s.day !== day) s = { day: day, n: 0 };
      if (s.n >= TELEGRAM.maxPerDay) return false;
      s.n++;
      localStorage.setItem('apml_tg_count', JSON.stringify(s));
      return true;
    } catch (e) { return true; }
  }

  // a quiet moment sends at once; anything arriving while we wait is bundled into one message
  function schedule() {
    if (timer) return;
    var now = Date.now();
    var wait = Math.max(0, lastSent + TELEGRAM.minGapMs - now, pausedUntil - now);
    timer = setTimeout(pump, wait);
  }

  function pump() {
    timer = null;
    if (!pending.length) return;
    var now = Date.now();
    sentTimes = sentTimes.filter(function (t) { return now - t < 60000; });
    if (sentTimes.length >= TELEGRAM.maxPerMinute) {            // per-minute limit reached: wait it out
      timer = setTimeout(pump, 60000 - (now - sentTimes[0]) + 50);
      return;
    }
    if (!dayAllowed()) { pending.length = 0; return; }           // daily limit reached: stop for today
    var batch = pending.splice(0, TELEGRAM.digestMax);
    lastSent = now;
    sentTimes.push(now);
    post(batch);
    if (pending.length) schedule();
  }

  function payload(batch) {
    return JSON.stringify(batch.length === 1 ? batch[0] : { items: batch });
  }

  function post(batch) {
    try {
      // text/plain keeps this a "simple" request, so the browser needs no extra permission check first
      fetch(TELEGRAM.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: payload(batch), keepalive: true })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (j) {
            if (res.status === 429 && retries < 3) {              // told to wait: pause, then try this batch again
              retries++;
              var secs = Math.min(60, Math.max(1, Number(j.retry_after) || 5));
              pausedUntil = Date.now() + secs * 1000;
              pending = batch.concat(pending);
              schedule();
            } else if (!res.ok) {
              console.warn('Telegram alert not sent:', j.error || res.status);
            } else {
              retries = 0;
            }
          });
        })
        .catch(function (err) { console.warn('Telegram alert not sent:', err); });
    } catch (e) { /* never block a download */ }
  }

  // leaving the page with something still waiting: send it now
  window.addEventListener('pagehide', function () {
    if (pending.length && navigator.sendBeacon) {
      try {
        var batch = pending.splice(0, TELEGRAM.digestMax);
        navigator.sendBeacon(TELEGRAM.url, new Blob([payload(batch)], { type: 'text/plain;charset=UTF-8' }));
      } catch (e) {}
    }
  });

  // ---------------- someone is online ----------------
  function deviceText() {
    var ua = navigator.userAgent || '';
    var os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /CrOS/i.test(ua) ? 'ChromeOS' : /Windows/i.test(ua) ? 'Windows' : /Mac OS X/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : 'Unknown OS';
    var br = /Edg\//i.test(ua) ? 'Edge' : /OPR\//i.test(ua) ? 'Opera' : /Firefox\//i.test(ua) ? 'Firefox' : /Chrome\//i.test(ua) ? 'Chrome' : /Safari\//i.test(ua) ? 'Safari' : 'Browser';
    return os + ' / ' + br;
  }
  function pageName() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }
  // search engines, link previews and monitoring services are not people
  function looksLikeBot() {
    try {
      if (navigator.webdriver === true) return true;
      return /bot\b|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|TelegramBot|WhatsApp\/|Pingdom|UptimeRobot/i.test(navigator.userAgent || '');
    } catch (e) { return false; }
  }

  function announceVisit() {
    try {
      if (ENABLED.visit === false || muted() || looksLikeBot()) return;
      var now = Date.now();
      var last = Number(localStorage.getItem('apml_visit_last') || 0);
      if (last && now - last < VISIT.cooldownHours * 3600 * 1000) return;
      localStorage.setItem('apml_visit_last', String(now));

      // the Worker adds the rough location, the time and the live numbers
      send({ type: 'visit', title: 'Someone is online', file: pageName(), folder: deviceText() });
    } catch (e) { /* ignore */ }
  }

  // wait a moment, and until the tab is really on screen, so pre-loads and instant bounces do not count
  function startVisit() {
    setTimeout(function () {
      if (document.visibilityState === 'hidden') {
        var onShow = function () {
          if (document.visibilityState === 'visible') {
            document.removeEventListener('visibilitychange', onShow);
            announceVisit();
          }
        };
        document.addEventListener('visibilitychange', onShow);
      } else {
        announceVisit();
      }
    }, VISIT.delayMs);
  }
  // ---------------- announcements ----------------
  var annNow = null, annPinned = '', annLastPoll = 0, annTries = 0;

  function annAvatarMark() {
    var b = document.getElementById('supportAvatarBtn');
    if (b) b.classList.toggle('apml-announce', !!annNow);
  }
  // pin it in the avatar's bubble (the avatar is built a moment after the page opens, so wait for it)
  function annApply() {
    annAvatarMark();
    var m = window.APMLMascot;
    if (annNow) {
      // first time this device sees this announcement: bounce and glow red to catch the eye
      try {
        if (m && typeof m.alert === 'function' && localStorage.getItem('apml_ann_alerted') !== annNow.id) {
          localStorage.setItem('apml_ann_alerted', annNow.id);
          m.alert();
        }
      } catch (e) {}
      if (m && typeof m.pin === 'function') {
        if (annPinned !== annNow.id) { m.pin(annNow.text); annPinned = annNow.id; }
        else m.pin(annNow.text);               // harmless if it is already showing; brings it back if something replaced it
      } else if (m && typeof m.say === 'function' && annPinned !== annNow.id) {
        m.say(annNow.text, { hold: 20000 });   // an older common.js without pinning: show it once
        annPinned = annNow.id;
      } else if (!m && annTries < 40) {
        annTries++; setTimeout(annApply, 300);
      }
    } else if (annPinned) {
      if (m && typeof m.unpin === 'function') m.unpin();
      annPinned = '';
    }
  }
  function annPoll() {
    annLastPoll = Date.now();
    return fetch(ANNOUNCE.url, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j) return;                        // Worker unreachable: keep showing what we had
        annNow = (j.active && j.text && (!j.expiresAt || j.expiresAt > Date.now())) ? j : null;
        annApply();
      })
      .catch(function () { /* offline: keep what we had */ });
  }
  function startAnnouncements() {
    if (!ANNOUNCE.enabled) return;
    try {
      var st = document.createElement('style');
      st.textContent = '.support-btn.apml-announce{animation:apmlPing 1.8s ease-in-out infinite}' +
        '@keyframes apmlPing{0%,100%{box-shadow:0 0 0 0 rgba(185,28,28,.55)}50%{box-shadow:0 0 0 12px rgba(185,28,28,0)}}';
      document.head.appendChild(st);
    } catch (e) {}
    annPoll();
    setInterval(function () {
      if (document.visibilityState === 'hidden') return;
      if (Date.now() - annLastPoll >= ANNOUNCE.pollSeconds * 1000) annPoll();
      else if (annNow) annApply();             // keeps it pinned even if the avatar was rebuilt or replaced
    }, 5000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && Date.now() - annLastPoll >= 20000) annPoll();
    });
  }

  function startAll() { startVisit(); startAnnouncements(); }
  if (document.readyState === 'complete') startAll();
  else window.addEventListener('load', startAll);

  window.APMNotify = { send: send, version: 7 };   // type APMNotify.version in the browser console to see which copy a page is running
})();
