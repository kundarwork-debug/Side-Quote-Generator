// =========================================================
// APML DIRECTORY HELPER (directory.js)
// Reusable search, filter, and card rendering for directories
// =========================================================

class APMLDirectory {
  constructor(containerId, searchInputId) {
    this.container = document.getElementById(containerId);
    this.searchInput = document.getElementById(searchInputId);
    this.allData = [];

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.filterData(e.target.value));
    }
  }

  // Load raw data array into the directory
  setData(dataArray) {
    this.allData = Array.isArray(dataArray) ? dataArray : [];
    this.render(this.allData);
  }

  // Filter items based on user search input across all fields
  filterData(query) {
    const q = String(query || '').toLowerCase().trim();
    if (!q) {
      this.render(this.allData);
      return;
    }

    const filtered = this.allData.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(q)
      );
    });
    this.render(filtered);
  }

  // Render cards into the target container element
  render(items) {
    if (!this.container) return;
    
    if (!items || items.length === 0) {
      this.container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted, #78716c); font-weight: 600;">
          No matching records found.
        </div>`;
      return;
    }

    this.container.innerHTML = items.map(item => {
      const isHub = String(item.category || '').includes('Hub');
      const badgeColor = isHub ? '#0284c7' : '#c21d1d';
      const badgeBg = isHub ? '#e0f2fe' : 'rgba(194, 29, 29, 0.08)';

      const name = item.name || 'Unnamed';
      const location = item.location || item.branch || 'N/A';
      const designation = item.designation || '';
      const contact = item.contact || item.mobile || '';
      const address = item.address || '';
      const apm = item.apm || item.apmCode || 'N/A';

      const cleanPhone = String(contact).replace(/[^0-9]/g, '');
      const tenDigitPhone = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;

      return `
        <div class="directory-card" style="background: #ffffff; border: 1.5px solid var(--border-subtle, #ede4de); border-left: 4px solid ${badgeColor}; border-radius: 16px; padding: 20px; box-shadow: 0 4px 16px rgba(120, 113, 108, 0.04); display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div>
              <span style="font-size: 10.5px; font-weight: 800; color: ${badgeColor}; background: ${badgeBg}; padding: 2px 10px; border-radius: 9999px; text-transform: uppercase; display: inline-block; margin-bottom: 4px;">
                ${escapeHtml(item.category || 'Directory Record')}
              </span>
              <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: var(--text-main, #292524); margin: 0;">
                ${escapeHtml(name)}
              </h3>
            </div>
            <span style="font-size: 11.5px; font-weight: 800; color: #ffffff; background: ${badgeColor}; padding: 3px 10px; border-radius: 6px; text-transform: uppercase;">
              ${escapeHtml(location)}
            </span>
          </div>

          <div style="font-size: 13px; color: var(--text-secondary, #44403c); font-weight: 600;">
            ${escapeHtml(designation)} ${apm !== 'N/A' ? `• APM Code: <b>${escapeHtml(apm)}</b>` : ''}
          </div>

          ${address ? `
            <div style="font-size: 12.5px; color: var(--text-muted, #78716c); display: flex; align-items: flex-start; gap: 6px; margin-top: 2px;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary, #c21d1d);">location_on</span>
              <span>${escapeHtml(address)}</span>
            </div>
          ` : ''}

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 6px; padding-top: 10px; border-top: 1px dashed var(--border-subtle, #ede4de);">
            ${contact ? `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 13.5px; font-weight: 700; color: var(--text-main, #292524);">📞 ${escapeHtml(contact)}</span>
              </div>
              <div style="display: flex; gap: 6px;">
                <a href="tel:${escapeHtml(tenDigitPhone)}" class="btn-call-mini" title="Call">
                  <span class="material-symbols-outlined" style="font-size: 18px;">call</span>
                </a>
                <a href="https://wa.me/91${escapeHtml(tenDigitPhone)}" target="_blank" rel="noopener noreferrer" class="btn-wa-mini" title="WhatsApp">
                  <span class="material-symbols-outlined" style="font-size: 18px;">chat</span>
                </a>
              </div>
            ` : '<span style="font-size: 12px; color: var(--text-muted);">No phone number available</span>'}
          </div>
        </div>
      `;
    }).join('');
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}
