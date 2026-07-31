export type City = {
  name: string;
  regionId: string;
  lon: number;
  lat: number;
};

export const cities: City[] = [
  { name: 'Londinium', regionId: 'britannia', lon: -0.10, lat: 51.50 },
  { name: 'Eburacum', regionId: 'caledonia', lon: -1.10, lat: 53.90 },
  { name: 'Parisii', regionId: 'gallia', lon: 2.35, lat: 48.85 },
  { name: 'Aurelianum', regionId: 'gallia', lon: 1.90, lat: 47.90 },
  { name: 'Burdigala', regionId: 'aquitania', lon: -0.58, lat: 44.84 },
  { name: 'Tolosa', regionId: 'aquitania', lon: 1.44, lat: 43.60 },
  { name: 'Toletum', regionId: 'hispania', lon: -4.02, lat: 39.86 },
  { name: 'Corduba', regionId: 'hispania', lon: -4.78, lat: 37.88 },
  { name: 'Barcino', regionId: 'hispania', lon: 2.18, lat: 41.38 },
  { name: 'Roma', regionId: 'italia', lon: 12.49, lat: 41.89 },
  { name: 'Mediolanum', regionId: 'italia', lon: 9.19, lat: 45.46 },
  { name: 'Ravenna', regionId: 'italia', lon: 12.20, lat: 44.42 },
  { name: 'Colonia', regionId: 'germania', lon: 6.96, lat: 50.94 },
  { name: 'Moguntiacum', regionId: 'germania', lon: 8.27, lat: 50.00 },
  { name: 'Augusta Vindel.', regionId: 'raetia', lon: 10.90, lat: 48.37 },
  { name: 'Carnuntum', regionId: 'pannonia', lon: 16.86, lat: 48.11 },
  { name: 'Sirmium', regionId: 'pannonia', lon: 19.61, lat: 44.97 },
  { name: 'Salona', regionId: 'illyricum', lon: 16.44, lat: 43.51 },
  { name: 'Singidunum', regionId: 'moesia', lon: 20.46, lat: 44.81 },
  { name: 'Serdica', regionId: 'moesia', lon: 23.32, lat: 42.70 },
  { name: 'Constantinopolis', regionId: 'thracia', lon: 28.95, lat: 41.01 },
  { name: 'Thessalonica', regionId: 'graecia', lon: 22.94, lat: 40.64 },
  { name: 'Athenae', regionId: 'graecia', lon: 23.73, lat: 37.98 },
  { name: 'Apulum', regionId: 'dacia', lon: 23.57, lat: 46.07 },
  { name: 'Carthago', regionId: 'africa', lon: 10.33, lat: 36.86 },
  { name: 'Caesarea', regionId: 'africa', lon: 2.22, lat: 36.59 },
  { name: 'Tingis', regionId: 'africa', lon: -5.80, lat: 35.77 },
];
