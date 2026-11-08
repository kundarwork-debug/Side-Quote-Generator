# APML Portal Android App

A rebuilt Android WebView app for the live APML Portal:
https://apmlportal.vercel.app/index.html

## App details
- Application ID: `com.apml.portal`
- Version: 2.1 (versionCode 3)
- Minimum Android: 6.0 (API 23)
- Target Android: API 35

## Included
- Edge-to-edge Android system bars with safe insets
- Full-screen portal experience (no duplicate native header or bottom navigation)
- Pull-to-refresh gesture
- Android back navigation
- WebView storage and session cookies for portal/Firebase flows
- Android file picker support, including multiple file selection
- Native Downloads handling with download notifications
- AndroidX branded native launch splash screen
- Native Android share sheet fallback for Web Share API actions
- Native system-bar and app theme styling
- External links handed to their appropriate Android apps
- Friendly offline/error retry screen
- Reduced-motion / responsive page compatibility without forcing page heights

## Build
The GitHub Actions workflow at `.github/workflows/build-apk.yml` builds the debug APK and publishes it as the `APML-Portal.apk` release asset. The APK uses a hybrid architecture: Android provides the launch experience, system integration and native sharing while the existing portal screens remain web-based.

The app displays the live website, so an internet connection is required for portal pages and Firebase-backed features.
