# APML Portal Android WebView

This Android app opens the live APML Portal at https://apmlportal.vercel.app/index.html.

## Build
The GitHub Actions workflow at .github/workflows/build-apk.yml builds a debug APK and uploads it as the artifact **APML-Portal-Android-APK**. Run it from Actions → Build APML Portal APK → Run workflow.

The APK is a WebView wrapper; an internet connection is required for the portal and Firebase-backed features.
