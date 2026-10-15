/* =====================================================================
   APML download alerts (Telegram)
   Sends a short Telegram message whenever a file is downloaded (a PDF made in the
   editor, or a file taken from the Drive or the Gallery) and when someone opens the
   portal. The Worker adds the live numbers to every message: people online now, total
   PDFs generated and total media downloaded.

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
  var VISIT = { cooldownHours: 6, delayMs: 1500 };

  // Live "online now" count. Every open, visible page checks in with your Firebase database every few seconds;
  // a visitor counts as online while their last check-in is recent. Only a random id, the page name and the
  // time are stored (nothing personal). The Worker reads these check-ins and cleans up old ones.
  var PRESENCE = {
    enabled: true,
    dbUrl: 'https://apml-portal-default-rtdb.firebaseio.com',
    path: 'apml_presence',
    beatSeconds: 20        // how often a visible page checks in (the Worker counts a visitor as online for 50 seconds after that)
  };
  var DEDUPE_SECONDS = 8;      // the same file twice within this time counts once (double clicks)

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

  function send(evt) {
    try {
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

  // ---------------- who is online right now ----------------
  function presenceOn() {
    return PRESENCE.enabled && ENABLED.visit !== false && !muted() && !looksLikeBot();
  }
  function presenceId() {
    try {
      var id = localStorage.getItem('apml_presence_id');
      if (!id) {
        id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        localStorage.setItem('apml_presence_id', id);   // one id per browser, so several tabs count as one person
      }
      return id;
    } catch (e) {
      window.__apmPresenceId = window.__apmPresenceId || Math.random().toString(36).slice(2, 10);
      return window.__apmPresenceId;
    }
  }
  function presenceUrl(id) {
    return PRESENCE.dbUrl + '/' + PRESENCE.path + (id ? '/' + encodeURIComponent(id) : '') + '.json';
  }
  // check in: the time comes from Firebase's own clock, so wrong clocks on phones cannot skew the count
  function beat() {
    if (document.visibilityState === 'hidden') return Promise.resolve();
    return fetch(presenceUrl(presenceId()), {
      method: 'PUT',
      body: JSON.stringify({ t: { '.sv': 'timestamp' }, p: pageName() }),
      keepalive: true
    }).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); });
  }
  function startPresence() {
    if (!presenceOn()) return;
    beat().catch(function () {});
    setInterval(function () { beat().catch(function () {}); }, PRESENCE.beatSeconds * 1000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') beat().catch(function () {});
    });
  }

  function announceVisit() {
    try {
      if (ENABLED.visit === false || muted() || looksLikeBot()) return;
      var now = Date.now();
      var last = Number(localStorage.getItem('apml_visit_last') || 0);
      if (last && now - last < VISIT.cooldownHours * 3600 * 1000) return;
      localStorage.setItem('apml_visit_last', String(now));

      var evt = { type: 'visit', title: 'Someone is online', file: pageName(), folder: deviceText() };
      if (!PRESENCE.enabled) { send(evt); return; }
      // check in first, so this visitor is part of the count the Worker reads; if that fails, send the alert anyway
      beat().then(function () { send(evt); }, function () { send(evt); });
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
  function startAll() { startPresence(); startVisit(); }
  if (document.readyState === 'complete') startAll();
  else window.addEventListener('load', startAll);

  window.APMNotify = { send: send };
})();
