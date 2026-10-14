/* =====================================================================
   APML download alerts
   Emails you (through your Formspree form) whenever a file is downloaded:
   a PDF made in the editor, or a file taken from the Drive or the Gallery.

   Pages call:  APMNotify.send({ type: 'drive', title: '...', file: '...', details: { ... }, link: '...' })
   It never gets in the way: any problem here is ignored and the download carries on.
   ===================================================================== */
(function () {
  'use strict';

  // ---------------- settings ----------------
  var FORM_URL = 'https://formspree.io/f/xljgpnak';
  var ENABLED = { pdf: true, drive: true, gallery: true };   // switch a kind off with false
  var DIGEST_SECONDS = 0;      // 0 = one email per download.  e.g. 120 = one summary email per 2 minutes
  var DEDUPE_SECONDS = 8;      // the same file twice within this time counts once (double clicks)
  var MAX_EMAILS_PER_DAY_PER_DEVICE = 40;   // safety net so a loop or a bot cannot use up your Formspree quota

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

  // ---------------- helpers ----------------
  var recent = {};
  var queue = [];
  var timer = null;

  function whenText() {
    try {
      return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST';
    } catch (e) { return new Date().toString(); }
  }
  function deviceText() {
    var ua = navigator.userAgent || '';
    var os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /CrOS/i.test(ua) ? 'ChromeOS' : /Windows/i.test(ua) ? 'Windows' : /Mac OS X/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : 'Unknown OS';
    var br = /Edg\//i.test(ua) ? 'Edge' : /OPR\//i.test(ua) ? 'Opera' : /Firefox\//i.test(ua) ? 'Firefox' : /Chrome\//i.test(ua) ? 'Chrome' : /Safari\//i.test(ua) ? 'Safari' : 'Browser';
    return os + ' / ' + br;
  }
  function pageName() {
    var f = (window.location.pathname.split('/').pop() || 'index.html');
    return f;
  }
  function detailLines(details) {
    var out = [];
    for (var k in (details || {})) {
      var v = details[k];
      if (v === undefined || v === null || String(v).trim() === '') continue;
      out.push(String(k).replace(/_/g, ' ') + ': ' + v);
    }
    return out;
  }
  function describe(r) {
    var lines = [r.title + ': ' + (r.file || '(no name)')];
    detailLines(r.details).forEach(function (l) { lines.push('  ' + l); });
    if (r.link) lines.push('  link: ' + r.link);
    lines.push('  page: ' + r.page + '   |   ' + r.when + '   |   ' + r.device);
    return lines.join('\n');
  }

  // ---------------- daily safety limit ----------------
  function allowedToday() {
    try {
      var day = new Date().toISOString().slice(0, 10);
      var s = JSON.parse(localStorage.getItem('apml_notify_count') || '{}');
      if (s.day !== day) s = { day: day, n: 0 };
      if (s.n >= MAX_EMAILS_PER_DAY_PER_DEVICE) return false;
      s.n++;
      localStorage.setItem('apml_notify_count', JSON.stringify(s));
      return true;
    } catch (e) { return true; }
  }

  // ---------------- sending ----------------
  function buildForm(records) {
    var fd = new FormData();
    if (records.length === 1) {
      var r = records[0];
      fd.append('_subject', 'APML Portal: ' + r.title + ' - ' + (r.file || ''));
      fd.append('event', r.title);
      fd.append('file', r.file || '');
      detailLines(r.details).forEach(function (l) {
        var i = l.indexOf(': ');
        fd.append(l.slice(0, i), l.slice(i + 2));
      });
      if (r.link) fd.append('link', r.link);
      fd.append('page', r.page);
      fd.append('time', r.when);
      fd.append('device', r.device);
    } else {
      fd.append('_subject', 'APML Portal: ' + records.length + ' downloads');
      fd.append('downloads', String(records.length));
      fd.append('summary', records.map(describe).join('\n\n'));
    }
    return fd;
  }

  function post(records, useBeacon) {
    if (!records.length || !allowedToday()) return;
    var fd = buildForm(records);
    try {
      if (useBeacon && navigator.sendBeacon) { navigator.sendBeacon(FORM_URL, fd); return; }
      fetch(FORM_URL, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' }, keepalive: true })
        .catch(function (err) { console.warn('Download alert not sent:', err); });
    } catch (e) { /* never block a download */ }
  }

  function flush(useBeacon) {
    clearTimeout(timer); timer = null;
    var batch = queue.splice(0, queue.length);
    post(batch, useBeacon);
  }

  function send(evt) {
    try {
      if (!evt || !evt.type || ENABLED[evt.type] === false) return;
      if (muted()) return;
      var key = evt.type + '|' + (evt.file || '');
      var now = Date.now();
      if (recent[key] && now - recent[key] < DEDUPE_SECONDS * 1000) return;
      recent[key] = now;

      var record = {
        type: evt.type,
        title: evt.title || 'File downloaded',
        file: evt.file || '',
        details: evt.details || {},
        link: evt.link || '',
        page: pageName(),
        when: whenText(),
        device: deviceText()
      };

      if (DIGEST_SECONDS > 0) {
        queue.push(record);
        if (!timer) timer = setTimeout(function () { flush(false); }, DIGEST_SECONDS * 1000);
      } else {
        post([record], false);
      }
    } catch (e) { /* ignore */ }
  }

  // leaving the page with a summary still waiting: send it now
  window.addEventListener('pagehide', function () { if (queue.length) flush(true); });

  window.APMNotify = { send: send };
})();
