# EAS Dev Build Workflow

Native binaries are built on EAS. Local Metro handles JS daily. USB/ADB primary, tunnel fallback.

## Decisions

- **EAS builds the dev-client APK.** Native deps, config plugins, SDK upgrades — any change that touches `android/` or `ios/` — requires `npm run android`. EAS produces an APK, not AAB (`android.buildType: "apk"`).
- **Local Metro for daily JS.** After APK installed, `npm start` runs Metro on `localhost` so hot reload is instant. No EAS build in the loop.
- **USB/ADB primary transport.** `npm start` uses `--localhost` with ADB reverse. Eliminates tunnel latency and firewall issues. `dev:lan` and `dev:tunnel` are explicit fallbacks when USB isn't available.
- **Manual rebuild trigger.** Developer decides when native changes warrant `eas build`. No automatic EAS trigger on SDK bump or config change.
- **Multi-device via `ANDROID_SERIAL`.** Set env var to target specific device when multiple phones are connected.
- **`appVersionSource: "local"`.** Dev builds read version from `app.config.js` / `package.json`, not from Expo servers. Keeps dev version in sync with repo.
- **`android:local` as escape hatch.** `expo run:android` remains available under `npm run android:local` for developers who have a full local Android SDK and need to debug native code locally.
- **Android-only scope.** iOS development build workflow is deferred.

## Consequences

- Developer onboarding requires: Node, Expo CLI, EAS CLI (logged in), Android platform tools (adb), USB-connected phone with dev APK installed.
- First native-change cycle after clone: `npm run android` → wait for EAS → install APK → `npm start`.
- Daily JS-only changes: `npm start` instantly.
- When EAS is unavailable, `android:local` provides a local native build fallback (requires Android SDK).
