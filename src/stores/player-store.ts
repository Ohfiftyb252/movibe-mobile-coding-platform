import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Player } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
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
  _setOvCoinAndUpdate: (amount: number) => void;
  recordLoss: () => void;
  resetLosses: () => void;
};
export const usePlayerStore = create<PlayerState>()(
  immer((set, get) => {
    const debouncedUpdate = debounce(async () => {
      const { player } = get();
      if (!player) return;
      try {
        await api<Player>(`/api/player/${player.id}`, {
          method: 'POST',
          body: JSON.stringify({ 
            ovCoin: player.ovCoin, 
            inventory: player.inventory,
            consecutiveLosses: player.consecutiveLosses,
          }),
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
      _setOvCoinAndUpdate: (amount) => {
        set((state) => {
          if (state.player) {
            state.player.ovCoin = amount;
          }
        });
        debouncedUpdate();
      },
      setOvCoin: (amount) => {
        const player = get().player;
        if (!player) return;
        if (amount <= 0) {
          toast.info("PITY PARTY!", {
            description: "You're broke. Here's a hat and 500 O.V. Coin. Try not to lose it all at once.",
            duration: 5000,
          });
          set(state => {
            if (state.player) {
              if (!state.player.inventory.hats.includes("Pity Party")) {
                state.player.inventory.hats.push("Pity Party");
              }
              state.player.ovCoin = 500;
            }
          });
          debouncedUpdate();
        } else {
          get()._setOvCoinAndUpdate(amount);
        }
      },
      recordLoss: () => {
        set(state => {
          if (state.player) {
            state.player.consecutiveLosses += 1;
          }
        });
        debouncedUpdate();
      },
      resetLosses: () => {
        set(state => {
          if (state.player && state.player.consecutiveLosses > 0) {
            state.player.consecutiveLosses = 0;
          }
        });
        debouncedUpdate();
      },
    };
  })
);