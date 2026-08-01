export type ResourceType = 'food' | 'production' | 'luxury';

export const defaultRegionResources: Record<string, ResourceType[]> = {
  africa: ['food', 'luxury'],
  aquitania: ['food', 'production'],
  britannia: ['food', 'luxury'],
  caledonia: ['production'],
  dacia: ['production'],
  gallia: ['food', 'production'],
  germania: ['production', 'food'],
  graecia: ['luxury', 'food'],
  hibernia: ['food'],
  hispania: ['production', 'luxury'],
  illyricum: ['production'],
  italia: ['food', 'production'],
  moesia: ['food'],
  pannonia: ['production'],
  raetia: ['production'],
  sarmatia: ['food'],
  scandinavia: ['luxury', 'food'],
  scythia: ['luxury'],
  sicilia: ['food'],
  thracia: ['luxury', 'food'],
};
