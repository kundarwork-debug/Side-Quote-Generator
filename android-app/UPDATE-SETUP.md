# APML Portal Android signing and updates

The Android app loads the live APML Portal website. Website-only changes deployed to the portal are visible in the installed app after refresh/reopen; they do not require an APK rebuild.

Native Android changes create a new signed APK. The app checks the latest GitHub release metadata periodically and shows a download prompt when a newer version is available. Android still requires the user to approve installation.

## One-time signing setup

A permanent signing key is required so Android accepts future APKs as updates to the installed app. Keep this keystore private and make a secure offline backup. Never commit it to this repository or share it in chat.

Generate a key on a trusted computer with Java installed:

```bash
keytool -genkeypair -v -keystore apml-release-key.jks -alias apml-portal -keyalg RSA -keysize 2048 -validity 10000
```

Use alias `apml-portal`. Choose strong passwords and store them securely.

Add these four repository Actions secrets under GitHub → Settings → Secrets and variables → Actions:

- `ANDROID_KEYSTORE_BASE64`: Base64 encoding of the complete `apml-release-key.jks` file.
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: `apml-portal`.
- `ANDROID_KEY_PASSWORD`: key password.

PowerShell can produce the Base64 value without changing the original keystore:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes(".\apml-release-key.jks"))
```

Paste that output into the `ANDROID_KEYSTORE_BASE64` secret. Do not paste it into a commit, issue, or chat.

## First signed installation

The existing APK was built with the CI debug signing identity, which is not a reliable permanent identity. The first APK signed with this new key may therefore require a one-time uninstall of the old app before installing the new signed APK. Uninstalling can erase app-local data. After this migration, keep using the exact same keystore for every release; future updates can install over the existing app.

Until all four secrets are configured, Actions only builds a validation/debug artifact and deliberately does not replace the public APK release.
