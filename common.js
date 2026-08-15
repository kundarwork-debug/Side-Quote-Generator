// 1. Inject the header HTML into #header-container
const headerContainer = document.getElementById("header-container");
if (headerContainer) {
  headerContainer.innerHTML = `
    <header class="header">
      <div class="header-inner">
        <a href="index.html" class="logo">APML Portal</a>
        
        <!-- Animated Hamburger Button -->
        <button class="hamburger-btn" id="hamburger" aria-label="Toggle navigation">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <nav class="nav-menu" id="navMenu">
          <a href="index.html">Home</a>
          <a href="editor.html">Quotation Editor</a>
          <a href="gallery.html">Gallery</a>
          <a href="APML-Lite.html">APML Lite</a>
          <a href="car-rate.html">Car Rate</a>
          <a href="about.html">About</a>
        </nav>
      </div>
    </header>
  `;

  // 2. Add rotation toggle listener
  const hamburgerBtn = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("is-active");
      if (navMenu) navMenu.classList.toggle("open");
    });
  }
}
