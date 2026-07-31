import { create } from 'zustand';
import type { Century } from '../content/scenarios';
import type { Kingdom, Ruler } from '../content/kingdoms';

export type SetupStep = 'century' | 'kingdom' | 'ruler' | 'playing';

export type GameSetupState = {
  step: SetupStep;
  century: Century;
  kingdom: Kingdom | null;
  ruler: Ruler | null;
  setCentury: (century: Century) => void;
  continueToKingdoms: () => void;
  selectKingdom: (kingdom: Kingdom) => void;
  selectRuler: (ruler: Ruler) => void;
  startGame: () => void;
  newCampaign: () => void;
  goBack: () => void;
};

export const useGameSetup = create<GameSetupState>((set) => ({
  step: 'century',
  century: 5,
  kingdom: null,
  ruler: null,
  setCentury: (century) => set({ century, kingdom: null, ruler: null }),
  continueToKingdoms: () => set({ step: 'kingdom' }),
  selectKingdom: (kingdom) => set({ kingdom, ruler: null, step: 'ruler' }),
  selectRuler: (ruler) => set({ ruler, step: 'playing' }),
  startGame: () => set({ step: 'playing' }),
  newCampaign: () => set({ step: 'kingdom', kingdom: null, ruler: null }),
  goBack: () => set((state) => {
    if (state.step === 'ruler') return { step: 'kingdom', ruler: null };
    if (state.step === 'kingdom') return { step: 'century', kingdom: null, ruler: null };
    return {};
  }),
}));
