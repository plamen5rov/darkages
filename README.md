# Dark Ages

Dark Ages is a browser-based, turn-based strategy game about shaping Europe
through a selected century from 5 through 15.

## Status

The project is an early prototype. The current build includes century selection
(5-15), kingdom and historical ruler selection per century, and a
Leaflet-rendered 20-region Europe map (Natural Earth data) with
click-to-capture territory control.

## Quickstart

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. Choose a century, pick a kingdom
and ruler, then start the campaign. Click any enemy region on the map to
capture it and see the faction color change.

## Commands

```bash
npm run dev
npm run build
npm run preview
```

## Technology

- TypeScript and Vite
- React for setup and interface screens
- Leaflet and react-leaflet for geographic map rendering
- Phaser 3 available for future unit and combat rendering
- Zustand for setup and presentation state

## Roadmap

See [`TASKS.md`](./TASKS.md) for the implementation roadmap. The next milestone
is adding unit movement and the core turn loop.
