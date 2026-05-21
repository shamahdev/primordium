# WebView token-session auth

Primordium uses Riot's WebView login redirect to capture token-session material, stores account metadata in persisted Zustand state, and stores per-account Riot API tokens in SecureStore. This decision originally rejected persistent per-account WebView cookie jars because React Native WebView does not provide first-class isolated cookie stores; login used incognito/cleared WebView sessions instead, and expired tokens marked the Stored Riot Account as needing re-authentication rather than deleting it.

Superseded by [ADR 0002](./0002-cookie-backed-multi-account-reauth.md), which keeps a managed scratch WebView cookie jar and stores Riot auth-domain cookies per Stored Riot Account for silent reauthentication.
