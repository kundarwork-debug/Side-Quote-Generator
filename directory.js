// =========================================================
// APML DIRECTORY HELPER (directory.js) - Soft Delete, Sorting & Admin View Support
// =========================================================

class APMLDirectory {
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
          No matching records found.
        </div>`;
      return;
    }

    let html = `
      <div style="background: #ffffff; border: 1.5px solid #ede4de; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(120, 113, 108, 0.05);">
        <div style="display: grid; grid-template-columns: 2fr 2fr 2fr 2.5fr 1fr; padding: 16px 24px; border-bottom: 1.5px solid #ede4de; font-size: 11.5px; font-weight: 700; color: #c21d1d; text-transform: uppercase; letter-spacing: 0.05em; background: #fdf8f5;">
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

      const isHub = String(category).includes('Hub');
      const avatarBg = isDeleted ? '#991b1b' : (isHub ? '#0284c7' : '#c21d1d');
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AP';

      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      const escapedAddressJson = JSON.stringify(address).replace(/"/g, '&quot;');

      return `
        <div id="row_view_${recordId}" style="display: grid; grid-template-columns: 2fr 2fr 2fr 2.5fr 1fr; padding: 16px 24px; border-bottom: 1px solid #ede4de; align-items: center; background: ${rowBg}; transition: background 0.15s ease;" onmouseover="this.style.background='${isDeleted ? '#fee2e2' : '#fdf8f5'}'" onmouseout="this.style.background='${rowBg}'">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${avatarBg}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;">
              ${escapeHtml(initials)}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 14px; font-weight: 700; color: ${textColor};">${escapeHtml(name)}${badgeText}</span>
              <span style="font-size: 11.5px; color: ${subTextColor}; font-weight: 600;">${escapeHtml(designation || category)}</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 13.5px; font-weight: 600; color: ${textColor};">${escapeHtml(location)}</span>
            <span style="font-size: 11.5px; color: ${subTextColor};">${escapeHtml(region)}</span>
          </div>

          <div style="font-size: 13.5px; font-weight: 600; color: ${textColor};">
            ${escapeHtml(contact)}
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px; padding-right: 8px;">
            <div style="font-size: 12px; color: ${subTextColor}; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="${escapeHtml(address)}">
              ${escapeHtml(address)}
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11.5px; font-weight: 700; color: #0284c7; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;" title="Open in Google Maps">
                <span class="material-symbols-outlined" style="font-size: 14px;">map</span> Maps
              </a>
              <button onclick="copyAddressToClipboard(${escapedAddressJson}, this)" style="background: none; border: none; font-size: 11.5px; font-weight: 700; color: #059669; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; padding: 0;" title="Copy Address">
                <span class="material-symbols-outlined" style="font-size: 14px;">content_copy</span> Copy
              </button>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px;">
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
        <div id="row_edit_${recordId}" style="display: none; padding: 24px; background: #fdf8f5; border-bottom: 1.5px solid #ede4de;">
          <div style="background: #ffffff; border: 1.5px solid #ede4de; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 14px;">
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

window.copyAddressToClipboard = function(addressText, btnElement) {
  navigator.clipboard.writeText(addressText).then(() => {
    const originalHTML = btnElement.innerHTML;
    btnElement.innerHTML = '<span class="material-symbols-outlined" style="font-size: 14px;">check</span> Copied!';
    btnElement.style.color = '#059669';
    setTimeout(() => {
      btnElement.innerHTML = originalHTML;
      btnElement.style.color = '#059669';
    }, 2000);
  }).catch(err => {
    alert("Failed to copy address: " + err);
  });
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
