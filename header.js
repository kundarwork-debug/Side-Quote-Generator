// Function to toggle mobile menu
function toggleHeaderMenu() {
  const menu = document.getElementById('dropdownMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

// Close menu if clicked outside
document.addEventListener('click', function (event) {
  const menuContainer = document.querySelector('.menu-container');
  const menu = document.getElementById('dropdownMenu');
  if (menuContainer && menu && !menuContainer.contains(event.target)) {
    menu.classList.remove('active');
  }
});

// Auto-hide header when scrolling down, show when scrolling up
let lastScrollY = window.scrollY;

window.addEventListener('scroll', function () {
  const header = document.getElementById('siteHeader');
  const dropdown = document.getElementById('dropdownMenu');
  const currentScrollY = window.scrollY;

  if (header) {
    // Hide header if scrolled down past 60px
    if (currentScrollY > 60 && currentScrollY > lastScrollY) {
      header.classList.add('header-hidden');
      if (dropdown) dropdown.classList.remove('active'); // close menu if scrolling down
    } else {
      // Show header on scroll up
      header.classList.remove('header-hidden');
    }
  }

  lastScrollY = currentScrollY;
});
