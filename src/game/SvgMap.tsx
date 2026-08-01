import { useMemo, useCallback, useState } from 'react';
import type { Faction } from '../content/scenarios';
import rawGeoJson from '../content/europe_regions.json';
import { cities } from '../game/cities';

const geoJson = rawGeoJson as unknown as GeoJSON.FeatureCollection;

type SvgMapProps = {
  ownership: Record<string, string>;
  factions: Faction[];
  playerFactionId: string;
  onCapture: (regionId: string) => void;
};

/* ── constants ── */

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

/* ── types ── */

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

/* ── geo helpers ── */

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

/* ── decorative generators ── */

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

/* ── component ── */

export function SvgMap({ ownership, factions, playerFactionId, onCapture }: SvgMapProps) {
  const bounds = useMemo(() => computeBounds(geoJson.features), []);

  const factionColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of factions) {
      map.set(f.id, `#${f.color.toString(16).padStart(6, '0')}`);
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

  const handleRegionClick = useCallback(
    (regionId: string) => {
      const currentOwner = ownership[regionId];
      if (currentOwner !== undefined && currentOwner !== playerFactionId) {
        onCapture(regionId);
      }
    },
    [ownership, playerFactionId, onCapture],
  );

  const projectedCities = useMemo(() => {
    return cities
      .filter((c) => ownership[c.regionId] !== undefined || c.regionId === 'africa')
      .map((city) => {
        const [cx, cy] = project(city.lon, city.lat, bounds, VW, VH, PAD);
        return { ...city, cx, cy };
      });
  }, [bounds, ownership]);

  const ownedRegions = useMemo(() => new Set(Object.keys(ownership)), [ownership]);
  const [hovered, setHovered] = useState<string | null>(null);

  const mapEdge = PAD - 2;
  const innerW = VW - PAD * 2 + 4;
  const innerH = VH - PAD * 2 + 4;

  /* ── compass rose data ── */
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
        {/* ── defs ── */}
        <defs>
          <filter id="s-region-shadow" x="-6%" y="-6%" width="112%" height="112%">
            <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.5" />
          </filter>
          <filter id="s-hover-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="3" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.65" />
          </filter>
          <filter id="s-coast-glow" x="-4%" y="-4%" width="108%" height="108%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={GOLD} floodOpacity="0.12" />
          </filter>
          <filter id="s-city-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
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

        {/* ═══ OCEAN LAYER ═══ */}
        <rect x={0} y={0} width={VW} height={VH} fill={OCEAN} />
        <rect x={0} y={0} width={VW} height={VH} fill="url(#s-ocean)" />

        {/* rhumb line network */}
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

          {/* wave arcs (sea decoration) */}
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

        {/* noise */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#s-noise)" />

        {/* ═══ COASTAL GLOW (behind land) ═══ */}
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

        {/* ═══ LAND MASSES ═══ */}
        {regionPaths.map((r) => {
          const ownerId = ownership[r.regionId];
          const fill = ownerId ? (factionColorMap.get(ownerId) ?? UNOWNED_FILL) : UNOWNED_FILL;
          const isHovered = hovered === r.regionId;
          const isOwned = ownedRegions.has(r.regionId);

          return (
            <g key={r.regionId}>
              {/* main fill */}
              <path
                d={r.d}
                fill={fill}
                fillOpacity={isHovered ? 1 : (isOwned ? 0.88 : 0.26)}
                filter={isHovered ? 'url(#s-hover-shadow)' : 'url(#s-region-shadow)'}
                className="svg-region"
                onMouseEnter={() => setHovered(r.regionId)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleRegionClick(r.regionId)}
              >
                <title>{r.name}</title>
              </path>
              {/* radial light overlay */}
              <path
                d={r.d}
                fill="url(#s-region-grad)"
                fillOpacity={isOwned ? 0.3 : 0.12}
                style={{ pointerEvents: 'none' }}
              />
              {/* hatch pattern for owned */}
              {isOwned && (
                <path
                  d={r.d}
                  fill="url(#s-hatch)"
                  fillOpacity={0.18}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {/* stroke */}
              <path
                d={r.d}
                fill="none"
                stroke={STROKE}
                strokeWidth={isHovered ? 1.8 : 1.0}
                strokeLinejoin="round"
                strokeOpacity={isHovered ? 0.9 : (isOwned ? 0.55 : 0.25)}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}

        {/* ═══ REGION LABELS ═══ */}
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

        {/* ═══ CITY MARKERS ═══ */}
        {projectedCities.map((city) => (
          <g key={city.name} filter="url(#s-city-glow)" style={{ pointerEvents: 'none' }}>
            <circle cx={city.cx} cy={city.cy} r={4.5} fill="none" stroke={GOLD} strokeWidth={1.5} strokeOpacity={0.65} />
            <circle cx={city.cx} cy={city.cy} r={4.5} fill="none" stroke="#5a3a1a" strokeWidth={0.5} strokeOpacity={0.3} />
            <circle cx={city.cx} cy={city.cy} r={2.2} fill="#f0ddc0" />
            <circle cx={city.cx} cy={city.cy} r={1.0} fill="#1a120a" />
            <text
              x={city.cx}
              y={city.cy - 9}
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
        ))}

        {/* ═══ COMPASS ROSE ═══ */}
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
          {/* north fleur */}
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

        {/* ═══ DECORATIVE TRIPLE BORDER ═══ */}
        <rect x={PAD - 9} y={PAD - 9} width={VW - PAD * 2 + 18} height={VH - PAD * 2 + 18}
          fill="none" stroke={STROKE} strokeWidth={0.5} strokeOpacity={0.12} />
        <rect x={PAD - 4} y={PAD - 4} width={VW - PAD * 2 + 8} height={VH - PAD * 2 + 8}
          fill="none" stroke={STROKE} strokeWidth={1} strokeOpacity={0.22} />
        <rect x={PAD} y={PAD} width={VW - PAD * 2} height={VH - PAD * 2}
          fill="none" stroke={GOLD} strokeWidth={1.2} strokeOpacity={0.3} />

        {/* ═══ CORNER ORNAMENTS ═══ */}
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

        {/* ═══ TITLE CARTOUCHE ═══ */}
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

        {/* ═══ VIGNETTE ═══ */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#s-vignette)" style={{ pointerEvents: 'none' }} />
      </svg>
    </div>
  );
}
