// =========================================================
// APML FIELD OFFICER DIRECTORY HELPER (field-officer.js)
// Supports Soft Delete, Sorting, Admin View & Custom Actions
// =========================================================

class APMLFieldOfficerDirectory {
  constructor(containerId, searchInputId) {
    this.container = document.getElementById(containerId);
    this.searchInput = document.getElementById(searchInputId);
    this.allData = [];
    this.showDeleted = false; // Admin toggle state

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.filterData(e.target.value));
    }
  }

  setData(dataArray) {
    this.allData = Array.isArray(dataArray) ? dataArray : [];
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
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(q)
        );
      });
    }
    this.render(pool);
  }

  render(items) {
    if (!this.container) return;
    
    if (!items || items.length === 0) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #78716c; font-weight: 600;">
          No matching field officers found.
        </div>`;
      return;
    }

    let html = `
      <div style="background: #ffffff; border: 1.5px solid #ede4de; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(120, 113, 108, 0.05);">
        <div style="display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 2fr 1fr; padding: 16px 24px; border-bottom: 1.5px solid #ede4de; font-size: 11.5px; font-weight: 700; color: #c21d1d; text-transform: uppercase; letter-spacing: 0.05em; background: #fdf8f5;">
          <div>Officer Name / Role</div>
          <div>Branch / APM</div>
          <div>Contact Number</div>
          <div>Status &amp; Communications</div>
          <div style="text-align: right;">Actions</div>
        </div>
        <div style="display: flex; flex-direction: column;">
    `;

    html += items.map((item, index) => {
      const recordId = item.id !== undefined ? item.id : index;
      const name = item.name || 'Unnamed Officer';
      const branch = item.branch || 'N/A';
      const apmCode = item.apmCode || 'N/A';
      const designation = item.designation || 'Marketing Executive';
      const role = item.role || 'BFO';
      const mobile = item.mobile || 'No Number';
      const status = item.status || 'Active';
      const isDeleted = item.isDeleted === true || item.isDeleted === 'true' || item.isDeleted === 1;

      const rowBg = isDeleted ? '#fef2f2' : '#ffffff';
      const textColor = isDeleted ? '#991b1b' : '#292524';
      const subTextColor = isDeleted ? '#b91c1c' : '#78716c';
      const badgeText = isDeleted ? ' [DELETED]' : '';

      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FO';
      const cleanPhone = String(mobile).replace(/[^0-9]/g, '');
      const waPhone = cleanPhone.length >= 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
      const statusClass = String(status).toLowerCase();

      return `
        <div id="row_view_${recordId}" style="display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 2fr 1fr; padding: 16px 24px; border-bottom: 1px solid #ede4de; align-items: center; background: ${rowBg}; transition: background 0.15s ease;" onmouseover="this.style.background='${isDeleted ? '#fee2e2' : '#fdf8f5'}'" onmouseout="this.style.background='${rowBg}'">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${isDeleted ? '#991b1b' : '#c21d1d'}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;">
              ${escapeHtml(initials)}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 14px; font-weight: 700; color: ${textColor};">${escapeHtml(name)}${badgeText}</span>
              <span style="font-size: 11.5px; color: ${subTextColor}; font-weight: 600;">${escapeHtml(designation)} (${escapeHtml(role)})</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 13.5px; font-weight: 700; color: ${textColor};">${escapeHtml(branch)}</span>
            <span style="font-size: 11.5px; color: ${subTextColor};">APM: ${escapeHtml(apmCode)}</span>
          </div>

          <div style="font-size: 13.5px; font-weight: 600; color: ${textColor};">
            ${escapeHtml(mobile)}
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div>
              <span class="state-badge ${statusClass}" style="padding: 3px 10px; border-radius: 9999px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; background: rgba(16,185,129,0.1); color: #059669;">${escapeHtml(status)}</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <a href="tel:${escapeHtml(cleanPhone)}" style="font-size: 11.5px; font-weight: 700; color: #0284c7; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;" title="Call Officer">
                <span class="material-symbols-outlined" style="font-size: 14px;">call</span> Call
              </a>
              <a href="https://wa.me/91${escapeHtml(waPhone)}?text=Hi%20${encodeURIComponent(name)},%20regarding%20APML..." target="_blank" rel="noopener noreferrer" style="font-size: 11.5px; font-weight: 700; color: #059669; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;" title="WhatsApp">
                <span class="material-symbols-outlined" style="font-size: 14px;">chat</span> WhatsApp
              </a>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            ${isDeleted ? `
              <button onclick="restoreOfficer('${recordId}')" title="Restore Officer" style="background: rgba(5, 150, 105, 0.1); border: 1.5px solid rgba(5, 150, 105, 0.3); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #059669; transition: all 0.2s ease;" onmouseover="this.style.background='#059669'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(5, 150, 105, 0.1)'; this.style.color='#059669'">
                <span class="material-symbols-outlined" style="font-size: 18px;">settings_backup_restore</span>
              </button>
              <button onclick="permanentDeleteOfficer('${recordId}')" title="Delete Permanently" style="background: rgba(220, 38, 38, 0.1); border: 1.5px solid rgba(220, 38, 38, 0.3); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dc2626; transition: all 0.2s ease;" onmouseover="this.style.background='#dc2626'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(220, 38, 38, 0.1)'; this.style.color='#dc2626'">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete_forever</span>
              </button>
            ` : `
              <button onclick="startEditOfficer('${recordId}')" title="Edit Officer" style="background: rgba(194, 29, 29, 0.08); border: 1.5px solid rgba(194, 29, 29, 0.2); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #c21d1d; transition: all 0.2s ease;" onmouseover="this.style.background='#c21d1d'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(194, 29, 29, 0.08)'; this.style.color='#c21d1d'">
                <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
              </button>
              <button onclick="deleteOfficer('${recordId}')" title="Delete Officer" style="background: rgba(220, 38, 38, 0.08); border: 1.5px solid rgba(220, 38, 38, 0.2); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dc2626; transition: all 0.2s ease;" onmouseover="this.style.background='#dc2626'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(220, 38, 38, 0.08)'; this.style.color='#dc2626'">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    html += `</div></div>`;
    this.container.innerHTML = html;
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
