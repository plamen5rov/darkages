export type RegionPolygon = {
  id: string;
  name: string;
  points: { x: number; y: number }[];
};

type GeoJsonFeature = {
  type: 'Feature';
  id: string;
  properties: {
    name: string;
    regionId: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
};

type GeoJsonCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

const MAP_BOUNDS = {
  west: -10,
  east: 40,
  south: 30,
  north: 65,
};

function projectLon(lon: number, screenWidth: number): number {
  return ((lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * screenWidth;
}

function projectLat(lat: number, screenHeight: number): number {
  return ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * screenHeight;
}

export function loadRegionsFromGeoJson(
  geoJson: string,
  screenWidth: number,
  screenHeight: number,
): RegionPolygon[] {
  const data: GeoJsonCollection = JSON.parse(geoJson);

  return data.features.map((feature) => {
    const ring = feature.geometry.coordinates[0];
    const points = ring.map(([lon, lat]) => ({
      x: Math.round(projectLon(lon, screenWidth)),
      y: Math.round(projectLat(lat, screenHeight)),
    }));

    return {
      id: feature.properties.regionId,
      name: feature.properties.name,
      points,
    };
  });
}
