# Map Technology Options

## Option 1: GeoJSON in Phaser (selected)

**Approach**: Replace hand-drawn TMX polygons with Natural Earth-style GeoJSON
feature polygons. A custom loader projects WGS84 coordinates to Phaser screen
space and feeds them to the existing graphics pipeline.

**Why first**: Zero new dependencies. The GeoJSON file is a local asset with
20 geographically accurate European region polygons. The existing ownership
coloring, city markers, and click capture continue to work unchanged.

**Tradeoffs**: No built-in zoom/pan or projection library — everything is a
simple equirectangular projection. Sufficient for a 20-region strategy map.

## Option 2: Leaflet base map + Phaser overlay

**Approach**: Use `react-leaflet` (Leaflet in React) for the cartographic base:
tiled terrain, smooth zoom/pan, proper Mercator projection, GeoJSON overlays.
Phaser runs as a transparent canvas on top for unit sprites, movement
animations, and combat effects.

**Key deps**: `leaflet`, `react-leaflet` (~40 kB gzipped combined).

**When to switch**: If the game needs free zoom/pan, minimaps, or tiled terrain
textures (rivers, mountains, forests). The Phaser-only approach struggles with
large-world camera movement; Leaflet solves this natively.

## Option 3: SVG in React

**Approach**: Source or hand-author an SVG file of historical Europe with
`<path>` elements. React renders the SVG inline and applies faction colors via
`fill` attributes controlled by CSS or state. No Phaser for the map layer.

**Key deps**: None — SVG is native to the browser.

**When to switch**: If the map should be a document-like element (accessible,
text-scalable, crisp at any resolution). Less suited for animated unit movement
or particle effects over the map surface.
