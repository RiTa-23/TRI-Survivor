import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  coins: number;
  addCoins: (amount: number) => void;
  setCoins: (amount: number) => void;
  resetCoins: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      coins: 0,
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      setCoins: (amount) => set({ coins: amount }),
      resetCoins: () => set({ coins: 0 }),
    }),
    {
      name: 'game-storage',
    }
  )
);
