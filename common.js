document.addEventListener("DOMContentLoaded", function () {
  // 1. INJECT COMMON HEADER
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    headerContainer.innerHTML = `
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      <header class="site-header" id="siteHeader">
        <div class="header-left">
          <a href="index.html" class="header-brand-name">APML</a>
        </div>

        <div class="menu-container">
          <button class="hamburger-btn" onclick="toggleMenu()" aria-label="Toggle Menu">
            <span class="material-symbols-outlined">menu</span>
          </button>

          <div class="dropdown-menu" id="dropdownMenu">
            <a href="editor.html" class="menu-item-btn">
              <span class="material-symbols-outlined mui-icon">edit_note</span>
              <span>Quotation Editor</span>
            </a>
            <a href="APML-Lite.html" class="menu-item-btn">
              <span class="material-symbols-outlined mui-icon">grid_view</span>
              <span>APML Lite Calculator</span>
            </a>
            <a href="car-rate.html" class="menu-item-btn">
              <span class="material-symbols-outlined mui-icon">directions_car</span>
              <span>Car Rate Calculator</span>
            </a>
            <a href="gallery.html" class="menu-item-btn">
              <span class="material-symbols-outlined mui-icon">photo_library</span>
              <span>Packing Gallery</span>
            </a>
          </div>
        </div>
      </header>
    `;
    initHeaderScrollAndMenu();
  }

  // 2. INJECT COMMON FOOTER (Updated: "About Me ↗" in place of username)
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="footer-left">
          <span class="footer-brand">APML Employee Portal</span>
        </div>
        <div class="footer-right">
          <a href="about.html" class="about-me-btn">
            <img src="https://github.com/kundarwork-debug.png" alt="GitHub Profile" class="github-avatar">
            <span>About Me ↗</span>
          </a>
        </div>
      </footer>
    `;
  }
});

function initHeaderScrollAndMenu() {
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", function () {
    const header = document.getElementById("siteHeader");
    const dropdown = document.getElementById("dropdownMenu");
    const currentScrollY = window.scrollY;

    if (header) {
      if (currentScrollY > 60 && currentScrollY > lastScrollY) {
        header.classList.add("header-hidden");
        if (dropdown) dropdown.classList.remove("active");
      } else {
        header.classList.remove("header-hidden");
      }
    }
    lastScrollY = currentScrollY;
  });

  document.addEventListener("click", function (event) {
    const menuContainer = document.querySelector(".menu-container");
    const menu = document.getElementById("dropdownMenu");
    if (menuContainer && menu && !menuContainer.contains(event.target)) {
      menu.classList.remove("active");
    }
  });
}

function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  if (menu) {
    menu.classList.toggle("active");
  }
}
