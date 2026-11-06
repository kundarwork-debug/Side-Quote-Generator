/* APML Portal privacy-aware visitor analytics.
   Stores a masked IP prefix only; no precise coordinates or cross-site tracking. */
(function () {
  "use strict";
  if (window.__apmlVisitorTrackerLoaded) return;
  window.__apmlVisitorTrackerLoaded = true;

  const CONSENT_KEY = "apml-analytics-consent";
  const ENDPOINT = "/api/visitor";
  const randomId = () => {
    try { return crypto.randomUUID().replace(/-/g, ""); }
    catch (_) { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  };
  const getId = (key) => {
    try {
      let value = localStorage.getItem(key);
      if (!value) { value = randomId(); localStorage.setItem(key, value); }
      return value;
    } catch (_) { return randomId(); }
  };
  const getSessionId = () => {
    try {
      let value = sessionStorage.getItem("apml-visitor-session");
      if (!value) { value = randomId(); sessionStorage.setItem("apml-visitor-session", value); }
      return value;
    } catch (_) { return randomId(); }
  };

  function showConsent() {
    if (document.getElementById("apml-analytics-consent")) return;
    const box = document.createElement("aside");
    box.id = "apml-analytics-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Analytics privacy choice");
    box.innerHTML = '<div class="apml-consent-copy"><strong>Help us improve APML Portal</strong><span>With your permission, we collect anonymous usage analytics such as approximate city, masked IP, device type, pages visited and time spent. We do not collect precise location or track you across other websites.</span></div><div class="apml-consent-actions"><button type="button" data-choice="no">Decline</button><button type="button" data-choice="yes">Allow analytics</button></div>';
    const style = document.createElement("style");
    style.textContent = '#apml-analytics-consent{position:fixed;z-index:100900;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;display:flex;align-items:center;gap:18px;padding:17px 19px;border:1px solid var(--md-sys-color-outline-variant,#ddd);border-radius:17px;background:var(--apml-color-page,#fff);color:var(--md-sys-color-on-surface,#222);box-shadow:0 14px 48px rgba(0,0,0,.2);font:13px/1.5 system-ui,sans-serif}#apml-analytics-consent .apml-consent-copy{display:grid;gap:4px;flex:1}#apml-analytics-consent strong{font-size:14px}#apml-analytics-consent span{color:var(--md-sys-color-on-surface-variant,#666)}#apml-analytics-consent .apml-consent-actions{display:flex;gap:8px;flex-shrink:0}#apml-analytics-consent button{min-height:38px;padding:0 13px;border:1px solid var(--md-sys-color-outline-variant,#ccc);border-radius:10px;background:transparent;color:inherit;font:700 12px system-ui;cursor:pointer}#apml-analytics-consent button[data-choice=yes]{background:#b4232c;color:#fff;border-color:#b4232c}@media(max-width:600px){#apml-analytics-consent{left:10px;right:10px;bottom:10px;display:block;padding:15px}#apml-analytics-consent .apml-consent-actions{margin-top:12px}#apml-analytics-consent button{flex:1}}';
    document.head.appendChild(style);
    document.body.appendChild(box);
    box.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-choice]");
      if (!button) return;
      try { localStorage.setItem(CONSENT_KEY, button.dataset.choice === "yes" ? "yes" : "no"); } catch (_) {}
      box.remove();
      if (button.dataset.choice === "yes") startTracking();
    });
  }

  let visitorId, sessionId, pageStarted = Date.now(), sentSeconds = 0, heartbeat = null;
  function payload(action, seconds) {
    return {
      action, visitorId, sessionId, page: location.pathname.slice(0, 180) || "/",
      title: document.title.slice(0, 120), referrer: document.referrer.slice(0, 240),
      seconds: Math.max(0, Math.min(45, Number(seconds) || 0))
    };
  }
  let sendQueue = Promise.resolve();
  function send(action, seconds, keepalive) {
    const data = payload(action, seconds);
    const body = JSON.stringify(data);
    if (keepalive && navigator.sendBeacon) {
      try {
        const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
        if (navigator.sendBeacon(ENDPOINT, blob)) return Promise.resolve();
      } catch (_) {}
    }
    sendQueue = sendQueue.then(() => fetch(ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
      keepalive: !!keepalive, credentials: "same-origin"
    })).catch(() => {});
    return sendQueue;
  }
  function accountPageTime() {
    const elapsed = Math.floor((Date.now() - pageStarted) / 1000);
    const delta = Math.max(0, Math.min(45, elapsed - sentSeconds));
    if (delta > 0) { sentSeconds += delta; send("page_time", delta, true); }
  }
  function startTracking() {
    visitorId = getId("apml-visitor-id");
    sessionId = getSessionId();
    send("start", 0, false).then(() => send("pageview", 0, false));
    heartbeat = window.setInterval(function () {
      const elapsed = Math.floor((Date.now() - pageStarted) / 1000);
      const delta = Math.max(0, Math.min(45, elapsed - sentSeconds));
      if (delta > 0) { sentSeconds += delta; send("heartbeat", delta, false); }
    }, 20000);
    window.addEventListener("pagehide", accountPageTime, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") accountPageTime();
    });
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) { pageStarted = Date.now(); sentSeconds = 0; send("pageview", 0, false); }
    });
  }

  function init() {
    let consent = null;
    try { consent = localStorage.getItem(CONSENT_KEY); } catch (_) {}
    if (consent === "yes") startTracking();
    else if (consent !== "no") showConsent();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
