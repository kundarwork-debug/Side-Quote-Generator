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
      const name = item.name || item.branchName || 'Personnel / Branch';
      const branch = item.branch || item.code || item.station || 'N/A';
      const designation = item.designation || item.hod || item.role || 'Staff';
      const phone = item.phone || item.mobile || item.contact || '';
      const email = item.email || '';
      const address = item.address || item.location || '';

      return `
        <div class="directory-card" style="background: #ffffff; border: 1px solid var(--surface-border, #ede4de); border-radius: 16px; padding: 20px; box-shadow: 0 4px 16px rgba(120, 113, 108, 0.04); display: flex; flex-direction: column; gap: 10px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: var(--text-main, #292524); margin: 0;">
              ${escapeHtml(name)}
            </h3>
            <span style="font-size: 11px; font-weight: 800; color: var(--primary, #b91c1c); background: var(--primary-soft, rgba(185, 28, 28, 0.06)); padding: 3px 8px; border-radius: 9999px; text-transform: uppercase;">
              ${escapeHtml(String(branch))}
            </span>
          </div>

          <div style="font-size: 13px; color: var(--text-muted, #78716c); font-weight: 600;">
            ${escapeHtml(designation)}
          </div>

          ${address ? `
            <div style="font-size: 12.5px; color: var(--text-muted, #78716c); display: flex; align-items: flex-start; gap: 6px; margin-top: 2px;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary, #b91c1c);">location_on</span>
              <span>${escapeHtml(address)}</span>
            </div>
          ` : ''}

          <div style="display: flex; align-items: center; gap: 14px; margin-top: 8px; padding-top: 10px; border-top: 1px dashed var(--surface-border, #ede4de);">
            ${phone ? `
              <a href="tel:${escapeHtml(phone)}" style="display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 700; color: var(--primary, #b91c1c); text-decoration: none;">
                <span class="material-symbols-outlined" style="font-size: 15px;">call</span>
                <span>${escapeHtml(phone)}</span>
              </a>
            ` : '<span style="font-size: 12px; color: var(--text-muted);">No phone</span>'}

            ${email ? `
              <a href="mailto:${escapeHtml(email)}" style="display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 700; color: var(--text-muted, #78716c); text-decoration: none;" title="${escapeHtml(email)}">
                <span class="material-symbols-outlined" style="font-size: 15px;">mail</span>
                <span>Email</span>
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Utility HTML escape function to prevent injection
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}
