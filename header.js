document.addEventListener("DOMContentLoaded", function () {
  // Apply saved theme immediately on page load
  const savedTheme = localStorage.getItem("apmlTheme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    fetch("header.html?v=" + new Date().getTime())
      .then(response => response.text())
      .then(data => {
        headerContainer.innerHTML = data;
        updateThemeIcon();
        initHeaderScrollAndMenu();
      })
      .catch(err => console.error("Error loading header:", err));
  } else {
    updateThemeIcon();
    initHeaderScrollAndMenu();
  }
});

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
        // Scroll Down -> Hide Header
        header.classList.add("header-hidden");
        if (dropdown) dropdown.classList.remove("active");
      } else {
        // Scroll Up -> Show Header
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
