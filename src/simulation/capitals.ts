export type CapitalDef = {
  cityName: string;
  regionId: string;
  lon: number;
  lat: number;
};

export const capitalAssignments: Record<string, CapitalDef> = {
  franks: { cityName: 'Parisii', regionId: 'gallia', lon: 2.35, lat: 48.85 },
  visigoths: { cityName: 'Toletum', regionId: 'hispania', lon: -4.02, lat: 39.86 },
  ostrogoths: { cityName: 'Ravenna', regionId: 'italia', lon: 12.20, lat: 44.42 },
  byzantines: { cityName: 'Constantinopolis', regionId: 'thracia', lon: 28.95, lat: 41.01 },
  saxons: { cityName: 'Londinium', regionId: 'britannia', lon: -0.10, lat: 51.50 },
  vandals: { cityName: 'Carthago', regionId: 'africa', lon: 10.33, lat: 36.86 },
  lombards: { cityName: 'Papia', regionId: 'italia', lon: 9.15, lat: 45.18 },
  avars: { cityName: 'Sirmium', regionId: 'pannonia', lon: 19.61, lat: 44.97 },
  bulgars: { cityName: 'Serdica', regionId: 'moesia', lon: 23.32, lat: 42.70 },
  carolingians: { cityName: 'Aquisgranum', regionId: 'germania', lon: 6.08, lat: 50.77 },
  umayyads: { cityName: 'Corduba', regionId: 'hispania', lon: -4.78, lat: 37.88 },
  'west-francia': { cityName: 'Parisii', regionId: 'gallia', lon: 2.35, lat: 48.85 },
  'east-francia': { cityName: 'Aquisgranum', regionId: 'germania', lon: 6.08, lat: 50.77 },
  vikings: { cityName: 'Upsala', regionId: 'scandinavia', lon: 17.63, lat: 59.85 },
  ottonians: { cityName: 'Aquisgranum', regionId: 'germania', lon: 6.08, lat: 50.77 },
  capetians: { cityName: 'Parisii', regionId: 'gallia', lon: 2.35, lat: 48.85 },
  caliphate: { cityName: 'Corduba', regionId: 'hispania', lon: -4.78, lat: 37.88 },
  hre: { cityName: 'Aquisgranum', regionId: 'germania', lon: 6.08, lat: 50.77 },
  france: { cityName: 'Parisii', regionId: 'gallia', lon: 2.35, lat: 48.85 },
  england: { cityName: 'Londinium', regionId: 'britannia', lon: -0.10, lat: 51.50 },
  papacy: { cityName: 'Roma', regionId: 'italia', lon: 12.49, lat: 41.89 },
  kiev: { cityName: 'Kiovia', regionId: 'sarmatia', lon: 30.52, lat: 50.45 },
  castile: { cityName: 'Toletum', regionId: 'hispania', lon: -4.02, lat: 39.86 },
  aragon: { cityName: 'Barcino', regionId: 'hispania', lon: 2.18, lat: 41.38 },
  mongols: { cityName: 'Sarai', regionId: 'scythia', lon: 47.85, lat: 47.25 },
  ottomans: { cityName: 'Constantinopolis', regionId: 'thracia', lon: 28.95, lat: 41.01 },
  spain: { cityName: 'Toletum', regionId: 'hispania', lon: -4.02, lat: 39.86 },
  moscow: { cityName: 'Moscovia', regionId: 'sarmatia', lon: 37.62, lat: 55.75 },
};

export function getCapitalForFaction(factionId: string): CapitalDef | undefined {
  return capitalAssignments[factionId];
}
