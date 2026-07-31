export type GameState = {
  ownership: Record<string, string>;
  turn: number;
  currentFaction: string;
  playerFaction: string;
};

export function createGameState(
  initialOwnership: Record<string, string>,
  playerFaction: string,
): GameState {
  return {
    ownership: { ...initialOwnership },
    turn: 1,
    currentFaction: playerFaction,
    playerFaction,
  };
}

export function captureRegion(
  state: GameState,
  regionId: string,
  capturerFaction: string,
): GameState {
  return {
    ...state,
    ownership: {
      ...state.ownership,
      [regionId]: capturerFaction,
    },
  };
}

export function endTurn(state: GameState, factions: string[]): GameState {
  const currentIndex = factions.indexOf(state.currentFaction);
  const nextIndex = (currentIndex + 1) % factions.length;
  return {
    ...state,
    turn: currentIndex === factions.length - 1 ? state.turn + 1 : state.turn,
    currentFaction: factions[nextIndex],
  };
}
