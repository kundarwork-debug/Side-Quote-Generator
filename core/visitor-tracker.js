/* APML Portal unified privacy and analytics consent.
   Core site storage remains available; optional visitor analytics starts only after opt-in.
   This portal currently uses browser storage (localStorage/sessionStorage) for preferences
   and session state; this prompt does not claim that every storage item is a cookie. */
(function () {
  "use strict";
  if (window.__apmlVisitorTrackerLoaded) return;
  window.__apmlVisitorTrackerLoaded = true;

  const CONSENT_KEY = "apml-analytics-consent";
  const PRIVACY_KEY = "apml-privacy-consent";
  const ENDPOINT = "/api/visitor";
  const randomId = () => {
    try { return crypto.randomUUID().replace(/-/g, ""); }
    catch (_) { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  };
  const getId = key => {
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

  let visitorId, sessionId, lastCountedAt = Date.now(), heartbeat = null;
  let trackingStarted = false;
  function payload(action, seconds, extra) {
    return Object.assign({
      action, visitorId, sessionId, page: location.pathname.slice(0, 180) || "/",
      seconds: Math.max(0, Math.min(45, Number(seconds) || 0))
    }, extra || {});
  }
  let sendQueue = Promise.resolve();
  function send(action, seconds, keepalive, extra) {
    const body = JSON.stringify(payload(action, seconds, extra));
    if (keepalive && navigator.sendBeacon) {
      try {
        if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain;charset=UTF-8" }))) return Promise.resolve();
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
    if (delta > 0 && trackingStarted) send("page_time", delta, true);
  }
  function startTracking() {
    if (trackingStarted) return;
    trackingStarted = true;
    window.dispatchEvent(new Event('apml-analytics-consent-granted'));
    visitorId = getId("apml-visitor-id");
    sessionId = getSessionId();
    send("start", 0, false).then(() => send("pageview", 0, false));
    const recordPerformance = () => {
      if (!trackingStarted) return;
      const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (!nav) return;
      const loadMs = Math.round(nav.loadEventEnd || nav.domContentLoadedEventEnd || 0);
      const domMs = Math.round(nav.domContentLoadedEventEnd || 0);
      const ttfbMs = Math.round(nav.responseStart || 0);
      if (!loadMs || loadMs < 0) return;
      send("performance", 0, false, {
        loadMs: Math.min(120000, loadMs),
        domMs: Math.min(120000, Math.max(0, domMs)),
        ttfbMs: Math.min(60000, Math.max(0, ttfbMs)),
        navType: nav.type || "other",
        serviceWorkerControlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller)
      });
    };
    if (document.readyState === "complete") window.setTimeout(recordPerformance, 0);
    else window.addEventListener("load", () => window.setTimeout(recordPerformance, 0), { once: true });
    heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") accountPageTime();
    }, 20000);
    window.addEventListener("pagehide", accountPageTime, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") accountPageTime();
      else lastCountedAt = Date.now();
    });
    window.addEventListener("pageshow", event => {
      if (event.persisted) { lastCountedAt = Date.now(); send("pageview", 0, false); }
    });
  }

  function showConsent() {
    if (document.getElementById("apml-privacy-consent")) return;
    const overlay = document.createElement("div");
    overlay.id = "apml-privacy-consent";
    overlay.innerHTML = `
      <section class="apml-cookie-card" role="dialog" aria-modal="true" aria-labelledby="apml-cookie-title" aria-describedby="apml-cookie-description">
        <svg class="apml-cookie-icon" xml:space="preserve" viewBox="0 0 122.88 122.25" aria-hidden="true"><g><path d="M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95 c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38 c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03 c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38 C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12 c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0 c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55 C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z M59.28,57.86c2.77,0,5.01,2.24,5.01,5.01c0,2.77-2.24,5.01-5.01,5.01 c-2.77,0-5.01-2.24-5.01-5.01C54.27,60.1,56.52,57.86,59.28,57.86L59.28,57.86z M37.56,78.49c3.37,0,6.11,2.73,6.11,6.11 s-2.73,6.11-6.11,6.11s-6.11-2.73-6.11-6.11S34.18,78.49,37.56,78.49L37.56,78.49z M50.72,31.75c2.65,0,4.79,2.14,4.79,4.79 c0,2.65-2.14,4.79-4.79,4.79c-2.65,0-4.79-2.14-4.79-4.79C45.93,33.89,48.08,31.75,50.72,31.75L50.72,31.75z M119.3,32.4 c1.98,0,3.58,1.6,3.58,3.58c0,1.98-1.6,3.58-3.58,3.58s-3.58-1.6-3.58-3.58S117.32,32.4,119.3,32.4L119.3,32.4z M93.62,22.91c2.98,0,5.39,2.41,5.39,5.39c0,2.98-2.41,5.39-5.39,5.39c-2.98,0-5.39-2.41-5.39-5.39 C88.23,25.33,90.64,22.91,93.62,22.91L93.62,22.91z M97.79,0.59c3.19,0,5.78,2.59,5.78,5.78c0,3.19-2.59,5.78-5.78,5.78 c-3.19,0-5.78-2.59-5.78-5.78C92.02,3.17,94.6,0.59,97.79,0.59L97.79,0.59z M76.73,80.63c4.43,0,8.03,3.59,8.03,8.03 c0,4.43-3.59,8.03-8.03,8.03s-8.03-3.59-8.03-8.03C68.7,84.22,72.29,80.63,76.73,80.63L76.73,80.63z M31.91,46.78 c4.8,0,8.69,3.89,8.69,8.69c0,4.8-3.89,8.69-8.69,8.69s-8.69-3.89-8.69-8.69C23.22,50.68,27.11,46.78,31.91,46.78L31.91,46.78z M107.13,60.74c-3.39-0.91-6.35-3.14-8.95-6.48c-5.78,1.52-11.16,1.41-15.76-0.02c-3.37-1.05-6.32-2.81-8.71-5.18 c-2.39-2.37-4.21-5.32-5.32-8.75c-1.51-4.66-1.69-10.2-0.18-16.32c-3.1-1.8-5.25-4.53-6.42-7.88c-1.06-3.05-1.28-6.59-0.61-10.35 C47.27,5.95,34.3,11.36,24.41,20.18C13.74,29.69,6.66,43.15,5.84,58.29l0,0.05v0h0l-0.01,0.13v0C5.07,73.72,10.55,87.82,20.02,98.3 c9.44,10.44,22.84,17.29,38,18.1l0.05,0h0v0l0.13,0.01h0c15.24,0.77,29.35-4.71,39.83-14.19c10.44-9.44,17.29-22.84,18.1-38l0-0.05 v0h0l0.01-0.13v0c0.07-1.34,0.09-2.64,0.06-3.91C112.98,61.34,109.96,61.51,107.13,60.74L107.13,60.74z"></path></g></svg>
        <h2 class="apml-cookie-heading" id="apml-cookie-title">Your privacy choices.</h2>
        <p class="apml-cookie-description" id="apml-cookie-description">We use essential browser storage to keep APML Portal working. With your permission, optional analytics helps us understand visits and improve your experience. <a href="policy/cookies.html">Read cookies policies</a>.</p>
        <div class="apml-cookie-buttons">
          <button type="button" class="apml-cookie-allow">Allow</button>
          <button type="button" class="apml-cookie-decline">Decline</button>
        </div>
      </section>`;
    const style = document.createElement("style");
    style.textContent = `
      #apml-privacy-consent{position:fixed;inset:0;z-index:100900;display:grid;place-items:center;padding:16px;background:rgba(15,18,24,.58);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;animation:apmlCookieFade .2s ease}
      #apml-privacy-consent *{box-sizing:border-box}
      html[data-theme="dark"] #apml-privacy-consent .apml-cookie-card{background:var(--surface-card,#151e2e);color:var(--text-main,#f8fafc);border-color:var(--surface-border,#334155)}
      html[data-theme="dark"] #apml-privacy-consent .apml-cookie-heading{color:var(--text-main,#f8fafc)}
      html[data-theme="dark"] #apml-privacy-consent .apml-cookie-description{color:var(--text-muted,#a8b5c7)}
      html[data-theme="dark"] #apml-privacy-consent .apml-cookie-decline{background:var(--surface-raised,#1e293b);color:var(--text-main,#f8fafc)}
      #apml-privacy-consent .apml-cookie-card{width:min(100%,340px);max-height:calc(100dvh - 32px);overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;padding:25px 25px 23px;border:1px solid var(--md-sys-color-outline-variant,#e2e8f0);border-radius:14px;background:var(--md-sys-color-surface-container-lowest,#fff);color:var(--md-sys-color-on-surface,#0f172a);text-align:center;box-shadow:var(--md-elevation-3,0 12px 32px rgba(0,0,0,.15));animation:apmlCookiePop .24s ease}
      #apml-privacy-consent .apml-cookie-icon{display:block;width:50px;height:50px;flex:none}
      #apml-privacy-consent .apml-cookie-icon path{fill:var(--md-sys-color-primary,#b91c1c)}
      #apml-privacy-consent .apml-cookie-heading{margin:0;color:var(--md-sys-color-on-surface,#0f172a);font-size:20px;line-height:1.25;font-weight:800}
      #apml-privacy-consent .apml-cookie-description{margin:0;color:var(--md-sys-color-on-surface-variant,#64748b);font-size:12px;font-weight:600;line-height:1.65}
      #apml-privacy-consent .apml-cookie-description a{color:var(--md-sys-color-primary,#b91c1c);text-decoration:none;text-underline-offset:3px}
      #apml-privacy-consent .apml-cookie-description a:hover{text-decoration:underline}
      #apml-privacy-consent .apml-cookie-buttons{display:flex;flex-direction:row;justify-content:center;gap:14px;width:100%;margin-top:2px}
      #apml-privacy-consent .apml-cookie-buttons button{width:100px;min-height:38px;border:0;border-radius:20px;font:700 13px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;transition:background .2s ease,box-shadow .2s ease,transform .2s ease}
      #apml-privacy-consent .apml-cookie-allow{background:var(--md-sys-color-primary,#b91c1c);color:#fff;box-shadow:var(--md-elevation-1,0 1px 3px rgba(0,0,0,.08))}
      #apml-privacy-consent .apml-cookie-allow:hover{background:var(--md-sys-color-on-primary-container,#991b1b);box-shadow:var(--md-elevation-2,0 6px 16px rgba(0,0,0,.1));transform:translateY(-1px)}
      #apml-privacy-consent .apml-cookie-decline{background:var(--md-sys-color-surface-container,#e2e8f0);color:var(--md-sys-color-on-surface,#0f172a);box-shadow:var(--md-elevation-1,0 1px 3px rgba(0,0,0,.08))}
      #apml-privacy-consent .apml-cookie-decline:hover{background:var(--md-sys-color-surface-container-low,#f1f5f9);box-shadow:var(--md-elevation-2,0 6px 16px rgba(0,0,0,.1));transform:translateY(-1px)}
      #apml-privacy-consent button:focus-visible,#apml-privacy-consent a:focus-visible{outline:3px solid #9c83ff;outline-offset:3px}
      @keyframes apmlCookieFade{from{opacity:0}to{opacity:1}}@keyframes apmlCookiePop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
      @media(max-width:380px){#apml-privacy-consent .apml-cookie-card{padding:22px 19px}#apml-privacy-consent .apml-cookie-description{font-size:11px}}
      @media(prefers-reduced-motion:reduce){#apml-privacy-consent,#apml-privacy-consent .apml-cookie-card{animation:none}#apml-privacy-consent .apml-cookie-buttons button{transition:none}}
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    function closeForSession() {
      try { sessionStorage.setItem("apml-privacy-dismissed", "yes"); } catch (_) {}
      overlay.remove();
    }
    function saveChoice(analyticsAllowed, persist) {
      if (persist && analyticsAllowed) {
        try {
          localStorage.setItem(PRIVACY_KEY, JSON.stringify({ essential: true, analytics: true, updatedAt: Date.now() }));
          localStorage.setItem(CONSENT_KEY, "yes");
          sessionStorage.removeItem("apml-privacy-dismissed");
          sessionStorage.removeItem("apml-analytics-consent-dismissed");
        } catch (_) {}
      } else if (persist) {
        try {
          localStorage.setItem(PRIVACY_KEY, JSON.stringify({ essential: true, analytics: false, updatedAt: Date.now() }));
          localStorage.setItem(CONSENT_KEY, "no");
          sessionStorage.removeItem("apml-privacy-dismissed");
          sessionStorage.removeItem("apml-analytics-consent-dismissed");
        } catch (_) {}
      } else {
        closeForSession();
        return;
      }
      overlay.remove();
      if (analyticsAllowed) startTracking();
    }
    overlay.querySelector(".apml-cookie-allow").addEventListener("click", () => saveChoice(true, true));
    overlay.querySelector(".apml-cookie-description a").addEventListener("click", () => { overlay.remove(); });
    overlay.querySelector(".apml-cookie-decline").addEventListener("click", () => saveChoice(false, true));
    overlay.addEventListener("click", event => { if (event.target === overlay) closeForSession(); });
    document.addEventListener("keydown", function onEscape(event) {
      if (event.key === "Escape" && document.body.contains(overlay)) {
        closeForSession();
        document.removeEventListener("keydown", onEscape);
      }
    });
  }

  // Allow the dedicated policy page to reopen the consent dialog on demand.
  window.apmlReviewPrivacyChoices = function () {
    try {
      localStorage.removeItem(PRIVACY_KEY);
      localStorage.removeItem(CONSENT_KEY);
      sessionStorage.removeItem("apml-privacy-dismissed");
      sessionStorage.removeItem("apml-analytics-consent-dismissed");
      sessionStorage.setItem("apml-force-privacy-prompt", "yes");
    } catch (_) {}
    window.location.reload();
  };

  function init() {
    const isCookiesPolicyPage = /(?:^|\/)policy\/cookies\.html$/.test(window.location.pathname.replace(/\/+$/, ""));
    let privacyChoice = null;
    let dismissed = false;
    let forcePrompt = false;
    try {
      forcePrompt = sessionStorage.getItem("apml-force-privacy-prompt") === "yes";
      if (forcePrompt) sessionStorage.removeItem("apml-force-privacy-prompt");
      privacyChoice = JSON.parse(localStorage.getItem(PRIVACY_KEY) || "null");
      // Backward compatibility: existing explicit analytics opt-ins remain respected.
      if (!privacyChoice && localStorage.getItem(CONSENT_KEY) === "yes") {
        privacyChoice = { essential: true, analytics: true };
        localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacyChoice));
      }
      dismissed = sessionStorage.getItem("apml-privacy-dismissed") === "yes"
        || sessionStorage.getItem("apml-analytics-consent-dismissed") === "yes";
      if (localStorage.getItem(CONSENT_KEY) === "no" && !privacyChoice) privacyChoice = { essential: true, analytics: false };
    } catch (_) {}
    if (privacyChoice && privacyChoice.analytics === true) startTracking();
    else if (forcePrompt || (!privacyChoice && !dismissed && !isCookiesPolicyPage)) showConsent();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
