import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Player } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
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
const DEFAULT_PLAYER_STATE: Omit<Player, 'id' | 'name'> = {
  ovCoin: 0,
  inventory: { hats: [] },
  consecutiveLosses: 0,
  debt: 0,
  heat: 0,
  luck: 50,
  corruption: 0,
};
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
  addHeat: (amount: number) => void;
  adjustLuck: (amount: number) => void;
  increaseCorruption: (amount: number) => void;
  addDebt: (amount: number) => void;
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
            debt: player.debt,
            heat: player.heat,
            luck: player.luck,
            corruption: player.corruption,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }, 1000);
    return {
      player: null,
      isLoading: true,
      error: null,
      loadPlayer: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const rawPlayer = await api<Player>(`/api/player/${id}`);
          const mergedPlayer: Player = {
            ...DEFAULT_PLAYER_STATE,
            ...rawPlayer,
            inventory: {
              ...DEFAULT_PLAYER_STATE.inventory,
              ...(rawPlayer.inventory || {}),
            }
          };
          set({ player: mergedPlayer, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      updatePlayer: async (id, updates) => {
        set((state) => {
          if (state.player) {
            Object.assign(state.player, updates);
          }
        });
        try {
          await api<Player>(`/api/player/${id}`, {
            method: 'POST',
            body: JSON.stringify(updates)
          });
        } catch (error) {
          console.error(error);
        }
      },
      _setOvCoinAndUpdate: (amount) => {
        set((state) => { if (state.player) state.player.ovCoin = amount; });
        debouncedUpdate();
      },
      setOvCoin: (amount) => {
        const player = get().player;
        if (!player) return;
        if (amount < 0) {
            toast.error("SYSTEM DEFICIT", {
                description: "You've gone past zero. The Vultures are calculating your organ market value.",
                duration: 5000,
            });
            set(state => {
                if (state.player) {
                    state.player.debt += Math.abs(amount);
                    state.player.ovCoin = 0;
                }
            });
            debouncedUpdate();
        } else if (amount === 0 && player.ovCoin > 0) {
          toast.info("PITY PARTY!", {
            description: "You're broke. Here's a hat and 500 O.V. Coin. That's more debt for you.",
            duration: 5000,
          });
          set(state => {
            if (state.player) {
              if (!state.player.inventory.hats.includes("Pity Party")) {
                state.player.inventory.hats.push("Pity Party");
              }
              state.player.ovCoin = 500;
              state.player.debt += 500;
            }
          });
          debouncedUpdate();
        } else {
          get()._setOvCoinAndUpdate(amount);
        }
      },
      recordLoss: () => {
        set(state => { if (state.player) state.player.consecutiveLosses += 1; });
        debouncedUpdate();
      },
      resetLosses: () => {
        set(state => { if (state.player) state.player.consecutiveLosses = 0; });
        debouncedUpdate();
      },
      addHeat: (amount) => {
        set(state => { if (state.player) state.player.heat = Math.max(0, (state.player.heat ?? 0) + amount); });
        debouncedUpdate();
      },
      adjustLuck: (amount) => {
        set(state => { 
          if (state.player) {
            const currentLuck = state.player.luck ?? 50;
            state.player.luck = Math.min(100, Math.max(0, currentLuck + amount));
          }
        });
        debouncedUpdate();
      },
      increaseCorruption: (amount) => {
        set(state => { if (state.player) state.player.corruption = Math.min(100, (state.player.corruption ?? 0) + amount); });
        debouncedUpdate();
      },
      addDebt: (amount) => {
        set(state => { if (state.player) state.player.debt = (state.player.debt ?? 0) + amount; });
        debouncedUpdate();
      },
    };
  })
);