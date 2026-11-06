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
    overlay.innerHTML = '<section class="apml-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="apml-consent-title" aria-describedby="apml-consent-description"><div class="apml-consent-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.7" stroke="currentColor" stroke-width="1.7"/><path d="m18.5 4.5 1-1m-15 1-1-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div><span class="apml-consent-eyebrow">YOUR PRIVACY MATTERS</span><h2 id="apml-consent-title">Help us make APML Portal better</h2><p id="apml-consent-description">We’d like to understand how the portal is used so we can improve the experience for everyone.</p><div class="apml-consent-details"><div><b>What we measure</b><span>Approximate city, masked IP, device type, pages visited and time spent.</span></div><div><b>What we don’t do</b><span>No precise location tracking and no tracking across other websites.</span></div></div><div class="apml-consent-actions"><button type="button" class="apml-consent-decline" data-choice="no">Not now</button><button type="button" class="apml-consent-accept" data-choice="yes">Allow analytics <span aria-hidden="true">→</span></button></div><p class="apml-consent-footnote">Your choice is saved on this browser. You can use the portal either way.</p></section>';
    const style = document.createElement("style");
    style.textContent = `
      #apml-analytics-consent{position:fixed;inset:0;z-index:100900;display:grid;place-items:center;padding:22px;background:rgba(15,18,24,.48);backdrop-filter:blur(11px) saturate(115%);-webkit-backdrop-filter:blur(11px) saturate(115%);animation:apmlConsentFade .24s ease-out;font:14px/1.55 'Plus Jakarta Sans',system-ui,sans-serif}
      #apml-analytics-consent *{box-sizing:border-box}
      #apml-analytics-consent .apml-consent-dialog{width:min(100%,490px);padding:34px 34px 25px;border:1px solid rgba(255,255,255,.68);border-radius:25px;background:var(--surface-card,#fff);color:var(--text-main,#201b18);box-shadow:0 28px 90px rgba(0,0,0,.3);text-align:center;animation:apmlConsentRise .32s cubic-bezier(.2,.8,.2,1)}
      #apml-analytics-consent .apml-consent-mark{width:58px;height:58px;margin:0 auto 17px;display:grid;place-items:center;border-radius:19px;background:rgba(185,35,44,.1);color:#b4232c}
      #apml-analytics-consent .apml-consent-mark svg{width:29px;height:29px}
      #apml-analytics-consent .apml-consent-eyebrow{display:block;color:#b4232c;font-size:10px;font-weight:800;letter-spacing:.16em}
      #apml-analytics-consent h2{margin:9px 0 9px;font-size:clamp(21px,4vw,27px);line-height:1.2;letter-spacing:-.045em;font-weight:800}
      #apml-analytics-consent #apml-consent-description{max-width:370px;margin:0 auto 21px;color:var(--text-secondary,#625b55);font-size:13px;line-height:1.7}
      #apml-analytics-consent .apml-consent-details{display:grid;gap:0;margin:0 0 23px;padding:0 15px;border:1px solid var(--surface-border,rgba(120,100,80,.16));border-radius:15px;text-align:left}
      #apml-analytics-consent .apml-consent-details div{display:grid;gap:3px;padding:12px 0}
      #apml-analytics-consent .apml-consent-details div+div{border-top:1px solid var(--surface-border,rgba(120,100,80,.16))}
      #apml-analytics-consent .apml-consent-details b{font-size:12px;font-weight:800}
      #apml-analytics-consent .apml-consent-details span{color:var(--text-muted,#777);font-size:11px;line-height:1.55}
      #apml-analytics-consent .apml-consent-actions{display:grid;grid-template-columns:.82fr 1.35fr;gap:10px}
      #apml-analytics-consent button{min-height:49px;padding:0 15px;border-radius:13px;font:700 13px system-ui,sans-serif;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
      #apml-analytics-consent button:focus-visible{outline:3px solid rgba(180,35,44,.3);outline-offset:3px}
      #apml-analytics-consent .apml-consent-decline{border:1px solid var(--surface-border,#ddd);background:transparent;color:var(--text-secondary,#555)}
      #apml-analytics-consent .apml-consent-accept{display:flex;align-items:center;justify-content:center;gap:12px;border:1px solid #a71924;background:linear-gradient(135deg,#c52c36 0%,#991b27 100%);color:#fff;box-shadow:0 8px 20px rgba(170,25,36,.28),inset 0 1px rgba(255,255,255,.2);font-weight:800}
      #apml-analytics-consent .apml-consent-accept span{font-size:19px;line-height:1;transition:transform .18s ease}
      #apml-analytics-consent .apml-consent-accept:hover{transform:translateY(-2px);box-shadow:0 12px 25px rgba(170,25,36,.36),inset 0 1px rgba(255,255,255,.2)}
      #apml-analytics-consent .apml-consent-accept:hover span{transform:translateX(3px)}
      #apml-analytics-consent .apml-consent-decline:hover{background:var(--surface-subtle,#f4f0eb)}
      #apml-analytics-consent .apml-consent-footnote{margin:16px 0 0;color:var(--text-muted,#888);font-size:10px;line-height:1.5}
      @keyframes apmlConsentFade{from{opacity:0}to{opacity:1}}@keyframes apmlConsentRise{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
      @media(max-width:480px){#apml-analytics-consent{padding:14px}#apml-analytics-consent .apml-consent-dialog{padding:27px 20px 20px;border-radius:21px}#apml-analytics-consent .apml-consent-actions{grid-template-columns:1fr 1.25fr}#apml-analytics-consent button{min-height:47px;padding:0 9px;font-size:12px}}
      @media(prefers-reduced-motion:reduce){#apml-analytics-consent,#apml-analytics-consent .apml-consent-dialog{animation:none}#apml-analytics-consent button{transition:none}}
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
