/**
 * ============================================================================
 * APML PORTAL - COMMON LAYOUT & NAVIGATION CONTROLLER (common.js)
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  initCommonLayout();
});

function initCommonLayout() {
  renderHeader();
  renderFooter();
  setupMobileMenu();
}

/**
 * Renders the Global Responsive Header with Live Clock & Hamburger Menu
 */
function renderHeader() {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  headerContainer.innerHTML = `
    <header class="portal-header">
      <div class="header-inner">
        
        <!-- BRAND LOGO & TITLE -->
        <a href="index.html" class="header-brand">
          <div class="brand-logo-pill">
            <span class="material-symbols-outlined">hub</span>
          </div>
          <div class="brand-text-group">
            <span class="brand-title">APML</span>
            <span class="brand-subtitle">Portal</span>
          </div>
        </a>

        <!-- DESKTOP NAVIGATION -->
        <nav class="desktop-nav">
          <a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}">
            <span class="material-symbols-outlined" style="font-size: 18px;">home</span>
            <span>Home</span>
          </a>
          <a href="editor.html" class="nav-link ${currentPath === 'editor.html' ? 'active' : ''}">
            <span class="material-symbols-outlined" style="font-size: 18px;">edit_note</span>
            <span>Quotation Studio</span>
          </a>
          <a href="calculator.html" class="nav-link ${currentPath === 'calculator.html' ? 'active' : ''}">
            <span class="material-symbols-outlined" style="font-size: 18px;">calculate</span>
            <span>Lite Calculator</span>
          </a>
          <a href="wcro-consignment-status.html" class="nav-link ${currentPath === 'wcro-consignment-status.html' ? 'active' : ''}">
            <span class="material-symbols-outlined" style="font-size: 18px;">local_shipping</span>
            <span>Consignment Status</span>
          </a>
        </nav>

        <!-- HEADER RIGHT UTILITIES (LIVE CLOCK & HAMBURGER TRIGGER) -->
        <div class="header-right-utils">
          
          <!-- LIVE CLOCK PILL -->
          <div class="live-clock-pill" id="liveClockPill">
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">schedule</span>
            <span id="headerClockText">Loading time...</span>
          </div>

          <!-- HAMBURGER MENU TOGGLE BUTTON -->
          <button type="button" class="hamburger-toggle-btn" id="hamburgerToggleBtn" aria-label="Toggle Navigation Menu">
            <span class="material-symbols-outlined" id="hamburgerIcon">menu</span>
          </button>

        </div>

      </div>
    </header>

    <!-- MOBILE / HAMBURGER SLIDE-OUT OVERLAY DRAWER -->
    <div class="mobile-drawer-overlay" id="mobileDrawerOverlay">
      <div class="mobile-drawer-panel" onclick="event.stopPropagation()">
        
        <div class="drawer-header">
          <div class="brand-text-group">
            <span class="brand-title" style="font-size: 18px;">APML Portal</span>
            <span class="brand-subtitle">Operations Menu</span>
          </div>
          <button type="button" class="drawer-close-btn" id="drawerCloseBtn" aria-label="Close menu">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="drawer-links-stack">
          <div class="drawer-category-label">Quick Navigation</div>
          <a href="index.html" class="drawer-link ${currentPath === 'index.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">home</span>
            <span>Home Portal</span>
          </a>
          <a href="editor.html" class="drawer-link ${currentPath === 'editor.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">edit_note</span>
            <span>Quotation Drafting Studio</span>
          </a>
          <a href="calculator.html" class="drawer-link ${currentPath === 'calculator.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">calculate</span>
            <span>APML Lite Rate Calculator</span>
          </a>
          <a href="wcro-consignment-status.html" class="drawer-link ${currentPath === 'wcro-consignment-status.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">local_shipping</span>
            <span>WCRO Consignment Status</span>
          </a>

          <div class="drawer-category-label" style="margin-top: 16px;">Enterprise Directories &amp; Drive</div>
          <a href="directory.html" class="drawer-link ${currentPath === 'directory.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">location_city</span>
            <span>Hub &amp; Branch Directory</span>
          </a>
          <a href="field-officer.html" class="drawer-link ${currentPath === 'field-officer.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">badge</span>
            <span>Field Officer Directory WCRO</span>
          </a>
          <a href="drive.html" class="drawer-link ${currentPath === 'drive.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">cloud_queue</span>
            <span>APML Cloud Drive</span>
          </a>
          <a href="gallery.html" class="drawer-link ${currentPath === 'gallery.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">photo_library</span>
            <span>Packing Standards Gallery</span>
          </a>

          <div class="drawer-category-label" style="margin-top: 16px;">Calculators</div>
          <a href="car-rate.html" class="drawer-link ${currentPath === 'car-rate.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">directions_car</span>
            <span>Car Rate Calculator</span>
          </a>
          <a href="local-rate.html" class="drawer-link ${currentPath === 'local-rate.html' ? 'active' : ''}">
            <span class="material-symbols-outlined">local_shipping</span>
            <span>APML Local Rate Calculator</span>
          </a>
        </div>

        <div class="drawer-footer-note">
          <span>Prasad Kundar • APML BDO</span>
        </div>

      </div>
    </div>
  `;

  startLiveClock();
}

/**
 * Renders the Global Footer
 */
function renderFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;

  const currentYear = new Date().getFullYear();

  footerContainer.innerHTML = `
    <footer class="portal-footer">
      <div class="footer-inner">
        <div class="footer-left">
          <span class="material-symbols-outlined" style="font-size: 18px; color: var(--primary);">shield_lock</span>
          <span>APML Enterprise Operations Portal &copy; ${currentYear}</span>
        </div>
        <div class="footer-right">
          <a href="about.html" class="footer-link">Architecture</a>
          <a href="support.html" class="footer-link">Support</a>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Configures Hamburger Menu Slide-Out Interactions
 */
function setupMobileMenu() {
  const toggleBtn = document.getElementById('hamburgerToggleBtn');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const closeBtn = document.getElementById('drawerCloseBtn');

  if (!toggleBtn || !overlay) return;

  const openDrawer = () => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

/**
 * Updates the Live Header Clock
 */
function startLiveClock() {
  const clockText = document.getElementById('headerClockText');
  if (!clockText) return;

  const updateClock = () => {
    const now = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    clockText.textContent = now.toLocaleString('en-IN', options);
  };

  updateClock();
  setInterval(updateClock, 1000);
}
