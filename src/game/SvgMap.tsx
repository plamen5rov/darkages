import { useMemo } from 'react';
import type { Faction } from '../content/scenarios';
import type { Unit, City } from '../simulation/entities';
import rawGeoJson from '../content/europe_regions.json';
import { cities } from '../game/cities';

const geoJson = rawGeoJson as unknown as GeoJSON.FeatureCollection;

export type SvgMapProps = {
  ownership: Record<string, string>;
  factions: Faction[];
  playerFactionId: string;
  currentFactionId: string;
  units: Unit[];
  cities: City[];
  selectedUnitId: number | null;
  movementOptions: string[] | null;
  onRegionClick: (regionId: string) => void;
  onUnitClick: (unitId: number) => void;
};

const VW = 1000;
const VH = 680;
const PAD = 55;

const OCEAN = '#0d121a';
const OCEAN_LIGHT = '#121a26';
const STROKE = '#c4b4a0';
const GOLD = '#c49e44';
const GOLD_LIGHT = '#dbb86a';
const GOLD_PALE = 'rgba(180,140,90,0.18)';
const INK = '#2a180d';
const LABEL_COLOR = '#e8ded0';
const UNOWNED_FILL = '#3d352b';
const MOVE_GLOW = 'rgba(80,220,100,0.22)';

type CoordRing = number[][];
type CoordPolygon = CoordRing[];
type CoordMultiPolygon = CoordPolygon[];
type Point = [number, number];

interface RegionBounds {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

function computeBounds(features: GeoJSON.Feature[]): RegionBounds {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  const walk = (coords: CoordPolygon) => {
    for (const ring of coords) {
      for (const [lon, lat] of ring) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  };

  for (const feature of features) {
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      walk(geom.coordinates as CoordPolygon);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates as unknown as CoordMultiPolygon) {
        walk(poly);
      }
    }
  }

  return { minLon, maxLon, minLat, maxLat };
}

function project(lon: number, lat: number, bounds: RegionBounds, vw: number, vh: number, pad: number): Point {
  const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (vw - pad * 2) + pad;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (vh - pad * 2) + pad;
  return [x, y];
}

function polygonToPath(coords: CoordPolygon, bounds: RegionBounds, vw: number, vh: number, pad: number): string {
  const parts: string[] = [];
  for (const ring of coords) {
    const pts = ring.map(([lon, lat]) => project(lon, lat, bounds, vw, vh, pad));
    const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ') + ' Z';
    parts.push(d);
  }
  return parts.join(' ');
}

function featurePath(feature: GeoJSON.Feature, bounds: RegionBounds, vw: number, vh: number, pad: number): string {
  const geom = feature.geometry;
  if (geom.type === 'Polygon') return polygonToPath(geom.coordinates as CoordPolygon, bounds, vw, vh, pad);
  if (geom.type === 'MultiPolygon') {
    return (geom.coordinates as unknown as CoordMultiPolygon)
      .map((poly) => polygonToPath(poly, bounds, vw, vh, pad))
      .join(' ');
  }
  return '';
}

function featureCentroid(feature: GeoJSON.Feature, bounds: RegionBounds, vw: number, vh: number, pad: number): Point {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  const walk = (coords: CoordPolygon) => {
    for (const ring of coords) {
      for (const [lon, lat] of ring) {
        const [px, py] = project(lon, lat, bounds, vw, vh, pad);
        sumX += px;
        sumY += py;
        count++;
      }
    }
  };

  const geom = feature.geometry;
  if (geom.type === 'Polygon') walk(geom.coordinates as CoordPolygon);
  else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates as unknown as CoordMultiPolygon) walk(poly);
  }

  return count > 0 ? [sumX / count, sumY / count] : [0, 0];
}

function generateRhumbLines(bounds: RegionBounds, vw: number, vh: number, pad: number) {
  const centers: Point[] = [
    [-9, 38],
    [10, 44],
    [28, 36],
    [-3, 55],
    [22, 52],
  ];

  const projected = centers.map(([lon, lat]) => project(lon, lat, bounds, vw, vh, pad));
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const maxDist = Math.sqrt(vw * vw + vh * vh) * 1.6;

  for (const [cx, cy] of projected) {
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const dx = Math.cos(angle) * maxDist;
      const dy = Math.sin(angle) * maxDist;
      lines.push({ x1: cx, y1: cy, x2: cx + dx, y2: cy + dy });
    }
  }

  return lines;
}

function generateWaveArcs(bounds: RegionBounds, vw: number, vh: number, pad: number) {
  const items: { cx: number; cy: number; r: number }[] = [];
  const centers: Point[] = [
    [-10, 44], [6, 48], [20, 50], [30, 38],
    [-4, 34], [16, 42], [28, 44], [-2, 60],
    [12, 46], [24, 48],
  ];

  for (const [lon, lat] of centers) {
    const [cx, cy] = project(lon, lat, bounds, vw, vh, pad);
    for (let s = 0; s < 3; s++) {
      items.push({ cx, cy, r: 22 + s * 18 });
    }
  }

  return items;
}

function factionColorHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export function SvgMap({
  ownership,
  factions,
  playerFactionId,
  currentFactionId,
  units,
  cities: gameCities,
  selectedUnitId,
  movementOptions,
  onRegionClick,
  onUnitClick,
}: SvgMapProps) {
  const bounds = useMemo(() => computeBounds(geoJson.features), []);

  const factionColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of factions) {
      map.set(f.id, factionColorHex(f.color));
    }
    return map;
  }, [factions]);

  const regionPaths = useMemo(() => {
    return geoJson.features.map((feature) => ({
      regionId: (feature.properties as Record<string, string> | null)?.regionId ?? '',
      name: (feature.properties as Record<string, string> | null)?.name ?? '',
      d: featurePath(feature, bounds, VW, VH, PAD),
      centroid: featureCentroid(feature, bounds, VW, VH, PAD),
    }));
  }, [bounds]);

  const rhumbLines = useMemo(() => generateRhumbLines(bounds, VW, VH, PAD), [bounds]);
  const waveArcs = useMemo(() => generateWaveArcs(bounds, VW, VH, PAD), [bounds]);

  const projectedCities = useMemo(() => {
    return cities
      .filter((c) => ownership[c.regionId] !== undefined || c.regionId === 'africa')
      .map((city) => {
        const [cx, cy] = project(city.lon, city.lat, bounds, VW, VH, PAD);
        const gameCity = gameCities.find((gc) => gc.name === city.name && gc.regionId === city.regionId);
        return { ...city, cx, cy, gameCity };
      });
  }, [bounds, ownership, gameCities]);

  const unitDisplay = useMemo(() => {
    // Group units by regionId for display
    const regionUnits = new Map<string, Unit[]>();
    for (const u of units) {
      const list = regionUnits.get(u.regionId) || [];
      list.push(u);
      regionUnits.set(u.regionId, list);
    }

    const display: { regionId: string; cx: number; cy: number; units: Unit[] }[] = [];
    for (const rp of regionPaths) {
      const list = regionUnits.get(rp.regionId);
      if (list && list.length > 0) {
        const [cx, cy] = rp.centroid;
        display.push({ regionId: rp.regionId, cx, cy, units: list });
      }
    }
    return display;
  }, [units, regionPaths]);

  const movementSet = useMemo(() => new Set(movementOptions || []), [movementOptions]);

  const selectedUnit = useMemo(() => {
    if (selectedUnitId == null) return null;
    return units.find((u) => u.id === selectedUnitId) || null;
  }, [units, selectedUnitId]);

  const ownRegionIds = useMemo(() => {
    // Regions owned by the currently active player (for UI indications)
    return new Set(
      Object.entries(ownership)
        .filter(([_, owner]) => owner === currentFactionId)
        .map(([regionId]) => regionId),
    );
  }, [ownership, currentFactionId]);

  const mapEdge = PAD - 2;
  const innerW = VW - PAD * 2 + 4;
  const innerH = VH - PAD * 2 + 4;

  const compassCX = VW - PAD - 35;
  const compassCY = PAD + 35;

  return (
    <div className="svg-map-stage">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="svg-map"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="s-region-shadow" x="-6%" y="-6%" width="112%" height="112%">
            <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.5" />
          </filter>
          <filter id="s-move-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#32cd32" floodOpacity="0.5" />
          </filter>
          <filter id="s-city-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="s-coast-glow" x="-4%" y="-4%" width="108%" height="108%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={GOLD} floodOpacity="0.12" />
          </filter>

          <pattern id="s-noise" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill="transparent" />
            <rect width="1" height="1" fill="rgba(255,255,255,0.006)" />
            <rect x="1" y="1" width="1" height="1" fill="rgba(0,0,0,0.010)" />
          </pattern>

          <pattern id="s-hatch" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="transparent" />
            <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(255,255,255,0.025)" strokeWidth="0.7" />
          </pattern>

          <radialGradient id="s-region-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.07" />
            <stop offset="100%" stopColor="black" stopOpacity="0.14" />
          </radialGradient>

          <radialGradient id="s-ocean" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={OCEAN_LIGHT} stopOpacity="0.6" />
            <stop offset="100%" stopColor={OCEAN} stopOpacity="1" />
          </radialGradient>

          <radialGradient id="s-vignette" cx="50%" cy="50%" r="65%">
            <stop offset="45%" stopColor="black" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.4" />
          </radialGradient>

          <clipPath id="s-map-clip">
            <rect x={mapEdge} y={mapEdge} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        <rect x={0} y={0} width={VW} height={VH} fill={OCEAN} />
        <rect x={0} y={0} width={VW} height={VH} fill="url(#s-ocean)" />

        <g clipPath="url(#s-map-clip)">
          {rhumbLines.map((line, i) => (
            <line
              key={`rh-${i}`}
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke={GOLD}
              strokeWidth={0.3}
              strokeOpacity={0.10}
            />
          ))}
          {waveArcs.map((w, i) => (
            <circle
              key={`wa-${i}`}
              cx={w.cx} cy={w.cy} r={w.r}
              fill="none"
              stroke={GOLD}
              strokeWidth={0.35}
              strokeOpacity={0.05}
            />
          ))}
        </g>

        <rect x={0} y={0} width={VW} height={VH} fill="url(#s-noise)" />

        <g filter="url(#s-coast-glow)">
          {regionPaths.map((r) => (
            <path
              key={`cst-${r.regionId}`}
              d={r.d}
              fill="none"
              stroke={GOLD_PALE}
              strokeWidth={4.5}
              strokeLinejoin="round"
              strokeOpacity={0.14}
              style={{ pointerEvents: 'none' }}
            />
          ))}
        </g>

        {/* Movement highlight layer */}
        {movementSet.size > 0 &&
          regionPaths
            .filter((r) => movementSet.has(r.regionId))
            .map((r) => (
              <path
                key={`mv-${r.regionId}`}
                d={r.d}
                fill={MOVE_GLOW}
                stroke="#40d040"
                strokeWidth={2}
                strokeOpacity={0.6}
                strokeLinejoin="round"
                filter="url(#s-move-glow)"
                style={{ pointerEvents: 'none' }}
              />
            ))}

        {/* Land masses */}
        {regionPaths.map((r) => {
          const ownerId = ownership[r.regionId];
          const fill = ownerId ? (factionColorMap.get(ownerId) ?? UNOWNED_FILL) : UNOWNED_FILL;
          const isOwned = ownerId !== undefined;

          return (
            <g key={r.regionId}>
              <path
                d={r.d}
                fill={fill}
                fillOpacity={isOwned ? 0.88 : 0.26}
                filter="url(#s-region-shadow)"
                className="svg-region"
                onClick={() => onRegionClick(r.regionId)}
              >
                <title>{r.name}</title>
              </path>
              <path
                d={r.d}
                fill="url(#s-region-grad)"
                fillOpacity={isOwned ? 0.3 : 0.12}
                style={{ pointerEvents: 'none' }}
              />
              {isOwned && (
                <path
                  d={r.d}
                  fill="url(#s-hatch)"
                  fillOpacity={0.18}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              <path
                d={r.d}
                fill="none"
                stroke={STROKE}
                strokeWidth={isOwned ? 1.0 : 0.8}
                strokeLinejoin="round"
                strokeOpacity={isOwned ? 0.55 : 0.25}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}

        {/* Region labels */}
        {regionPaths.map((r) => {
          const [cx, cy] = r.centroid;
          if (cx === 0 && cy === 0) return null;
          return (
            <g key={`lbl-${r.regionId}`} style={{ pointerEvents: 'none' }}>
              <text
                x={cx}
                y={cy + 0.5}
                fill="rgba(0,0,0,0.55)"
                fontFamily="'Cinzel', 'IM Fell English', Georgia, serif"
                fontSize="8.5"
                fontWeight="700"
                textAnchor="middle"
                letterSpacing="0.1em"
              >
                {r.name}
              </text>
              <text
                x={cx}
                y={cy}
                fill={LABEL_COLOR}
                fontFamily="'Cinzel', 'IM Fell English', Georgia, serif"
                fontSize="8.5"
                fontWeight="700"
                textAnchor="middle"
                letterSpacing="0.1em"
                fillOpacity={0.78}
              >
                {r.name}
              </text>
            </g>
          );
        })}

        {/* City markers */}
        {projectedCities.map((city) => {
          const isCapital = city.gameCity?.isCapital ?? false;
          const cityOwner = city.gameCity?.owner;
          const ownerColor = cityOwner ? factionColorMap.get(cityOwner) : GOLD;
          return (
            <g key={city.name} filter="url(#s-city-glow)" style={{ pointerEvents: 'none' }}>
              {isCapital ? (
                <>
                  <circle cx={city.cx} cy={city.cy} r={6} fill="none" stroke={ownerColor ?? GOLD} strokeWidth={2} strokeOpacity={0.8} />
                  <circle cx={city.cx} cy={city.cy} r={3} fill={ownerColor ?? GOLD} fillOpacity={0.6} />
                  <circle cx={city.cx} cy={city.cy} r={1.2} fill={INK} />
                  <text
                    x={city.cx}
                    y={city.cy - 8}
                    fill={LABEL_COLOR}
                    fontFamily="'Cinzel Decorative', Georgia, serif"
                    fontSize="6"
                    fontWeight="700"
                    textAnchor="middle"
                    fillOpacity={0.85}
                  >
                    ♔
                  </text>
                </>
              ) : (
                <>
                  <circle cx={city.cx} cy={city.cy} r={4.5} fill="none" stroke={GOLD} strokeWidth={1.5} strokeOpacity={0.65} />
                  <circle cx={city.cx} cy={city.cy} r={4.5} fill="none" stroke="#5a3a1a" strokeWidth={0.5} strokeOpacity={0.3} />
                  <circle cx={city.cx} cy={city.cy} r={2.2} fill="#f0ddc0" />
                  <circle cx={city.cx} cy={city.cy} r={1.0} fill={INK} />
                </>
              )}
              <text
                x={city.cx}
                y={city.cy - 10}
                fill={LABEL_COLOR}
                fontFamily="'IM Fell English', Georgia, serif"
                fontSize="7.5"
                fontStyle="italic"
                textAnchor="middle"
                fillOpacity={0.82}
              >
                {city.name}
              </text>
            </g>
          );
        })}

        {/* Unit markers */}
        {unitDisplay.map(({ regionId, cx, cy, units: regionUnits }) => {
          const offsetX = units.length > 1 ? 0 : 0;
          return regionUnits.map((unit, idx) => {
            const ucx = cx + (units.length > 1 ? (idx - (units.length - 1) / 2) * 14 : 0);
            const ucy = cy + (units.length > 1 ? 8 : 8);
            const ownerColor = factionColorMap.get(unit.owner) ?? '#888';
            const isSelected = unit.id === selectedUnitId;
            const hpRatio = unit.hp / unit.maxHp;
            const isPlayerUnit = unit.owner === playerFactionId;

            return (
              <g
                key={`unit-${unit.id}`}
                style={{ cursor: isPlayerUnit ? 'pointer' : 'default' }}
                onClick={(e) => {
                  if (isPlayerUnit) {
                    e.stopPropagation();
                    onUnitClick(unit.id);
                  }
                }}
              >
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={ucx}
                    cy={ucy}
                    r={10}
                    fill="none"
                    stroke={GOLD_LIGHT}
                    strokeWidth={2}
                    strokeDasharray="3,2"
                    strokeOpacity={0.9}
                  />
                )}
                {/* Unit shape */}
                <rect
                  x={ucx - 5}
                  y={ucy - 5}
                  width={10}
                  height={10}
                  fill={ownerColor}
                  fillOpacity={0.9}
                  stroke={INK}
                  strokeWidth={0.8}
                  rx={unit.type === 'scout' ? 5 : 1}
                />
                {/* Type indicator */}
                {unit.type === 'scout' && (
                  <text
                    x={ucx}
                    y={ucy + 3}
                    fill={INK}
                    fontSize="6"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    fillOpacity={0.6}
                  >
                    ▶
                  </text>
                )}
                {/* HP bar background */}
                <rect
                  x={ucx - 6}
                  y={ucy - 5}
                  width={12}
                  height={2}
                  fill="rgba(0,0,0,0.5)"
                  rx={0.5}
                  style={{ pointerEvents: 'none' }}
                />
                {/* HP bar fill */}
                <rect
                  x={ucx - 6}
                  y={ucy - 5}
                  width={12 * hpRatio}
                  height={2}
                  fill={hpRatio > 0.6 ? '#4a4' : hpRatio > 0.3 ? '#ca4' : '#c44'}
                  rx={0.5}
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            );
          });
        })}

        {/* Compass rose */}
        <g transform={`translate(${compassCX}, ${compassCY})`}>
          {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => {
            const isPrimary = deg % 90 === 0;
            const isSecondary = deg % 45 === 0 && !isPrimary;
            const rad = (deg * Math.PI) / 180;
            const len = isPrimary ? 24 : isSecondary ? 16 : 10;
            const sw = isPrimary ? 1.4 : isSecondary ? 0.8 : 0.4;
            const op = isPrimary ? 0.85 : isSecondary ? 0.5 : 0.25;
            return (
              <line
                key={`cr-${deg}`}
                x1={0} y1={0}
                x2={Math.cos(rad) * len}
                y2={Math.sin(rad) * len}
                stroke={isPrimary ? GOLD : '#8a7540'}
                strokeWidth={sw}
                strokeOpacity={op}
              />
            );
          })}
          <circle cx={0} cy={0} r={5} fill="none" stroke={GOLD} strokeWidth={1.3} strokeOpacity={0.6} />
          <circle cx={0} cy={0} r={2.5} fill="none" stroke={GOLD_LIGHT} strokeWidth={0.8} strokeOpacity={0.5} />
          <circle cx={0} cy={0} r={0.8} fill={GOLD_LIGHT} fillOpacity={0.4} />
          <g transform="translate(0, -26)" stroke={GOLD} strokeWidth={1.2} strokeOpacity={0.8} fill="none">
            <path d="M0,-8 L-3,0 L0,-2 L3,0 Z" fill={GOLD} fillOpacity={0.4} strokeWidth={0.6} />
          </g>
          <text x={0} y={-36} fill={GOLD}
            fontFamily="'Cinzel Decorative', Georgia, serif"
            fontSize="11" fontWeight="700"
            textAnchor="middle" letterSpacing="0.12em"
            fillOpacity={0.75}
          >
            N
          </text>
        </g>

        {/* Decorative triple border */}
        <rect x={PAD - 9} y={PAD - 9} width={VW - PAD * 2 + 18} height={VH - PAD * 2 + 18}
          fill="none" stroke={STROKE} strokeWidth={0.5} strokeOpacity={0.12} />
        <rect x={PAD - 4} y={PAD - 4} width={VW - PAD * 2 + 8} height={VH - PAD * 2 + 8}
          fill="none" stroke={STROKE} strokeWidth={1} strokeOpacity={0.22} />
        <rect x={PAD} y={PAD} width={VW - PAD * 2} height={VH - PAD * 2}
          fill="none" stroke={GOLD} strokeWidth={1.2} strokeOpacity={0.3} />

        {/* Corner ornaments */}
        {[0, 1, 2, 3].map((i) => {
          const ox = i % 2 === 0 ? PAD + 10 : VW - PAD - 10;
          const oy = i < 2 ? PAD + 10 : VH - PAD - 10;
          const sx = i % 2 === 0 ? 4 : -4;
          const sy = i < 2 ? 4 : -4;
          return (
            <g key={`crn-${i}`} stroke={GOLD} strokeWidth={0.5} strokeOpacity={0.25} fill="none">
              <line x1={ox} y1={oy} x2={ox + sx * 4} y2={oy} />
              <line x1={ox} y1={oy} x2={ox} y2={oy + sy * 4} />
              <circle cx={ox} cy={oy} r={3.5} strokeOpacity={0.15} />
              <circle cx={ox} cy={oy} r={1.2} strokeOpacity={0.3} />
            </g>
          );
        })}

        {/* Title cartouche */}
        <g transform={`translate(${VW / 2}, ${PAD + 16})`} style={{ pointerEvents: 'none' }}>
          <rect x={-110} y={-12} width={220} height={24} rx={1}
            fill="rgba(26, 18, 10, 0.55)" stroke={GOLD} strokeWidth={0.6} strokeOpacity={0.3} />
          <line x1={-98} y1={-6} x2={98} y2={-6} stroke={GOLD} strokeWidth={0.3} strokeOpacity={0.15} />
          <line x1={-98} y1={6} x2={98} y2={6} stroke={GOLD} strokeWidth={0.3} strokeOpacity={0.15} />
          <text x={0} y={4}
            fill={GOLD}
            fontFamily="'Cinzel Decorative', Georgia, serif"
            fontSize="10.5" fontWeight="700"
            textAnchor="middle" letterSpacing="0.14em"
            fillOpacity={0.75}
          >
            EUROPE
          </text>
        </g>

        {/* Vignette */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#s-vignette)" style={{ pointerEvents: 'none' }} />
      </svg>
    </div>
  );
}
