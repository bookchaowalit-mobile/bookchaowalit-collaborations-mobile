# Collaborations — Mobile

> **Template copy.** This repo is one of the name-substituted Expo SDK 53 / Expo Router
> template copies in `bookchaowalit-mobile`. The canonical template is
> [`bookchaowalit-mobile/community-hub-mobile`](https://github.com/bookchaowalit-mobile/community-hub-mobile);
> this copy keeps its own code (no shared package). Consolidation/archive is pending
> owner decision D5 (BD-033) per `repository-catalog/portfolio/MOBILE-CONSOLIDATION-2026-10.md`
> in solo-empire.

React Native mobile app (Expo) for **Collaborations**.

Part of [Chaowalit Greepoke](https://bookchaowalit.com)'s 101 Portfolio Projects.

## Tech Stack

- **Framework:** Expo SDK 53 + Expo Router
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **UI:** React Native + Ionicons

## Features

- **Collaboration pipeline** (home tab): track partners and projects through
  `proposed → negotiating → active → completed` (or `declined`, which can be
  reopened). Only valid transitions are offered.
- **Status filter** chips with counts and **search** across partner, project
  and notes.
- **Propose** new collaborations with validated input.
- Starts with sample data held in memory (`lib/collabs.ts`); persistence and
  sharing with collaborators are on the backlog.

## Getting Started

```bash
npm ci
npx expo start
```

## Validation

```bash
npm run validate   # expo lint + tsc --noEmit + vitest
npx expo export --platform android --output-dir dist   # bundle smoke check
```

Pure logic lives in `lib/` and is unit-tested with Vitest (`lib/*.test.ts`).
CI (`.github/workflows/ci.yml`) calls the shared `bookchaowalit/platform-ci-workflows`
`ci-node.yml` and `security.yml` (v1.1.1, SHA-pinned): `npm ci`, lint, typecheck, tests,
the Android JS bundle export above, plus Gitleaks, Semgrep, OSV-Scanner and Trivy.
Failures are not masked. There is no EAS / Expo cloud build in CI: that needs an
owner-linked Expo account (owner action).

## Build

```bash
# Android
npx eas build --platform android --profile preview

# iOS
npx eas build --platform ios --profile preview
```

## Related

- **Frontend:** [bookchaowalit-website/collaborations-frontend](https://github.com/bookchaowalit-website/collaborations-frontend)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

## License

MIT
