import rawGeoJson from '../content/europe_regions.json';

const geoJson = rawGeoJson as unknown as GeoJSON.FeatureCollection;
const regionIds = geoJson.features
  .map((f) => (f.properties as Record<string, string> | null)?.regionId ?? '')
  .filter(Boolean);

function getRegionIds(): string[] {
  return regionIds;
}

const ADJACENCY: Record<string, string[]> = {
  britannia: ['caledonia', 'gallia', 'germania'],
  caledonia: ['britannia', 'hibernia'],
  hibernia: ['caledonia'],
  scandinavia: ['sarmatia', 'germania'],
  sarmatia: ['scandinavia', 'germania', 'dacia', 'scythia'],
  scythia: ['sarmatia', 'dacia', 'moesia', 'thracia'],
  germania: ['gallia', 'raetia', 'italia', 'scandinavia', 'sarmatia', 'britannia'],
  gallia: ['britannia', 'germania', 'raetia', 'italia', 'aquitania', 'hispania'],
  aquitania: ['gallia', 'hispania'],
  hispania: ['aquitania', 'gallia', 'africa'],
  raetia: ['germania', 'gallia', 'italia', 'pannonia'],
  italia: ['gallia', 'raetia', 'germania', 'pannonia', 'illyricum', 'sicilia'],
  sicilia: ['italia', 'africa'],
  pannonia: ['raetia', 'italia', 'illyricum', 'moesia', 'dacia'],
  illyricum: ['italia', 'pannonia', 'moesia', 'graecia'],
  moesia: ['pannonia', 'illyricum', 'dacia', 'scythia', 'graecia', 'thracia'],
  dacia: ['sarmatia', 'pannonia', 'moesia', 'scythia'],
  graecia: ['illyricum', 'moesia', 'thracia'],
  thracia: ['graecia', 'moesia', 'scythia'],
  africa: ['hispania', 'sicilia'],
};

export function getAdjacency(): Record<string, string[]> {
  return ADJACENCY;
}
