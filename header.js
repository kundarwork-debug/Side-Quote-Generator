document.addEventListener("DOMContentLoaded", function () {
  // 1. Apply saved theme on page load
  const savedTheme = localStorage.getItem("apmlTheme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) return;

  // The Header HTML Markup
  const headerHTML = `
    <header class="site-header" id="siteHeader">
      <div class="header-left">
        <img src="https://github.com/kundarwork-debug.png" alt="Logo" class="github-profile-pic">
        <a href="index.html" class="header-brand-name">APML</a>
        <span class="status-badge"><span class="status-dot"></span> Staff Portal</span>
      </div>

      <div class="header-right">
        <button class="theme-toggle-btn" id="themeToggleBtn" onclick="toggleTheme()" aria-label="Toggle Dark Mode">
          <span class="theme-icon" id="themeIcon">🌙</span>
        </button>

        <div class="menu-container">
          <button class="hamburger-btn" onclick="toggleMenu()" aria-label="Toggle Menu">
            <div class="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <div class="dropdown-menu" id="dropdownMenu">
            <a href="APML-Lite.html" class="menu-item-btn">📊 APML Lite Calculator</a>
            <a href="car-rate.html" class="menu-item-btn">🚗 Car Rate Calculator</a>
            <a href="editor.html" class="menu-item-btn">📝 Quotation Editor</a>
            <a href="gallery.html" class="menu-item-btn">📸 Packing Gallery</a>
          </div>
        </div>
      </div>
    </header>
  `;

  // Try fetching header.html (for hosted live sites), or fallback directly
  fetch("header.html?v=" + new Date().getTime())
    .then(response => {
      if (!response.ok) throw new Error("CORS or File Not Found");
      return response.text();
    })
    .then(data => {
      headerContainer.innerHTML = data;
      finishHeaderSetup();
    })
    .catch(() => {
      // Direct Fallback if opened locally via file:/// or CORS blocked
      headerContainer.innerHTML = headerHTML;
      finishHeaderSetup();
    });
});

function finishHeaderSetup() {
  updateThemeIcon();
  initHeaderScrollAndMenu();
}

// Toggle Dark / Light Theme
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("apmlTheme", isDark ? "dark" : "light");
  updateThemeIcon();
}

function updateThemeIcon() {
  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    const isDark = document.body.classList.contains("dark-theme");
    themeIcon.innerText = isDark ? "☀️" : "🌙";
  }
}

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
