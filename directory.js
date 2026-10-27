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
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-muted, #78716c); font-weight: 600; font-size: 13.5px;">
          No matching records found.
        </div>`;
      this.container.style.display = 'block';
      return;
    }

    this.container.innerHTML = items.map(item => {
      const name = item.name || item.city || item.branchName || 'Personnel / Branch';
      const branch = item.branch || item.region || item.code || item.station || 'N/A';
      const designation = item.designation || item.hod || item.role || item.teamLeader || 'Staff';
      const phone = item.phone || item.mobile || item.contact || '';
      const email = item.email || '';
      const address = item.address || item.location || '';
      const typeTag = item.type || '';

      const cleanPhone = String(phone).replace(/[^0-9]/g, '');
      const tenDigitPhone = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;

      return `
        <div class="lookup-result-item" style="background: #ffffff; border: 1.5px solid var(--border-subtle, #ede4de); border-left: 4px solid var(--primary, #c21d1d); border-radius: 16px; padding: 20px; box-shadow: 0 4px 16px rgba(120, 113, 108, 0.04); display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div>
              ${typeTag ? `<span style="font-size: 10px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; display: inline-block; margin-bottom: 4px;">${escapeHtml(typeTag)}</span>` : ''}
              <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 16.5px; font-weight: 800; color: var(--primary, #c21d1d); margin: 0;">
                ${escapeHtml(name)}
              </h3>
            </div>
            <span style="font-size: 11px; font-weight: 800; color: #ffffff; background: var(--primary, #c21d1d); padding: 3px 10px; border-radius: 6px; text-transform: uppercase;">
              ${escapeHtml(String(branch))}
            </span>
          </div>

          <div style="font-size: 13px; color: var(--text-secondary, #44403c); font-weight: 600;">
            ${escapeHtml(designation)}
          </div>

          ${address ? `
            <div style="font-size: 12.5px; color: var(--text-muted, #78716c); display: flex; align-items: flex-start; gap: 6px; margin-top: 2px;">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary, #c21d1d);">location_on</span>
              <span>${escapeHtml(address)}</span>
            </div>
          ` : ''}

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 6px; padding-top: 10px; border-top: 1px dashed var(--border-subtle, #ede4de);">
            ${phone ? `
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 13.5px; font-weight: 700; color: var(--text-main, #292524);">📞 ${escapeHtml(phone)}</span>
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
    this.container.style.display = 'flex';
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
