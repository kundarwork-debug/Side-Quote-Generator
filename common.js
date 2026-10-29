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
  // ... rest of common.js
