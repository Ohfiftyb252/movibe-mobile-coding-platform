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
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
interface PlayerWithMeta extends Player {
  lastLoginAt: number;
  loginStreak: number;
  title: string;
  lastBonusClaimedAt: number;
  lastNearMissAt: number;
  totalRegrets: number;
}
const DEFAULT_PLAYER_STATE: Omit<PlayerWithMeta, 'id' | 'name'> = {
  ovCoin: 0,
  inventory: { hats: [] },
  consecutiveLosses: 0,
  debt: 0,
  heat: 0,
  luck: 50,
  corruption: 0,
  spinsSinceBigWin: 99,
  lastLoginAt: 0,
  loginStreak: 0,
  title: 'Fresh Meat',
  lastBonusClaimedAt: 0,
  lastNearMissAt: 0,
  totalRegrets: 0,
};
type PlayerState = {
  player: PlayerWithMeta | null;
  isLoading: boolean;
  error: string | null;
  loadPlayer: (id: string) => Promise<void>;
  updatePlayer: (id: string, updates: Partial<PlayerWithMeta>) => Promise<void>;
  setOvCoin: (amount: number) => void;
  recordLoss: () => void;
  resetLosses: () => void;
  addHeat: (amount: number) => void;
  adjustLuck: (amount: number) => void;
  increaseCorruption: (amount: number) => void;
  addDebt: (amount: number) => void;
  incrementSpinsSinceBigWin: () => void;
  resetSpinsSinceBigWin: () => void;
  smashTerminal: () => void;
  checkDailyStatus: () => void;
  claimDailyBonus: () => void;
  recordRegret: () => void;
  getLatestAchievement: () => string;
};
export const usePlayerStore = create<PlayerState>()(
  immer((set, get) => {
    const calculateTitle = (p: PlayerWithMeta): string => {
      if (p.totalRegrets > 20) return 'Main Character of the Feed';
      if (p.debt > 50000) return 'Financial Black Hole';
      if (p.corruption > 80) return 'Glitch Architect';
      if (p.debt > 10000) return 'Debt Addict';
      if (p.luck > 80) return 'Lucky Fool';
      if (p.totalRegrets > 10) return 'Statistic in Waiting';
      if (p.consecutiveLosses > 10) return 'The House’s Favorite';
      return p.title || 'Fresh Meat';
    };
    const debouncedUpdate = debounce(async () => {
      const { player } = get();
      if (!player) return;
      try {
        await api(`/api/player/${player.id}`, {
          method: 'POST',
          body: JSON.stringify(player),
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
          const rawPlayer = await api<any>(`/api/player/${id}`);
          const merged: PlayerWithMeta = {
            ...DEFAULT_PLAYER_STATE,
            ...rawPlayer,
          };
          set({ player: merged, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      updatePlayer: async (id, updates) => {
        set((state) => {
          if (state.player) {
            Object.assign(state.player, updates);
            state.player.title = calculateTitle(state.player);
          }
        });
        debouncedUpdate();
      },
      setOvCoin: (amount) => {
        set((state) => {
          if (!state.player) return;
          if (amount < 0) {
            state.player.debt += Math.abs(amount);
            state.player.ovCoin = 0;
            toast.error("SYSTEM DEFICIT", { description: "Debt accrued. Organ value recalculated." });
          } else if (amount === 0 && state.player.ovCoin > 0) {
            state.player.ovCoin = 500;
            state.player.debt += 500;
            if (!state.player.inventory.hats.includes("Pity Party")) state.player.inventory.hats.push("Pity Party");
            toast.info("PITY PARTY", { description: "You're broke. Here's 500 OVC (on credit)." });
          } else {
            state.player.ovCoin = amount;
          }
          state.player.title = calculateTitle(state.player);
        });
        debouncedUpdate();
      },
      recordLoss: () => {
        set((state) => {
          if (state.player) {
            state.player.consecutiveLosses += 1;
            state.player.title = calculateTitle(state.player);
          }
        });
        debouncedUpdate();
      },
      resetLosses: () => {
        set((state) => { if (state.player) state.player.consecutiveLosses = 0; });
        debouncedUpdate();
      },
      addHeat: (amount) => {
        set((state) => { if (state.player) state.player.heat = Math.max(0, state.player.heat + amount); });
        debouncedUpdate();
      },
      adjustLuck: (amount) => {
        set((state) => {
          if (state.player) {
            state.player.luck = Math.min(100, Math.max(0, state.player.luck + amount));
            state.player.title = calculateTitle(state.player);
          }
        });
        debouncedUpdate();
      },
      increaseCorruption: (amount) => {
        set((state) => {
          if (state.player) {
            state.player.corruption = Math.min(100, state.player.corruption + amount);
            state.player.title = calculateTitle(state.player);
          }
        });
        debouncedUpdate();
      },
      addDebt: (amount) => {
        set((state) => { if (state.player) state.player.debt += amount; });
        debouncedUpdate();
      },
      incrementSpinsSinceBigWin: () => {
        set((state) => { if (state.player) state.player.spinsSinceBigWin = (state.player.spinsSinceBigWin ?? 0) + 1; });
        debouncedUpdate();
      },
      resetSpinsSinceBigWin: () => {
        set((state) => { if (state.player) state.player.spinsSinceBigWin = 0; });
        debouncedUpdate();
      },
      smashTerminal: () => {
        const reward = Math.floor(Math.random() * 41) + 10;
        set((state) => {
          if (state.player) {
            if (Math.random() < 0.1) {
              state.player.ovCoin = 0;
              state.player.heat += 50;
              toast.error("SECURITY LOCKOUT", { description: "Biometrics wiped. Fees deducted." });
            } else {
              state.player.ovCoin += reward;
              state.player.heat += 15;
              toast.success("CATHARSIS", { description: `You kicked the machine. +${reward} OVC.` });
            }
          }
        });
        debouncedUpdate();
      },
      checkDailyStatus: () => {
        const p = get().player;
        if (!p) return;
        const now = Date.now();
        const last = p.lastLoginAt || 0;
        const diffHours = (now - last) / (1000 * 60 * 60);
        if (diffHours >= 24 && diffHours < 48) {
          set(s => { if (s.player) s.player.loginStreak += 1; });
        } else if (diffHours >= 48) {
          set(s => { if (s.player) s.player.loginStreak = 1; });
          toast.info("THE HOUSE MISSED YOU", { description: "Streak reset. We were starting to worry." });
        }
        set(s => { if (s.player) s.player.lastLoginAt = now; });
        debouncedUpdate();
      },
      claimDailyBonus: () => {
        const p = get().player;
        if (!p) return;
        const now = Date.now();
        const lastClaim = p.lastBonusClaimedAt || 0;
        const isNewDay = new Date(now).toDateString() !== new Date(lastClaim).toDateString();
        if (isNewDay) {
          const bonus = 100 + (p.loginStreak * 50);
          set(s => {
            if (s.player) {
              s.player.ovCoin += bonus;
              s.player.lastBonusClaimedAt = now;
              s.player.corruption += 1;
            }
          });
          toast.success("DAILY CORRUPTION BONUS", { description: `+${bonus} OVC. Spend it before your conscience returns.` });
          debouncedUpdate();
        }
      },
      recordRegret: () => {
        set((state) => {
          if (state.player) {
            state.player.totalRegrets += 1;
            state.player.lastNearMissAt = Date.now();
            state.player.title = calculateTitle(state.player);
          }
        });
        debouncedUpdate();
      },
      getLatestAchievement: () => {
        const p = get().player;
        if (!p) return "Fresh Meat";
        if (p.debt > 50000) return "Financial Ruin Expert";
        if (p.corruption > 70) return "Glitch Architect";
        if (p.consecutiveLosses > 5) return "Preferred Donor";
        return p.title;
      }
    };
  })
);