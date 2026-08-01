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

const VW = 1000;
const VH = 650;
const PAD = 55;

const OCEAN = '#1a1510';
const OCEAN_LIGHT = '#231d16';
const STROKE = '#c4b4a0';
const GOLD = '#c49a4a';
const GOLD_LIGHT = '#dbb86a';
const GOLD_PALE = 'rgba(180,140,90,0.25)';
const INK = '#e0d5c4';
const LABEL_COLOR = '#e8ded0';
const UNOWNED_FILL = '#3d352b';

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

function polygonToPath(
  coordinates: CoordPolygon,
  bounds: RegionBounds,
  vw: number,
  vh: number,
  pad: number,
): string {
  const parts: string[] = [];
  for (const ring of coordinates) {
    const pts = ring.map(([lon, lat]) => project(lon, lat, bounds, vw, vh, pad));
    const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ') + ' Z';
    parts.push(d);
  }
  return parts.join(' ');
}

function featureCoordsToPath(
  feature: GeoJSON.Feature,
  bounds: RegionBounds,
  vw: number,
  vh: number,
  pad: number,
): string {
  const geom = feature.geometry;
  if (geom.type === 'Polygon') {
    return polygonToPath(geom.coordinates as CoordPolygon, bounds, vw, vh, pad);
  }
  if (geom.type === 'MultiPolygon') {
    return (geom.coordinates as unknown as CoordMultiPolygon)
      .map((poly) => polygonToPath(poly, bounds, vw, vh, pad))
      .join(' ');
  }
  return '';
}

function featureCentroid(
  feature: GeoJSON.Feature,
  bounds: RegionBounds,
  vw: number,
  vh: number,
  pad: number,
): Point {
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
  if (geom.type === 'Polygon') {
    walk(geom.coordinates as CoordPolygon);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates as unknown as CoordMultiPolygon) {
      walk(poly);
    }
  }

  return count > 0 ? [sumX / count, sumY / count] : [0, 0];
}

function generateRhumbLines(bounds: RegionBounds, vw: number, vh: number, pad: number): { x1: number; y1: number; x2: number; y2: number }[] {
  const centers: Point[] = [
    [-8, 36],
    [10, 42],
    [28, 34],
    [-4, 54],
    [20, 50],
  ];

  const projected = centers.map(([lon, lat]) => project(lon, lat, bounds, vw, vh, pad));
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  const maxDist = Math.sqrt(vw * vw + vh * vh) * 1.5;

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

function generateSeaDecor(bounds: RegionBounds, vw: number, vh: number, pad: number) {
  const items: { cx: number; cy: number; r: number }[] = [];
  const oceanCenters: Point[] = [
    [-12, 45],
    [8, 48],
    [20, 52],
    [28, 38],
    [-6, 35],
    [14, 44],
    [30, 42],
    [-4, 60],
  ];

  for (const [lon, lat] of oceanCenters) {
    const [cx, cy] = project(lon, lat, bounds, vw, vh, pad);
    items.push({ cx, cy, r: 20 + Math.random() * 15 });
    items.push({ cx: cx + 30, cy: cy + 15, r: 12 + Math.random() * 10 });
  }

  return items;
}

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
      d: featureCoordsToPath(feature, bounds, VW, VH, PAD),
      centroid: featureCentroid(feature, bounds, VW, VH, PAD),
    }));
  }, [bounds]);

  const rhumbLines = useMemo(() => generateRhumbLines(bounds, VW, VH, PAD), [bounds]);
  const seaCircles = useMemo(() => generateSeaDecor(bounds, VW, VH, PAD), [bounds]);

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

  return (
    <div className="svg-map-stage">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="svg-map"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="region-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
          </filter>
          <filter id="region-hover-shadow" x="-8%" y="-8%" width="116%" height="116%">
            <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <filter id="coast-glow" x="-3%" y="-3%" width="106%" height="106%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={GOLD} floodOpacity="0.15" />
          </filter>
          <filter id="city-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="noise" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill="transparent" />
            <rect width="1" height="1" fill="rgba(255,255,255,0.008)" />
            <rect x="1" y="1" width="1" height="1" fill="rgba(0,0,0,0.012)" />
          </pattern>
          <pattern id="hatch" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="transparent" />
            <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
          </pattern>
          <radialGradient id="region-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="black" stopOpacity="0.12" />
          </radialGradient>
          <clipPath id="map-clip">
            <rect x={mapEdge} y={mapEdge} width={innerW} height={innerH} />
          </clipPath>
          <radialGradient id="ocean-radial" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={OCEAN_LIGHT} stopOpacity="0.5" />
            <stop offset="100%" stopColor={OCEAN} stopOpacity="1" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={VW} height={VH} fill={OCEAN} />
        <rect x={0} y={0} width={VW} height={VH} fill="url(#ocean-radial)" />

        {/* Rhumb lines */}
        <g clipPath="url(#map-clip)">
          {rhumbLines.map((line, i) => (
            <line
              key={`rhumb-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={GOLD}
              strokeWidth={0.3}
              strokeOpacity={0.09}
            />
          ))}

          {/* Decorative sea circles */}
          {seaCircles.map((c, i) => (
            <circle
              key={`sea-${i}`}
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill="none"
              stroke={GOLD}
              strokeWidth={0.4}
              strokeOpacity={0.06}
            />
          ))}
        </g>

        {/* Noise and texture */}
        <rect x={0} y={0} width={VW} height={VH} fill="url(#noise)" />

        {/* Coastal hachure bands (behind regions) */}
        <g filter="url(#coast-glow)">
          {regionPaths.map((r) => (
            <path
              key={`coast-${r.regionId}`}
              d={r.d}
              fill="none"
              stroke={GOLD_PALE}
              strokeWidth={5}
              strokeLinejoin="round"
              strokeOpacity={0.15}
              style={{ pointerEvents: 'none' }}
            />
          ))}
        </g>

        {/* Region land masses */}
        {regionPaths.map((r) => {
          const ownerId = ownership[r.regionId];
          const fill = ownerId ? (factionColorMap.get(ownerId) ?? UNOWNED_FILL) : UNOWNED_FILL;
          const isHovered = hovered === r.regionId;
          const isOwned = ownedRegions.has(r.regionId);

          return (
            <g key={r.regionId}>
              <path
                d={r.d}
                fill={fill}
                fillOpacity={isHovered ? 1 : (isOwned ? 0.88 : 0.28)}
                filter={isHovered ? 'url(#region-hover-shadow)' : 'url(#region-shadow)'}
                className="svg-region"
                onMouseEnter={() => setHovered(r.regionId)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleRegionClick(r.regionId)}
              >
                <title>{r.name}</title>
              </path>
              <path
                d={r.d}
                fill="url(#region-grad)"
                fillOpacity={isOwned ? 0.3 : 0.15}
                style={{ pointerEvents: 'none' }}
              />
              {isOwned && (
                <path
                  d={r.d}
                  fill="url(#hatch)"
                  fillOpacity={0.2}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              <path
                d={r.d}
                fill="none"
                stroke={STROKE}
                strokeWidth={isHovered ? 1.8 : 1.0}
                strokeLinejoin="round"
                strokeOpacity={isHovered ? 0.9 : (isOwned ? 0.55 : 0.3)}
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
            <g key={`label-${r.regionId}`} style={{ pointerEvents: 'none' }}>
              <text
                x={cx}
                y={cy + 0.5}
                fill="rgba(0,0,0,0.5)"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="8.5"
                fontWeight="bold"
                textAnchor="middle"
                letterSpacing="0.1em"
              >
                {r.name}
              </text>
              <text
                x={cx}
                y={cy}
                fill={LABEL_COLOR}
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="8.5"
                fontWeight="bold"
                textAnchor="middle"
                letterSpacing="0.1em"
                fillOpacity={0.75}
              >
                {r.name}
              </text>
            </g>
          );
        })}

        {/* Cities */}
        {projectedCities.map((city) => (
          <g key={city.name} filter="url(#city-glow)" style={{ pointerEvents: 'none' }}>
            <circle cx={city.cx} cy={city.cy} r={4} fill="none" stroke={GOLD} strokeWidth={1.5} strokeOpacity={0.7} />
            <circle cx={city.cx} cy={city.cy} r={1.8} fill={INK} />
            <text
              x={city.cx}
              y={city.cy - 8}
              fill={LABEL_COLOR}
              fontFamily="Georgia, serif"
              fontSize="7.5"
              textAnchor="middle"
              fillOpacity={0.85}
            >
              {city.name}
            </text>
          </g>
        ))}

        {/* Compass rose */}
        <g transform={`translate(${VW - PAD - 30}, ${PAD + 30})`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const long = i % 2 === 0;
            const rad = (deg * Math.PI) / 180;
            const len = long ? 22 : 14;
            const x2 = Math.cos(rad) * len;
            const y2 = Math.sin(rad) * len;
            return (
              <line
                key={`cpt-${deg}`}
                x1={0}
                y1={0}
                x2={x2}
                y2={y2}
                stroke={long ? GOLD : '#8a7540'}
                strokeWidth={long ? 1.5 : 0.8}
                strokeOpacity={long ? 0.85 : 0.5}
              />
            );
          })}
          <circle cx={0} cy={0} r={3.5} fill="none" stroke={GOLD} strokeWidth={1.2} strokeOpacity={0.7} />
          <circle cx={0} cy={0} r={1.5} fill={GOLD_LIGHT} fillOpacity={0.6} />
          <text
            x={0}
            y={-27}
            fill={GOLD}
            fontFamily="Georgia, serif"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            letterSpacing="0.12em"
            fillOpacity={0.8}
          >
            N
          </text>
        </g>

        {/* Decorative triple border */}
        <rect
          x={PAD - 8}
          y={PAD - 8}
          width={VW - PAD * 2 + 16}
          height={VH - PAD * 2 + 16}
          fill="none"
          stroke={STROKE}
          strokeWidth={0.6}
          strokeOpacity={0.15}
        />
        <rect
          x={PAD - 3}
          y={PAD - 3}
          width={VW - PAD * 2 + 6}
          height={VH - PAD * 2 + 6}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          strokeOpacity={0.25}
        />
        <rect
          x={PAD}
          y={PAD}
          width={VW - PAD * 2}
          height={VH - PAD * 2}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.2}
          strokeOpacity={0.35}
        />

        {/* Corner ornaments */}
        {[0, 1, 2, 3].map((i) => {
          const ox = i % 2 === 0 ? PAD + 8 : VW - PAD - 8;
          const oy = i < 2 ? PAD + 8 : VH - PAD - 8;
          const sx = i % 2 === 0 ? 4 : -4;
          const sy = i < 2 ? 4 : -4;
          return (
            <g key={`corner-${i}`} stroke={GOLD} strokeWidth={0.6} strokeOpacity={0.3} fill="none">
              <line x1={ox} y1={oy} x2={ox + sx * 3} y2={oy} />
              <line x1={ox} y1={oy} x2={ox} y2={oy + sy * 3} />
              <circle cx={ox} cy={oy} r={2.5} strokeOpacity={0.2} />
            </g>
          );
        })}

        {/* Vignette overlay */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
          <stop offset="55%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.35" />
        </radialGradient>
        <rect x={0} y={0} width={VW} height={VH} fill="url(#vignette)" style={{ pointerEvents: 'none' }} />
      </svg>
    </div>
  );
}
