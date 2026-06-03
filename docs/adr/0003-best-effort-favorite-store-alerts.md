# Best-effort Favorite Store Alerts

Primordium uses local Expo BackgroundTask and local notifications for Favorite Store Alerts instead of an exact reset-time backend push system.

The alert checks the active Stored Riot Account's daily and accessory Store offers against device-local Favorites. It is best-effort: the operating system decides when background tasks run, may delay them past Valorant reset time, and may stop them after the user kills the app until Primordium is opened again.

This keeps Riot auth material and Favorites on device, avoids introducing a backend that stores Riot account state or push tokens, and matches the feature's per-device scope. The trade-off is that alerts cannot be guaranteed to arrive exactly at reset time.
