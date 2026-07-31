# Dark Ages

## Current State

- This repository is being built from an empty project shell.
- The product is a browser-based, turn-based strategy game set in Europe.
- The player selects a century from 5 through 10.
- Historical content is simple and historically inspired.

## Technology

- Use TypeScript, React, Phaser 3, and Zustand.
- Use Vite for the development and production build shell.
- Use plain TypeScript modules for deterministic simulation rules.
- Phaser renders the simulation and handles map input.
- React handles setup screens, HUD, menus, and interface overlays.
- Add Tiled only when replacing the prototype map with the real Europe map.
- Add EasyStar only when movement needs map pathfinding.
- Add Dexie/IndexedDB only after the core turn loop works.
- Add Howler only after gameplay is stable.

## Architecture

- Keep simulation rules independent of React, Phaser, and Zustand.
- Keep UI state separate from simulation state.
- Zustand owns setup and presentation state, not game-rule mutations.
- Keep content in data modules with stable IDs for game entities.
- Centralize territory ownership and faction-color changes.
- Prefer explicit code over ECS or broad abstractions until needed.

## Product Scope

- Setup selects a century from 5-10, then a kingdom and ruler.
- The first playable slice needs one simplified map, two factions, units,
  movement, turns, combat, capture, and visible ownership changes.
- Start with a code-defined test map; introduce Tiled for Europe later.
- Defer persistence, advanced AI, research, diplomacy, multiplayer, modding,
  deep events, and detailed historical accuracy until the core loop is stable.

## Working Rules

- Prefer data-driven content and deterministic rules.
- Make the smallest useful change and avoid broad refactors.
- Add focused simulation tests when changing rules.
- Verify the setup-to-turn flow in the browser.
- Do not copy Civilization's exact UI, assets, names, or text.
- Update this file when the toolchain, architecture, or milestone scope changes.

## Commands

- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript checks and the production build.
- There are no test or lint scripts yet.
