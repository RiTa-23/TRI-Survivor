import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  coins: number;
  selectedWeapon: 'sword' | 'gun';
  addCoins: (amount: number) => void;
  setCoins: (amount: number) => void;
  resetCoins: () => void;
  setSelectedWeapon: (weapon: 'sword' | 'gun') => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      coins: 0,
      selectedWeapon: 'sword',
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      setCoins: (amount) => set({ coins: amount }),
      resetCoins: () => set({ coins: 0 }),
      setSelectedWeapon: (weapon) => set({ selectedWeapon: weapon }),
    }),
    {
      name: 'game-storage',
    }
  )
);
