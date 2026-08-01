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

- [2026-07-31] Replace hand-drawn map polygons with a GeoJSON-authored Europe
  map using real WGS84 geographic coordinates and equirectangular projection.
  Document the three map technology options in MAP_OPTIONS.md.
  Files modified: `AGENTS.md`, `src/game/GameCanvas.tsx`,
  `src/game/cities.ts`, `src/vite-env.d.ts`.
  Files added: `src/content/europe.geojson`, `src/game/geojsonLoader.ts`,
  `MAP_OPTIONS.md`.

- [2026-07-31] Switch map rendering to Leaflet via react-leaflet with proper
  Mercator projection, CartoDB tile layer, and SVG polygon rendering from
  Natural Earth 50m geographic data (20 regions, 1,942 vertices).
  Files modified: `AGENTS.md`, `package.json`, `package-lock.json`,
  `src/App.tsx`, `src/styles.css`.
  Files added: `src/game/LeafletMap.tsx`,
  `src/content/europe_regions.json`.
  Files removed: `src/content/europe.geojson`.

- [2026-08-01] Replace Leaflet map with an inline SVG map rendering GeoJSON
  regions directly via equirectangular projection. Dark medieval manuscript
  aesthetic with rhumb lines, compass rose, coastal glow, drop shadows,
  decorative borders, and noise texture.
  Files modified: `src/App.tsx`, `src/styles.css`.
  Files added: `src/game/SvgMap.tsx`.

- [2026-08-01] Complete visual overhaul: dark vellum manuscript theme with
  Cinzel Decorative, Uncial Antiqua, and IM Fell English fonts (downloaded
  locally). Portolan-chart style map with 5-point rhumb network, compass rose,
  title cartouche, gold triple border, wave ornaments, and vignette. Removed
  Phaser, Leaflet, and all dead code; bundle now contains only React, Zustand,
  and inline SVG rendering. Heraldic card styling, wax-seal buttons, gold-accent
  typography throughout.
  Files modified: `index.html`, `src/styles.css`, `src/App.tsx`,
  `src/game/SvgMap.tsx`, `package.json`.
  Files added: `public/fonts/*.ttf`, `public/assets/compass-rose.svg`.
  Files removed: `src/game/GameCanvas.tsx`, `src/game/LeafletMap.tsx`,
  `src/game/geojsonLoader.ts`, `src/game/mapLoader.ts`,
  `src/game/mapRenderer.ts`.

- [2026-08-01] Add turn-based strategy engine with units, combat, capital
  capture, and region resource system. Replace click-to-capture prototype with
  full Civ-III-style gameplay: units (army/scout) move through an adjacency
  graph of 20 European regions, combat uses randomized attack/defense rolls,
  capturing an enemy capital absorbs their entire kingdom. Turn phases cycle
  through production (food growth, unit building), player movement, AI movement
  (simple heuristic), and cleanup. Historical capitals mapped per faction per
  century (Parisii for Franks, Constantinopolis for Byzantines, Toletum for
  Visigoths, etc.) with crown markers. Region resources (food/production/luxury)
  assigned from medieval historical sources. HUD panel shows turn, phase, unit
  selection, city list, faction stats, and battle log. Victory when all other
  factions' capitals are captured. Fixed RulerSelect "Start with" button to
  actually select the ruler.
  Files modified: `src/App.tsx`, `src/game/SvgMap.tsx`, `src/game/cities.ts`,
  `src/setup/RulerSelect.tsx`, `src/styles.css`, `.gitignore`.
  Files added: `src/game/HUD.tsx`, `src/simulation/adjacency.ts`,
  `src/simulation/capitals.ts`, `src/simulation/engine.ts`,
  `src/simulation/entities.ts`, `src/simulation/resources.ts`,
  `src/store/gameState.ts`.

- [2026-08-01] Increase HUD font sizes 30-50% (10-13px → 13-18px) for
  readability and widen panel to 300px. Add "How to play" toggle in the
  HUD sidebar with a collapsible rules panel explaining goal, turns,
  movement, combat, capture, units, and cities. Polish map-note with
  gold left-border accent and larger text.
  Files modified: `src/game/HUD.tsx`, `src/styles.css`, `src/App.tsx`.
