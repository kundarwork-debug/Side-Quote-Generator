// =========================================================
// APML DIRECTORY HELPER (directory.js) - Light Theme with Edit & Delete
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

  setData(dataArray) {
    this.allData = Array.isArray(dataArray) ? dataArray : [];
    this.render(this.allData);
  }

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

  render(items) {
    if (!this.container) return;
    
    if (!items || items.length === 0) {
      this.container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted, #78716c); font-weight: 600;">
          No matching records found.
        </div>`;
      return;
    }

    this.container.innerHTML = items.map((item, index) => {
      const recordId = item.id !== undefined ? item.id : index;
      const category = item.category || '';
      const location = item.location || '';
      const region = item.region || '';
      const designation = item.designation || '';
      const name = item.name || '';
      const contact = item.contact || '';
      const address = item.address || '';

      const isHub = String(category).includes('Hub');
      const badgeColor = isHub ? '#0284c7' : '#c21d1d';
      const badgeBg = isHub ? '#e0f2fe' : 'rgba(194, 29, 29, 0.08)';

      return `
        <div class="directory-card" style="background: #ffffff; border: 1.5px solid var(--border-subtle, #ede4de); border-left: 4px solid ${badgeColor}; border-radius: 16px; padding: 20px; box-shadow: 0 4px 16px rgba(120, 113, 108, 0.04); display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10.5px; font-weight: 800; color: ${badgeColor}; background: ${badgeBg}; padding: 2px 10px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
              ${escapeHtml(category || 'Record')}
            </span>
            <span style="font-size: 11px; font-family: monospace; color: var(--text-muted, #78716c); font-weight: 700;">ID: #${escapeHtml(String(recordId))}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary, #44403c); margin-bottom: 4px;">Category</label>
              <input id="cat_${recordId}" style="width: 100%; padding: 10px 14px; font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--border-subtle, #ede4de); border-radius: 8px; outline: none; background: #ffffff; color: var(--text-main, #292524);" value="${escapeHtml(category)}">
            </div>
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary, #44403c); margin-bottom: 4px;">Location / Branch</label>
              <input id="loc_${recordId}" style="width: 100%; padding: 10px 14px; font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--border-subtle, #ede4de); border-radius: 8px; outline: none; background: #ffffff; color: var(--text-main, #292524);" value="${escapeHtml(location)}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary, #44403c); margin-bottom: 4px;">Region</label>
              <input id="reg_${recordId}" style="width: 100%; padding: 10px 14px; font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--border-subtle, #ede4de); border-radius: 8px; outline: none; background: #ffffff; color: var(--text-main, #292524);" value="${escapeHtml(region)}">
            </div>
            <div>
              <label style="display: block; font-size: 11.5px; font-weight: 700; color: var(--text-secondary, #44403c); margin-bottom: 4px;">Designation / Role</label>
              <input id="des_${recordId}" style="width: 100%; padding: 10px 14px; font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--border-subtle, #ede4de); border-radius: 8px; outline: none; background: #ffffff; color: var(--text-main, #292524);" value="${escapeHtml(designation)}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary, #44403c); margin-bottom: 4px;">Contact Person Name</label>
              <input id="nam_${recordId}" style="width: 100%; padding: 10px 14px; font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--border-subtle, #ede4de); border-radius: 8px; outline: none; background: #ffffff; color: var(--text-main, #292524);" value="${escapeHtml(name)}">
            </div>
            <div>
              <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary, #44403c); margin-bottom: 4px;">Contact Number</label>
              <input id="con_${recordId}" style="width: 100%; padding: 10px 14px; font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--border-subtle, #ede4de); border-radius: 8px; outline: none; background: #ffffff; color: var(--text-main, #292524);" value="${escapeHtml(contact)}">
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary, #44403c); margin-bottom: 4px;">Full Address</label>
            <input id="adr_${recordId}" style="width: 100%; padding: 10px 14px; font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--border-subtle, #ede4de); border-radius: 8px; outline: none; background: #ffffff; color: var(--text-main, #292524);" value="${escapeHtml(address)}">
          </div>

          <div style="display: flex; gap: 10px; margin-top: 6px; padding-top: 10px; border-top: 1px dashed var(--border-subtle, #ede4de);">
            <button onclick="saveRecord('${recordId}')" style="flex: 1; padding: 10px; background: #0284c7; color: #ffffff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
              Edit / Save
            </button>
            <button onclick="deleteRecord('${recordId}')" style="flex: 1; padding: 10px; background: #dc2626; color: #ffffff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
              Delete
            </button>
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
