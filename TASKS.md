# Dark Ages Build Tasks

## Milestone 1: Bootstrap

- [x] Initialize Vite with TypeScript and React.
- [x] Add Phaser 3 and Zustand.
- [x] Add the initial browser shell and development commands.
- [ ] Add project directories for content, simulation, rendering, and UI.

## Milestone 2: Content Model

- [ ] Define stable IDs and TypeScript types for game entities.
- [ ] Add validation for scenario content.
- [ ] Add simple placeholder scenarios for centuries 5 through 10.

## Milestone 3: Setup Flow

- [ ] Build century selection for centuries 5-10.
- [ ] Filter kingdoms by selected century.
- [ ] Filter rulers by selected kingdom and century.
- [ ] Start a session with the selected scenario, kingdom, and ruler.

## Milestone 4: Playable Map

- [ ] Create a small code-defined Europe test map.
- [ ] Render regions, cities, units, and faction colors in Phaser.
- [ ] Add map selection and basic camera behavior.
- [ ] Show selected century, kingdom, ruler, turn, and ownership in the UI.

## Milestone 5: Core Turn Loop

- [ ] Add unit movement and legal movement validation.
- [ ] Add end-turn handling and turn progression.
- [ ] Add basic combat resolution.
- [ ] Add city capture and centralized territory-color updates.
- [ ] Add focused simulation tests for movement, combat, turns, and capture.

## Milestone 6: Real Map and Content

- [ ] Replace the test map with a simplified Europe map authored in Tiled.
- [ ] Define the mapping between Tiled data and stable game-content IDs.
- [ ] Expand simple content across centuries 5-10.
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

Complete the remaining bootstrap structure, then define the content model.
