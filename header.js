document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("header-container");
  if (!container) return;

  // Load the shared header snippet automatically
  fetch("header.html")
    .then((response) => response.text())
    .then((data) => {
      container.innerHTML = data;
      initMenuEvents();
    })
    .catch((err) => console.error("Error loading header:", err));
});

function initMenuEvents() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (hamburgerBtn && dropdownMenu) {
    // Toggle dropdown on button click
    hamburgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("active");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (!dropdownMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        dropdownMenu.classList.remove("active");
      }
    });
  }
}
