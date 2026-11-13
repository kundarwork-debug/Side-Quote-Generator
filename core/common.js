// =========================================================
// SHARED APML PAGE LOADER — lightweight CSS spinner
// =========================================================
(function initSharedPageLoader() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  const isHomePage = !currentPage || currentPage === 'index.html' || currentPage === 'index';
  const isAnalyticsPage = currentPage === 'analytics.html' || currentPage === 'analytics';
  const isEditorPage = currentPage === 'editor.html' || currentPage === 'editor';
  const isGalleryPage = currentPage === 'gallery.html' || currentPage === 'gallery';
  const isDrivePage = currentPage === 'drive.html' || currentPage === 'drive';
  const isDirectoryPage = currentPage === 'directory.html' || currentPage === 'directory';
  const isFieldOfficerPage = currentPage === 'field-officer.html' || currentPage === 'field-officer';
  if (isHomePage || isAnalyticsPage || isEditorPage) return;
  const keepPageLoader = isDirectoryPage || isFieldOfficerPage || isDrivePage || isGalleryPage;
  if (!keepPageLoader || document.getElementById('pageLoadingOverlay')) return;

  const pageCopy = isDrivePage
    ? ['files','folders','documents','uploads','files']
    : isGalleryPage
      ? ['images','media','standards','albums','images']
      : isDirectoryPage
        ? ['contacts','records','branches','details','contacts']
        : ['officers','records','branches','details','officers'];

  const style = document.createElement('style');
  style.id = 'apml-shared-page-loader-style';
  style.textContent = `
    #pageLoadingOverlay.apml-shared-page-loader { position:fixed; inset:0; z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px; background:rgba(253,248,245,.48); -webkit-backdrop-filter:blur(12px) saturate(115%); backdrop-filter:blur(12px) saturate(115%); opacity:1; visibility:visible; transition:opacity .35s ease,visibility .35s ease; }
    #pageLoadingOverlay.apml-shared-page-loader.hide { opacity:0; visibility:hidden; pointer-events:none; }
    #pageLoadingOverlay .loader-card-box { display:flex; flex-direction:column; align-items:center; padding:1.5rem 2rem; border-radius:1.25rem; background:rgba(255,255,255,.82); border:1px solid rgba(255,255,255,.78); box-shadow:0 18px 48px rgba(45,35,30,.12); }
    #pageLoadingOverlay .spinnerContainer { display:flex; flex-direction:column; align-items:center; }
    #pageLoadingOverlay .spinner { width:56px; height:56px; display:grid; border:4px solid transparent; border-radius:50%; border-right-color:var(--primary,#b4232c); animation:apml-tri-spinner 1s infinite linear; }
    #pageLoadingOverlay .spinner::before,#pageLoadingOverlay .spinner::after { content:""; grid-area:1/1; margin:2px; border:inherit; border-radius:50%; animation:apml-tri-spinner 2s infinite; }
    #pageLoadingOverlay .spinner::after { margin:8px; animation-duration:3s; }
    @keyframes apml-tri-spinner { to { transform:rotate(1turn); } }
    #pageLoadingOverlay .loader { color:var(--text-main,#4a4a4a); font-family:var(--font-sans,'Plus Jakarta Sans',sans-serif); font-weight:600; font-size:22px; box-sizing:content-box; height:40px; padding:8px 10px; display:flex; border-radius:8px; }
    #pageLoadingOverlay .words { overflow:hidden; color:var(--primary,#b4232c); }
    #pageLoadingOverlay .word { display:block; height:100%; padding-left:6px; animation:apml-cycle-words 5s infinite; }
    @keyframes apml-cycle-words { 10%{transform:translateY(-105%)} 25%{transform:translateY(-100%)} 35%{transform:translateY(-205%)} 50%{transform:translateY(-200%)} 60%{transform:translateY(-305%)} 75%{transform:translateY(-300%)} 85%{transform:translateY(-405%)} 100%{transform:translateY(-400%)} }
    @media(max-width:480px) { #pageLoadingOverlay .loader-card-box { padding:1.35rem 1.5rem; } #pageLoadingOverlay .loader { font-size:20px; } }
    @media(prefers-reduced-motion:reduce) { #pageLoadingOverlay .spinner,#pageLoadingOverlay .spinner::before,#pageLoadingOverlay .spinner::after,#pageLoadingOverlay .word { animation:none; } #pageLoadingOverlay.apml-shared-page-loader { transition:none; } }
  `;
  (document.head || document.documentElement).appendChild(style);

  const overlay=document.createElement('div');
  overlay.id='pageLoadingOverlay';
  overlay.className='apml-shared-page-loader';
  overlay.setAttribute('role','status');
  overlay.setAttribute('aria-live','polite');
  overlay.innerHTML=`
    <div class="loader-card-box"><div class="spinnerContainer">
      <div class="spinner" aria-hidden="true"></div>
      <div class="loader"><p>loading</p><div class="words">${pageCopy.map(word => `<span class="word">${word}</span>`).join('')}</div></div>
    </div></div>`;
  if(document.body) document.body.insertBefore(overlay,document.body.firstChild);
  else document.addEventListener('DOMContentLoaded',()=>document.body.insertBefore(overlay,document.body.firstChild),{once:true});

  let dismissed=false;
  const dismiss=()=>{
    if(dismissed)return;
    dismissed=true;
    window.setTimeout(()=>{ overlay.classList.add('hide'); window.setTimeout(()=>overlay.remove(),450); },250);
  };
  if(document.readyState==='complete') window.setTimeout(dismiss,500);
  else window.addEventListener('load',dismiss,{once:true});
  window.setTimeout(dismiss,12000);
})();

// =========================================================
// SORTABLEJS - SHARED DRAG-AND-DROP LIBRARY
// Available on every page that loads common.js.
// Pages can await window.APMLSortableReady before creating sortable lists.
// =========================================================
(function loadSortableJS() {
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  if (currentPage === 'analytics.html' || currentPage === 'analytics' || currentPage === 'editor.html' || currentPage === 'editor' || currentPage === 'gallery.html' || currentPage === 'gallery' || currentPage === 'drive.html' || currentPage === 'drive') return;
  if (window.Sortable) {
    window.APMLSortableReady = Promise.resolve(window.Sortable);
    return;
  }
  if (window.APMLSortableReady) return;

  window.APMLSortableReady = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-apml-sortablejs]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Sortable), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js';
    script.async = true;
    script.dataset.apmlSortablejs = 'true';
    script.onload = () => {
      if (window.Sortable) resolve(window.Sortable);
      else reject(new Error('SortableJS loaded but window.Sortable is unavailable.'));
    };
    script.onerror = () => reject(new Error('Unable to load SortableJS.'));
    document.head.appendChild(script);
  });
  window.APMLSortableReady.catch((error) => {
    console.warn('APML SortableJS load failed:', error);
  });
})();

// =========================================================
// APML STANDALONE APK DETECTION
// =========================================================
(function detectStandaloneApp() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                    || window.navigator.standalone 
                    || document.referrer.includes('android-app://');

  if (isStandalone) {
    document.documentElement.classList.add('is-native-apk');
  }
})();

// =========================================================
// APML WEB APP INSTALL PROMOTION (PWA SHORTCUT)
// =========================================================
(function initPwaInstallPromotion() {
  // Make the install manifest available on every portal page.
  if (!document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.json';
    document.head.appendChild(manifest);
  }

  // iOS home-screen icon; Android/Chrome uses the PNG entries in manifest.json.
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = '/icon-192.png';
    document.head.appendChild(appleIcon);
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone
    || document.referrer.includes('android-app://');
  if (isStandalone) return;

  // Show the install suggestion on phones only; never on desktop or tablets.
  const userAgent = navigator.userAgent || '';
  const isPhone = /iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|Opera Mini/i.test(userAgent);
  if (!isPhone) return;

  let deferredInstallPrompt = null;
  let dismissedUntil = 0;
  try {
    dismissedUntil = Number(localStorage.getItem('apml-pwa-promo-dismissed-until') || 0);
  } catch (error) {}

  const style = document.createElement('style');
  style.textContent = `
    .apml-app-promo-backdrop{position:fixed;inset:0;z-index:100500;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.58);backdrop-filter:blur(7px);opacity:0;animation:apmlPromoFade .24s ease forwards}
    .apml-app-promo-card{position:relative;width:min(100%,410px);overflow:hidden;border:1px solid rgba(255,255,255,.72);border-radius:24px;background:var(--surface-card,#fff);color:var(--text-main,#1c1917);box-shadow:0 28px 90px rgba(0,0,0,.28);padding:30px 26px 24px;text-align:center;font-family:var(--font-sans,Arial,sans-serif)}
    .apml-app-promo-top{height:5px;position:absolute;inset:0 0 auto;background:linear-gradient(90deg,#991b1b,#dc2626,#fb7185)}
    .apml-app-promo-logo{width:66px;height:66px;object-fit:contain;margin:4px auto 16px;display:block}
    .apml-app-promo-kicker{font-size:11px;letter-spacing:.16em;font-weight:800;color:#b91c1c;text-transform:uppercase;margin-bottom:8px}
    .apml-app-promo-title{font-size:24px;line-height:1.2;font-weight:800;letter-spacing:-.04em;margin:0 0 10px;color:var(--text-main,#1c1917)}
    .apml-app-promo-copy{font-size:14px;line-height:1.65;color:var(--text-secondary,#57534e);margin:0 auto 22px;max-width:320px}
    .apml-app-promo-actions{display:grid;gap:10px}
    .apml-app-promo-install{display:flex;align-items:center;justify-content:center;min-height:48px;border:0;border-radius:13px;background:#b91c1c;color:#fff!important;font:800 14px inherit;text-decoration:none!important;cursor:pointer;box-shadow:0 7px 18px rgba(185,28,28,.2)}
    .apml-app-promo-dismiss{min-height:44px;border:0;background:transparent;color:var(--text-muted,#78716c);font:700 13px inherit;cursor:pointer}
    .apml-app-promo-note{font-size:11px;line-height:1.55;color:var(--text-muted,#78716c);margin-top:13px}
    .apml-app-promo-close{position:absolute;right:13px;top:13px;width:34px;height:34px;border:0;border-radius:50%;background:var(--surface-subtle,#f5f5f4);color:var(--text-secondary,#57534e);font-size:21px;line-height:1;cursor:pointer}
    @keyframes apmlPromoFade{to{opacity:1}}
    @media(prefers-reduced-motion:reduce){.apml-app-promo-backdrop{animation:none;opacity:1}}
  `;
  document.head.appendChild(style);

  let backdrop = null;
  let installButton = null;
  let note = null;
  let hasBeenShown = false;

  function closePromo(saveDismissal = true) {
    if (!backdrop) return;
    if (saveDismissal) {
      try { localStorage.setItem('apml-pwa-promo-dismissed-until', String(Date.now() + 7 * 24 * 60 * 60 * 1000)); } catch (error) {}
    }
    backdrop.remove();
    backdrop = null;
  }

  function showPromo() {
    if (hasBeenShown || Date.now() < dismissedUntil || window.matchMedia('(display-mode: standalone)').matches) return;
    hasBeenShown = true;
    backdrop = document.createElement('div');
    backdrop.className = 'apml-app-promo-backdrop';
    backdrop.setAttribute('role','dialog');
    backdrop.setAttribute('aria-modal','true');
    backdrop.setAttribute('aria-labelledby','apml-app-promo-title');
    backdrop.innerHTML = `
      <section class="apml-app-promo-card">
        <div class="apml-app-promo-top"></div>
        <button class="apml-app-promo-close" type="button" aria-label="Close install prompt">×</button>
        <img class="apml-app-promo-logo" src="logo.svg" alt="APML Portal">
        <div class="apml-app-promo-kicker">Your workspace, one tap away</div>
        <h2 class="apml-app-promo-title" id="apml-app-promo-title">Add APML Portal to your home screen</h2>
        <p class="apml-app-promo-copy">Open your portal like an app — quickly, in its own window, without searching for the website every time.</p>
        <div class="apml-app-promo-actions">
          <button class="apml-app-promo-install" type="button">Add APML Shortcut</button>
          <button class="apml-app-promo-dismiss" type="button">Continue in Browser</button>
        </div>
        <div class="apml-app-promo-note">Free · No APK · Uses your browser</div>
      </section>`;
    document.body.appendChild(backdrop);
    installButton = backdrop.querySelector('.apml-app-promo-install');
    note = backdrop.querySelector('.apml-app-promo-note');

    installButton.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        if (choice && choice.outcome === 'accepted') closePromo(false);
        else if (note) note.textContent = 'No problem — you can add APML Portal later from your browser menu.';
        return;
      }
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (note) note.textContent = isIOS
        ? 'In Safari, tap Share, then choose “Add to Home Screen”.'
        : 'Open your browser menu (⋮) and choose “Install app” or “Add to Home screen”.';
      installButton.textContent = 'Got it';
      installButton.onclick = () => closePromo();
    });

    backdrop.querySelector('.apml-app-promo-close').addEventListener('click', () => closePromo());
    backdrop.querySelector('.apml-app-promo-dismiss').addEventListener('click', () => closePromo());
    backdrop.addEventListener('click', event => { if (event.target === backdrop) closePromo(); });
    document.addEventListener('keydown', function onEscape(event) {
      if (event.key === 'Escape' && backdrop) {
        closePromo();
        document.removeEventListener('keydown', onEscape);
      }
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    closePromo(false);
  });

  // Give the page time to load before showing the install suggestion.
  window.addEventListener('load', () => {
    window.setTimeout(showPromo, 5000);
  }, { once: true });
})();
 
// =========================================================
// HISTORICAL DAILY ANALYTICS TRACKER
// =========================================================
// Keep analytics date keys aligned with the dashboard's Asia/Kolkata calendar.
function getIndiaDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function hasAnalyticsConsent() {
  try {
    const choice = JSON.parse(localStorage.getItem('apml-privacy-consent') || 'null');
    return !!(choice && choice.analytics === true) || localStorage.getItem('apml-analytics-consent') === 'yes';
  } catch (_) { return false; }
}
window.apmlHasAnalyticsConsent = hasAnalyticsConsent;

function logDailyActivity(type) {
  try {
    if (!hasAnalyticsConsent() || typeof firebase === 'undefined' || !firebase.database) return;
    const db = firebase.database();
    const today = getIndiaDateKey();
    const logRef = db.ref(`analytics/daily_logs/${today}/${type}`);
    logRef.transaction((currentValue) => (currentValue || 0) + 1);
  } catch (err) {
    console.warn("Daily log error:", err);
  }
}

function recordDailyVisitorIfAllowed() {
  if (!hasAnalyticsConsent()) return;
  try {
    const today = getIndiaDateKey();
    if (localStorage.getItem('apml_last_visit_date') !== today) {
      logDailyActivity('visitors');
      localStorage.setItem('apml_last_visit_date', today);
    }
  } catch (_) {}
}
window.addEventListener('DOMContentLoaded', recordDailyVisitorIfAllowed);
window.addEventListener('apml-analytics-consent-granted', recordDailyVisitorIfAllowed);

// --- TRACK PEAK CONCURRENT ONLINE USERS PER DAY ---
let dailyPeakTrackingStarted = false;
function initDailyPeakTracker() {
  if (dailyPeakTrackingStarted || !hasAnalyticsConsent()) return;
  try {
    if (!hasAnalyticsConsent() || typeof firebase === 'undefined' || !firebase.database) return;
    const db = firebase.database();
    dailyPeakTrackingStarted = true;
    const today = getIndiaDateKey();
    const peakRef = db.ref(`analytics/daily_logs/${today}/peak_online`);

    // Monitor active presence nodes in real-time
    db.ref("presence").on("value", (snap) => {
      const currentActive = snap.numChildren() || 0;
      if (currentActive > 0) {
        // Atomically update peak if current online count exceeds today's previous high
        peakRef.transaction((currentPeak) => {
          return Math.max(currentPeak || 0, currentActive);
        });
      }
    });
  } catch (err) {
    console.warn("Peak online tracking error:", err);
  }
}

window.addEventListener('DOMContentLoaded', initDailyPeakTracker);
window.addEventListener('apml-analytics-consent-granted', initDailyPeakTracker);

// =========================================================
// EMAIL ALERTS REMOVED
// Alerts now go to Telegram through notify.js. This empty function stays only so that any page
// that still calls window.sendPortalNotification(...) keeps working: it sends nothing anywhere.
// =========================================================
window.sendPortalNotification = function () {};

// =========================================================
// APML COMMON HEADER, FOOTER & ROUTE DETECTION SCRIPT
// =========================================================
(function initCommonLayout() {
  function renderHeaderAndFooter() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const isHomePage = (currentPage === "index.html" || currentPage === "" || currentPage === "index");

    // Shared header stays visible on every page.

    // 1. INJECT HEADER (Rotating Hub Logo + Navigation)
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
      headerContainer.innerHTML = `
        <header class="site-header" id="siteHeader">
          <div class="header-inner">
            <div style="display: flex; align-items: center; gap: 20px;">
              <a href="/index.html" class="site-logo">
                <div class="logo-badge">
                  <img src="logo.svg" alt="APML Hub" style="width: 24px; height: 24px; display: block; object-fit: contain;">
                </div>
                <div class="logo-text">APML <span>Portal</span></div>
              </a>

            </div>

<div class="header-controls">
              <!-- Compact light/dark theme switch -->
              <label class="theme-switch" for="themeToggle" title="Switch theme">
                <input id="themeToggle" class="theme-switch-input" type="checkbox" role="switch" aria-label="Switch to dark theme">
                <span class="theme-switch-track" aria-hidden="true">
                  <span class="theme-switch-thumb"></span>
                </span>
              </label>
              <!-- Animated SVG hamburger toggle -->
              <label class="hamburger hamburger-btn" id="hamburgerBtn">
              <input id="burger-checkbox" class="burger-checkbox" type="checkbox" aria-label="Toggle navigation menu" aria-controls="navMenu">
              <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                <path class="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
                <path class="line" d="M7 16 27 16"></path>
              </svg>
              </label>
            </div>

            <!-- Navigation Menu Dropdown -->
            <nav class="nav-menu" id="navMenu">
              <a href="/index.html" class="nav-link ${isHomePage ? 'active' : ''}">
                <span class="material-symbols-outlined">home</span>
                <span>Home</span>
              </a>
              <a href="/modules/editor.html" class="nav-link ${currentPage === 'editor.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">edit_note</span>
                <span>Quotation Editor</span>
              </a>
              <a href="/modules/gallery.html" class="nav-link ${currentPage === 'gallery.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">photo_library</span>
                <span>Gallery</span>
              </a>
              <a href="/modules/drive.html" class="nav-link ${currentPage === 'drive.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">cloud</span>
                <span>Cloud Drive</span>
              </a>
              <a href="/modules/directory.html" class="nav-link ${currentPage === 'directory.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">location_city</span>
                <span>Hub &amp; Branch Directory</span>
              </a>
              <a href="/modules/field-officer.html" class="nav-link ${currentPage === 'field-officer.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">badge</span>
                <span>Field Officer Directory WCRO</span>
              </a>
              <a href="/modules/APML-Lite.html" class="nav-link ${currentPage === 'APML-Lite.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">grid_view</span>
                <span>APML Lite</span>
              </a>
              <a href="/modules/car-rate.html" class="nav-link ${currentPage === 'car-rate.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">directions_car</span>
                <span>Car Rate</span>
              </a>
              <a href="/modules/local-rate.html" class="nav-link ${currentPage === 'local-rate.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">local_shipping</span>
                <span>APML Local Rate</span>
              </a>
              <a href="/modules/system-health.html" class="nav-link ${currentPage === 'system-health.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">monitor_heart</span>
                <span>System Health</span>
              </a>
            </nav>
          </div>
        </header>
      `;

      // Shared light/dark theme switch. Keep the saved preference in sync across every page.
      const themeToggle = document.getElementById("themeToggle");
      function syncThemeToggle() {
        if (!themeToggle) return;
        const dark = document.documentElement.getAttribute("data-theme") === "dark";
        themeToggle.checked = dark;
        themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
        themeToggle.title = dark ? "Switch to light theme" : "Switch to dark theme";
      }
      syncThemeToggle();
      themeToggle?.addEventListener("change", () => {
        const nextTheme = themeToggle.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", nextTheme);
        try { localStorage.setItem("apml-theme", nextTheme); } catch (error) {}
        syncThemeToggle();
      });

      // Event Listeners for Hamburger Toggle & Outside Clicks
      const hamburgerBtn = document.getElementById("hamburgerBtn");
      const burgerCheckbox = document.getElementById("burger-checkbox");
      const navMenu = document.getElementById("navMenu");
      const siteHeader = document.getElementById("siteHeader");

      function setMenuOpen(isOpen) {
        if (!hamburgerBtn || !burgerCheckbox || !navMenu) return;
        burgerCheckbox.checked = isOpen;
        hamburgerBtn.classList.toggle("is-active", isOpen);
        navMenu.classList.toggle("open", isOpen);
        hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }

      if (hamburgerBtn && burgerCheckbox && navMenu) {
        burgerCheckbox.addEventListener("change", () => {
          setMenuOpen(burgerCheckbox.checked);
        });

        navMenu.querySelectorAll(".nav-link").forEach((link) => {
          link.addEventListener("click", () => setMenuOpen(false));
        });

        document.addEventListener("click", (e) => {
          if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target) && e.target !== burgerCheckbox) {
            setMenuOpen(false);
          }
        });

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") setMenuOpen(false);
        });
      }

    // 2. INJECT EDGE-TO-EDGE STRETCHED FOOTER
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
      const currentYear = new Date().getFullYear();
      footerContainer.innerHTML = `
        <footer class="site-footer-extended apml-tw-footer">
          <div class="apml-tw-footer-inner">
            <div class="apml-tw-footer-top">
              <section class="apml-tw-brand" aria-label="APML Portal information">
                <a class="apml-tw-logo" href="/index.html" aria-label="APML Portal home">
                  <img src="/logo.svg" alt="APML Portal" width="150" height="42">
                </a>
                <p>Independent, unofficial utility website built primarily to help APML employees with selected work tasks. It is not an official company website.</p>
                <ul class="apml-tw-socials" aria-label="Contact and social links">
                  <li><a href="mailto:Kundar.work@gmail.com" aria-label="Email APML Portal" title="Email">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 8L4 7v10h16V7l-8 6zm0-2 7-4H5l7 4z"/></svg>
                  </a></li>
                  <li><a href="https://wa.me/919910579530" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.5l6-1.6A11.8 11.8 0 0 0 23.5 11a11.7 11.7 0 0 0-3-7.5zM12 21a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.5.9.9-3.4-.2-.4A9.8 9.8 0 1 1 12 21zm5.4-7.3c-.3-.2-1.7-.9-2-.9-.2-.1-.4-.2-.6.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.2.2 2 3.1 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/></svg>
                  </a></li>
                  <li><a href="https://github.com/kundarwork-debug" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" title="GitHub">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.2-1.6-1.2-1.6-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.6-2.8 5.6-5.4 5.9.4.3.8 1 .8 2v3c0 .3.2.7.8.6A11.2 11.2 0 0 0 12 .8z"/></svg>
                  </a></li>
                </ul>
                <div class="footer-developer-tag">Designed &amp; developed by <span>Prasad Kundar</span></div>
              </section>

              <div class="apml-tw-link-grid">
                <nav aria-label="Work tools">
                  <h2>Work tools</h2>
                  <ul>
                    <li><a href="/index.html">Home Portal</a></li>
                    <li><a href="/modules/editor.html">Quotation Editor</a></li>
                    <li><a href="/modules/gallery.html">Packing Gallery</a></li>
                    <li><a href="/modules/drive.html">Cloud Drive</a></li>
                  </ul>
                </nav>
                <nav aria-label="Directories">
                  <h2>Directories</h2>
                  <ul>
                    <li><a href="/modules/directory.html">Hub &amp; Branch Directory</a></li>
                    <li><a href="/modules/field-officer.html">Field Officer WCRO</a></li>
                  </ul>
                </nav>
                <nav aria-label="Helpful links">
                  <h2>Helpful links</h2>
                  <ul>
                    <li><a href="/about.html">About Developer</a></li>
                    <li><a href="/policy/bug-report.html">Report a Bug</a></li>
                  </ul>
                </nav>
                <nav aria-label="Legal">
                  <h2>Legal</h2>
                  <ul>
                    <li><a href="/policy/privacy.html">Privacy Policy</a></li>
                    <li><a href="/policy/terms.html">Terms &amp; Conditions</a></li>
                    <li><a href="/policy/cookies.html">Cookies &amp; Storage Policy</a></li>
                  </ul>
                </nav>
              </div>
            </div>

            <div class="apml-tw-footer-bottom">
              <p>© ${currentYear} APML Portal. All rights reserved.</p>
              <div class="apml-tw-footer-actions">
                <a href="/about.html" class="footer-about-pill">
                  <img src="https://github.com/kundarwork-debug.png" alt="Profile" onerror="this.src='/logo.svg'">
                  <span>About Developer</span>
                </a>
                <button type="button" class="footer-fun-btn" onclick="window.location.href='/404.html'" title="Play!">
                  <span class="play">play</span><span class="now">now!</span>
                </button>
                <button type="button" class="footer-back-to-top-btn" id="footerBackToTopBtn" aria-label="Scroll to top" title="Go to top">
                  <svg class="svgIcon" viewBox="0 0 384 512" aria-hidden="true"><path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </footer>
        <style>
          #footer-container .apml-tw-footer {
            --apml-tw-accent: var(--md-sys-color-primary, #b91c1c);
            --apml-tw-bg: var(--apml-color-page, #f7f5f0);
            --apml-tw-text: var(--apml-color-text, #292524);
            --apml-tw-muted: var(--apml-color-text-secondary, #57534e);
            display:block;width:100%;box-sizing:border-box;
            padding:0;background:var(--apml-tw-bg)!important;
            background-color:var(--apml-tw-bg)!important;background-image:none!important;
            color:var(--apml-tw-text);border-top:1px solid var(--apml-color-border,#e7dfd8);
          }
          #footer-container .apml-tw-footer-inner{max-width:1280px;margin:0 auto;padding:56px 32px 26px}
          #footer-container .apml-tw-footer-top{display:grid;grid-template-columns:minmax(220px,1fr) minmax(0,2fr);gap:56px}
          #footer-container .apml-tw-brand{display:flex;flex-direction:column;align-items:flex-start;gap:18px;min-width:0}
          #footer-container .apml-tw-logo{display:inline-flex;align-items:center;min-height:42px;text-decoration:none}
          #footer-container .apml-tw-logo img{display:block;width:auto;height:38px;max-width:180px;object-fit:contain}
          #footer-container .apml-tw-brand>p{max-width:340px;margin:0;color:var(--apml-tw-muted);font-size:14px;line-height:1.75}
          #footer-container .apml-tw-socials{display:flex;gap:10px;list-style:none;margin:2px 0 0;padding:0}
          #footer-container .apml-tw-socials a{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;background:color-mix(in srgb,var(--apml-tw-text) 7%,transparent);color:var(--apml-tw-muted);transition:background .2s,color .2s,transform .2s}
          #footer-container .apml-tw-socials a:hover{background:var(--apml-tw-accent);color:#fff;transform:translateY(-2px)}
          #footer-container .apml-tw-socials svg{width:19px;height:19px;fill:currentColor}
          #footer-container .apml-tw-brand .footer-developer-tag{margin:0;color:var(--apml-tw-muted);font-size:12px}
          #footer-container .apml-tw-brand .footer-developer-tag span{color:var(--apml-tw-accent)}
          #footer-container .apml-tw-link-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}
          #footer-container .apml-tw-link-grid nav{min-width:0}
          #footer-container .apml-tw-link-grid h2{margin:0 0 20px;color:var(--apml-tw-text);font-size:14px;font-weight:750;letter-spacing:.02em}
          #footer-container .apml-tw-link-grid ul{display:flex;flex-direction:column;gap:14px;list-style:none;margin:0;padding:0}
          #footer-container .apml-tw-link-grid a{color:var(--apml-tw-muted);font-size:13.5px;line-height:1.5;text-decoration:none;transition:color .2s}
          #footer-container .apml-tw-link-grid a:hover{color:var(--apml-tw-accent)}
          #footer-container .apml-tw-footer-bottom{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:42px;padding-top:22px;border-top:1px solid var(--apml-color-border,#e7dfd8)}
          #footer-container .apml-tw-footer-bottom>p{margin:0;color:var(--apml-tw-muted);font-size:12.5px}
          #footer-container .apml-tw-footer-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
          #footer-container .apml-tw-footer-actions .footer-about-pill{background:transparent}
          #footer-container .apml-tw-footer-actions .footer-back-to-top-btn{flex:0 0 42px}
          html[data-theme="dark"] #footer-container .apml-tw-footer{--apml-tw-bg:#10141d;--apml-tw-text:#f8fafc;--apml-tw-muted:#cbd5e1;border-color:#334155}
          @media(max-width:1000px){#footer-container .apml-tw-footer-top{grid-template-columns:1fr;gap:36px}#footer-container .apml-tw-link-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}}
          @media(max-width:700px){#footer-container .apml-tw-footer-inner{padding:38px 22px 24px}#footer-container .apml-tw-link-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 18px}#footer-container .apml-tw-footer-bottom{align-items:flex-start;flex-direction:column;margin-top:34px}#footer-container .apml-tw-footer-actions{gap:10px}}
          @media(max-width:380px){#footer-container .apml-tw-footer-inner{padding-left:16px;padding-right:16px}#footer-container .apml-tw-link-grid{gap:24px 12px}}
          @media(prefers-reduced-motion:reduce){#footer-container .apml-tw-footer *{transition:none!important;animation:none!important}}
        </style>
      `;;

      // Footer Back to Top Click Handler
      const footerBackToTopBtn = document.getElementById("footerBackToTopBtn");
      if (footerBackToTopBtn) {
        footerBackToTopBtn.addEventListener("click", () => {
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        });
      }
    }
  }

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHeaderAndFooter);
  } else {
    renderHeaderAndFooter();
  }

  // =========================================================
  // INTELLIGENT FLOATING MASCOT WIDGET (AUTO-HIDE + CLICK FOR NEW TIP)
  // =========================================================
  (function initFloatingMascot() {
    const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const isIndexPage = (currentPage === "index.html" || currentPage === "" || currentPage === "index");
    const is404Page = (currentPage === "404.html" || currentPage === "404");

    // Keep the floating mascot on desktop web only. It is intentionally
    // omitted on phones, narrow layouts and the native Android app.
    const isMobileLayout = window.matchMedia('(max-width: 768px)').matches;
    const isNativeApk = document.documentElement.classList.contains('is-native-apk');
    if (is404Page || isMobileLayout || isNativeApk) return;

    // Five rotating tips for each page
    const pageTips = {
      "index.html": [
        "Welcome to APML Portal! Select any module below to get started. 🚀",
        "Tip: Use the hamburger menu on top to quickly navigate anywhere.",
        "All telemetry systems and personnel metrics are live and synced!",
        "Need a quotation? Open the Quotation Editor, and your PDF is saved to the Drive automatically. 📄",
        "Click my avatar anytime for another quick hint!"
      ],
      "editor.html": [
        "💡 Pro Tip: Fill out quotation line items and click 'Preview A4' to generate an official PDF.",
        "You can save your drafts locally right from this studio.",
        "Freight calculations compute automatically based on your inputs.",
        "Every PDF you download is also saved to Drive in the Quotation folder. 📁",
        "Delete any charge line you don't need with the red bin icon, and the totals update instantly."
      ],
      "gallery.html": [
        "💡 Tip: Select a folder category and click 'Upload Media' to add photos or videos instantly.",
        "Click any asset card to preview it in the full-screen lightbox.",
        "Deleted items are automatically safely archived into the Trash Archive.",
        "You can select several photos or videos at once and upload them in one go. 📸",
        "Views and downloads are counted for every media item."
      ],
      "drive.html": [
        "💡 Tip: Use 'Upload File' to add documents, images and videos straight into the current folder.",
        "Create folders with 'New Folder' to keep your files organised.",
        "Deleted files are automatically routed to the Trash Archive for easy recovery.",
        "Quotation PDFs from the editor land in the Quotation folder automatically. 📁"
      ],
      "directory.html": [
        "💡 Tip: Use the search bar to look up branch HODs and direct phone contacts.",
        "Click on location pins to open exact addresses in Google Maps.",
        "Search works on city, in-charge name, phone number or designation.",
        "Use the hamburger menu to jump to any other module quickly.",
        "Click my avatar anytime for another quick hint!"
      ],
      "apml-lite.html": [
        "💡 Tip: Enter volume dimensions to calculate CFT up to the 450 CFT ceiling limit.",
        "Destination pricing and floor constraints compute automatically.",
        "This calculator covers the Mumbai & Pune hub rates.",
        "Enter a CFT volume between 1 and 450 to see the rate straight away.",
        "Click my avatar anytime for another quick hint!"
      ],
      "local-rate.html": [
        "💡 Tip: Enter the volume in CFT to calculate the local shifting rate.",
        "Rates update instantly as you change the values.",
        "Double-check the volume, since it drives the whole estimate.",
        "Use the hamburger menu to switch to the other calculators.",
        "Click my avatar anytime for another quick hint!"
      ],
      "car-rate.html": [
        "💡 Tip: Type the vehicle model, for example Nexon, Creta or Brezza, to pick the car.",
        "Enter the distance in KM to get the transport estimate.",
        "Vehicle type and distance together decide the final rate.",
        "Use the hamburger menu to switch to the other calculators.",
        "Click my avatar anytime for another quick hint!"
      ],
      "field-officer.html": [
        "💡 Tip: Search by name, branch (MUM, PUN, AHMD), APM code, designation or phone.",
        "Type a branch code like MUM or PUN to see its field officers.",
        "Every field officer's APM code is listed for quick reference.",
        "Use the hamburger menu to jump to other modules.",
        "Click my avatar anytime for another quick hint!"
      ],
      "wcro-consignment-status-old.html": [
        "💡 Tip: Filter records by any keyword to find a consignment quickly.",
        "This is the older WCRO status view, kept for reference.",
        "Try a consignment number, city or status word in the filter box.",
        "Use the hamburger menu to jump to other modules.",
        "Click my avatar anytime for another quick hint!"
      ],
      "about.html": [
        "Hi! This page tells the story behind the APML Portal. 👋",
        "Scroll down to see how the portal is built and what powers it.",
        "Everything is synced in real-time with Firebase and Supabase.",
        "Use the hamburger menu to explore the other modules.",
        "Click my avatar anytime for another quick hint!"
      ]
    };

    const defaultTips = [
      "Welcome to the APML Enterprise workspace! 💼",
      "Everything is synced in real-time with Firebase and Supabase.",
      "Use the hamburger menu to jump between modules.",
      "Quotation PDFs are saved to the Drive automatically. 📁",
      "Click my avatar anytime for another quick hint!"
    ];

    const tipsArray = pageTips[currentPage] || defaultTips;
    let tipIndex = Math.floor(Math.random() * tipsArray.length);

    // Create Support FAB Container
    const supportFab = document.createElement('div');
    supportFab.className = 'support-fab';
    supportFab.id = 'support-fab';
    if (!isIndexPage) {
      supportFab.classList.add('visible'); // On other pages, start visible
    }

    supportFab.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0px;">      
        <div class="support-msg-bubble" id="supportBubble" style="position: relative;">
          <span style="position: relative; z-index: 2; display: block; margin: 0; padding: 0;"><span id="typewriter-text"></span><span class="cursor" id="typeCursor">|</span></span>
        </div>      
        <div class="support-btn" id="supportAvatarBtn" title="Click for a new message!" style="cursor: pointer;">        
          <span class="support-mascot" id="apmlWobnimo" role="img" aria-label="APML assistant mascot">
            <span class="support-mascot-sprite support-mascot-directions"></span>
            <span class="support-mascot-sprite support-mascot-reactions"></span>
          </span>      
        </div>    
      </div>  
    `;

    // Append Mascot Styles
    const mascotStyle = document.createElement('style');
    mascotStyle.innerHTML = `
      .support-fab {
        position: fixed;
        bottom: 32px;
        right: 32px;
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.35s ease, visibility 0.35s ease;
        pointer-events: none;
      }
      .support-fab.visible {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
      .support-fab > div {
        pointer-events: inherit;
      }
      .support-msg-bubble {
        position: relative;
        top: 20px;
        margin-right: 12px; /* shift the announcement bubble slightly left of the mascot */
        z-index: 2;
        background-color: #ffffff;
        color: var(--text-main, #1c1917);
        border: 2px solid var(--text-main, #1c1917);
        box-shadow: 4px 4px 0px var(--text-main, #1c1917);
        display: block;
        padding: 4px 16px 10px;
        margin: 0;
        min-height: 0;
        height: auto;
        box-sizing: border-box;
        border-radius: 20px 20px 0 20px;
        font-size: 14.5px;
        font-weight: 600;
        max-width: 260px;
        opacity: 0;
        transform: translateY(10px) scale(0.9);
        transition: opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease;
        pointer-events: auto;
        line-height: 1.5;
      }
      .support-msg-bubble.show {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .cursor {
        display: inline-block;
        width: 2px;
        background-color: var(--text-main, #1c1917);
        margin-left: 2px;
        animation: blink 1s step-end infinite;
      }
      @keyframes blink { 50% { opacity: 0; } }
      .support-btn {
        width: 136px;
        height: 136px;
        border-radius: 50%;
        border: 3px solid var(--text-main, #1c1917);
        box-shadow: 4px 4px 0px var(--text-main, #1c1917);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        overflow: hidden;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      }
      .support-mascot {
        position: relative;
        display: block;
        width: 128px;
        height: 128px;
        max-width: 100%;
        max-height: 100%;
        pointer-events: none;
      }
      .support-mascot-sprite {
        position: absolute;
        inset: 0;
        display: block;
        background-size: 300% 300%;
        background-repeat: no-repeat;
        background-position: 50% 50%;
      }
      .support-mascot-directions {
        background-image: url("https://koboyo.com/page-mascot/mascots/beard-directions.webp");
      }
      .support-mascot-reactions {
        background-image: url("https://koboyo.com/page-mascot/mascots/beard-reactions.webp");
        opacity: 0;
      }
      .support-btn {
        border: 0;
        box-shadow: none;
        overflow: visible;
        background: transparent;
        margin-right: -10px; /* move the mascot slightly closer to the screen edge */
      }
      .support-btn:hover {
        background: transparent;
      }
      @media (max-width: 600px) {
        .support-fab { right: 14px; bottom: 18px; }
        .support-msg-bubble { margin-right: 8px; }
        .support-btn { width: 108px; height: 108px; margin-right: -6px; }
        .support-mascot { width: 104px; height: 104px; }
      }
      /* Keep the mascot stationary on hover; no lift or shadow ring. */
      .support-fab:hover .support-btn {
        transform: none !important;
        box-shadow: none !important;
      }

      /* ---- moods ---- */
      .support-btn.apml-mood-sleep { opacity: 0.55; filter: grayscale(0.35); transition: opacity 0.6s ease, filter 0.6s ease; }
      .support-zzz { position: absolute; right: 74px; bottom: 14px; font-size: 20px; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; }
      .support-zzz.show { opacity: 1; animation: apmlZzz 2.4s ease-in-out infinite; }
      @keyframes apmlZzz { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-8px) rotate(6deg); } }
      .support-btn.apml-mood-alert { animation: none !important; box-shadow: none !important; border-color: #dc2626; }
      @keyframes apmlBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes apmlGlow {
        0% { box-shadow: 4px 4px 0 var(--text-main, #1c1917), 0 0 0 0 rgba(220, 38, 38, 0.65); }
        100% { box-shadow: 4px 4px 0 var(--text-main, #1c1917), 0 0 0 20px rgba(220, 38, 38, 0); }
      }
      .support-btn.apml-mood-happy { animation: apmlHop 0.5s ease-in-out 3 !important; }
      @keyframes apmlHop {
        0%, 100% { transform: translateY(0) scale(1); }
        40% { transform: translateY(-12px) scale(1.08) rotate(-6deg); }
        70% { transform: translateY(-4px) scale(1.04) rotate(5deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .support-zzz.show, .support-btn.apml-mood-alert, .support-btn.apml-mood-happy { animation: none !important; }
        .support-btn.apml-mood-alert { box-shadow: none !important; }
      }
    `;

    document.head.appendChild(mascotStyle);
    document.body.appendChild(supportFab);

    let pinnedText = '';
    let pinnedShowing = false;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollPosition = scrollY + window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
      const footer = document.querySelector('footer') || document.getElementById('footer-container');
      const footerHeight = footer ? footer.offsetHeight : 0;
      const isNearBottom = scrollPosition > (bodyHeight - footerHeight + 20);

      const fab = document.getElementById('support-fab');
      if (fab) {
        if (isNearBottom) {
          fab.classList.remove('visible');
        } else if (isIndexPage) {
          if (scrollY > 250) {
            fab.classList.add('visible');
          } else {
            fab.classList.remove('visible');
          }
        } else {
          fab.classList.add('visible');
        }
      }
    }, { passive: true });

    let hideTimer = null;
    let isTyping = false;
    let typeToken = 0;

    function playTypewriter(textToType, forceKeepOpen = false, holdMs = 5000, isPin = false) {
      const typeText = document.getElementById('typewriter-text');
      const bubble = document.getElementById('supportBubble');
      const cursor = document.getElementById('typeCursor');
      if (!typeText || !bubble) return;

      const myToken = ++typeToken;
      if (!isPin) pinnedShowing = false;
      typeText.textContent = "";
      setWobnimoState('speaking');
      if (cursor) cursor.style.display = 'inline-block';
      bubble.classList.add('show');
      isTyping = true;

      clearTimeout(hideTimer);

      let typeIndex = 0;
      function step() {
        if (myToken !== typeToken) return;
        if (typeIndex < textToType.length) {
          // Keep the mascot in its speaking animation for the entire
          // typewriter reveal, even if another short-lived state timer fires.
          setWobnimoState('speaking');
          typeText.textContent += textToType.charAt(typeIndex);
        } else {
          isTyping = false;
          setWobnimoState('idle');
          setTimeout(() => {
            if (myToken === typeToken && cursor) cursor.style.display = 'none';
          }, 1500);

          if (isPin) {
            pinnedShowing = true;
          } else if (!forceKeepOpen || pinnedText) {
            hideTimer = setTimeout(() => {
              if (myToken !== typeToken) return;
              if (pinnedText) playTypewriter(pinnedText, true, 0, true);
              else bubble.classList.remove('show');
            }, holdMs);
          }
          return;
        }
        typeIndex++;
        setTimeout(step, 30);
      }
      step();
    }

    const IDLE_MS = 15000, ALERT_MS = 5000, HAPPY_MS = 3000;
    const moodBtn = document.getElementById('supportAvatarBtn');
    const wobnimo = document.getElementById('apmlWobnimo');
    const mascotDirections = wobnimo && wobnimo.querySelector('.support-mascot-directions');
    const mascotReactions = wobnimo && wobnimo.querySelector('.support-mascot-reactions');
    const mascotDirectionNames = ['up-left','up','up-right','left','center','right','down-left','down','down-right'];
    const mascotReactionNames = ['blink','heart','sparkle','surprised','starry','blush','sleepy','dizzy','delighted'];
    let wobnimoStateTimer = null;
    let mascotReactionTimer = null;
    let mascotBoopCount = 0;
    let mascotLastBoop = 0;

    function showSupportDirection(name) {
      if (!mascotDirections) return;
      const i = mascotDirectionNames.indexOf(name);
      mascotDirections.style.backgroundPosition = ((i % 3) * 50) + '% ' + (Math.floor(i / 3) * 50) + '%';
    }
    function showSupportReaction(name, duration = 1200) {
      if (!mascotDirections || !mascotReactions) return;
      const i = mascotReactionNames.indexOf(name);
      if (i < 0) return;
      clearTimeout(mascotReactionTimer);
      mascotReactions.style.backgroundPosition = ((i % 3) * 50) + '% ' + (Math.floor(i / 3) * 50) + '%';
      mascotReactions.style.opacity = '1';
      mascotDirections.style.opacity = '0';
      // A zero duration keeps the reaction visible until another state replaces it.
      if (duration > 0) {
        mascotReactionTimer = setTimeout(() => {
          mascotReactions.style.opacity = '0';
          mascotDirections.style.opacity = '1';
        }, duration);
      } else {
        mascotReactionTimer = null;
      }
    }
    function setWobnimoState(state, resetAfter) {
      if (!wobnimo) return;
      const states = {
        idle: ['center', null],
        speaking: ['center', 'delighted'],
        listening: ['center', 'surprised'],
        thinking: ['center', 'blink'],
        working: ['center', 'starry'],
        sleeping: ['center', 'sleepy'],
        error: ['center', 'surprised'],
        surprised: ['center', 'surprised']
      };
      const [direction, reaction] = states[state] || states.idle;
      showSupportDirection(direction);
      if (reaction) showSupportReaction(reaction, state === 'sleeping' ? 0 : (resetAfter || 1300));
      else {
        clearTimeout(mascotReactionTimer);
        if (mascotReactions) mascotReactions.style.opacity = '0';
        if (mascotDirections) mascotDirections.style.opacity = '1';
      }
      clearTimeout(wobnimoStateTimer);
      if (resetAfter) {
        wobnimoStateTimer = setTimeout(() => {
          if (!asleep) setWobnimoState('idle');
        }, resetAfter);
      }
    }
    function playSupportBoop() {
      const now = Date.now();
      mascotBoopCount = now - mascotLastBoop < 1600 ? mascotBoopCount + 1 : 1;
      mascotLastBoop = now;
      const reaction = mascotBoopCount >= 4 ? 'dizzy' : ['heart','sparkle','delighted'][(mascotBoopCount - 1) % 3];
      if (mascotBoopCount >= 4) mascotBoopCount = 0;
      showSupportReaction(reaction, 900);
    }
    if (moodBtn && wobnimo && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const sectors = ['right','down-right','down','down-left','left','up-left','up','up-right'];
      const sectorSize = Math.PI * 2 / sectors.length;
      window.addEventListener('pointermove', event => {
        const rect = moodBtn.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);

        if (Math.hypot(dx, dy) < 70) { showSupportDirection('center'); return; }
        const sector = (Math.round(Math.atan2(dy, dx) / sectorSize) + sectors.length) % sectors.length;
        if (!mascotReactions || mascotReactions.style.opacity !== '1') showSupportDirection(sectors[sector]);
      }, { passive: true });

      window.addEventListener('pointerout', event => {
        if (event.relatedTarget) return;
        showSupportDirection('center');
      }, { passive: true });
    }

    let typingTimer = null;
    document.addEventListener('input', (event) => {
      if (!event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
      wake();
      setWobnimoState('listening');
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => setWobnimoState('idle'), 1400);
    }, true);
    document.addEventListener('submit', () => {
      wake();
      setWobnimoState('thinking');
      setTimeout(() => {
        if (wobnimo && mascotReactions && mascotReactions.style.opacity === '1') {
          setWobnimoState('working');
          setTimeout(() => {
            if (wobnimo && mascotReactions && mascotReactions.style.opacity === '1') setWobnimoState('idle');
          }, 12000);
        }
      }, 850);
    }, true);
    // Native form validation failures should trigger the mascot's error reaction.
    document.addEventListener('invalid', () => {
      if (window.APMLMascot) window.APMLMascot.alert();
    }, true);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') setWobnimoState('sleeping');
      else setWobnimoState('idle');
    });
    const zzz = document.createElement('div');
    zzz.className = 'support-zzz';
    zzz.setAttribute('aria-hidden', 'true');
    zzz.textContent = '💤';
    supportFab.appendChild(zzz);
    let asleep = false, lastActivity = Date.now(), alertTimer = null, happyTimer = null;

    function wake() {
      lastActivity = Date.now();
      // Ordinary mouse movement must not reset the gaze to centre.
      // Pointer tracking updates the eyes independently on every move.
      if (!asleep) return;
      asleep = false;
      setWobnimoState('idle');
      if (moodBtn) moodBtn.classList.remove('apml-mood-sleep');
      zzz.classList.remove('show');
    }
    function fallAsleep() {
      if (asleep || alertTimer || happyTimer || !moodBtn) return;
      asleep = true;
      setWobnimoState('sleeping');
      moodBtn.classList.add('apml-mood-sleep');
      zzz.classList.add('show');
    }
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll', 'click'].forEach((ev) => {
      window.addEventListener(ev, wake, { passive: true });
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
    setInterval(() => {
      if (!asleep && Date.now() - lastActivity >= IDLE_MS) fallAsleep();
    }, Math.max(100, Math.min(1000, IDLE_MS / 4)));

    function alertMood() {
      if (!moodBtn) return;
      wake();
      clearTimeout(alertTimer);
      moodBtn.classList.remove('apml-mood-happy');
      moodBtn.classList.add('apml-mood-alert');
      setWobnimoState('error', ALERT_MS);
      alertTimer = setTimeout(() => { moodBtn.classList.remove('apml-mood-alert'); alertTimer = null; lastActivity = Date.now(); }, ALERT_MS);
    }
    const happyLines = ['👍 Nice work!', '🎉 All done!', '✅ Done, great job!'];
    function happyMood(text) {
      if (!moodBtn) return;
      wake();
      clearTimeout(happyTimer);
      moodBtn.classList.remove('apml-mood-alert');
      clearTimeout(alertTimer); alertTimer = null;
      moodBtn.classList.add('apml-mood-happy');
      // Keep Wobnimo in its neutral pose; APML's own bounce handles the celebration without the built-in circular ring.
      setWobnimoState('idle', HAPPY_MS);
      happyTimer = setTimeout(() => { moodBtn.classList.remove('apml-mood-happy'); happyTimer = null; lastActivity = Date.now(); }, HAPPY_MS);
      const line = String(text || happyLines[Math.floor(Math.random() * happyLines.length)]);
      playTypewriter(line, false, 4500);
    }

    window.APMLMascot = {
      say: function (text, opts) {
        if (!text) return;
        const keepOpen = opts && opts.keepOpen !== undefined ? !!opts.keepOpen : isIndexPage;
        playTypewriter(String(text), keepOpen, (opts && Number(opts.hold)) || 5000);
      },
      alert: alertMood,
      happy: happyMood,
      wake: wake,
      isAsleep: function () { return asleep; },
      pin: function (text) {
        text = String(text || '').trim();
        if (!text) return;
        if (pinnedText === text && pinnedShowing) return;
        pinnedText = text;
        playTypewriter(text, true, 0, true);
      },
      unpin: function () {
        if (!pinnedText) return;
        pinnedText = '';
        pinnedShowing = false;
        typeToken++;
        isTyping = false;
        const bubble = document.getElementById('supportBubble');
        if (bubble) bubble.classList.remove('show');
        window.dispatchEvent(new Event('scroll'));
      }
    };

    setTimeout(() => {
      if (!isTyping && typeToken === 0 && !pinnedText && (!isIndexPage || window.scrollY > 250)) {
        playTypewriter(tipsArray[tipIndex], isIndexPage);
      }
    }, 1000);

    const avatarBtn = document.getElementById('supportAvatarBtn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isTyping) return;
        if (pinnedText) { playTypewriter(pinnedText, true, 0, true); playSupportBoop(); return; }

        playSupportBoop();
        tipIndex = (Math.floor(tipIndex) + 1) % tipsArray.length;
        playTypewriter(tipsArray[tipIndex], isIndexPage);
      });
    }
  })();

  // 3. SERVICE WORKER REGISTRATION (PWA Support)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('ServiceWorker registration note:', err);
      });
    });
  }

  // 4. HARDWARE BACK BUTTON NAVIGATION TRAP
  window.addEventListener('popstate', () => {
    const navMenu = document.getElementById("navMenu");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const burgerCheckbox = document.getElementById("burger-checkbox");
    if (navMenu && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      if (hamburgerBtn) {
        hamburgerBtn.classList.remove('is-active');
        hamburgerBtn.setAttribute("aria-expanded", "false");
      }
      if (burgerCheckbox) burgerCheckbox.checked = false;
    }
  });
})();

// ---------------------------------------------------------------------
// ALERTS: load notify.js
// ---------------------------------------------------------------------
(function loadNotify() {
  if (window.APMNotify) return;
  var s = document.createElement('script');
  // Always load the shared Telegram notifier from the site root, regardless
  // of whether common.js is used by a root page or a page inside /modules.
  s.src = new URL('/notify.js?v=8', window.location.origin).href;
  s.async = true;
  document.head.appendChild(s);
})();

// Station tracker is not included in this repository; do not request a missing script.

// Privacy-aware visitor analytics is shared across portal pages.
(function loadVisitorTracker() {
  if (window.__apmlVisitorTrackerRequested) return;
  window.__apmlVisitorTrackerRequested = true;
  var script = document.createElement('script');
  script.src = '/core/visitor-tracker.js?v=10';
  script.async = true;
  document.head.appendChild(script);
})();
