# WebView token-session auth

Primordium uses Riot's WebView login redirect to capture token-session material, stores account metadata in persisted Zustand state, and stores per-account Riot API tokens in SecureStore. We rejected persistent per-account WebView cookie jars because React Native WebView does not provide first-class isolated cookie stores; login uses incognito/cleared WebView sessions instead, and expired tokens mark the Stored Riot Account as needing re-authentication rather than deleting it.
