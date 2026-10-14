/* =====================================================================
   APML download alerts (Telegram)
   Sends a short Telegram message whenever a file is downloaded: a PDF made in
   the editor, or a file taken from the Drive or the Gallery.

   The message goes to your Cloudflare Worker (/notify), which holds the bot token
   as a secret and talks to Telegram. No token or chat id is ever in a web page.

   Pages call:  APMNotify.send({ type: 'drive', title: '...', file: '...', folder: '...' })
   It never gets in the way: any problem here is ignored and the download carries on.
   ===================================================================== */
(function () {
  'use strict';

  // ---------------- settings ----------------
  var ENABLED = { pdf: true, drive: true, gallery: true };   // switch a kind off with false
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

  window.APMNotify = { send: send };
})();
