APML PORTAL — UNIFIED ADMIN NOTIFICATION CENTRE

PACKAGE CONTENTS
- apml-drive-api-upgraded.js : Worker replacement based on the supplied current Worker source.
- notifications.html         : Admin inbox page (email magic-link sign-in; no password is collected by this page).
- notification-center.js     : Inbox UI, Supabase session handling, read state, filters and shared bell count.

WHAT THE WORKER CHANGE DOES
- Preserves the existing routes and admin bot commands.
- Fixes Telegram HTML escaping in tgEsc().
- Stores recent portal notifications in the existing ANNOUNCE_KV namespace (up to 150).
- Adds GET/POST /admin-notifications, protected by the same Supabase admin email allowlist as /delete.
- Supports per-admin mark-read, mark-all-read and clear (clear only hides records from that admin).
- Adds /inbox and /notifications Telegram commands.
- Gives bug/error notifications high priority and rate-limits repeated admin command error alerts to one per command per five minutes.
- Existing /notify batching and Telegram global per-minute throttle remain in place.

DEPLOYMENT
1. Back up the currently deployed Cloudflare Worker.
2. Replace its script with apml-drive-api-upgraded.js. Keep all existing secrets and bindings, especially ANNOUNCE_KV, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_WEBHOOK_SECRET, TELEGRAM_ADMIN_IDS and the Google Drive service-account variables.
3. Add notifications.html and notification-center.js to the APML GitHub repository root.
4. Add a Notifications link in the shared navigation/header (snippet below).
5. Bump the service worker version and add notifications.html and notification-center.js to PRECACHE.
6. In Supabase Auth URL configuration, allow the APML portal URL (https://apmlportal.vercel.app/notifications.html) as a redirect URL for email magic links. Email OTP/magic-link sign-in must be enabled. The Worker still checks the authenticated email against CONFIG.ADMIN_EMAILS.
7. Confirm ANNOUNCE_KV is bound to the same KV namespace already used for announcements, maintenance and admin logs.

SHARED HEADER LINK SNIPPET
Insert this inside the .header-controls element in common.js, before the theme switch:

<a href="notifications.html" id="apmlNotificationBell" aria-label="Notifications" title="Admin notifications" style="position:relative;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;color:var(--text-main);text-decoration:none;border:1px solid var(--surface-border);background:var(--surface-card);">
  <span class="material-symbols-outlined" style="font-size:21px">notifications</span>
  <span id="apmlNotificationCount" hidden style="position:absolute;right:-3px;top:-4px;min-width:17px;height:17px;padding:0 4px;border-radius:99px;background:#b91c1c;color:#fff;font:800 10px/17px Arial;text-align:center;border:2px solid var(--bg-base)">0</span>
</a>

At the end of common.js, load the shared badge script:

(function loadAdminNotificationCenter() {
  if (window.__apmlNotificationCenterRequested) return;
  window.__apmlNotificationCenterRequested = true;
  const script = document.createElement('script');
  script.src = './notification-center.js?v=1';
  script.async = true;
  document.head.appendChild(script);
})();

SERVICE WORKER CHANGE
- Change const VERSION = 'v19' to const VERSION = 'v20'.
- Add 'notifications.html' and 'notification-center.js' to PRECACHE.

IMPORTANT LIMITS
- The Worker file is prepared, not deployed. Cloudflare deployment must be done in the Worker editor or Wrangler.
- The frontend files are packaged, not yet committed to GitHub from this session.
- No live Telegram send, KV read/write or Supabase sign-in was executed here. Test in a staging Worker first, then verify with /inbox and the web inbox.
