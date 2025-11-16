import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Player } from '@shared/types';
import { api } from '@/lib/api-client';
// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
type PlayerState = {
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  loadPlayer: (id: string) => Promise<void>;
  updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
  setOvCoin: (amount: number) => void;
};
export const usePlayerStore = create<PlayerState>()(
  immer((set, get) => {
    const debouncedUpdate = debounce(async () => {
      const { player } = get();
      if (!player) return;
      try {
        await api<Player>(`/api/player/${player.id}`, {
          method: 'POST',
          body: JSON.stringify({ ovCoin: player.ovCoin, inventory: player.inventory }),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to sync player data';
        set({ error: errorMessage });
        console.error(errorMessage);
      }
    }, 1000);
    return {
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
        const originalPlayerState = get().player;
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
          set({ error: errorMessage, player: originalPlayerState }); // Revert on failure
          console.error(errorMessage);
        }
      },
      setOvCoin: (amount) => {
        set((state) => {
          if (state.player) {
            state.player.ovCoin = amount;
          }
        });
        debouncedUpdate();
      },
    };
  })
);