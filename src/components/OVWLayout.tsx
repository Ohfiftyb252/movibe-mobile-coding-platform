import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { usePlayerStore } from '@/stores/player-store';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, Package, Flame, Clover, Skull, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TiltedOverlay } from '@/components/TiltedOverlay';
import { SatiricalTicker } from '@/components/SatiricalTicker';
const DEBT_ROASTS = [
  "The House owns your soul. And your left shoe.",
  "Your credit score is currently 'Nuclear Winter'.",
  "We've seen better financial decisions from a goldfish.",
  "At this rate, you'll be paying us back in your next three lives.",
  "You're not just broke, you're a mathematical anomaly."
];
function PlayerStats() {
  const player = usePlayerStore((s) => s.player);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const error = usePlayerStore((s) => s.error);
  const smashTerminal = usePlayerStore((s) => s.smashTerminal);
  const claimDailyBonus = usePlayerStore((s) => s.claimDailyBonus);
  const prevLuckRef = useRef(50);
  const prevDebtRef = useRef(0);
  const [luckFlash, setLuckFlash] = useState(false);
  const [heatFlash, setHeatFlash] = useState(false);
  const [debtFlash, setDebtFlash] = useState(false);
  const [currentRoast, setCurrentRoast] = useState(DEBT_ROASTS[0]);
  useEffect(() => {
    if (player) {
      if (Math.abs((player.luck || 50) - prevLuckRef.current) >= 1) {
        setLuckFlash(true);
        setTimeout(() => setLuckFlash(false), 1000);
      }
      if (player.debt > prevDebtRef.current) {
        setDebtFlash(true);
        setCurrentRoast(DEBT_ROASTS[Math.floor(Math.random() * DEBT_ROASTS.length)]);
        setTimeout(() => setDebtFlash(false), 2000);
      }
      prevLuckRef.current = player.luck || 50;
      prevDebtRef.current = player.debt || 0;
    }
  }, [player]);
  if (isLoading) return <div className="text-ov-gray animate-pulse text-xs tracking-widest font-bold">SYNCHRONIZING...</div>;
  if (error || !player) return <div className="text-red-500 text-xs font-bold uppercase animate-pulse">SYSTEM_FAULT: NO_DATA</div>;
  const isTilted = (player.consecutiveLosses ?? 0) >= 5;
  const lastClaim = player.lastBonusClaimedAt || 0;
  const canClaim = new Date().toDateString() !== new Date(lastClaim).toDateString();
  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-3">
        {canClaim && (
          <Button
            size="sm"
            onClick={claimDailyBonus}
            className="h-8 bg-ov-green/20 border border-ov-green text-ov-green hover:bg-ov-green hover:text-black animate-pulse text-[10px]"
          >
            <ShieldCheck className="w-3 h-3 mr-1" /> CLAIM BONUS
          </Button>
        )}
        {isTilted && (
          <Button
            variant="destructive"
            size="sm"
            onClick={smashTerminal}
            className="h-8 animate-glitch border-2 border-white/50 px-2 py-0 text-[10px] font-bold"
          >
            <Zap className="w-3 h-3 mr-1" /> SMASH TERMINAL
          </Button>
        )}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-black/80 border border-ov-primary/20 rounded-xl text-[10px] uppercase tracking-tighter">
          <div className="text-ov-primary font-bold italic mr-2 border-r border-ov-primary/20 pr-4">
            {player.title || 'Fresh Meat'}
          </div>
          <div className={cn("flex items-center gap-1.5 text-orange-500", heatFlash && "scale-110 text-red-500")}>
            <Flame className="w-3 h-3" /> {player.heat ?? 0}
          </div>
          <div className={cn("flex items-center gap-1.5 text-green-400", luckFlash && "scale-110 text-ov-primary")}>
            <Clover className="w-3 h-3" /> {player.luck ?? 50}%
          </div>
          <div className={cn("flex items-center gap-1.5 text-red-400", debtFlash && "scale-125 text-red-600")}>
            <Skull className="w-3 h-3" /> {(player.debt ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-3 bg-ov-green/5 border border-ov-green/30 px-4 py-1.5 rounded-lg">
          <Coins className="w-4 h-4 text-ov-green" />
          <span className="font-mono text-ov-green font-bold text-lg leading-none">{(player.ovCoin ?? 0).toLocaleString()}</span>
        </div>
        <Button asChild variant="ghost" size="icon" className="text-ov-gray hover:text-ov-primary">
          <Link to="/inventory"><Package className="w-5 h-5" /></Link>
        </Button>
      </div>
      <div className="w-32 sm:w-48">
        <div className="flex justify-between text-[10px] uppercase text-ov-primary/70 font-bold mb-1">
          <span>Corruption</span>
          <span>{player.corruption ?? 0}%</span>
        </div>
        <Progress value={player.corruption ?? 0} className="h-1 bg-ov-primary/10" />
      </div>
      {debtFlash && (
        <div className="fixed top-24 right-4 max-w-[280px] animate-slide-up z-[70]">
          <div className="bg-red-950/90 border-2 border-red-500/50 p-3 rounded-xl backdrop-blur-xl shadow-2xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-red-400 uppercase tracking-widest text-[10px]">RECOVERY_ALERT</p>
              <p className="text-red-100 italic mt-1 font-sans">"{currentRoast}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export function OVWLayout({ children }: { children: React.ReactNode }) {
  const loadPlayer = usePlayerStore((s) => s.loadPlayer);
  const checkDailyStatus = usePlayerStore((s) => s.checkDailyStatus);
  const player = usePlayerStore((s) => s.player);
  const playerId = player?.id;
  const hasCheckedDaily = useRef(false);
  useEffect(() => {
    loadPlayer('PLAYER_ONE');
  }, [loadPlayer]);
  useEffect(() => {
    if (playerId && !hasCheckedDaily.current) {
      checkDailyStatus();
      hasCheckedDaily.current = true;
    }
  }, [playerId, checkDailyStatus]);
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You were one spin away from the Big One. Are you really walking away now?";
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  const corruption = player?.corruption ?? 0;
  const losses = player?.consecutiveLosses ?? 0;
  const isTilted = losses >= 5;
  return (
    <div className="min-h-screen bg-ov-dark text-ov-foreground font-mono selection:bg-ov-primary selection:text-black relative overflow-x-hidden">
      <style>{`
        body.game-active {
          overflow: hidden !important;
          height: 100vh !important;
          width: 100vw !important;
          position: fixed !important;
          touch-action: none !important;
        }
        body.game-active main {
          padding-top: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        body.game-active main > div {
          padding-top: 0 !important;
          margin-top: 0 !important;
          width: 100%;
        }
        body.game-active header {
          opacity: 0.3;
          pointer-events: none;
        }
        body.game-active footer {
          display: none;
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-[100] scanline opacity-[0.03]"></div>
      <div className="fixed inset-0 pointer-events-none z-[101] vignette opacity-50"></div>
      {isTilted && <TiltedOverlay intensity={Math.min(losses, 10)} />}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[60] backdrop-blur-2xl bg-ov-dark/80 border-b border-ov-primary/20 transition-all",
        corruption > 85 && "border-ov-primary shadow-2xl shadow-ov-primary/20"
      )}>
        <SatiricalTicker />
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-display text-2xl md:text-3xl uppercase glitch-text" data-text="O.V.W">O.V.W</Link>
          <PlayerStats />
        </div>
      </header>
      <main className={cn("max-w-7xl mx-auto px-4 transition-all duration-500", isTilted && "filter sepia-[0.3] hue-rotate-[340deg]")}>
        <div className="py-8 pt-32 md:pt-40 lg:pt-44 min-h-screen w-full">
          {children}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-6 text-center text-ov-gray/10 text-[10px] pointer-events-none uppercase tracking-[1em] z-40 bg-gradient-to-t from-ov-dark to-transparent">
        O.V. WORLD :: BUILT WITH REGRETS :: MMXXV
      </footer>
      <Toaster theme="dark" richColors position="top-center" />
    </div>
  );
}