import type { Century, Faction } from './scenarios';

export type Ruler = {
  id: string;
  name: string;
  reign: string;
};

export type Kingdom = Faction & {
  rulers: Ruler[];
};

export type CenturyContent = {
  century: Century;
  kingdoms: Kingdom[];
};

export const centuryContent: CenturyContent[] = [
  {
    century: 5,
    kingdoms: [
      { id: 'franks', name: 'Franks', color: 0x8f473e, rulers: [
        { id: 'childeric-i', name: 'Childeric I', reign: '458–481' },
        { id: 'clovis-i', name: 'Clovis I', reign: '481–511' },
      ]},
      { id: 'visigoths', name: 'Visigoths', color: 0xb8794d, rulers: [
        { id: 'euric', name: 'Euric', reign: '466–484' },
        { id: 'alaric-ii', name: 'Alaric II', reign: '484–507' },
      ]},
      { id: 'ostrogoths', name: 'Ostrogoths', color: 0xb6a26a, rulers: [
        { id: 'theodoric', name: 'Theodoric the Great', reign: '493–526' },
      ]},
      { id: 'byzantines', name: 'Eastern Romans', color: 0x344e5c, rulers: [
        { id: 'zeno', name: 'Zeno', reign: '474–491' },
        { id: 'anastasius-i', name: 'Anastasius I', reign: '491–518' },
      ]},
      { id: 'saxons', name: 'Anglo-Saxons', color: 0x607a68, rulers: [
        { id: 'hengist', name: 'Hengist of Kent', reign: 'c.455–488' },
        { id: 'aelle', name: 'Aelle of Sussex', reign: 'c.477–514' },
      ]},
      { id: 'vandals', name: 'Vandals', color: 0x9b6b58, rulers: [
        { id: 'gaiseric', name: 'Gaiseric', reign: '428–477' },
        { id: 'huneric', name: 'Huneric', reign: '477–484' },
      ]},
    ],
  },
  {
    century: 6,
    kingdoms: [
      { id: 'franks', name: 'Frankish kingdoms', color: 0x8f473e, rulers: [
        { id: 'clovis-i-6', name: 'Clovis I', reign: '481–511' },
        { id: 'childebert-i', name: 'Childebert I', reign: '511–558' },
        { id: 'chlothar-i', name: 'Chlothar I', reign: '558–561' },
      ]},
      { id: 'byzantines', name: 'Eastern Romans', color: 0x344e5c, rulers: [
        { id: 'justinian-i', name: 'Justinian I', reign: '527–565' },
        { id: 'justin-ii', name: 'Justin II', reign: '565–578' },
        { id: 'maurice', name: 'Maurice', reign: '582–602' },
      ]},
      { id: 'visigoths', name: 'Visigoths', color: 0xb8794d, rulers: [
        { id: 'amalaric', name: 'Amalaric', reign: '526–531' },
        { id: 'leovigild', name: 'Leovigild', reign: '568–586' },
      ]},
      { id: 'saxons', name: 'Anglo-Saxons', color: 0x607a68, rulers: [
        { id: 'ceawlin', name: 'Ceawlin of Wessex', reign: '560–592' },
        { id: 'aethelberht', name: 'Aethelberht of Kent', reign: '589–616' },
      ]},
      { id: 'lombards', name: 'Lombards', color: 0xb6a26a, rulers: [
        { id: 'alboin', name: 'Alboin', reign: '568–572' },
      ]},
      { id: 'avars', name: 'Avars & Slavs', color: 0x7d8c60, rulers: [
        { id: 'bayan-i', name: 'Bayan I', reign: 'c.562–602' },
      ]},
    ],
  },
  {
    century: 7,
    kingdoms: [
      { id: 'franks', name: 'Frankish kingdoms', color: 0x8f473e, rulers: [
        { id: 'chlothar-ii', name: 'Chlothar II', reign: '613–629' },
        { id: 'dagobert-i', name: 'Dagobert I', reign: '629–639' },
      ]},
      { id: 'byzantines', name: 'Eastern Romans', color: 0x344e5c, rulers: [
        { id: 'heraclius', name: 'Heraclius', reign: '610–641' },
        { id: 'constans-ii', name: 'Constans II', reign: '641–668' },
      ]},
      { id: 'visigoths', name: 'Visigoths', color: 0xb8794d, rulers: [
        { id: 'sisebut', name: 'Sisebut', reign: '612–621' },
        { id: 'recceswinth', name: 'Recceswinth', reign: '649–672' },
      ]},
      { id: 'saxons', name: 'Anglo-Saxons', color: 0x607a68, rulers: [
        { id: 'edwin', name: 'Edwin of Northumbria', reign: '616–633' },
        { id: 'oswald', name: 'Oswald of Northumbria', reign: '634–642' },
      ]},
      { id: 'lombards', name: 'Lombard kingdom', color: 0xb6a26a, rulers: [
        { id: 'rothari', name: 'Rothari', reign: '636–652' },
        { id: 'grimoald', name: 'Grimoald', reign: '662–671' },
      ]},
      { id: 'bulgars', name: 'Bulgar khanate', color: 0x9b6b58, rulers: [
        { id: 'kubrat', name: 'Kubrat', reign: '632–665' },
      ]},
    ],
  },
  {
    century: 8,
    kingdoms: [
      { id: 'carolingians', name: 'Carolingians', color: 0x8f473e, rulers: [
        { id: 'charles-martel', name: 'Charles Martel', reign: '718–741' },
        { id: 'pepin', name: 'Pepin the Short', reign: '751–768' },
        { id: 'charlemagne', name: 'Charlemagne', reign: '768–814' },
      ]},
      { id: 'byzantines', name: 'Eastern Romans', color: 0x344e5c, rulers: [
        { id: 'leo-iii', name: 'Leo III the Isaurian', reign: '717–741' },
        { id: 'constantine-v', name: 'Constantine V', reign: '741–775' },
        { id: 'irene', name: 'Irene of Athens', reign: '797–802' },
      ]},
      { id: 'umayyads', name: 'Umayyad Spain', color: 0x7d8c60, rulers: [
        { id: 'abd-al-rahman-i', name: 'Abd al-Rahman I', reign: '756–788' },
      ]},
      { id: 'saxons', name: 'Anglo-Saxons', color: 0x607a68, rulers: [
        { id: 'offa', name: 'Offa of Mercia', reign: '757–796' },
      ]},
      { id: 'lombards', name: 'Lombard kingdom', color: 0xb6a26a, rulers: [
        { id: 'liutprand', name: 'Liutprand', reign: '712–744' },
        { id: 'desiderius', name: 'Desiderius', reign: '756–774' },
      ]},
      { id: 'bulgars', name: 'Bulgar khanate', color: 0xb8794d, rulers: [
        { id: 'tervel', name: 'Tervel', reign: '701–721' },
        { id: 'krum', name: 'Krum', reign: '803–814' },
      ]},
    ],
  },
  {
    century: 9,
    kingdoms: [
      { id: 'west-francia', name: 'West Francia', color: 0x8f473e, rulers: [
        { id: 'charles-bald', name: 'Charles the Bald', reign: '843–877' },
      ]},
      { id: 'east-francia', name: 'East Francia', color: 0x607a68, rulers: [
        { id: 'louis-german', name: 'Louis the German', reign: '843–876' },
      ]},
      { id: 'byzantines', name: 'Eastern Romans', color: 0x344e5c, rulers: [
        { id: 'basil-i', name: 'Basil I the Macedonian', reign: '867–886' },
      ]},
      { id: 'umayyads', name: 'Umayyad Spain', color: 0x7d8c60, rulers: [
        { id: 'abd-al-rahman-ii', name: 'Abd al-Rahman II', reign: '822–852' },
      ]},
      { id: 'bulgars', name: 'Bulgar empire', color: 0xb8794d, rulers: [
        { id: 'boris-i', name: 'Boris I', reign: '852–889' },
        { id: 'simeon-i', name: 'Simeon I the Great', reign: '893–927' },
      ]},
      { id: 'vikings', name: 'Norse realms', color: 0xb6a26a, rulers: [
        { id: 'ragnar', name: 'Ragnar Lodbrok', reign: 'legendary 9th c.' },
        { id: 'harald-fairhair', name: 'Harald Fairhair', reign: 'c.872–930' },
      ]},
    ],
  },
  {
    century: 10,
    kingdoms: [
      { id: 'ottonians', name: 'Ottonian realm', color: 0x607a68, rulers: [
        { id: 'otto-i', name: 'Otto I the Great', reign: '936–973' },
        { id: 'otto-ii', name: 'Otto II', reign: '973–983' },
      ]},
      { id: 'capetians', name: 'West Francia', color: 0x8f473e, rulers: [
        { id: 'hugh-capet', name: 'Hugh Capet', reign: '987–996' },
      ]},
      { id: 'byzantines', name: 'Eastern Romans', color: 0x344e5c, rulers: [
        { id: 'basil-ii', name: 'Basil II the Bulgar-Slayer', reign: '976–1025' },
      ]},
      { id: 'caliphate', name: 'Caliphate of Cordoba', color: 0x7d8c60, rulers: [
        { id: 'abd-al-rahman-iii', name: 'Abd al-Rahman III', reign: '912–961' },
        { id: 'al-hakam-ii', name: 'Al-Hakam II', reign: '961–976' },
      ]},
      { id: 'bulgars', name: 'Bulgar empire', color: 0xb8794d, rulers: [
        { id: 'simeon-i-10', name: 'Simeon I the Great', reign: '893–927' },
        { id: 'samuel', name: 'Samuel', reign: '997–1014' },
      ]},
      { id: 'vikings', name: 'Norse realms', color: 0xb6a26a, rulers: [
        { id: 'harald-bluetooth', name: 'Harald Bluetooth', reign: '958–986' },
        { id: 'sweyn-forkbeard', name: 'Sweyn Forkbeard', reign: '986–1014' },
      ]},
    ],
  },
  {
    century: 11,
    kingdoms: [
      { id: 'hre', name: 'Holy Roman Empire', color: 0x607a68, rulers: [
        { id: 'henry-iii', name: 'Henry III', reign: '1046–1056' },
        { id: 'henry-iv', name: 'Henry IV', reign: '1084–1105' },
      ]},
      { id: 'france', name: 'Kingdom of France', color: 0x8f473e, rulers: [
        { id: 'robert-ii', name: 'Robert II the Pious', reign: '996–1031' },
        { id: 'philip-i', name: 'Philip I', reign: '1060–1108' },
      ]},
      { id: 'byzantines', name: 'Eastern Romans', color: 0x344e5c, rulers: [
        { id: 'basil-ii-11', name: 'Basil II', reign: '976–1025' },
        { id: 'alexios-i', name: 'Alexios I Komnenos', reign: '1081–1118' },
      ]},
      { id: 'england', name: 'Norman England', color: 0xb8794d, rulers: [
        { id: 'william-i', name: 'William the Conqueror', reign: '1066–1087' },
        { id: 'henry-i', name: 'Henry I', reign: '1100–1135' },
      ]},
      { id: 'papacy', name: 'Papal States', color: 0xb6a26a, rulers: [
        { id: 'gregory-vii', name: 'Gregory VII', reign: '1073–1085' },
        { id: 'urban-ii', name: 'Urban II', reign: '1088–1099' },
      ]},
      { id: 'kiev', name: 'Kievan Rus', color: 0x9b6b58, rulers: [
        { id: 'yaroslav', name: 'Yaroslav the Wise', reign: '1019–1054' },
      ]},
    ],
  },
  {
    century: 12,
    kingdoms: [
      { id: 'hre', name: 'Holy Roman Empire', color: 0x607a68, rulers: [
        { id: 'frederick-i', name: 'Frederick I Barbarossa', reign: '1155–1190' },
      ]},
      { id: 'france', name: 'Kingdom of France', color: 0x8f473e, rulers: [
        { id: 'louis-vii', name: 'Louis VII', reign: '1137–1180' },
        { id: 'philip-ii', name: 'Philip II Augustus', reign: '1180–1223' },
      ]},
      { id: 'byzantines', name: 'Eastern Romans', color: 0x344e5c, rulers: [
        { id: 'manuel-i', name: 'Manuel I Komnenos', reign: '1143–1180' },
      ]},
      { id: 'england', name: 'Angevin Empire', color: 0xb8794d, rulers: [
        { id: 'henry-ii', name: 'Henry II', reign: '1154–1189' },
        { id: 'richard-i', name: 'Richard I Lionheart', reign: '1189–1199' },
      ]},
      { id: 'papacy', name: 'Papal States', color: 0xb6a26a, rulers: [
        { id: 'innocent-iii', name: 'Innocent III', reign: '1198–1216' },
      ]},
      { id: 'castile', name: 'Kingdom of Castile', color: 0x9b6b58, rulers: [
        { id: 'alfonso-viii', name: 'Alfonso VIII', reign: '1158–1214' },
      ]},
    ],
  },
  {
    century: 13,
    kingdoms: [
      { id: 'hre', name: 'Holy Roman Empire', color: 0x607a68, rulers: [
        { id: 'frederick-ii', name: 'Frederick II', reign: '1220–1250' },
      ]},
      { id: 'france', name: 'Kingdom of France', color: 0x8f473e, rulers: [
        { id: 'louis-ix', name: 'Louis IX the Saint', reign: '1226–1270' },
        { id: 'philip-iv', name: 'Philip IV the Fair', reign: '1285–1314' },
      ]},
      { id: 'mongols', name: 'Mongol Empire', color: 0x344e5c, rulers: [
        { id: 'genghis-khan', name: 'Genghis Khan', reign: '1206–1227' },
      ]},
      { id: 'england', name: 'Kingdom of England', color: 0xb8794d, rulers: [
        { id: 'john', name: 'John Lackland', reign: '1199–1216' },
        { id: 'edward-i', name: 'Edward I Longshanks', reign: '1272–1307' },
      ]},
      { id: 'aragon', name: 'Crown of Aragon', color: 0xb6a26a, rulers: [
        { id: 'james-i', name: 'James I the Conqueror', reign: '1213–1276' },
      ]},
      { id: 'castile', name: 'Kingdom of Castile', color: 0x9b6b58, rulers: [
        { id: 'ferdinand-iii', name: 'Ferdinand III', reign: '1217–1252' },
        { id: 'alfonso-x', name: 'Alfonso X the Wise', reign: '1252–1284' },
      ]},
    ],
  },
  {
    century: 14,
    kingdoms: [
      { id: 'hre', name: 'Holy Roman Empire', color: 0x607a68, rulers: [
        { id: 'charles-iv', name: 'Charles IV', reign: '1355–1378' },
      ]},
      { id: 'france', name: 'Kingdom of France', color: 0x8f473e, rulers: [
        { id: 'philip-vi', name: 'Philip VI', reign: '1328–1350' },
        { id: 'charles-v', name: 'Charles V the Wise', reign: '1364–1380' },
      ]},
      { id: 'ottomans', name: 'Ottoman Empire', color: 0x344e5c, rulers: [
        { id: 'osman-i', name: 'Osman I', reign: '1299–1326' },
        { id: 'murad-i', name: 'Murad I', reign: '1362–1389' },
      ]},
      { id: 'england', name: 'Kingdom of England', color: 0xb8794d, rulers: [
        { id: 'edward-iii', name: 'Edward III', reign: '1327–1377' },
        { id: 'richard-ii', name: 'Richard II', reign: '1377–1399' },
      ]},
      { id: 'papacy', name: 'Papal States', color: 0xb6a26a, rulers: [
        { id: 'clement-vi', name: 'Clement VI', reign: '1342–1352' },
      ]},
      { id: 'castile', name: 'Kingdom of Castile', color: 0x9b6b58, rulers: [
        { id: 'alfonso-xi', name: 'Alfonso XI', reign: '1312–1350' },
      ]},
    ],
  },
  {
    century: 15,
    kingdoms: [
      { id: 'hre', name: 'Holy Roman Empire', color: 0x607a68, rulers: [
        { id: 'frederick-iii', name: 'Frederick III', reign: '1452–1493' },
        { id: 'maximilian-i', name: 'Maximilian I', reign: '1493–1519' },
      ]},
      { id: 'france', name: 'Kingdom of France', color: 0x8f473e, rulers: [
        { id: 'charles-vii', name: 'Charles VII', reign: '1422–1461' },
        { id: 'louis-xi', name: 'Louis XI the Prudent', reign: '1461–1483' },
      ]},
      { id: 'ottomans', name: 'Ottoman Empire', color: 0x344e5c, rulers: [
        { id: 'mehmed-ii', name: 'Mehmed II the Conqueror', reign: '1451–1481' },
        { id: 'bayezid-ii', name: 'Bayezid II', reign: '1481–1512' },
      ]},
      { id: 'england', name: 'Kingdom of England', color: 0xb8794d, rulers: [
        { id: 'henry-v', name: 'Henry V', reign: '1413–1422' },
        { id: 'edward-iv', name: 'Edward IV', reign: '1461–1483' },
        { id: 'henry-vii', name: 'Henry VII Tudor', reign: '1485–1509' },
      ]},
      { id: 'spain', name: 'Crown of Spain', color: 0xb6a26a, rulers: [
        { id: 'isabella-i', name: 'Isabella I of Castile', reign: '1474–1504' },
        { id: 'ferdinand-ii', name: 'Ferdinand II of Aragon', reign: '1479–1516' },
      ]},
      { id: 'moscow', name: 'Grand Duchy of Moscow', color: 0x9b6b58, rulers: [
        { id: 'ivan-iii', name: 'Ivan III the Great', reign: '1462–1505' },
      ]},
    ],
  },
];

export function getKingdoms(century: Century): Kingdom[] {
  return centuryContent.find((c) => c.century === century)?.kingdoms ?? [];
}

export function getKingdom(century: Century, kingdomId: string): Kingdom | undefined {
  return getKingdoms(century).find((k) => k.id === kingdomId);
}
