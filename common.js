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
// DIWALI FESTIVE THEME & ANIMATION OVERLAY
// =========================================================
(function initDiwaliTheme() {
  if (document.getElementById('apmlDiwaliStyles')) return;

  const style = document.createElement('style');
  style.id = 'apmlDiwaliStyles';
  style.innerHTML = `
    body.diwali-theme {
      background: radial-gradient(circle at 50% 10%, rgba(251, 191, 36, 0.18) 0%, transparent 60%),
                  radial-gradient(circle at 85% 90%, rgba(249, 115, 22, 0.12) 0%, transparent 50%),
                  linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%) !important;
    }

    body.diwali-theme .ambient-glow,
    body.diwali-theme .ambient-bg {
      background: 
        radial-gradient(circle at 50% 18%, rgba(251, 191, 36, 0.45) 0%, transparent 65%),
        radial-gradient(circle at 85% 85%, rgba(249, 115, 22, 0.35) 0%, transparent 55%) !important;
    }

    .diwali-sparkle {
      position: fixed;
      width: 7px;
      height: 7px;
      background: #fbbf24;
      border-radius: 50%;
      pointer-events: none;
      box-shadow: 0 0 12px #f59e0b, 0 0 24px #d97706;
      animation: floatUpward 4.5s linear infinite;
      z-index: 99998;
    }

    @keyframes floatUpward {
      0% { transform: translateY(100vh) scale(0.4); opacity: 0; }
      15% { opacity: 0.95; }
      85% { opacity: 0.85; }
      100% { transform: translateY(-10vh) scale(1.3); opacity: 0; }
    }

    #diwaliBanner {
      background: linear-gradient(135deg, #991b1b, #b91c1c);
      color: #fef08a;
      text-align: center;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      position: sticky;
      top: 64px;
      z-index: 999;
      box-shadow: 0 4px 14px rgba(185, 28, 28, 0.25);
    }

    #diwaliToggleBtn {
      position: fixed;
      bottom: 24px;
      left: 24px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
      border: none;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
      z-index: 99999;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    #diwaliToggleBtn:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.6);
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('diwaliBanner')) {
      const banner = document.createElement('div');
      banner.id = 'diwaliBanner';
      banner.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 18px; color: #fde047;">flare</span>
        <span>✨ Wishing you a very Happy &amp; Prosperous Diwali from APML Portal! May your operations shine bright. ✨</span>
        <span class="material-symbols-outlined" style="font-size: 18px; cursor: pointer; opacity: 0.8;" onclick="document.getElementById('diwaliBanner').style.display='none'">close</span>
      `;
      document.body.prepend(banner);
    }

    if (!document.getElementById('diwaliToggleBtn')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'diwaliToggleBtn';
      toggleBtn.title = "Toggle Diwali Festive Mode";
      toggleBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 24px;">outdoor_grill</span>`;
      document.body.appendChild(toggleBtn);

      let sparkInterval = null;
      function spawnSparkle() {
        if (!document.body.classList.contains('diwali-theme')) return;
        const sparkle = document.createElement('div');
        sparkle.className = 'diwali-sparkle';
        sparkle.style.left = Math.random() * window.innerWidth + 'px';
        sparkle.style.animationDuration = (3 + Math.random() * 3) + 's';
        sparkle.style.opacity = Math.random();
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 5000);
      }

      let isDiwaliActive = localStorage.getItem('apml_diwali_mode') !== 'false';

      function setDiwaliMode(active) {
        isDiwaliActive = active;
        localStorage.setItem('apml_diwali_mode', active);
        if (active) {
          document.body.classList.add('diwali-theme');
          const b = document.getElementById('diwaliBanner');
          if (b) b.style.display = 'flex';
          if (!sparkInterval) sparkInterval = setInterval(spawnSparkle, 350);
        } else {
          document.body.classList.remove('diwali-theme');
          const b = document.getElementById('diwaliBanner');
          if (b) b.style.display = 'none';
          if (sparkInterval) {
            clearInterval(sparkInterval);
            sparkInterval = null;
          }
          document.querySelectorAll('.diwali-sparkle').forEach(el => el.remove());
        }
      }

      toggleBtn.addEventListener('click', () => setDiwaliMode(!isDiwaliActive));
      setDiwaliMode(isDiwaliActive);
    }
  });
})();

// =========================================================
// HISTORICAL DAILY ANALYTICS TRACKER
// =========================================================
function logDailyActivity(type) {
  try {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    const db = firebase.database();
    
    // Get today's date string in YYYY-MM-DD format (local date)
    const today = new Date().toISOString().split('T')[0];
    const logRef = db.ref(`analytics/daily_logs/${today}/${type}`);
    
    // Atomically increment the counter for today in Firebase
    logRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
    });
  } catch (err) {
    console.warn("Daily log error:", err);
  }
}

// Automatically log unique visitor once per calendar day per browser session
window.addEventListener('DOMContentLoaded', () => {
  const lastVisitDate = localStorage.getItem('apml_last_visit_date');
  const today = new Date().toISOString().split('T')[0];
  
  if (lastVisitDate !== today) {
    logDailyActivity('visitors');
    localStorage.setItem('apml_last_visit_date', today);
  }
});

// --- TRACK PEAK CONCURRENT ONLINE USERS PER DAY ---
function initDailyPeakTracker() {
  try {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    const db = firebase.database();
    
    const today = new Date().toISOString().split('T')[0];
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

    // Add flag to <html> if on home page
    if (isHomePage) {
      document.documentElement.classList.add("is-home-page");
    } else {
      document.documentElement.classList.remove("is-home-page");
    }

    // 1. INJECT HEADER (Rotating Hub Logo + Live Clock + Navigation)
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
      headerContainer.innerHTML = `
        <header class="site-header" id="siteHeader">
          <div class="header-inner">
            <div style="display: flex; align-items: center; gap: 20px;">
              <a href="index.html" class="site-logo">
                <div class="logo-badge">
                  <img src="logo.svg" alt="APML Hub" style="width: 24px; height: 24px; display: block; object-fit: contain;">
                </div>
                <div class="logo-text">APML <span>Portal</span></div>
              </a>

              <!-- Live Header Date & Time Display -->
              <div class="header-live-clock" id="headerLiveClock" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text-muted, #78716c); background: var(--md-sys-color-surface-container-low, #f7ede6); padding: 5px 12px; border-radius: 9999px; border: 1px solid var(--md-sys-color-outline-variant, #ede4de);">
                <span class="material-symbols-outlined" style="font-size: 15px; color: var(--primary, #b91c1c);">schedule</span>
                <span id="liveClockText">Loading time...</span>
              </div>
            </div>

            <!-- Animated Rotating Hamburger Button -->
            <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle navigation menu" aria-expanded="false">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </button>

            <!-- Navigation Menu Dropdown -->
            <nav class="nav-menu" id="navMenu">
              <a href="index.html" class="nav-link ${isHomePage ? 'active' : ''}">
                <span class="material-symbols-outlined">home</span>
                <span>Home</span>
              </a>
              <a href="editor.html" class="nav-link ${currentPage === 'editor.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">edit_note</span>
                <span>Quotation Editor</span>
              </a>
              <a href="gallery.html" class="nav-link ${currentPage === 'gallery.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">photo_library</span>
                <span>Gallery</span>
              </a>
              <a href="drive.html" class="nav-link ${currentPage === 'drive.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">cloud</span>
                <span>Cloud Drive</span>
              </a>
              <a href="directory.html" class="nav-link ${currentPage === 'directory.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">location_city</span>
                <span>Hub &amp; Branch Directory</span>
              </a>
              <a href="field-officer.html" class="nav-link ${currentPage === 'field-officer.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">badge</span>
                <span>Field Officer Directory WCRO</span>
              </a>
              <a href="APML-Lite.html" class="nav-link ${currentPage === 'APML-Lite.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">grid_view</span>
                <span>APML Lite</span>
              </a>
              <a href="car-rate.html" class="nav-link ${currentPage === 'car-rate.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">directions_car</span>
                <span>Car Rate</span>
              </a>
              <a href="local-rate.html" class="nav-link ${currentPage === 'local-rate.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">local_shipping</span>
                <span>APML Local Rate</span>
              </a>
            </nav>
          </div>
        </header>
      `;

      // Initialize Live Clock Updater
      function updateLiveClock() {
        const clockEl = document.getElementById("liveClockText");
        if (clockEl) {
          const now = new Date();
          const options = { 
            weekday: 'short', 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
          };
          clockEl.textContent = now.toLocaleString('en-IN', options);
        }
      }
      updateLiveClock();
      setInterval(updateLiveClock, 1000);

      // Event Listeners for Hamburger Click & Outside Clicks
      const hamburgerBtn = document.getElementById("hamburgerBtn");
      const navMenu = document.getElementById("navMenu");
      const siteHeader = document.getElementById("siteHeader");

      if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = hamburgerBtn.classList.toggle("is-active");
          navMenu.classList.toggle("open", isOpen);
          hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        navMenu.querySelectorAll(".nav-link").forEach((link) => {
          link.addEventListener("click", () => {
            hamburgerBtn.classList.remove("is-active");
            navMenu.classList.remove("open");
            hamburgerBtn.setAttribute("aria-expanded", "false");
          });
        });

        document.addEventListener("click", (e) => {
          if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            hamburgerBtn.classList.remove("is-active");
            navMenu.classList.remove("open");
            hamburgerBtn.setAttribute("aria-expanded", "false");
          }
        });

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            hamburgerBtn.classList.remove("is-active");
            navMenu.classList.remove("open");
            hamburgerBtn.setAttribute("aria-expanded", "false");
          }
        });
      }

      // Hide/reveal on scroll only applies to home page
      if (isHomePage) {
        const scrollTriggerDistance = 110;
        function handleHeaderScroll() {
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;
          if (scrollY > scrollTriggerDistance) {
            siteHeader?.classList.add("header-visible");
          } else {
            siteHeader?.classList.remove("header-visible");
            if (navMenu && navMenu.classList.contains("open")) {
              navMenu.classList.remove("open");
              if (hamburgerBtn) {
                hamburgerBtn.classList.remove("is-active");
                hamburgerBtn.setAttribute("aria-expanded", "false");
              }
            }
          }
        }

        window.addEventListener("scroll", handleHeaderScroll, { passive: true });
        handleHeaderScroll();
      }
    }

    // 2. INJECT EDGE-TO-EDGE STRETCHED FOOTER
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
      const currentYear = new Date().getFullYear();
      footerContainer.innerHTML = `
        <footer class="site-footer-extended">
          <div class="footer-grid-container">
            
            <!-- Left Brand Section -->
            <div class="footer-brand-col">
              <div class="footer-brand-heading">
                <div class="logo-badge" style="width: 32px; height: 32px;">
                  <img src="logo.svg" alt="APML Hub" style="width: 20px; height: 20px; display: block; object-fit: contain;">
                </div>
                <span class="footer-title-text">APML Portal</span>
              </div>
              <p class="footer-brand-desc">
                Enterprise operations workspace designed to simplify quotation drafting, branch directories, and packing logistics standards.
              </p>
              <div class="footer-developer-tag">
                Designed &amp; developed by <span>Prasad Kundar</span>
              </div>
            </div>

            <!-- Right Links Columns -->
            <div class="footer-links-columns">
              <div class="footer-link-col">
                <div class="footer-col-title">Quick Links</div>
                <a href="index.html" class="footer-item-link">Home Portal</a>
                <a href="editor.html" class="footer-item-link">Quotation Editor</a>
                <a href="gallery.html" class="footer-item-link">Packing Gallery</a>
                <a href="drive.html" class="footer-item-link">Cloud Drive</a>
              </div>

              <div class="footer-link-col">
                <div class="footer-col-title">Directories</div>
                <a href="directory.html" class="footer-item-link">Hub &amp; Branch Directory</a>
                <a href="field-officer.html" class="footer-item-link">Field Officer WCRO</a>
              </div>

              <div class="footer-link-col">
                <div class="footer-col-title">Resources &amp; Legal</div>
                <a href="terms.html" class="footer-item-link">Terms &amp; Conditions</a>
                <a href="privacy.html" class="footer-item-link">Privacy Policy</a>
                <a href="bug-report.html" class="footer-item-link" style="color: var(--primary, #b91c1c);">Report a Bug</a>
              </div>
            </div>

          </div>

          <div class="footer-bottom-bar">
            <span>&copy; ${currentYear} APML Portal. All rights reserved.</span>
            
            <div style="display: flex; align-items: center; gap: 16px;">
              <a href="about.html" class="footer-about-pill">
                <img src="https://github.com/kundarwork-debug.png" alt="Profile" onerror="this.src='logo.svg'">
                <span>About Developer</span>
              </a>

              <!-- CUSTOM UIVERSE BUTTON LINKING TO 404 -->
              <button type="button" class="footer-fun-btn" onclick="window.location.href='404.html'" title="Play!">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 36 36"
                  width="18px"
                  height="18px"
                >
                  <rect width="36" height="36" x="0" y="0" fill="#fdd835"></rect>
                  <path
                    fill="#e53935"
                    d="M38.67,42H11.52C11.27,40.62,11,38.57,11,36c0-5,0-11,0-11s1.44-7.39,3.22-9.59 c1.67-2.06,2.76-3.48,6.78-4.41c3-0.7,7.13-0.23,9,1c2.15,1.42,3.37,6.67,3.81,11.29c1.49-0.3,5.21,0.2,5.5,1.28 C40.89,30.29,39.48,38.31,38.67,42z"
                  ></path>
                  <path
                    fill="#b71c1c"
                    d="M39.02,42H11.99c-0.22-2.67-0.48-7.05-0.49-12.72c0.83,4.18,1.63,9.59,6.98,9.79 c3.48,0.12,8.27,0.55,9.83-2.45c1.57-3,3.72-8.95,3.51-15.62c-0.19-5.84-1.75-8.2-2.13-8.7c0.59,0.66,3.74,4.49,4.01,11.7 c0.03,0.83,0.06,1.72,0.08,2.66c4.21-0.15,5.93,1.5,6.07,2.35C40.68,33.85,39.8,38.9,39.02,42z"
                  ></path>
                  <path
                    fill="#212121"
                    d="M35,27.17c0,3.67-0.28,11.2-0.42,14.83h-2C32.72,38.42,33,30.83,33,27.17 c0-5.54-1.46-12.65-3.55-14.02c-1.65-1.08-5.49-1.48-8.23-0.85c-3.62,0.83-4.57,1.99-6.14,3.92L15,16.32 c-1.31,1.6-2.59,6.92-3,8.96v10.8c0,2.58,0.28,4.61,0.54,5.92H10.5c-0.25-1.41-0.5-3.42-0.5-5.92l0.02-11.09 c0.15-0.77,1.55-7.63,3.43-9.94l0.08-0.09c1.65-2.03,2.96-3.63,7.25-4.61c3.28-0.76,7.67-0.25,9.77,1.13 C33.79,13.6,35,22.23,35,27.17z"
                  ></path>
                  <path
                    fill="#01579b"
                    d="M17.165,17.283c5.217-0.055,9.391,0.283,9,6.011c-0.391,5.728-8.478,5.533-9.391,5.337 c-0.913-0.196-7.826-0.043-7.696-5.337C9.209,18,13.645,17.32,17.165,17.283z"
                  ></path>
                  <path
                    fill="#212121"
                    d="M40.739,37.38c-0.28,1.99-0.69,3.53-1.22,4.62h-2.43c0.25-0.19,1.13-1.11,1.67-4.9 c0.57-4-0.23-11.79-0.93-12.78c-0.4-0.4-2.63-0.8-4.37-0.89l0.1-1.99c1.04,0.05,4.53,0.31,5.71,1.49 C40.689,24.36,41.289,33.53,40.739,37.38z"
                  ></path>
                  <path
                    fill="#81d4fa"
                    d="M10.154,20.201c0.261,2.059-0.196,3.351,2.543,3.546s8.076,1.022,9.402-0.554 c1.326-1.576,1.75-4.365-0.891-5.267C19.336,17.287,12.959,16.251,10.154,20.201z"
                  ></path>
                  <path
                    fill="#212121"
                    d="M17.615,29.677c-0.502,0-0.873-0.03-1.052-0.069c-0.086-0.019-0.236-0.035-0.434-0.06 c-5.344-0.679-8.053-2.784-8.052-6.255c0.001-2.698,1.17-7.238,8.986-7.32l0.181-0.002c3.444-0.038,6.414-0.068,8.272,1.818 c1.173,1.191,1.712,3,1.647,5.53c-0.044,1.688-0.785,3.147-2.144,4.217C22.785,29.296,19.388,29.677,17.615,29.677z M17.086,17.973 c-7.006,0.074-7.008,4.023-7.008,5.321c-0.001,3.109,3.598,3.926,6.305,4.27c0.273,0.035,0.48,0.063,0.601,0.089 c0.563,0.101,4.68,0.035,6.855-1.732c0.865-0.702,1.299-1.57,1.326-2.653c0.051-1.958-0.301-3.291-1.073-4.075 c-1.262-1.281-3.834-1.255-6.825-1.222L17.086,17.973z"
                  ></path>
                  <path
                    fill="#e1f5fe"
                    d="M15.078,19.043c1.957-0.326,5.122-0.529,4.435,1.304c-0.489,1.304-7.185,2.185-7.185,0.652 C12.328,19.467,15.078,19.043,15.078,19.043z"
                  ></path>
                </svg>
                <span class="now">now!</span>
                <span class="play">play</span>
              </button>

              <!-- EMBEDDED FOOTER BACK TO TOP BUTTON -->
              <button type="button" class="footer-back-to-top-btn" id="footerBackToTopBtn" aria-label="Scroll to top" title="Go to top">
                <svg class="svgIcon" viewBox="0 0 384 512">
                  <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
                </svg>
              </button>
            </div>
          </div>
        </footer>

        <style>
          /* EXTENDED STRETCHED FOOTER STYLING */
          .site-footer-extended {
            background: var(--md-sys-color-surface-container-low, #f7ede6);
            border-top: 1px solid var(--md-sys-color-outline-variant, #ede4de);
            padding: 60px 40px 30px;
            width: 100%;
            margin-top: auto;
            color: var(--text-main, #292524);
          }

          .footer-grid-container {
            width: 100%;
            display: grid;
            grid-template-columns: 1.5fr 3fr;
            gap: 40px;
            align-items: start;
            padding-bottom: 40px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          }

          .footer-brand-col {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .footer-brand-heading {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .footer-title-text {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .footer-brand-desc {
            font-size: 13.5px;
            color: var(--text-muted, #78716c);
            line-height: 1.6;
            max-width: 440px;
          }

          .footer-developer-tag {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-muted, #78716c);
            margin-top: 4px;
          }

          .footer-developer-tag span {
            color: var(--primary, #b91c1c);
            font-weight: 700;
          }

          .footer-links-columns {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            width: 100%;
          }

          .footer-col-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 14.5px;
            font-weight: 700;
            margin-bottom: 14px;
            color: var(--text-main, #292524);
            letter-spacing: -0.01em;
          }

          .footer-link-col {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .footer-item-link {
            font-size: 13.5px;
            font-weight: 500;
            color: var(--text-muted, #78716c);
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .footer-item-link:hover {
            color: var(--primary, #b91c1c);
          }

          .footer-bottom-bar {
            width: 100%;
            margin-top: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12.5px;
            color: var(--text-muted, #78716c);
            flex-wrap: wrap;
            gap: 12px;
          }

          .footer-about-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            border: 1px solid var(--md-sys-color-outline-variant, #ede4de);
            padding: 6px 14px;
            border-radius: 9999px;
            color: var(--text-main, #292524);
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.2s ease;
            position: relative;
            z-index: 10;
          }

          .footer-about-pill:hover {
            transform: translateY(-1px);
          }

          .footer-about-pill img {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            object-fit: cover;
          }
        </style>
      `;

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

    // Completely hide avatar on 404.html
    if (is404Page) return;

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

    // Inject Lottie player script if not already present
    if (!document.querySelector('script[src*="lottie-player"]')) {
      const lottieScript = document.createElement('script');
      lottieScript.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
      lottieScript.async = true;
      document.head.appendChild(lottieScript);
    }

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
          <lottie-player 
            src="https://lottie.host/c98b389d-7d8c-4ef0-b1d7-9777c095e5c3/q4tTVYKfM5.json" 
            background="transparent" 
            speed="1" 
            style="width: 75px; height: 75px; position: absolute; top: -52px; left: 50%; transform: translateX(-50%); z-index: 1; pointer-events: none;" 
            loop 
            autoplay>
          </lottie-player>        
          <span style="position: relative; z-index: 2;"><span id="typewriter-text"></span><span class="cursor" id="typeCursor">|</span></span>      
        </div>      
        <div class="support-btn" id="supportAvatarBtn" title="Click for a new message!" style="cursor: pointer;">        
          <img src="https://github.com/kundarwork-debug.png" alt="Developer" class="support-avatar">      
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
        background-color: #ffffff;
        color: var(--text-main, #1c1917);
        border: 2px solid var(--text-main, #1c1917);
        box-shadow: 4px 4px 0px var(--text-main, #1c1917);
        padding: 16px 24px;
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
        width: 64px;
        height: 64px;
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
      .support-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      @media (hover: hover) {
        .support-fab:hover .support-btn {
          transform: translateY(-4px);
          box-shadow: 6px 6px 0px var(--text-main, #1c1917);
        }
      }

      /* ---- moods ---- */
      .support-btn.apml-mood-sleep { opacity: 0.55; filter: grayscale(0.35); transition: opacity 0.6s ease, filter 0.6s ease; }
      .support-zzz { position: absolute; right: 74px; bottom: 14px; font-size: 20px; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; }
      .support-zzz.show { opacity: 1; animation: apmlZzz 2.4s ease-in-out infinite; }
      @keyframes apmlZzz { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-8px) rotate(6deg); } }
      .support-btn.apml-mood-alert { animation: apmlBounce 0.55s ease-in-out infinite, apmlGlow 1.1s ease-out infinite !important; border-color: #dc2626; }
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
        .support-btn.apml-mood-alert { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.55); }
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
      if (cursor) cursor.style.display = 'inline-block';
      bubble.classList.add('show');
      isTyping = true;

      clearTimeout(hideTimer);

      let typeIndex = 0;
      function step() {
        if (myToken !== typeToken) return;
        if (typeIndex < textToType.length) {
          typeText.textContent += textToType.charAt(typeIndex);
        } else {
          isTyping = false;
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
    const zzz = document.createElement('div');
    zzz.className = 'support-zzz';
    zzz.setAttribute('aria-hidden', 'true');
    zzz.textContent = '💤';
    supportFab.appendChild(zzz);
    let asleep = false, lastActivity = Date.now(), alertTimer = null, happyTimer = null;

    function wake() {
      lastActivity = Date.now();
      if (!asleep) return;
      asleep = false;
      if (moodBtn) moodBtn.classList.remove('apml-mood-sleep');
      zzz.classList.remove('show');
    }
    function fallAsleep() {
      if (asleep || alertTimer || happyTimer || !moodBtn) return;
      asleep = true;
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
        if (pinnedText) { playTypewriter(pinnedText, true, 0, true); return; }

        tipIndex = (Math.floor(tipIndex) + 1) % tipsArray.length;
        playTypewriter(tipsArray[tipIndex], isIndexPage);
      });
    }
  })();

  // 3. SERVICE WORKER REGISTRATION (PWA Support)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('ServiceWorker registration note:', err);
      });
    });
  }

  // 4. HARDWARE BACK BUTTON NAVIGATION TRAP
  window.addEventListener('popstate', () => {
    const navMenu = document.getElementById("navMenu");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    if (navMenu && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      if (hamburgerBtn) hamburgerBtn.classList.remove('is-active');
    }
  });
})();

// ---------------------------------------------------------------------
// ALERTS: load notify.js
// ---------------------------------------------------------------------
(function loadNotify() {
  if (window.APMNotify) return;
  var base = '';
  var tags = document.getElementsByTagName('script');
  for (var i = 0; i < tags.length; i++) {
    if (/common\.js(\?|$)/.test(tags[i].src)) { base = tags[i].src.replace(/common\.js.*$/, ''); break; }
  }
  var s = document.createElement('script');
  s.src = base + 'notify.js?v=7';
  s.async = true;
  document.head.appendChild(s);
})();

// ---------------------------------------------------------------------
// STATION TRACKER: load station-tracker.js
// ---------------------------------------------------------------------
(function loadStationTracker() {
  var base = '';
  var tags = document.getElementsByTagName('script');
  for (var i = 0; i < tags.length; i++) {
    if (/common\.js(\?|$)/.test(tags[i].src)) { 
      base = tags[i].src.replace(/common\.js.*$/, ''); 
      break; 
    }
  }
  var s = document.createElement('script');
  s.src = base + 'station-tracker.js';
  s.async = true;
  document.head.appendChild(s);
})();
