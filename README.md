# Dark Ages

Dark Ages is a browser-based, turn-based strategy game about shaping Europe
through a selected century from 5 through 10.

## Status

The project is an early prototype. The current build includes a century
selection screen and a Phaser-rendered prototype map.

## Quickstart

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, choose a century, and continue
to the prototype map.

## Commands

```bash
npm run dev
npm run build
npm run preview
```

## Technology

- TypeScript and Vite
- React for setup and interface screens
- Phaser 3 for the map and game rendering
- Zustand for setup and presentation state

## Roadmap

See [`TASKS.md`](./TASKS.md) for the implementation roadmap. The next milestone
is the data model for centuries, kingdoms, rulers, regions, cities, factions,
and units.
