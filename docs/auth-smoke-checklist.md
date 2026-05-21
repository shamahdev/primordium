# Auth Smoke Checklist

Run on a real iOS or Android device build.

- Fresh install opens onboarding with the security disclosure and Region picker.
- Login succeeds for a valid Riot account and selected Region.
- Wrong Region blocks saving and returns a clear login error.
- App lands in Home/Profile tabs after login.
- Profile shows Riot ID, Region, level, XP, VP, Radianite, and Kingdom Credits.
- Pulling or retrying profile refresh marks the account as needing re-authentication on 401/403.
- Switch Account opens a bottom sheet with the active account marked.
- Add account keeps the current account active until the new login succeeds.
- Logging into the same PUUID and Region updates the existing saved account instead of duplicating it.
- Logout confirms before removing only the current account.
- Relaunch restores saved accounts, active account, and cached Profile Snapshot.
