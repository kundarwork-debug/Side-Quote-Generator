// =========================================================
// APML USER / REAL NAME SETUP & TRACKER (Vanilla JS Modal)
// =========================================================
(function() {
  function initStationTracker() {
    let stationName = localStorage.getItem('apml_station_name');
    let snoozeUntil = localStorage.getItem('apml_prompt_snooze');
    let isSnoozed = snoozeUntil && Date.now() < parseInt(snoozeUntil, 10);
    
    // Show prompt if name is missing AND the 15-minute snooze has expired
    if ((!stationName || stationName.trim() === '' || stationName === 'null' || stationName === 'undefined') && !isSnoozed) {
      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'apmlStationModalOverlay';
      modalOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeInOverlay 0.3s ease;
      `;

      modalOverlay.innerHTML = `
        <div style="
          background: #ffffff;
          max-width: 420px;
          width: 100%;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
          border: 1.5px solid #f3e8e2;
          text-align: center;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: scaleUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        " id="apmlModalContentBox">
          <img src="https://i.ibb.co/hJ97C30p/Gemini-Generated-Image-hkvlk4hkvlk4hkvl-1.png" alt="Setup Illustration" style="
            width: 100%;
            height: 140px;
            object-fit: contain;
            border-radius: 12px;
            margin-bottom: 20px;
            display: block;
          ">
          <h3 style="
            font-size: 22px;
            font-weight: 800;
            color: #1c1917;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
          ">Enter Your Name</h3>
          <p style="
            font-size: 14px;
            color: #78716c;
            line-height: 1.5;
            margin-bottom: 24px;
          ">Because this workstation has shared access, adding your name helps your team coordinate tasks and downloads smoothly.</p>
          
          <form id="apmlStationForm" style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
            <div>
              <input type="text" id="apmlStationInput" placeholder="Your Full Name" required autofocus style="
                width: 100%;
                padding: 12px 16px;
                background: #f8f5f0;
                border: 1.5px solid #d7ccc8;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                color: #1c1917;
                outline: none;
                transition: all 0.2s ease;
              ">
              <div id="apmlStationError" style="color: #dc2626; font-size: 12px; font-weight: 600; margin-top: 4px; display: none;">Please enter your real name!</div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button type="button" id="apmlCloseTabBtn" style="
                flex: 1;
                background: #64748b;
                color: #ffffff;
                border: none;
                padding: 14px;
                border-radius: 9999px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: background 0.2s ease, transform 0.2s ease;
              ">Close Tab</button>
              <button type="submit" style="
                flex: 1.5;
                background: #b91c1c;
                color: #ffffff;
                border: none;
                padding: 14px;
                border-radius: 9999px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(185, 28, 28, 0.25);
                transition: background 0.2s ease, transform 0.2s ease;
              ">Save &amp; Continue</button>
            </div>
          </form>
        </div>
      `;

      const styleTag = document.createElement('style');
      styleTag.innerHTML = `
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUpModal { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        #apmlStationInput:focus { border-color: #b91c1c !important; background: #ffffff !important; box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.15); }
        #apmlCloseTabBtn:hover { background: #475569 !important; }
      `;
      document.head.appendChild(styleTag);
      document.body.appendChild(modalOverlay);

      const form = document.getElementById('apmlStationForm');
      const input = document.getElementById('apmlStationInput');
      const errorDiv = document.getElementById('apmlStationError');
      const closeTabBtn = document.getElementById('apmlCloseTabBtn');
      const contentBox = document.getElementById('apmlModalContentBox');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input.value.trim().replace(/['"`<>\\]/g, '');
        if (!val) {
          errorDiv.style.display = 'block';
          input.focus();
          return;
        }

        localStorage.setItem('apml_station_name', val);
        localStorage.removeItem('apml_prompt_snooze'); // Clear snooze once saved

        // Immediately sync user registration data to Firebase
        if (typeof window.APMLStation !== 'undefined' && window.APMLStation.logAction) {
          window.APMLStation.logAction('Registered', 'Initial Setup');
        }

        modalOverlay.style.opacity = '0';
        setTimeout(() => modalOverlay.remove(), 300);
      });

      // Close tab button: set 15 min snooze, show countdown, and redirect to about.html
      closeTabBtn.addEventListener('click', () => {
        const snoozeExpiry = Date.now() + (15 * 60 * 1000);
        localStorage.setItem('apml_prompt_snooze', snoozeExpiry);

        let timerSeconds = 5;
        contentBox.innerHTML = `
          <div style="padding: 10px 0;">
            <div style="width: 50px; height: 50px; border: 4px solid #f3e8e2; border-top-color: #b91c1c; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <h3 style="font-size: 20px; font-weight: 800; color: #1c1917; margin-bottom: 8px;">Redirecting...</h3>
            <p style="font-size: 14px; color: #78716c; line-height: 1.5;">Taking you to the About page in <b id="countdownNumber" style="color: #b91c1c;">${timerSeconds}</b> seconds.</p>
          </div>
          <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;

        const countdownEl = document.getElementById('countdownNumber');
        const interval = setInterval(() => {
          timerSeconds--;
          if (countdownEl) {
            countdownEl.textContent = timerSeconds;
          }
          if (timerSeconds <= 0) {
            clearInterval(interval);
            window.location.href = "about.html";
          }
        }, 1000);
      });
    }
  }

  window.APMLStation = {
    getName: function() {
      return localStorage.getItem('apml_station_name') || 'Unknown-User';
    },
    logAction: function(actionType, fileName) {
      if (typeof firebase === 'undefined' || !firebase.database) return;
      const station = this.getName();
      const safeKey = station.replace(/[.#$\/\[\]]/g, '_');
      
      const ref = firebase.database().ref(`analytics/stationActivity/${safeKey}`);
      ref.update({
        stationName: station,
        lastActive: Date.now(),
        lastAction: actionType,
        lastFile: fileName || ''
      });

      if (actionType === 'download') {
        ref.child('downloadCount').transaction(val => (val || 0) + 1);
      }
    },
    reset: function() {
      localStorage.removeItem('apml_station_name');
      localStorage.removeItem('apml_prompt_snooze');
      alert("Name cleared. Refresh the page to enter a new name.");
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStationTracker);
  } else {
    initStationTracker();
  }
})();
