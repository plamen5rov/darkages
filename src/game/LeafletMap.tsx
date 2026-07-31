import { useMemo } from 'react';
import { MapContainer, GeoJSON, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import type { Faction } from '../content/scenarios';
import europeGeoJson from '../content/europe_regions.json';
import { cities } from '../game/cities';
import 'leaflet/dist/leaflet.css';

type LeafletMapProps = {
  ownership: Record<string, string>;
  factions: Faction[];
  playerFactionId: string;
  onCapture: (regionId: string) => void;
};

const DEFAULT_COLOR = '#8f8b82';
const MAP_CENTER: [number, number] = [48, 10];
const MAP_ZOOM = 4;
const MIN_ZOOM = 3;
const MAX_ZOOM = 7;

function factionColor(
  regionId: string,
  ownership: Record<string, string>,
  factions: Faction[],
): string {
  const factionId = ownership[regionId];
  if (!factionId) return DEFAULT_COLOR;
  const faction = factions.find((f) => f.id === factionId);
  if (!faction) return DEFAULT_COLOR;
  return `#${faction.color.toString(16).padStart(6, '0')}`;
}

export function LeafletMap({ ownership, factions, playerFactionId, onCapture }: LeafletMapProps) {
  const factionColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const regionId of Object.keys(ownership)) {
      map.set(regionId, factionColor(regionId, ownership, factions));
    }
    return map;
  }, [ownership, factions]);

  const geoJsonData = useMemo(() => {
    return europeGeoJson as GeoJSON.FeatureCollection;
  }, []);

  const regionStyle = (feature?: GeoJSON.Feature) => {
    const regionId = feature?.properties?.regionId ?? '';
    return {
      fillColor: factionColorMap.get(regionId) ?? DEFAULT_COLOR,
      weight: 2,
      opacity: 0.9,
      color: '#e9e5da',
      fillOpacity: 0.75,
    };
  };

  const onEachRegion = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const regionId = feature.properties?.regionId ?? '';
    const name = feature.properties?.name ?? regionId;
    layer.bindTooltip(name, { sticky: true, opacity: 0.9 });

    layer.on({
      click: () => {
        const currentOwner = ownership[regionId];
        if (currentOwner !== undefined && currentOwner !== playerFactionId) {
          onCapture(regionId);
        }
      },
    });
  };

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      className="leaflet-map"
      zoomControl={true}
      attributionControl={false}
      maxBounds={[[25, -20], [72, 50]]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        attribution=""
      />
      <GeoJSON
        key="regions"
        data={geoJsonData}
        style={regionStyle}
        onEachFeature={onEachRegion}
      />
      {cities
        .filter((c) => ownership[c.regionId] !== undefined || c.regionId === 'africa')
        .map((city) => (
          <CircleMarker
            key={city.name}
            center={[city.lat, city.lon]}
            radius={4}
            pathOptions={{
              color: '#2d2924',
              weight: 2,
              fillColor: '#f8f2e8',
              fillOpacity: 1,
            }}
          >
            <Tooltip permanent direction="right" offset={[6, 0]} opacity={0.85}>
              <span style={{ fontFamily: 'Georgia', fontSize: '11px', fontWeight: 'bold' }}>
                {city.name}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
