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
    const overlay = document.createElement("div");
    overlay.id = "apml-analytics-consent";
    overlay.setAttribute("role", "presentation");
    overlay.innerHTML = '<section class="apml-cookie-card" role="dialog" aria-modal="true" aria-labelledby="apml-consent-title" aria-describedby="apml-consent-description"><svg class="apml-cookie-icon" viewBox="0 0 122.88 122.25" aria-hidden="true"><path d="M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z M59.28,57.86c2.77,0,5.01,2.24,5.01,5.01c0,2.77-2.24,5.01-5.01,5.01c-2.77,0-5.01-2.24-5.01-5.01C54.27,60.1,56.52,57.86,59.28,57.86L59.28,57.86z M37.56,78.49c3.37,0,6.11,2.73,6.11,6.11s-2.73,6.11-6.11,6.11s-6.11-2.73-6.11-6.11S34.18,78.49,37.56,78.49L37.56,78.49z M50.72,31.75c2.65,0,4.79,2.14,4.79,4.79c0,2.65-2.14,4.79-4.79,4.79c-2.65,0-4.79-2.14-4.79-4.79C45.93,33.89,48.08,31.75,50.72,31.75L50.72,31.75z M119.3,32.4c1.98,0,3.58,1.6,3.58,3.58c0,1.98-1.6,3.58-3.58,3.58s-3.58-1.6-3.58-3.58C115.71,34.01,117.32,32.4,119.3,32.4L119.3,32.4z M93.62,22.91c2.98,0,5.39,2.41,5.39,5.39c0,2.98-2.41,5.39-5.39,5.39c-2.98,0-5.39-2.41-5.39-5.39C88.23,25.33,90.64,22.91,93.62,22.91L93.62,22.91z M97.79,0.59c3.19,0,5.78,2.59,5.78,5.78c0,3.19-2.59,5.78-5.78,5.78c-3.19,0-5.78-2.59-5.78-5.78C92.02,3.17,94.6,0.59,97.79,0.59L97.79,0.59z M76.73,80.63c4.43,0,8.03,3.59,8.03,8.03c0,4.43-3.59,8.03-8.03,8.03s-8.03-3.59-8.03-8.03C68.7,84.22,72.29,80.63,76.73,80.63L76.73,80.63z M31.91,46.78c4.8,0,8.69,3.89,8.69,8.69c0,4.8-3.89,8.69-8.69,8.69s-8.69-3.89-8.69-8.69C23.22,50.68,27.11,46.78,31.91,46.78L31.91,46.78z M107.13,60.74c-3.39-0.91-6.35-3.14-8.95-6.48c-5.78,1.52-11.16,1.41-15.76-0.02c-3.37-1.05-6.32-2.81-8.71-5.18c-2.39-2.37-4.21-5.32-5.32-8.75c-1.51-4.66-1.69-10.2-0.18-16.32c-3.1-1.8-5.25-4.53-6.42-7.88c-1.06-3.05-1.28-6.59-0.61-10.35C47.27,5.95,34.3,11.36,24.41,20.18C13.74,29.69,6.66,43.15,5.84,58.29l0,0.05v0h0l-0.01,0.13v0C5.07,73.72,10.55,87.82,20.02,98.3c9.44,10.44,22.84,17.29,38,18.1l0.05,0h0v0l0.13,0.01h0c15.24,0.77,29.35-4.71,39.83-14.19c10.44-9.44,17.29-22.84,18.1-38l0-0.05v0h0l0.01-0.13v0c0.07-1.34,0.09-2.64,0.06-3.91C112.98,61.34,109.96,61.51,107.13,60.74L107.13,60.74z"/></svg><h2 class="apml-cookie-heading" id="apml-consent-title">We use analytics.</h2><p class="apml-cookie-description" id="apml-consent-description">Allow us to understand how APML Portal is used so we can improve your experience. We collect approximate city, masked IP, device type, pages visited and time spent. We do not track your precise location or activity across other websites.</p><div class="apml-cookie-actions"><button type="button" class="apml-cookie-accept" data-choice="yes">Allow</button><button type="button" class="apml-cookie-decline" data-choice="no">Decline</button></div><p class="apml-cookie-note">Your choice is saved on this browser. The portal works either way.</p></section>';
    const style = document.createElement("style");
    style.textContent = `
      #apml-analytics-consent{position:fixed;inset:0;z-index:100900;display:grid;place-items:center;padding:18px;background:rgba(15,18,24,.5);backdrop-filter:blur(11px);-webkit-backdrop-filter:blur(11px);animation:apmlCookieFade .22s ease-out;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      #apml-analytics-consent *{box-sizing:border-box}
      #apml-analytics-consent .apml-cookie-card{width:min(100%,370px);min-height:0;padding:27px 25px 21px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.8);border-radius:22px;background:#fff;color:#1a1a1a;text-align:center;box-shadow:0 22px 70px rgba(0,0,0,.24);animation:apmlCookiePop .28s cubic-bezier(.2,.8,.2,1)}
      #apml-analytics-consent .apml-cookie-icon{width:50px;height:50px;flex:none}
      #apml-analytics-consent .apml-cookie-icon path{fill:#615151}
      #apml-analytics-consent .apml-cookie-heading{margin:0;font-size:1.2rem;line-height:1.25;font-weight:800;color:#1a1a1a}
      #apml-analytics-consent .apml-cookie-description{margin:0;color:#636363;font-size:.78rem;line-height:1.65;font-weight:500}
      #apml-analytics-consent .apml-cookie-actions{width:100%;display:flex;flex-direction:row;justify-content:center;gap:12px;margin-top:5px}
      #apml-analytics-consent .apml-cookie-actions button{width:112px;min-height:39px;padding:8px 14px;border:0;border-radius:20px;cursor:pointer;font-size:13px;font-weight:700;transition:background .18s ease,transform .18s ease,box-shadow .18s ease}
      #apml-analytics-consent .apml-cookie-accept{background:#a91f2b;color:#fff;box-shadow:0 5px 14px rgba(169,31,43,.23)}
      #apml-analytics-consent .apml-cookie-accept:hover{background:#bd2935;transform:translateY(-1px);box-shadow:0 7px 17px rgba(169,31,43,.3)}
      #apml-analytics-consent .apml-cookie-decline{background:#e3e3e3;color:#2e2e2e}
      #apml-analytics-consent .apml-cookie-decline:hover{background:#d5d5d5}
      #apml-analytics-consent .apml-cookie-actions button:focus-visible{outline:3px solid rgba(169,31,43,.28);outline-offset:3px}
      #apml-analytics-consent .apml-cookie-note{margin:0;color:#888;font-size:10px;line-height:1.45}
      @keyframes apmlCookieFade{from{opacity:0}to{opacity:1}}@keyframes apmlCookiePop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      @media(max-width:420px){#apml-analytics-consent{padding:14px}#apml-analytics-consent .apml-cookie-card{width:min(100%,350px);padding:24px 20px 19px;gap:10px}#apml-analytics-consent .apml-cookie-description{font-size:.75rem}}
      @media(prefers-reduced-motion:reduce){#apml-analytics-consent,#apml-analytics-consent .apml-cookie-card{animation:none}#apml-analytics-consent button{transition:none}}
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-choice]");
      if (!button) return;
      try { localStorage.setItem(CONSENT_KEY, button.dataset.choice === "yes" ? "yes" : "no"); } catch (_) {}
      overlay.remove();
      if (button.dataset.choice === "yes") startTracking();
    });
  }

  let visitorId, sessionId, lastCountedAt = Date.now(), heartbeat = null;
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
    const now = Date.now();
    const delta = Math.max(0, Math.min(45, Math.floor((now - lastCountedAt) / 1000)));
    lastCountedAt = now;
    if (delta > 0) send("page_time", delta, true);
  }
  function startTracking() {
    visitorId = getId("apml-visitor-id");
    sessionId = getSessionId();
    send("start", 0, false).then(() => send("pageview", 0, false));
    heartbeat = window.setInterval(function () {
      if (document.visibilityState === "visible") accountPageTime();
    }, 20000);
    window.addEventListener("pagehide", accountPageTime, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") accountPageTime();
      else lastCountedAt = Date.now();
    });
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) { lastCountedAt = Date.now(); send("pageview", 0, false); }
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
