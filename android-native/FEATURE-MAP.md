# APML Portal — Existing Feature Audit

Audit source: current `main` branch at the time this file was created. This is a functional inventory, not a claim that the native implementation is complete.

| Existing web module | Current implementation evidence | Native migration notes |
|---|---|---|
| Home | `index.html`, `common.js`; live counters and operational telemetry from Firebase | Native dashboard with live repository-backed KPIs and quick actions |
| Quotation Editor | `editor.html`; quotation fields, dynamic cost rows/terms, A4 preview, PDF export, Firebase download metric | Compose form + native PDF generation/share; verify calculations and templates |
| Cloud Drive | `drive.html`; Firebase paths `catbox_gdrive_files`, `catbox_gdrive_folders`; Google popup auth; upload endpoint; Catbox links | Firebase Android Auth, folder/file repository, native document picker and download manager; audit upload endpoint security |
| Gallery | `gallery.html`; Firebase path `apml_ranked_gallery`; Google popup auth; media upload and Catbox links | Native media grid, preview, upload, folders, download and admin controls |
| Hub & Branch Directory | `directory.html`, `directory.js`; Firebase Realtime Database and Google auth scripts | Native searchable directory and authenticated CRUD; verify exact record schema and rules |
| Field Officer Directory | `field-officer.html`, `field-officer.js`; Firebase Realtime Database and Google auth scripts | Native searchable officer list and authenticated CRUD |
| Analytics | `analytics.html`, `visitor-analytics.js`; Firebase daily logs, download totals, visitor session reporting, ApexCharts and PDF/CSV exports | Native charts, date filtering, export and access control; keep existing web analytics collection intact |
| APML Lite | `APML-Lite.html`; local calculator logic | Offline native calculator; validate exact formula and edge cases |
| Car Rate | `car-rate.html`; vehicle transport calculator logic | Offline native calculator; validate vehicle categories, distance and totals |
| Local Rate | `local-rate.html`; volume/consignment and add-on calculator | Offline native calculator; validate slabs, add-ons and minimum charges |
| System Health | `system-health.html`, `api/system-health.js` | Native service-status screen using the existing health endpoint |
| Bug Report | `bug-report.html`, `notify.js` | Native form; preserve current submission destination and rate limits |
| About | `about.html` | Native about/settings screen |

## Items requiring deeper inspection before porting

- Exact Realtime Database paths and JSON models for directory and officer records.
- Firebase security rules and the precise admin authorization model.
- Drive/Gallery upload API contracts, server-side validation and storage ownership.
- Quotation numbering, PDF layout and all rate calculation formulas.
- Analytics date-window logic and visitor privacy/retention behavior.
- Existing notification delivery and Telegram rate limiting.

## Acceptance criteria

- No WebView is used for primary app screens.
- Every module listed above has a native screen and verified working operations before claiming parity.
- Read-only modules remain read-only unless the existing web app permits authenticated writes.
- Existing website remains deployable and functional independently.
- APK can be installed as an update using the same application ID and permanent signing identity.
