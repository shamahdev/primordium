# Threaded Store Surface

We will treat `react-native-runtimes` as permanent architecture for the Store Surface, using a secondary Hermes runtime for Store rendering while the Main Runtime keeps navigation, auth/session refresh, account persistence, notifications, interaction state, and cross-cutting app state. This accepts Metro/native/runtime complexity because Store is Primordium's most asset-heavy surface and isolating it gives us a stable boundary for responsiveness work without moving Riot session concerns across isolated JS heaps.

## Consequences

The Store Surface must pass IDs, prepared view data, or Shared Runtime State across the runtime boundary instead of large mutable objects or auth/session objects. Store runtime changes should still be verified with same-device Android production APK measurements for tab open, scroll responsiveness, regressions, and APK size.

Initial integration uses `@react-native-runtimes/core` and `react-native-nitro-modules`. `@react-native-runtimes/state` is deferred until Store-specific live cross-runtime state is required, so existing main-app Zustand state remains the default outside the threaded Store boundary.

Every threaded Store integration change must include Android production APK before/after notes for Store tab open and scroll behavior, plus smoke checks for login/session refresh and account switching. If runtime isolation worsens performance or introduces regressions, the integration must be fixed before merge.
