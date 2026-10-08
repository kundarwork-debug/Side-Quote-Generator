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
              <a href="drive.html" class="nav-link ${currentPage === 'drive.html' ? 'active' : ''}">
                <span class="material-symbols-outlined">cloud</span>
                <span>Cloud Drive</span>
              </a>
              <a href="hub-details.html" class="nav-link ${currentPage === 'hub-details.html' ? 'active' : ''}">
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
                <a href="hub-details.html" class="footer-item-link">Hub &amp; Branch Directory</a>
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

              <!-- EMBEDDED FOOTER BACK TO TOP BUTTON -->
              <button type="button" class="footer-back-to-top-btn" id="footerBackToTopBtn" aria-label="Scroll to top" title="Go to top">
                <span class="material-symbols-outlined">arrow_upward</span>
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

          /* EMBEDDED FOOTER BACK TO TOP BUTTON */
          .footer-back-to-top-btn {
            width: 42px;
            height: 42px;
            background: var(--primary, #b91c1c);
            color: #ffffff;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);
            transition: all 0.2s ease;
            position: relative;
            z-index: 10;
          }

          .footer-back-to-top-btn:hover {
            background: #991b1b;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(185, 28, 28, 0.4);
          }

          @media (max-width: 850px) {
            .site-footer-extended {
              padding: 40px 20px 24px;
            }
            .footer-grid-container {
              grid-template-columns: 1fr;
              gap: 32px;
            }
            .footer-links-columns {
              grid-template-columns: repeat(2, 1fr);
            }
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
      "hub-details.html": [
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
      "directory.html": [
        "💡 Tip: Search by city, in-charge name, phone or designation to find a contact fast.",
        "Operations and field contacts are all kept in this one directory.",
        "Tap a phone number to call straight from your device.",
        "Use the hamburger menu to jump to other modules.",
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
    // Start on a random tip each time a page opens
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

    // Append Mascot Styles with pointer-events protection for footer buttons
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
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      .support-fab > div {
        pointer-events: none;
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
    `;

    document.head.appendChild(mascotStyle);
    document.body.appendChild(supportFab);

    // Scroll Controller for FAB
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
      const footer = document.querySelector('footer') || document.getElementById('footer-container');
      const footerHeight = footer ? footer.offsetHeight : 0;
      const isNearBottom = scrollPosition > (bodyHeight - footerHeight + 20);

      const fab = document.getElementById('support-fab');
      if (fab) {
        fab.style.opacity = isNearBottom ? '0' : '1';
        const supportBtn = fab.querySelector('.support-btn');
        if (supportBtn) supportBtn.style.pointerEvents = isNearBottom ? 'none' : 'auto';
      }
    }, { passive: true });

    // Typewriter Effect Function with Auto-Hide (cancellable)
    let hideTimer = null;
    let isTyping = false;
    let typeToken = 0;

    function playTypewriter(textToType) {
      const typeText = document.getElementById('typewriter-text');
      const bubble = document.getElementById('supportBubble');
      const cursor = document.getElementById('typeCursor');
      if (!typeText || !bubble) return;

      const myToken = ++typeToken; // a newer message cancels this one
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
          typeIndex++;
          setTimeout(step, 30);
        } else {
          isTyping = false;
          setTimeout(() => {
            if (myToken === typeToken && cursor) cursor.style.display = 'none';
          }, 1500);

          // Auto-hide message after 5 seconds
          hideTimer = setTimeout(() => {
            if (myToken === typeToken) bubble.classList.remove('show');
          }, 5000);
        }
      }
      step();
    }

    // Public hook so any page can make the avatar say something:
    //   window.APMLMascot.say("Hello!")
    window.APMLMascot = {
      say: function (text) {
        if (!text) return;
        playTypewriter(String(text));
      }
    };

    // Initial trigger on load
    setTimeout(() => {
      if (!isTyping && typeToken === 0) playTypewriter(tipsArray[tipIndex]);
    }, 1000);

    // Click Avatar for New Message
    const avatarBtn = document.getElementById('supportAvatarBtn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isTyping) return;

        tipIndex = (tipIndex + 1) % tipsArray.length;
        playTypewriter(tipsArray[tipIndex]);
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
