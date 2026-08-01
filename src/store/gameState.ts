import { create } from 'zustand';
import type { EngineState, UnitType } from '../simulation/entities';
import type { ResourceType } from '../simulation/resources';
import type { CapitalDef } from '../simulation/capitals';
import {
  createEngineState,
  selectUnit,
  deselectUnit,
  moveUnit,
  advancePhase,
  setCityBuild,
  checkVictory,
} from '../simulation/engine';

export type GameStateStore = {
  engineState: EngineState | null;

  initGame: (
    factionOrder: string[],
    ownership: Record<string, string>,
    playerFaction: string,
    resources: Record<string, ResourceType[]>,
    capitals: Record<string, CapitalDef>,
    adjacency: Record<string, string[]>,
  ) => void;

  handleSelectUnit: (unitId: number) => void;
  handleDeselectUnit: () => void;
  handleMoveUnit: (targetRegionId: string) => void;
  handleAdvancePhase: () => void;
  handleSetBuild: (cityId: number, buildItem: UnitType | null) => void;

  victory: boolean;
};

export const useGameState = create<GameStateStore>((set, get) => ({
  engineState: null,
  victory: false,

  initGame: (factionOrder, ownership, playerFaction, resources, capitals, adjacency) => {
    const state = createEngineState(
      factionOrder,
      ownership,
      playerFaction,
      resources,
      capitals,
      adjacency,
    );
    set({ engineState: state, victory: false });
  },

  handleSelectUnit: (unitId: number) => {
    const { engineState } = get();
    if (!engineState) return;
    set({ engineState: selectUnit(engineState, unitId) });
  },

  handleDeselectUnit: () => {
    const { engineState } = get();
    if (!engineState) return;
    set({ engineState: deselectUnit(engineState) });
  },

  handleMoveUnit: (targetRegionId: string) => {
    const { engineState } = get();
    if (!engineState) return;
    const next = moveUnit(engineState, targetRegionId);
    set({
      engineState: next,
      victory: checkVictory(next, next.playerFaction),
    });
  },

  handleAdvancePhase: () => {
    const { engineState } = get();
    if (!engineState) return;
    const next = advancePhase(engineState);
    set({
      engineState: next,
      victory: checkVictory(next, next.playerFaction),
    });
  },

  handleSetBuild: (cityId: number, buildItem: UnitType | null) => {
    const { engineState } = get();
    if (!engineState) return;
    set({ engineState: setCityBuild(engineState, cityId, buildItem) });
  },
}));
