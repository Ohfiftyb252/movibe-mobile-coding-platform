import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Player } from '@shared/types';
import { api } from '@/lib/api-client';
type PlayerState = {
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  loadPlayer: (id: string) => Promise<void>;
  updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
  setOvCoin: (amount: number) => void;
};
export const usePlayerStore = create<PlayerState>()(
  immer((set) => ({
    player: null,
    isLoading: true,
    error: null,
    loadPlayer: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const player = await api<Player>(`/api/player/${id}`);
        set({ player, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load player data';
        set({ error: errorMessage, isLoading: false });
        console.error(errorMessage);
      }
    },
    updatePlayer: async (id, updates) => {
      set((state) => {
        if (state.player) {
          Object.assign(state.player, updates);
        }
      });
      try {
        const updatedPlayer = await api<Player>(`/api/player/${id}`, {
          method: 'POST',
          body: JSON.stringify(updates),
        });
        set({ player: updatedPlayer });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update player data';
        set({ error: errorMessage });
        console.error(errorMessage);
        // Optionally revert state on failure
        // For now, we optimistically update
      }
    },
    setOvCoin: (amount) => {
        set((state) => {
            if (state.player) {
                state.player.ovCoin = amount;
            }
        });
    }
  }))
);