# APML Portal — Native Android Rebuild

This directory is the separate native Android application. It is intentionally isolated from the existing website and the legacy WebView project under `android-app/`.

## Product goal

Build a genuine Android application with native screens and navigation. The application must not load the APML website in a WebView or use a website wrapper as its main UI.

## Stack

- Kotlin
- Jetpack Compose + Material 3
- Navigation Compose
- MVVM with repositories and ViewModels
- Firebase Android SDK for the existing APML Realtime Database and Firebase Authentication
- Room for offline/local data where appropriate
- DataStore for preferences
- Android DownloadManager / share intents / notifications

## Existing backend discovered

- Firebase project: `apml-portal`
- Realtime Database: `https://apml-portal-default-rtdb.firebaseio.com`
- Existing database modules include:
  - `analytics/daily_logs`
  - `analytics/totalPdfDownloads`
  - `analytics/totalMediaDownloads`
  - `catbox_gdrive_files`
  - `catbox_gdrive_folders`
  - `apml_ranked_gallery`
  - `presence`
  - `analytics/visitor_sessions`
- The current website uses Firebase Google popup authentication for protected Drive and Gallery operations. Native authentication must use the Android Firebase authentication flow; do not emulate the web popup.
- File uploads and some file management operations are backed by existing HTTP endpoints / Catbox integration. These need a dedicated API audit before native implementation. Never embed privileged credentials in the APK.

## Non-negotiable migration rules

1. Do not change or remove the existing website pages during the native rebuild.
2. Do not replace the current `android-app/` WebView project until native feature parity has been tested.
3. Keep application ID `com.apml.portal` and use the user's existing permanent signing key for release builds.
4. Increment versionCode for every published APK.
5. Do not publish a partial native app as a replacement for the working portal.
6. Preserve Firebase records and existing data structures. Any schema migration needs an explicit plan and backward compatibility.
7. All admin actions must remain protected by Firebase Authentication and database security rules.
8. Test on Redmi Note 9 / Project X Infinity (Android 16), including low-memory and offline cases.

## Development stages

- Stage 0 — repository and backend audit (this document and FEATURE-MAP.md).
- Stage 1 — native app foundation: Compose theme, navigation, dashboard shell, loading/error states, app lifecycle, build pipeline.
- Stage 2 — offline/local calculators: APML Lite, Car Rate, Local Rate. Verify formulas against the website before release.
- Stage 3 — quotation editor and PDF generation/sharing.
- Stage 4 — Directory and Field Officer Directory, including protected admin CRUD.
- Stage 5 — Cloud Drive and Gallery, including authentication, upload/download, folders and media preview.
- Stage 6 — Analytics, visitor intelligence, System Health, Bug Reports and notifications.
- Stage 7 — parity testing, accessibility, performance, security review, signed release.

A stage is complete only after its features are implemented and tested; placeholder screens do not count as parity.
