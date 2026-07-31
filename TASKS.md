# Dark Ages Build Tasks

## Milestone 1: Bootstrap

- [x] Initialize Vite with TypeScript and React.
- [x] Add Phaser 3 and Zustand.
- [x] Add the initial browser shell and development commands.
- [x] Add project directories for content, simulation, rendering, and UI.

## Milestone 2: Content Model

- [x] Define stable IDs and TypeScript types for game entities.
- [ ] Add validation for scenario content.
- [x] Add simple placeholder scenarios for centuries 5 through 15.
- [x] Add kingdom and historical ruler data per century.

## Milestone 3: Setup Flow

- [x] Build century selection for centuries 5-15.
- [x] Filter kingdoms by selected century.
- [x] Filter rulers by selected kingdom and century.
- [x] Start a session with the selected scenario, kingdom, and ruler.

## Milestone 4: Playable Map

- [x] Create a small code-defined Europe test map.
- [x] Render regions, cities, and faction colors in Phaser.
- [x] Replace with a Tiled-authored Europe map with 20 historical regions.
- [x] Source and review historical regional boundaries for centuries 5-15.
- [x] Define the mapping between Tiled object-layer data and game-content IDs.
- [x] Show selected century, kingdom, ruler, and ownership in the UI.
- [ ] Add map selection and basic camera behavior.

## Milestone 5: Core Turn Loop

- [ ] Add unit movement and legal movement validation.
- [ ] Add end-turn handling and turn progression.
- [ ] Add basic combat resolution.
- [x] Add city capture and centralized territory-color updates.
- [ ] Add focused simulation tests for movement, combat, turns, and capture.

## Milestone 6: Real Map and Content

- [x] Replace the test map with a simplified Europe map authored in Tiled.
- [x] Source and review historical regional boundaries for each century.
- [x] Define the mapping between Tiled data and stable game-content IDs.
- [x] Expand simple content across centuries 5-15.
- [ ] Validate that every scenario has playable starting data.

## Milestone 7: Opponents and Persistence

- [ ] Add deterministic basic opponent behavior.
- [ ] Add versioned save/load using IndexedDB and Dexie.
- [ ] Add new-game and resume flows.

## Milestone 8: Polish

- [ ] Improve setup, map, combat, and capture feedback.
- [ ] Verify desktop and mobile layouts.
- [ ] Add audio with Howler if it improves the experience.
- [ ] Verify the complete setup-to-turn flow in the browser.

## Current Focus

Complete map interaction (camera, zoom) and unit movement on the map.
