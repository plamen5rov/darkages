import type { ResourceType } from './resources';
import type { CapitalDef } from './capitals';

export type UnitType = 'army' | 'scout';

export type Unit = {
  id: number;
  type: UnitType;
  regionId: string;
  owner: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  movesLeft: number;
  maxMoves: number;
};

export type City = {
  id: number;
  regionId: string;
  name: string;
  owner: string;
  isCapital: boolean;
  population: number;
  foodStock: number;
  productionStock: number;
  buildItem: UnitType | null;
  buildProgress: number;
};

export type Phase =
  | 'setup'
  | 'production'
  | 'player_move'
  | 'ai_move'
  | 'cleanup';

export type EngineState = Readonly<{
  ownership: Record<string, string>;
  units: Unit[];
  cities: City[];
  adjacency: Record<string, string[]>;
  resources: Record<string, ResourceType[]>;
  capitals: Record<string, CapitalDef>;
  factionOrder: string[];
  turn: number;
  phase: Phase;
  currentFaction: string;
  playerFaction: string;
  selectedUnitId: number | null;
  showMovement: string[] | null;
  log: string[];
}>;

export const UNIT_STATS: Record<UnitType, { maxHp: number; attack: number; defense: number; maxMoves: number }> = {
  army: { maxHp: 10, attack: 6, defense: 4, maxMoves: 2 },
  scout: { maxHp: 6, attack: 3, defense: 2, maxMoves: 3 },
};

export const CITY_BUILD_COST: Record<UnitType, number> = {
  army: 8,
  scout: 4,
};

export const POP_GROWTH_THRESHOLD = 6;
export const FOOD_PER_POP = 2;
