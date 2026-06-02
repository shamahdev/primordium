# Contributing to Primordium

Thanks for your interest in contributing! Primordium is an Expo/React Native app built with TypeScript. This guide covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Style](#coding-style)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Be respectful, constructive, and inclusive. Harassment of any kind will not be tolerated.

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 (use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm))
- **npm** (this project enforces npm via `preinstall` — do not use yarn or pnpm)
- **Expo CLI** (`npx expo`)
- **iOS**: Xcode 16+ (macOS only)
- **Android**: Android Studio with an emulator or a physical device

### Setup

```bash
git clone https://github.com/shamahdev/primordium.git
cd primordium
npm install
```

### Run the app

```bash
# Start Expo dev server
npm start

# Or target a specific platform
npm run ios:dev
npm run android:dev
npm run web

# Environment variants (development / preview / production)
npm run android:dev
npm run android:preview
npm run android:prod
npm run ios:dev
npm run ios:preview
npm run ios:prod
```

Environment variants set `APP_VARIANT` which controls the app name and bundle identifier via `app.config.js`.

## Development Workflow

1. **Find or create an issue** for the change you want to make. Discuss the approach in the issue before writing code for larger features.
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/short-description    # feature
   git checkout -b fix/short-description     # bug fix
   git checkout -b chore/short-description   # tooling, deps, docs
   ```
3. **Make your changes** and test on at least one platform (iOS simulator, Android emulator, or physical device).
4. **Run lint and type-check** before committing.
5. **Open a pull request** against `main` with a clear description and a reference to the issue.

### AI-Assisted Development

AI-assisted and vibe coding contributions are welcome as long as the resulting code meets the project's standards — it must pass lint, type-check, and work correctly on target platforms. AI is a tool, not a replacement for review and testing.

This project uses [Matt Pocock's skills](https://github.com/mattpocock/skills) to help AI coding agents navigate the project's documentation, architecture decisions, and domain language. The `docs/` directory contains:

| Directory | Purpose |
|---|---|
| `docs/adr/` | Architecture Decision Records — why we chose certain patterns |
| `docs/agents/` | Agent-specific instructions (issue tracking, triage labels, domain docs) |

If you contribute with an AI coding agent, install and use the Matt Pocock skill set so the agent can automatically read and apply the conventions in `AGENTS.md`, `CONTEXT.md`, and `docs/adr/`. This keeps contributions consistent regardless of whether they are hand-written or AI-generated.

## Project Structure

```
primordium/
├── app.config.js          # Dynamic Expo config (env variants)
├── app.json               # Static Expo config base
├── eas.json               # EAS Build profiles
├── src/
│   ├── app/               # Expo Router file-based routes
│   │   ├── (tabs)/        # Authenticated tab screens
│   │   ├── _layout.tsx    # Root layout
│   │   ├── login.tsx      # Riot login screen
│   │   └── onboarding.tsx # First-launch region picker
│   ├── components/        # Reusable UI components
│   ├── constants/         # Theme colors, spacing, Riot endpoints
│   ├── hooks/             # Custom React hooks (useTheme, etc.)
│   ├── lib/               # Business logic (API, auth, cookies, store assets)
│   └── stores/            # Zustand stores (account, etc.)
└── assets/                # Images, icons, splash
```

Key patterns:
- **Zustand** for global state (`src/stores/`)
- **Expo Router** file-based routing (`src/app/`)
- **React Navigation Material Top Tabs** for the authenticated tab bar
- **Riot auth** flows live in `src/lib/riot-login.ts`, `src/lib/riot-cookies.ts`, and `src/lib/auth-recovery.ts`

## Coding Style

- **TypeScript** with strict mode — avoid `any`, prefer type inference
- **React function components** with hooks — no class components
- **Expo Router** conventions — file-based routes, `useLocalSearchParams` for query params
- **Zustand** stores — use selectors (`useStore(state => state.foo)`) for performance

### Imports

Use path aliases as configured in `tsconfig.json`:

```ts
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { type ValorantShard } from '@/lib/account';
```

Keep imports organized: React / RN first, third-party next, project aliases last.

### Components

- Use `ThemedText` and `ThemedView` for theme-aware text and containers
- Use `StyleSheet.create` for static styles
- Use `useSafeAreaInsets` from `react-native-safe-area-context` for safe area awareness

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Night Market countdown timer
fix: tab bar hidden behind Android nav bar
chore: update expo to 55.0.26
docs: add contributing guide
refactor: extract store refresh into hook
```

Keep commits focused — one logical change per commit.

## Pull Request Process

1. Ensure your branch is up to date with `main`:
   ```bash
   git checkout main && git pull && git checkout - && git rebase main
   ```
2. Verify lint and type-check pass:
   ```bash
   npm run lint && npx tsc --noEmit
   ```
3. Test on at least one platform.
4. Open the PR with:
   - A clear title following conventional commits
   - A description of what changed and why
   - A reference to the related issue (e.g., `Closes #42`)
   - Screenshots or screen recordings for UI changes
5. Request review from a maintainer.

## Reporting Issues

- **Bug reports**: Include steps to reproduce, expected vs actual behavior, device/OS version, and screenshots.
- **Feature requests**: Describe the problem you want solved, not just the solution. Include use cases.
- **Security issues**: Do **not** open a public issue. Contact a maintainer directly.

Use [GitHub Issues](https://github.com/shamahdev/primordium/issues) for all non-security reports.
