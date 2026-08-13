(function applySavedTheme() {
  const savedTheme = localStorage.getItem("apml_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    fetch("header.html")
      .then(response => response.text())
      .then(data => {
        headerContainer.innerHTML = data;
        initHeaderScrollAndMenu();
        updateThemeIcon();
      })
      .catch(err => console.error("Error loading header:", err));
  } else {
    initHeaderScrollAndMenu();
    updateThemeIcon();
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

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("apml_theme", newTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const themeIcon = document.getElementById("themeIcon");
  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (themeIcon) {
    themeIcon.textContent = currentTheme === "dark" ? "light_mode" : "dark_mode";
  }
}
