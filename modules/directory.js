
(function applyDirectoryPresentation() {
  if (!document.body) return;
  document.body.classList.add('apml-directory-page');
  const style = document.createElement('style');
  style.id = 'apml-directory-premium-styles';
  style.textContent = "\n/* Directory-only Premium Enterprise presentation layer */\nbody.apml-directory-page {\n  --primary: var(--apml-color-brand, #b4232c);\n  --primary-dark: var(--apml-color-brand-hover, #941c24);\n  --primary-soft: var(--apml-color-brand-soft, #f8e9e9);\n  --bg-base: var(--apml-color-page, #f7f5f0);\n  --surface-card: var(--apml-color-surface, #fff);\n  --border-subtle: var(--apml-color-border, #e5e1d9);\n  --border-hover: rgba(180,35,44,.24);\n  --text-main: var(--apml-color-text, #202124);\n  --text-secondary: var(--apml-color-text-secondary, #55565a);\n  --text-muted: var(--apml-color-text-muted, #777a80);\n  --shadow-card: var(--apml-shadow-soft, 0 2px 8px rgba(32,33,36,.04));\n  --font-sans: var(--apml-font-sans, 'Plus Jakarta Sans', sans-serif);\n  background: var(--bg-base) !important;\n  color: var(--text-main);\n}\nbody.apml-directory-page .main-container {\n  width: 100% !important;\n  max-width: none !important;\n  margin-left: 0 !important;\n  margin-right: 0 !important;\n  padding: 30px clamp(16px,3vw,42px) 64px !important;\n  gap: 26px !important;\n}\nbody.apml-directory-page .directory-header-wrap {\n  align-items: flex-start !important;\n  text-align: left !important;\n  gap: 8px;\n  padding: 8px 2px 2px;\n}\nbody.apml-directory-page .header-badge {\n  background: #fff !important;\n  border-color: var(--border-subtle) !important;\n  color: var(--primary) !important;\n  box-shadow: none !important;\n  margin-bottom: 4px !important;\n}\nbody.apml-directory-page .page-title {\n  color: var(--text-main) !important;\n  font-family: var(--font-sans) !important;\n  font-size: clamp(29px,3.4vw,40px) !important;\n  font-weight: 750 !important;\n  line-height: 1.16;\n  letter-spacing: -.045em !important;\n}\nbody.apml-directory-page .page-title span {\n  background: none !important;\n  -webkit-text-fill-color: currentColor !important;\n  color: var(--primary) !important;\n}\nbody.apml-directory-page .directory-intro {\n  max-width: 680px;\n  color: var(--text-muted);\n  font-size: 14px;\n  line-height: 1.7;\n}\nbody.apml-directory-page .status-badge {\n  margin-top: 7px !important;\n  background: #edf7f1 !important;\n  color: #28734b !important;\n  border: 1px solid #d6eadc !important;\n  font-size: 11px !important;\n  font-weight: 650 !important;\n}\nbody.apml-directory-page .card {\n  background: var(--surface-card) !important;\n  border: 1px solid var(--border-subtle) !important;\n  border-radius: 18px !important;\n  padding: clamp(18px,2.2vw,28px) !important;\n  box-shadow: var(--shadow-card) !important;\n  transition: border-color 180ms ease, box-shadow 180ms ease !important;\n}\nbody.apml-directory-page .card:hover {\n  border-color: var(--border-hover) !important;\n  box-shadow: var(--shadow-card) !important;\n}\nbody.apml-directory-page .card-header {\n  color: var(--text-main) !important;\n  font-family: var(--font-sans) !important;\n  font-size: 15px !important;\n  font-weight: 750 !important;\n  letter-spacing: -.02em !important;\n  margin-bottom: 20px !important;\n}\nbody.apml-directory-page .card-header > div:first-child .material-symbols-outlined { color: var(--primary); }\nbody.apml-directory-page #masterSearchInput {\n  min-height: 52px;\n  background: #fbfaf8 !important;\n  border: 1px solid var(--border-subtle) !important;\n  border-radius: 12px !important;\n  color: var(--text-main) !important;\n  font-size: 14px !important;\n  font-weight: 500 !important;\n  padding-left: 50px !important;\n}\nbody.apml-directory-page #masterSearchInput::placeholder { color: #96979a; font-weight: 450; }\nbody.apml-directory-page #masterSearchInput:focus {\n  background: #fff !important;\n  border-color: var(--primary) !important;\n  box-shadow: 0 0 0 3px rgba(180,35,44,.11) !important;\n}\nbody.apml-directory-page .lookup-icon { color: #777a80 !important; }\nbody.apml-directory-page .quick-chips { gap: 8px !important; margin-top: 14px !important; }\nbody.apml-directory-page .chip {\n  background: #fff !important;\n  border: 1px solid var(--border-subtle) !important;\n  color: var(--text-secondary) !important;\n  padding: 7px 13px !important;\n  font-size: 11.5px !important;\n  font-weight: 650 !important;\n  transition: background 160ms ease,border-color 160ms ease,color 160ms ease !important;\n}\nbody.apml-directory-page .chip:hover,\nbody.apml-directory-page .chip:focus-visible {\n  background: var(--primary-soft) !important;\n  color: var(--primary) !important;\n  border-color: rgba(180,35,44,.28) !important;\n  transform: none !important;\n}\nbody.apml-directory-page #createContactBtn {\n  min-height: 40px;\n  padding: 9px 15px !important;\n  border-radius: 10px !important;\n  background: var(--primary) !important;\n  box-shadow: none !important;\n  font-size: 12px !important;\n}\nbody.apml-directory-page #createContactBtn:hover { background: var(--primary-dark) !important; }\nbody.apml-directory-page #adminToggleBtn {\n  border-radius: 10px !important;\n  width: 40px !important;\n  height: 40px !important;\n}\nbody.apml-directory-page #adminToggleBtn:hover {\n  border-color: var(--border-hover) !important;\n  background: #fbf7f5 !important;\n}\nbody.apml-directory-page .lookup-results-list { margin-top: 22px !important; gap: 0 !important; }\nbody.apml-directory-page .directory-results-shell {\n  overflow: hidden;\n  background: #fff;\n  border: 1px solid var(--border-subtle);\n  border-radius: 16px;\n  box-shadow: var(--shadow-card);\n}\nbody.apml-directory-page .directory-table-head {\n  grid-template-columns: 1.7fr 1.15fr 1.05fr 1.8fr .7fr;\n  gap: 16px;\n  padding: 14px 20px !important;\n  background: #f7f5f0 !important;\n  border-bottom: 1px solid var(--border-subtle) !important;\n  color: #777a80 !important;\n  font-size: 10px !important;\n  font-weight: 750 !important;\n  letter-spacing: .075em !important;\n}\nbody.apml-directory-page .directory-record-row {\n  grid-template-columns: 1.7fr 1.15fr 1.05fr 1.8fr .7fr !important;\n  gap: 16px;\n  padding: 17px 20px !important;\n  border-bottom: 1px solid #efede8 !important;\n  background: #fff !important;\n  transition: background 160ms ease !important;\n}\nbody.apml-directory-page .directory-record-row:last-child { border-bottom: 0 !important; }\nbody.apml-directory-page .directory-record-row:hover { background: #fbfaf8 !important; }\nbody.apml-directory-page .directory-record-row[data-deleted=\"true\"] { background: #fbf5f4 !important; }\nbody.apml-directory-page .directory-record-row > div { min-width: 0; }\nbody.apml-directory-page .directory-person { gap: 12px !important; }\nbody.apml-directory-page .directory-avatar {\n  width: 40px !important;\n  height: 40px !important;\n  font-size: 12px !important;\n  font-weight: 750 !important;\n}\nbody.apml-directory-page .directory-person-name {\n  color: var(--text-main) !important;\n  font-size: 13px !important;\n  font-weight: 750 !important;\n  line-height: 1.4;\n}\nbody.apml-directory-page .directory-person-role {\n  color: var(--text-muted) !important;\n  font-size: 11px !important;\n  font-weight: 550 !important;\n  margin-top: 3px;\n}\nbody.apml-directory-page .directory-location-primary,\nbody.apml-directory-page .directory-contact {\n  color: var(--text-main) !important;\n  font-size: 12px !important;\n  font-weight: 650 !important;\n  overflow-wrap: anywhere;\n}\nbody.apml-directory-page .directory-location-secondary {\n  color: var(--text-muted) !important;\n  font-size: 11px !important;\n  margin-top: 3px;\n}\nbody.apml-directory-page .directory-address {\n  color: var(--text-secondary) !important;\n  font-size: 11px !important;\n  line-height: 1.55 !important;\n}\nbody.apml-directory-page .directory-address-actions { gap: 12px !important; margin-top: 6px; }\nbody.apml-directory-page .directory-address-actions a,\nbody.apml-directory-page .directory-address-actions button { color: #536c91 !important; }\nbody.apml-directory-page .directory-row-actions { gap: 6px !important; }\nbody.apml-directory-page .directory-row-actions button {\n  width: 33px !important;\n  height: 33px !important;\n  border-radius: 9px !important;\n}\nbody.apml-directory-page .directory-edit-panel {\n  background: #f7f5f0 !important;\n  padding: 20px !important;\n}\nbody.apml-directory-page .directory-edit-form {\n  border: 1px solid var(--border-subtle) !important;\n  border-radius: 14px !important;\n  box-shadow: none !important;\n}\nbody.apml-directory-page .directory-edit-form > div:first-child {\n  color: var(--text-main) !important;\n  font-family: var(--font-sans) !important;\n  font-weight: 750 !important;\n}\nbody.apml-directory-page .directory-edit-form label { color: var(--text-secondary) !important; }\nbody.apml-directory-page .directory-edit-form input {\n  border: 1px solid var(--border-subtle) !important;\n  border-radius: 9px !important;\n  background: #fff !important;\n  font-family: var(--font-sans) !important;\n}\nbody.apml-directory-page .directory-edit-form input:focus {\n  border-color: var(--primary) !important;\n  box-shadow: 0 0 0 3px rgba(180,35,44,.1) !important;\n  outline: none !important;\n}\nbody.apml-directory-page .directory-edit-form button { border-radius: 9px !important; }\nbody.apml-directory-page .directory-empty-state {\n  padding: 42px 20px !important;\n  color: var(--text-muted) !important;\n  background: #fff;\n  border: 1px solid var(--border-subtle);\n  border-radius: 14px;\n  font-size: 13px;\n}\n@media (max-width: 900px) {\n  body.apml-directory-page .directory-table-head { display: none !important; }\n  body.apml-directory-page .directory-record-row {\n    grid-template-columns: minmax(0,1fr) minmax(0,1fr) !important;\n    gap: 14px 18px !important;\n    padding: 17px !important;\n  }\n  body.apml-directory-page .directory-record-row > div:nth-child(1) { grid-column: 1 / -1; }\n  body.apml-directory-page .directory-record-row > div:nth-child(5) {\n    grid-column: 1 / -1;\n    justify-content: flex-start !important;\n  }\n}\n@media (max-width: 560px) {\n  body.apml-directory-page { padding-top: 72px !important; }\n  body.apml-directory-page .main-container { padding: 22px 14px 42px !important; gap: 18px !important; }\n  body.apml-directory-page .directory-header-wrap { padding-top: 2px; }\n  body.apml-directory-page .page-title { font-size: clamp(26px,8vw,33px) !important; }\n  body.apml-directory-page .directory-intro { font-size: 12.5px; }\n  body.apml-directory-page .card { padding: 17px !important; }\n  body.apml-directory-page .card-header { align-items: flex-start !important; font-size: 14px !important; }\n  body.apml-directory-page .card-header > div:last-child { gap: 7px !important; }\n  body.apml-directory-page #createContactBtn { padding: 8px 10px !important; font-size: 11px !important; }\n  body.apml-directory-page #createContactBtn .material-symbols-outlined { font-size: 16px !important; }\n  body.apml-directory-page .directory-record-row {\n    grid-template-columns: minmax(0,1fr) !important;\n    gap: 12px !important;\n    padding: 16px !important;\n  }\n  body.apml-directory-page .directory-record-row > div:nth-child(1),\n  body.apml-directory-page .directory-record-row > div:nth-child(5) { grid-column: auto; }\n  body.apml-directory-page .directory-record-row > div:nth-child(2),\n  body.apml-directory-page .directory-record-row > div:nth-child(3),\n  body.apml-directory-page .directory-record-row > div:nth-child(4),\n  body.apml-directory-page .directory-record-row > div:nth-child(5) { padding-left: 52px; }\n  body.apml-directory-page .directory-edit-panel { padding: 12px !important; }\n  body.apml-directory-page .directory-edit-form { padding: 16px !important; }\n}\n@media (prefers-reduced-motion: reduce) {\n  body.apml-directory-page .card,\n  body.apml-directory-page .chip,\n  body.apml-directory-page .directory-record-row { transition: none !important; }\n}\n";
  document.head.appendChild(style);
  const heading = document.querySelector('.directory-header-wrap .page-title');
  if (heading && !document.querySelector('.directory-intro')) {
    const intro = document.createElement('p');
    intro.className = 'directory-intro';
    intro.textContent = 'Find branch locations and contact details in one place. Search by city, branch, officer name or phone number.';
    heading.insertAdjacentElement('afterend', intro);
  }
})();

// =========================================================
// APML DIRECTORY HELPER (directory.js) - Soft Delete, Sorting & Admin View Support
// =========================================================

class APMLDirectory {
  constructor(containerId, searchInputId) {
    this.container = document.getElementById(containerId);
    this.searchInput = document.getElementById(searchInputId);
    this.allData = [];
    this.searchIndex = new WeakMap();
    this.showDeleted = false; // Admin toggle state

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.filterData(e.target.value));
    }
  }

  setData(dataArray) {
    this.allData = Array.isArray(dataArray) ? dataArray : [];
    this.searchIndex = new WeakMap();
    this.allData.forEach(item => {
      if (item && typeof item === 'object') {
        this.searchIndex.set(item, Object.values(item).map(value => String(value ?? '')).join(' ').toLowerCase());
      }
    });
    this.render(this.getFilteredAndSortedData(this.allData));
  }

  getFilteredAndSortedData(data) {
    let pool = data;
    if (!this.showDeleted) {
      pool = data.filter(item => item.isDeleted !== true && item.isDeleted !== 'true' && item.isDeleted !== 1);
    } else {
      // Sort deleted contacts to the bottom
      pool = [...data].sort((a, b) => {
        const aDel = a.isDeleted === true || a.isDeleted === 'true' || a.isDeleted === 1 ? 1 : 0;
        const bDel = b.isDeleted === true || b.isDeleted === 'true' || b.isDeleted === 1 ? 1 : 0;
        return aDel - bDel; // 0 (active) comes before 1 (deleted)
      });
    }
    return pool;
  }

  toggleAdminView(show) {
    this.showDeleted = show;
    const currentQuery = this.searchInput ? this.searchInput.value : '';
    this.filterData(currentQuery);
  }

  filterData(query) {
    const q = String(query || '').toLowerCase().trim();
    let pool = this.getFilteredAndSortedData(this.allData);

    if (q) {
      pool = pool.filter(item => {
        const indexedText = item && this.searchIndex.get(item);
        return (indexedText || Object.values(item).map(value => String(value ?? '')).join(' ').toLowerCase()).includes(q);
      });
    }
    this.render(pool);
  }

  render(items) {
    if (!this.container) return;
    
    if (!items || items.length === 0) {
      this.container.innerHTML = `
        <div class="apml-empty-state directory-empty-state" role="status">
          <img class="apml-empty-state__art" src="assets/empty-states/directory.svg" alt="A contact card with a magnifying glass." width="320" height="220" loading="lazy" decoding="async">
          <h3 class="apml-empty-state__title">No matching contacts</h3>
          <p class="apml-empty-state__description">Try a different search term or check the selected contact view.</p>
        </div>`;
      return;
    }

    let html = `
      <div class="directory-results-shell" style="background: #ffffff; border: 1.5px solid #ede4de; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(120, 113, 108, 0.05);">
        <div class="directory-table-head" style="display: grid; grid-template-columns: 2fr 2fr 2fr 2.5fr 1fr; padding: 16px 24px; border-bottom: 1.5px solid #ede4de; font-size: 11.5px; font-weight: 700; color: #c21d1d; text-transform: uppercase; letter-spacing: 0.05em; background: #fdf8f5;">
          <div>Name / Category</div>
          <div>Location / Region</div>
          <div>Contact Number</div>
          <div>Address &amp; Maps</div>
          <div style="text-align: right;">Actions</div>
        </div>
        <div style="display: flex; flex-direction: column;">
    `;

    html += items.map((item, index) => {
      const recordId = item.id !== undefined ? item.id : index;
      const category = item.category || 'Record';
      const location = item.location || 'N/A';
      const region = item.region || '';
      const designation = item.designation || '';
      const name = item.name || 'Unnamed';
      const contact = item.contact || 'No Number';
      const address = item.address || 'No address specified';
      const isDeleted = item.isDeleted === true || item.isDeleted === 'true' || item.isDeleted === 1;

      const rowBg = isDeleted ? '#fef2f2' : '#ffffff';
      const textColor = isDeleted ? '#991b1b' : '#292524';
      const subTextColor = isDeleted ? '#b91c1c' : '#78716c';
      const badgeText = isDeleted ? ' [DELETED]' : '';

      // Keep every active contact avatar red; use black for deleted contacts.
      const avatarBg = isDeleted ? '#171717' : '#c21d1d';
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AP';

      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      const escapedAddressJson = JSON.stringify(address).replace(/"/g, '&quot;');

      return `
        <div id="row_view_${recordId}" class="directory-record-row" data-deleted="${isDeleted}" style="display: grid; grid-template-columns: 2fr 2fr 2fr 2.5fr 1fr; padding: 16px 24px; border-bottom: 1px solid #ede4de; align-items: center; background: ${rowBg}; transition: background 0.15s ease;" onmouseover="this.style.background='${isDeleted ? '#fee2e2' : '#fdf8f5'}'" onmouseout="this.style.background='${rowBg}'">
          <div class="directory-person" style="display: flex; align-items: center; gap: 14px;">
            <div class="directory-avatar" style="width: 38px; height: 38px; border-radius: 50%; background: ${avatarBg}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;">
              ${escapeHtml(initials)}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span class="directory-person-name" style="font-size: 14px; font-weight: 700; color: ${textColor};">${escapeHtml(name)}${badgeText}</span>
              <span class="directory-person-role" style="font-size: 11.5px; color: ${subTextColor}; font-weight: 600;">${escapeHtml(designation || category)}</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column;">
            <span class="directory-location-primary" style="font-size: 13.5px; font-weight: 600; color: ${textColor};">${escapeHtml(location)}</span>
            <span class="directory-location-secondary" style="font-size: 11.5px; color: ${subTextColor};">${escapeHtml(region)}</span>
          </div>

          <div class="directory-contact" style="font-size: 13.5px; font-weight: 600; color: ${textColor};">
            ${escapeHtml(contact)}
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; padding-right: 8px;">
            <div class="directory-address" style="font-size: 12px; color: ${subTextColor}; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="${escapeHtml(address)}">
              ${escapeHtml(address)}
            </div>
            <div class="directory-address-actions" style="display: flex; gap: 8px; align-items: center;">
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11.5px; font-weight: 700; color: #0284c7; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;" title="Open in Google Maps">
                <span class="material-symbols-outlined" style="font-size: 14px;">map</span> Maps
              </a>
              <button onclick="copyAddressToClipboard(${escapedAddressJson}, this)" style="background: none; border: none; font-size: 11.5px; font-weight: 700; color: #059669; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; padding: 0;" title="Copy Address">
                <span class="material-symbols-outlined" style="font-size: 14px;">content_copy</span> Copy
              </button>
            </div>
          </div>

          <div class="directory-row-actions" style="display: flex; justify-content: flex-end; gap: 8px;">
            ${isDeleted ? `
              <button onclick="restoreRecord('${recordId}')" title="Restore Contact" style="background: rgba(5, 150, 105, 0.1); border: 1.5px solid rgba(5, 150, 105, 0.3); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #059669; transition: all 0.2s ease;" onmouseover="this.style.background='#059669'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(5, 150, 105, 0.1)'; this.style.color='#059669'">
                <span class="material-symbols-outlined" style="font-size: 18px;">settings_backup_restore</span>
              </button>
              <button onclick="permanentDeleteRecord('${recordId}')" title="Delete Permanently" style="background: rgba(220, 38, 38, 0.1); border: 1.5px solid rgba(220, 38, 38, 0.3); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dc2626; transition: all 0.2s ease;" onmouseover="this.style.background='#dc2626'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(220, 38, 38, 0.1)'; this.style.color='#dc2626'">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete_forever</span>
              </button>
            ` : `
              <button onclick="toggleEditCard('${recordId}')" title="Edit Record" style="background: rgba(194, 29, 29, 0.08); border: 1.5px solid rgba(194, 29, 29, 0.2); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #c21d1d; transition: all 0.2s ease;" onmouseover="this.style.background='#c21d1d'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(194, 29, 29, 0.08)'; this.style.color='#c21d1d'">
                <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
              </button>
              <button onclick="deleteRecord('${recordId}')" title="Delete Record" style="background: rgba(220, 38, 38, 0.08); border: 1.5px solid rgba(220, 38, 38, 0.2); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dc2626; transition: all 0.2s ease;" onmouseover="this.style.background='#dc2626'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(220, 38, 38, 0.08)'; this.style.color='#dc2626'">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
              </button>
            `}
          </div>
        </div>

        <!-- EXPANDED EDIT BOX (Hidden by default, shows on Edit click) -->
        ${!isDeleted ? `
        <div id="row_edit_${recordId}" class="directory-edit-panel" style="display: none; padding: 24px; background: #fdf8f5; border-bottom: 1.5px solid #ede4de;">
          <div class="directory-edit-form" style="background: #ffffff; border: 1.5px solid #ede4de; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 14px;">
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 800; color: #c21d1d; display: flex; align-items: center; gap: 8px;">
              <span class="material-symbols-outlined">badge</span>
              Edit Record Details (#${escapeHtml(String(recordId))})
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #44403c; margin-bottom: 4px;">Category</label>
                <input id="cat_${recordId}" style="width: 100%; padding: 12px 16px; font-size: 14px; font-weight: 600; border: 1.5px solid #ede4de; border-radius: 8px; outline: none;" value="${escapeHtml(category)}">
              </div>
              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #44403c; margin-bottom: 4px;">Location / Branch</label>
                <input id="loc_${recordId}" style="width: 100%; padding: 12px 16px; font-size: 14px; font-weight: 600; border: 1.5px solid #ede4de; border-radius: 8px; outline: none;" value="${escapeHtml(location)}">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #44403c; margin-bottom: 4px;">Region</label>
                <input id="reg_${recordId}" style="width: 100%; padding: 12px 16px; font-size: 14px; font-weight: 600; border: 1.5px solid #ede4de; border-radius: 8px; outline: none;" value="${escapeHtml(region)}">
              </div>
              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #44403c; margin-bottom: 4px;">Designation / Role</label>
                <input id="des_${recordId}" style="width: 100%; padding: 12px 16px; font-size: 14px; font-weight: 600; border: 1.5px solid #ede4de; border-radius: 8px; outline: none;" value="${escapeHtml(designation)}">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #44403c; margin-bottom: 4px;">Contact Person Name</label>
                <input id="nam_${recordId}" style="width: 100%; padding: 12px 16px; font-size: 14px; font-weight: 600; border: 1.5px solid #ede4de; border-radius: 8px; outline: none;" value="${escapeHtml(name)}">
              </div>
              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #44403c; margin-bottom: 4px;">Contact Number</label>
                <input id="con_${recordId}" style="width: 100%; padding: 12px 16px; font-size: 14px; font-weight: 600; border: 1.5px solid #ede4de; border-radius: 8px; outline: none;" value="${escapeHtml(contact)}">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 11.5px; font-weight: 700; color: #44403c; margin-bottom: 4px;">Full Address</label>
              <input id="adr_${recordId}" style="width: 100%; padding: 12px 16px; font-size: 14px; font-weight: 600; border: 1.5px solid #ede4de; border-radius: 8px; outline: none;" value="${escapeHtml(address)}">
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 6px;">
              <button onclick="toggleEditCard('${recordId}')" style="padding: 10px 20px; background: #ede4de; color: #44403c; border: none; border-radius: 9999px; font-size: 13px; font-weight: 700; cursor: pointer;">
                Cancel
              </button>
              <button onclick="saveRecord('${recordId}')" style="padding: 10px 24px; background: #c21d1d; color: #ffffff; border: none; border-radius: 9999px; font-size: 13px; font-weight: 700; cursor: pointer;">
                Save Changes
              </button>
            </div>
          </div>
        </div>
        ` : ''}
      `;
    }).join('');

    html += `</div></div>`;
    this.container.innerHTML = html;
  }
}

window.toggleEditCard = function(id) {
  const editBox = document.getElementById(`row_edit_${id}`);
  if (editBox) {
    if (editBox.style.display === 'none' || !editBox.style.display) {
      editBox.style.display = 'block';
    } else {
      editBox.style.display = 'none';
    }
  }
};

window.copyAddressToClipboard = async function(addressText, btnElement) {
  const text = String(addressText || '');
  const originalHTML = btnElement ? btnElement.innerHTML : '';
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      helper.style.pointerEvents = 'none';
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand('copy');
      helper.remove();
      if (!copied) throw new Error('Clipboard access is unavailable in this browser.');
    }
    if (btnElement) {
      btnElement.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true" style="font-size: 14px;">check</span> Copied!';
      btnElement.style.color = '#059669';
      btnElement.setAttribute('aria-label', 'Address copied');
      window.setTimeout(() => {
        btnElement.innerHTML = originalHTML;
        btnElement.style.color = '';
        btnElement.removeAttribute('aria-label');
      }, 2000);
    }
  } catch (_) {
    if (window.Swal) Swal.fire({ icon: 'error', title: 'Copy failed', text: 'Please select and copy the address manually.' });
    else alert('Copy failed. Please select and copy the address manually.');
  }
};

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}
