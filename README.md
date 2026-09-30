# Collaborations — Mobile

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
CI (`.github/workflows/build.yml`) runs all of the above and fails on errors;
the EAS preview build is owner-triggered (`workflow_dispatch`) and needs the
`EXPO_TOKEN` secret plus the committed `eas.json`.

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
