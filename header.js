<script>
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', function () {
    const header = document.getElementById('siteHeader');
    const dropdown = document.getElementById('dropdownMenu');
    const currentScrollY = window.scrollY;

    // Scroll down past 60px -> Hide header
    if (currentScrollY > 60 && currentScrollY > lastScrollY) {
      header.classList.add('header-hidden');
      if (dropdown) dropdown.classList.remove('active');
    } else {
      // Scroll up -> Show header
      header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
  });

  function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    menu.classList.toggle('active');
  }

  document.addEventListener('click', function(event) {
    const menuContainer = document.querySelector('.menu-container');
    const menu = document.getElementById('dropdownMenu');
    if (menuContainer && !menuContainer.contains(event.target)) {
      menu.classList.remove('active');
    }
  });
</script>

</body>
</html>
