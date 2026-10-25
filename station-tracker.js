// =========================================================
// APML USER / REAL NAME SETUP & TRACKER (SweetAlert2)
// =========================================================
(function() {
  function initStationTracker() {
    let stationName = localStorage.getItem('apml_station_name');
    
    // If name is not set, show prompt on every refresh
    if (!stationName || stationName.trim() === '' || stationName === 'null' || stationName === 'undefined') {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: "Enter Your Name",
          text: "Since office logins are shared, please enter your real name so your team knows who performed recent actions and downloads.",
          imageUrl: "https://i.ibb.co/hJ97C30p/Gemini-Generated-Image-hkvlk4hkvlk4hkvl-1.png",
          imageWidth: 320,
          imageHeight: 160,
          imageAlt: "APML Name Setup",
          input: "text",
          inputPlaceholder: "Your Full Name",
          inputAttributes: { 
            autocapitalize: "words",
            autocorrect: "off"
          },
          showCancelButton: true,
          confirmButtonText: "Save & Continue",
          cancelButtonText: "Close Tab",
          confirmButtonColor: "#b91c1c",
          cancelButtonColor: "#64748b",
          allowOutsideClick: false,
          allowEscapeKey: false,
          preConfirm: (name) => {
            if (!name || !name.trim()) {
              Swal.showValidationMessage("Please enter your real name!");
              return false;
            }
            return name.trim().replace(/['"`<>\\]/g, '');
          }
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            const cleanName = result.value;
            localStorage.setItem('apml_station_name', cleanName);
            
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: `Welcome, ${cleanName}!`,
              showConfirmButton: false,
              timer: 2500
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // User clicked "Close Tab" -> Start 5-second countdown timer
            let timerSeconds = 5;
            let timerInterval;

            Swal.fire({
              title: "Closing Tab...",
              html: `This tab will close in <b>${timerSeconds}</b> seconds.`,
              timer: 5000,
              timerProgressBar: true,
              allowOutsideClick: false,
              allowEscapeKey: false,
              didOpen: () => {
                Swal.showLoading();
                const b = Swal.getHtmlContainer().querySelector('b');
                timerInterval = setInterval(() => {
                  timerSeconds--;
                  if (b) {
                    b.textContent = timerSeconds;
                  }
                }, 1000);
              },
              willClose: () => {
                clearInterval(timerInterval);
              }
            }).then(() => {
              // Attempt to close the tab, fallback to blank page if browser blocks window.close()
              window.close();
              setTimeout(() => {
                window.location.href = "about:blank";
              }, 500);
            });
          }
        });
      } else {
        // Fallback if SweetAlert2 isn't loaded yet
        let fallbackName = prompt("【 APML Portal Setup 】\nPlease enter your real name:");
        while (!fallbackName || !fallbackName.trim()) {
          fallbackName = prompt("Name cannot be empty. Please enter your real name:");
        }
        localStorage.setItem('apml_station_name', fallbackName.trim().replace(/['"`<>\\]/g, ''));
      }
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
      alert("Name cleared. Refresh the page to enter a new name.");
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStationTracker);
  } else {
    initStationTracker();
  }
})();
