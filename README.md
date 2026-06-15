<!-- prettier-ignore -->
<div align="center">

<img src="./assets/images/icon.png" alt="Primordium" align="center" height="96" />

# Primordium

[Download latest release](https://github.com/shamahdev/primordium/releases)

**Check your Valorant Store from your phone, across multiple Riot accounts**


[![Expo](https://img.shields.io/badge/Expo-56-000020?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.85-61dafb?style=flat-square&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Android APK](https://img.shields.io/badge/Android-APK-success?style=flat-square&logo=android)](https://github.com/shamahdev/primordium/releases)

[Download](#download) • [Features](#features) • [Architecture](#architecture) • [Contributing](#contributing)

</div>

## Overview

Primordium is an unofficial mobile companion app for Valorant. It lets you view your personalized Store, featured bundles, Night Market, cosmetic catalog, and account profile without opening the game.

The app signs in through Riot, stores session material on-device, refreshes sessions automatically when possible, and supports switching between multiple Riot accounts on one device.

Primordium is heavily inspired by [VShop](https://vshop.one/).

## Download

Android APK builds are published on the [GitHub Releases page](https://github.com/shamahdev/primordium/releases). Production Android distribution uses APK releases rather than Play Store AAB distribution.

## Features

- **Store** - View daily skin offers, accessory offers, featured bundles, and Night Market cards with reset timers.
- **Catalog** - Browse Valorant cosmetics from `valorant-api.com`, search, filter by item type, and open item details.
- **Favorites & Store Alerts** - Mark cosmetics as favorites and optionally get notified when a favorited item appears in your Store.
- **Account Profile & Multi-Account Support** - View level, XP, currency balances, and manage multiple Riot accounts on one device.
- **Session Recovery** - Stored Riot sessions are refreshed in the background when possible, with reauth prompts when Riot requires a fresh login.
- **Update Checks** - In-app release banner points users to newer GitHub Releases builds.

## Architecture

Primordium uses Expo Router with vertical domain modules under `src/modules`.

```text
src/
├── app/                # Expo Router routes and layouts
├── commons/            # Shared UI, theme, HTTP, logging, update checks
└── modules/
    ├── account/        # Riot login, stored sessions, profile, account switching
    ├── catalog/        # Public cosmetic catalog and filtering
    ├── favorite/       # Favorites and background notification alerts
    └── store/          # Riot storefront, offers, bundles, item details
```

Key implementation details:

- **Expo SDK 56** with React Native 0.85, React 19, Expo Router, and typed routes.
- **Zustand** persists account, favorite, and alert state.
- **Riot storefront** requests use `POST https://pd.{shard}.a.pvp.net/store/v3/storefront/{puuid}` with Riot auth headers.
- **Public assets** are resolved from [valorant-api.com](https://valorant-api.com/) for bundles, skins, buddies, cards, sprays, flex items, and titles.
- **Secure material** is stored through Expo SecureStore; persistent app state uses AsyncStorage-backed Zustand stores.
- **Background alerts** use Expo Background Task, Task Manager, and Notifications.
- **Production Android builds** are APKs with arm64-v8a only, R8 minification, resource shrinking, and bundle compression enabled.

## Tech Stack

- [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Zustand](https://github.com/pmndrs/zustand)

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Use [GitHub Issues](https://github.com/shamahdev/primordium/issues) for bugs and feature requests, and [GitHub Discussions](https://github.com/shamahdev/primordium/discussions) for broader ideas or questions.

## Acknowledgments

- [VShop](https://vshop.one/) for the original product inspiration.
- [valapidocs.techchrism.me](https://valapidocs.techchrism.me/) for Riot API reference material.
- [valorant-api.com](https://valorant-api.com/) for public asset and metadata APIs.

---

> [!IMPORTANT]
> Primordium is an **unofficial** project. It is not endorsed by, affiliated with, or connected to Riot Games or VALORANT in any way. All Valorant and Riot Games assets are property of their respective owners.
