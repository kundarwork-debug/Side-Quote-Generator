// =========================================================
// APML COMMON HEADER, FOOTER & ROTATING HAMBURGER SCRIPT
// =========================================================
(function initCommonLayout() {
  function renderHeaderAndFooter() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // 1. INJECT HEADER (Rotating Hub Logo + Navigation)
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
      headerContainer.innerHTML = `
        <header class="site-header">
          <div class="header-inner">
            <a href="index.html" class="site-logo">
              <div class="logo-badge">
                <img src="logo.svg" alt="APML Hub" style="width: 24px; height: 24px; display: block; object-fit: contain;">
              </div>
              <div class="logo-text">APML <span>Portal</span></div>
            </a>

            <!-- Animated Rotating Hamburger Button -->
            <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle navigation menu" aria-expanded="false">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </button>

            <!-- Navigation Menu Dropdown -->
            <nav class="nav-menu" id="navMenu">
              <a href="index.html" class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">
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
                <span>Hub Directory</span>
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

      // Event Listeners for Hamburger Click & Outside Clicks
      const hamburgerBtn = document.getElementById("hamburgerBtn");
      const navMenu = document.getElementById("navMenu");

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
    }

    // 2. INJECT FOOTER (With GitHub Profile Avatar on About Me Button)
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

            <div class="footer-actions">
              <!-- M3 Themed About Me Button with GitHub Avatar -->
              <a href="about.html" class="m3-about-btn" title="About Developer">
                <img src="https://github.com/github.png" alt="GitHub Profile" class="about-github-avatar" onerror="this.src='logo.svg'">
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
})();
