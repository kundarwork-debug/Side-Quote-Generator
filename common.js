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
              <a href="hub-details.html" class="nav-link ${currentPage === 'hub-details.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">location_city</span>
                <span>Hub &amp; Branch Directory</span>
              </a>
              <a href="field-officer.html" class="nav-link ${currentPage === 'field-officer.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">badge</span>
                <span>Field Officer Directory WCRO</span>
              </a>
              <a href="drive.html" class="nav-link ${currentPage === 'drive.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">cloud_queue</span>
                <span>APML Cloud Drive</span>
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

    // 2. INJECT FOOTER (Restored with Terms, Privacy & Bug Report)
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
      footerContainer.innerHTML = `
        <footer class="site-footer">
          <div class="footer-inner">
            <div class="footer-brand">
              <div class="logo-badge" style="width: 28px; height: 28px;">
                <img src="logo.svg" alt="APML Hub" style="width: 18px; height: 18px; display: block; object-fit: contain;">
              </div>
              <div class="footer-credit-text">Designed &amp; developed by <span>Prasad</span></div>
            </div>

            <div class="footer-links-group" style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; font-size: 13px; font-weight: 600;">
              <a href="terms.html" class="footer-nav-link" style="color: var(--text-muted, #78716c); text-decoration: none; transition: color 0.2s;">Terms &amp; Conditions</a>
              <a href="privacy.html" class="footer-nav-link" style="color: var(--text-muted, #78716c); text-decoration: none; transition: color 0.2s;">Privacy Policy</a>
              <a href="bug-report.html" class="footer-nav-link" style="color: var(--primary, #b91c1c); text-decoration: none; transition: color 0.2s; display: inline-flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 15px;">bug_report</span> Report Bug
              </a>
            </div>

            <div class="footer-actions">
              <a href="about.html" class="m3-about-btn" title="About Developer">
                <img src="https://github.com/kundarwork-debug.png" alt="GitHub Profile" class="about-github-avatar" onerror="this.src='logo.svg'">
                <span>About Me</span>
              </a>
            </div>
          </div>
        </footer>
      `;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHeaderAndFooter);
  } else {
    renderHeaderAndFooter();
  }

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
