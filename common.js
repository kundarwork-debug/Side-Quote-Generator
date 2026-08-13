document.addEventListener("DOMContentLoaded", function () {
  // Load Header
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    fetch("header.html")
      .then(response => response.text())
      .then(data => {
        headerContainer.innerHTML = data;
        initHeaderScrollAndMenu();
      })
      .catch(err => console.error("Error loading header:", err));
  } else {
    initHeaderScrollAndMenu();
  }

  // Load Footer
  const footerContainer = document.getElementById("footer-container");
  if (footerContainer) {
    fetch("footer.html")
      .then(response => response.text())
      .then(data => {
        footerContainer.innerHTML = data;
      })
      .catch(err => console.error("Error loading footer:", err));
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
