export type City = {
  name: string;
  regionId: string;
  x: number;
  y: number;
};

export const cities: City[] = [
  { name: 'Londinium', regionId: 'britannia', x: 345, y: 255 },
  { name: 'Eburacum', regionId: 'britannia', x: 320, y: 220 },
  { name: 'Parisii', regionId: 'gallia', x: 400, y: 320 },
  { name: 'Aurelianum', regionId: 'gallia', x: 380, y: 350 },
  { name: 'Burdigala', regionId: 'aquitania', x: 320, y: 420 },
  { name: 'Tolosa', regionId: 'aquitania', x: 360, y: 440 },
  { name: 'Toletum', regionId: 'hispania', x: 180, y: 580 },
  { name: 'Corduba', regionId: 'hispania', x: 140, y: 630 },
  { name: 'Barcino', regionId: 'hispania', x: 240, y: 530 },
  { name: 'Roma', regionId: 'italia', x: 500, y: 520 },
  { name: 'Mediolanum', regionId: 'italia', x: 460, y: 460 },
  { name: 'Ravenna', regionId: 'italia', x: 490, y: 490 },
  { name: 'Colonia', regionId: 'germania', x: 450, y: 260 },
  { name: 'Moguntiacum', regionId: 'germania', x: 480, y: 300 },
  { name: 'Augusta Vindel.', regionId: 'raetia', x: 440, y: 420 },
  { name: 'Carnuntum', regionId: 'pannonia', x: 580, y: 430 },
  { name: 'Sirmium', regionId: 'pannonia', x: 610, y: 480 },
  { name: 'Salona', regionId: 'illyricum', x: 540, y: 540 },
  { name: 'Singidunum', regionId: 'moesia', x: 640, y: 540 },
  { name: 'Serdica', regionId: 'moesia', x: 710, y: 570 },
  { name: 'Constantinopolis', regionId: 'thracia', x: 790, y: 600 },
  { name: 'Thessalonica', regionId: 'graecia', x: 680, y: 650 },
  { name: 'Athenae', regionId: 'graecia', x: 660, y: 710 },
  { name: 'Apulum', regionId: 'dacia', x: 750, y: 450 },
  { name: 'Carthago', regionId: 'africa', x: 360, y: 720 },
  { name: 'Caesarea', regionId: 'africa', x: 200, y: 730 },
  { name: 'Tingis', regionId: 'africa', x: 90, y: 710 },
];
