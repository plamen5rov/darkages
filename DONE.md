# Changelog

- [2026-07-31] Bootstrap the Vite React Phaser Zustand shell, add the initial
  century-selection and map prototype, and document the build roadmap.
  Files modified: `.gitignore`, `AGENTS.md`, `TASKS.md`, `index.html`,
  `package.json`, `package-lock.json`, `src/App.tsx`,
  `src/game/GameCanvas.tsx`, `src/main.tsx`, `src/styles.css`,
  `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`,
  `vite.config.ts`.

- [2026-07-31] Add the three base game features: century selection (5-15),
  kingdom and ruler selection with historical data, and territory capture
  with faction-color updates. Replace the prototype map with a 20-region
  Tiled-authored Europe map rendered in Phaser.
  Files modified: `AGENTS.md`, `TASKS.md`, `src/App.tsx`,
  `src/game/GameCanvas.tsx`, `src/styles.css`.
  Files added: `src/content/scenarios.ts`, `src/content/map.tmx`,
  `src/content/kingdoms.ts`, `src/game/mapLoader.ts`,
  `src/game/mapRenderer.ts`, `src/game/cities.ts`,
  `src/setup/KingdomSelect.tsx`, `src/setup/RulerSelect.tsx`,
  `src/store/gameSetup.ts`, `src/simulation/turnState.ts`,
  `src/vite-env.d.ts`.
