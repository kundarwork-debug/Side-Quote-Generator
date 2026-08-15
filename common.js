// =========================================================
// APML COMMON HEADER, FOOTER & ROTATING HAMBURGER SCRIPT
// =========================================================
(function initCommonLayout() {
  function renderHeaderAndFooter() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // 1. Injects Header
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
      headerContainer.innerHTML = `
        <header class="site-header">
          <div class="header-inner">
            <a href="index.html" class="site-logo">
              <div class="logo-badge">KP</div>
              <div class="logo-text">APML <span>Portal</span></div>
            </a>

            <!-- Animated Rotating Hamburger Button -->
            <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle navigation menu" aria-expanded="false">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </button>

            <!-- Navigation Links -->
            <nav class="nav-menu" id="navMenu">
              <a href="editor.html" class="nav-link ${currentPage === 'editor.html' ? 'active' : ''}">
                <span class="material-symbols-outlined" style="font-size: 18px;">edit_note</span>
                <span>Quotation Editor</span>
              </a>
              <a href="gallery.html" class="nav-link ${currentPage === 'gallery.html' ? 'active' : ''}">
                <span class="material-symbols-outlined" style="font-size: 18px;">photo_library</span>
                <span>Gallery</span>
              </a>
              <a href="APML-Lite.html" class="nav-link ${currentPage === 'APML-Lite.html' ? 'active' : ''}">
                <span class="material-symbols-outlined" style="font-size: 18px;">grid_view</span>
                <span>APML Lite</span>
              </a>
              <a href="car-rate.html" class="nav-link ${currentPage === 'car-rate.html' ? 'active' : ''}">
                <span class="material-symbols-outlined" style="font-size: 18px;">directions_car</span>
                <span>Car Rate</span>
              </a>
            </nav>
          </div>
        </header>
      `;

      // Hamburger Click Event Listener
      const hamburgerBtn = document.getElementById("hamburgerBtn");
      const navMenu = document.getElementById("navMenu");

      if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = hamburgerBtn.classList.toggle("is-active");
          navMenu.classList.toggle("open", isOpen);
          hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        // Close dropdown when any link is clicked
        navMenu.querySelectorAll(".nav-link").forEach((link) => {
          link.addEventListener("click", () => {
            hamburgerBtn.classList.remove("is-active");
            navMenu.classList.remove("open");
            hamburgerBtn.setAttribute("aria-expanded", "false");
          });
        });

        // Close dropdown if user clicks outside
        document.addEventListener("click", (e) => {
          if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            hamburgerBtn.classList.remove("is-active");
            navMenu.classList.remove("open");
            hamburgerBtn.setAttribute("aria-expanded", "false");
          }
        });
      }
    }

    // 2. Injects Footer
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
      footerContainer.innerHTML = `
        <footer class="site-footer">
          <div class="footer-inner">
            <div>&copy; ${new Date().getFullYear()} APML Internal Logistics & Operations Suite. All rights reserved.</div>
            <div class="footer-links">
              <a href="index.html">Portal Home</a>
              <a href="editor.html">Editor</a>
              <a href="gallery.html">Gallery</a>
              <a href="about.html">Developer</a>
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
