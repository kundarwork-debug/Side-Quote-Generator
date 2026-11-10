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
  function payload(action, seconds) {
    return {
      action, visitorId, sessionId, page: location.pathname.slice(0, 180) || "/",
      title: document.title.slice(0, 120), referrer: document.referrer.slice(0, 240),
      seconds: Math.max(0, Math.min(45, Number(seconds) || 0))
    };
  }
  let sendQueue = Promise.resolve();
  function send(action, seconds, keepalive) {
    const body = JSON.stringify(payload(action, seconds));
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
    visitorId = getId("apml-visitor-id");
    sessionId = getSessionId();
    send("start", 0, false).then(() => send("pageview", 0, false));
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
      <section class="apml-privacy-card" role="dialog" aria-modal="true" aria-labelledby="apml-privacy-title" aria-describedby="apml-privacy-copy">
        <button class="apml-privacy-close" type="button" aria-label="Close privacy choices">×</button>
        <div class="apml-privacy-mark" aria-hidden="true">✓</div>
        <p class="apml-privacy-eyebrow">YOUR PRIVACY MATTERS</p>
        <h2 id="apml-privacy-title">Cookies 🍪</h2>
        <p class="apml-privacy-copy" id="apml-privacy-copy">APML Portal uses essential browser storage to remember settings and keep features working. With your permission, optional analytics helps us understand page visits and improve the portal.</p>
        <div class="apml-privacy-options">
          <div class="apml-privacy-option">
            <div><strong>Essential storage</strong><span>Required for preferences and core site features. Always active.</span></div>
            <span class="apml-privacy-required">Always on</span>
          </div>
          <div class="apml-privacy-option apml-privacy-analytics-row">
            <div><strong>Visitor analytics</strong><span>Page visits, approximate city, masked IP, device type and time spent. No precise location or cross-site tracking.</span></div>
            <label class="apml-privacy-switch"><input id="apml-analytics-toggle" type="checkbox" checked><span></span><b class="sr-only">Allow visitor analytics</b></label>
          </div>
        </div>
        <div class="apml-privacy-custom-note" hidden>Choose whether to allow optional visitor analytics. Essential storage stays active so the portal can function.</div>
        <div class="apml-privacy-actions">
          <button type="button" class="apml-privacy-primary" data-action="accept">Accept all</button>
          <button type="button" class="apml-privacy-secondary" data-action="reject">Reject optional</button>
        </div>
        <button type="button" class="apml-privacy-customize">Customize</button>
        <p class="apml-privacy-footnote">You can use APML Portal either way. Your choice applies to this browser.</p>
      </section>`;
    const style = document.createElement("style");
    style.textContent = `
      #apml-privacy-consent{position:fixed;inset:0;z-index:100900;display:grid;place-items:center;padding:16px;background:rgba(15,18,24,.58);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;animation:apmlPrivacyFade .2s ease}
      #apml-privacy-consent *{box-sizing:border-box}
      #apml-privacy-consent .apml-privacy-card{position:relative;width:min(100%,410px);max-height:calc(100dvh - 32px);overflow:auto;padding:27px 25px 20px;border:1px solid rgba(255,255,255,.8);border-radius:23px;background:#fff;color:#1c1917;text-align:left;box-shadow:0 24px 80px rgba(0,0,0,.28);animation:apmlPrivacyPop .24s ease}
      #apml-privacy-consent .apml-privacy-close{position:absolute;right:14px;top:13px;width:34px;height:34px;border:0;border-radius:50%;background:#f4f2f1;color:#57534e;font-size:23px;cursor:pointer}
      #apml-privacy-consent .apml-privacy-mark{width:42px;height:42px;display:grid;place-items:center;border-radius:14px;background:#f9e9e9;color:#a91f2b;font-size:22px;font-weight:900}
      #apml-privacy-consent .apml-privacy-eyebrow{margin:17px 0 6px;color:#a91f2b;font-size:10px;font-weight:850;letter-spacing:.15em}
      #apml-privacy-consent h2{margin:0 0 9px;font-size:22px;line-height:1.2;letter-spacing:-.04em;color:#1c1917}
      #apml-privacy-consent .apml-privacy-copy{margin:0 0 17px;color:#625d59;font-size:13px;line-height:1.6}
      #apml-privacy-consent .apml-privacy-options{border:1px solid #eee8e5;border-radius:15px;overflow:hidden}
      #apml-privacy-consent .apml-privacy-option{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px}
      #apml-privacy-consent .apml-privacy-option+.apml-privacy-option{border-top:1px solid #eee8e5}
      #apml-privacy-consent .apml-privacy-option strong{display:block;font-size:12px;color:#292524;margin-bottom:4px}
      #apml-privacy-consent .apml-privacy-option span:not(.apml-privacy-required){display:block;max-width:280px;color:#78716c;font-size:11px;line-height:1.5}
      #apml-privacy-consent .apml-privacy-required{flex:none;color:#78716c;font-size:10px;font-weight:750}
      #apml-privacy-consent .apml-privacy-switch{position:relative;flex:none;width:39px;height:23px}
      #apml-privacy-consent .apml-privacy-switch input{position:absolute;opacity:0;width:1px;height:1px}
      #apml-privacy-consent .apml-privacy-switch span{position:absolute;inset:0;border-radius:99px;background:#d6d3d1;cursor:pointer;transition:background .2s}
      #apml-privacy-consent .apml-privacy-switch span:after{content:"";position:absolute;width:17px;height:17px;left:3px;top:3px;border-radius:50%;background:white;box-shadow:0 1px 3px #0002;transition:transform .2s}
      #apml-privacy-consent .apml-privacy-switch input:checked+span{background:#a91f2b}
      #apml-privacy-consent .apml-privacy-switch input:checked+span:after{transform:translateX(16px)}
      #apml-privacy-consent .apml-privacy-switch input:focus-visible+span{outline:3px solid #e8a2a8;outline-offset:3px}
      #apml-privacy-consent .apml-privacy-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:17px}
      #apml-privacy-consent .apml-privacy-actions button{min-height:43px;padding:9px 10px;border:0;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer}
      #apml-privacy-consent .apml-privacy-primary{background:#a91f2b;color:#fff;box-shadow:0 5px 14px #a91f2b24}
      #apml-privacy-consent .apml-privacy-secondary{background:#f1efed;color:#292524}
      #apml-privacy-consent .apml-privacy-customize{display:block;margin:10px auto 0;padding:7px 12px;border:0;background:transparent;color:#a91f2b;font-size:12px;font-weight:750;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
      #apml-privacy-consent .apml-privacy-custom-note{margin-top:10px;color:#78716c;font-size:11px;line-height:1.5}
      #apml-privacy-consent .apml-privacy-footnote{margin:10px 0 0;text-align:center;color:#918b86;font-size:10px;line-height:1.45}
      #apml-privacy-consent .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      @keyframes apmlPrivacyFade{from{opacity:0}to{opacity:1}}@keyframes apmlPrivacyPop{from{opacity:0;transform:translateY(9px) scale(.98)}to{opacity:1;transform:none}}
      @media(max-width:420px){#apml-privacy-consent .apml-privacy-card{padding:23px 19px 18px}#apml-privacy-consent h2{font-size:20px}}
      @media(prefers-reduced-motion:reduce){#apml-privacy-consent,#apml-privacy-consent .apml-privacy-card{animation:none}}
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const toggle = overlay.querySelector("#apml-analytics-toggle");
    const customize = overlay.querySelector(".apml-privacy-customize");
    const customNote = overlay.querySelector(".apml-privacy-custom-note");
    let customized = false;
    customize.addEventListener("click", () => {
      customized = true;
      customNote.hidden = false;
      toggle.focus();
      customize.textContent = "Save preferences";
    });
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
      } else {
        // A rejection or a custom choice without analytics is a session-only dismissal.
        try {
          localStorage.removeItem(PRIVACY_KEY);
          localStorage.removeItem(CONSENT_KEY);
        } catch (_) {}
        closeForSession();
        return;
      }
      overlay.remove();
      if (analyticsAllowed) startTracking();
    }
    overlay.addEventListener("click", event => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "accept") { toggle.checked = true; saveChoice(true, true); }
      if (action === "reject") { toggle.checked = false; saveChoice(false, false); }
    });
    customize.addEventListener("click", () => {
      if (!customized) return;
      saveChoice(toggle.checked, toggle.checked);
    });
    overlay.querySelector(".apml-privacy-close").addEventListener("click", closeForSession);
    overlay.addEventListener("click", event => { if (event.target === overlay) closeForSession(); });
    document.addEventListener("keydown", function onEscape(event) {
      if (event.key === "Escape" && document.body.contains(overlay)) {
        closeForSession();
        document.removeEventListener("keydown", onEscape);
      }
    });
  }

  function init() {
    let privacyChoice = null;
    let dismissed = false;
    try {
      privacyChoice = JSON.parse(localStorage.getItem(PRIVACY_KEY) || "null");
      // Backward compatibility: existing explicit analytics opt-ins remain respected.
      if (!privacyChoice && localStorage.getItem(CONSENT_KEY) === "yes") {
        privacyChoice = { essential: true, analytics: true };
        localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacyChoice));
      }
      dismissed = sessionStorage.getItem("apml-privacy-dismissed") === "yes"
        || sessionStorage.getItem("apml-analytics-consent-dismissed") === "yes";
      if (localStorage.getItem(CONSENT_KEY) === "no") localStorage.removeItem(CONSENT_KEY);
    } catch (_) {}
    if (privacyChoice && privacyChoice.analytics === true) startTracking();
    else if (!dismissed) showConsent();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
