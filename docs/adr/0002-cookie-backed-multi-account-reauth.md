# Cookie-backed multi-account reauth

## Status

Accepted

## Context

Primordium lets a player keep and switch between multiple Stored Riot Accounts on one device. Riot access tokens are short-lived, so requiring interactive Riot login whenever a player switches back to an older Stored Riot Account creates poor multi-account UX.

React Native WebView does not provide isolated cookie jars per account. A shared native cookie jar can silently authenticate the wrong Riot identity if reused carelessly.

## Decision

Store Riot auth-domain cookies in SecureStore per Stored Riot Account and use the native WebView cookie jar only as managed scratch space.

Before each auth attempt, clear the shared cookie jar. For silent reauth, inject only the selected Stored Riot Account's saved Riot auth cookies, load Riot's auth URL in a hidden WebView, capture the returned access token, verify the returned `puuid`, request a fresh entitlements token, save the refreshed token bundle, save refreshed Riot auth cookies when available, then clear the shared cookie jar again.

Only one auth or reauth attempt may own the scratch cookie jar at a time. Concurrent refreshes for the same Stored Riot Account share one in-flight refresh; refreshes for different Stored Riot Accounts are globally serialized.

## Consequences

- Switching Stored Riot Accounts can silently recover expired tokens when Riot still accepts the saved cookies.
- Saved Riot auth cookies are credential material and must be deleted when the Stored Riot Account is removed or Riot rejects them.
- A `puuid` mismatch during reauth is treated as unsafe and never overwrites the selected Stored Riot Account.
- Network failures and timeouts do not prove the saved cookies are invalid; they stay retryable and do not mark the Stored Riot Account sign-in required.
