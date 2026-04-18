import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '@/stores/player-store';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, Package, Flame, Clover, Skull, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const prevLuckRef = useRef(50);
  const prevHeatRef = useRef(0);
  const [luckFlash, setLuckFlash] = useState(false);
  const [heatFlash, setHeatFlash] = useState(false);
  useEffect(() => {
    if (player) {
      const currentLuck = player.luck ?? 50;
      const currentHeat = player.heat ?? 0;
      if (Math.abs(currentLuck - prevLuckRef.current) > 5) {
        setLuckFlash(true);
        setTimeout(() => setLuckFlash(false), 1000);
      }
      if (Math.abs(currentHeat - prevHeatRef.current) > 10) {
        setHeatFlash(true);
        setTimeout(() => setHeatFlash(false), 1000);
      }
      prevLuckRef.current = currentLuck;
      prevHeatRef.current = currentHeat;
    }
  }, [player]);
  const roast = useMemo(() => DEBT_ROASTS[Math.floor(Math.random() * DEBT_ROASTS.length)], []);
  if (isLoading) return <div className="text-ov-gray animate-pulse text-xs tracking-widest font-bold">SYNCHRONIZING...</div>;
  if (error || !player) return <div className="text-red-500 text-xs font-bold uppercase animate-pulse">SYSTEM_FAULT: NO_DATA</div>;
  const debt = player.debt ?? 0;
  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-black/80 border border-ov-primary/20 rounded-xl text-[10px] uppercase tracking-tighter">
          <div className={cn(
            "flex items-center gap-1.5 transition-all duration-300",
            heatFlash ? "text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-orange-500"
          )} title="Heat (Attention Level)">
            <Flame className={cn("w-3 h-3", heatFlash && "animate-bounce")} /> {player.heat ?? 0}
          </div>
          <div className={cn(
            "flex items-center gap-1.5 transition-all duration-300",
            luckFlash ? "text-ov-primary scale-110 drop-shadow-[0_0_8px_rgba(255,0,229,0.8)]" : "text-green-400"
          )} title="Luck (Algorithmic Favor)">
            <Clover className={cn("w-3 h-3", luckFlash && "animate-spin")} /> {player.luck ?? 50}%
          </div>
          <div className="flex items-center gap-1.5 text-red-400 font-bold" title="Debt (Liquid Asset Denial)">
            <Skull className="w-3 h-3" /> {debt.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-3 bg-ov-green/5 border border-ov-green/30 px-4 py-1.5 rounded-lg shadow-[0_0_20px_rgba(0,255,156,0.05)]">
          <Coins className="w-4 h-4 text-ov-green" />
          <span className="font-mono text-ov-green font-bold text-lg leading-none tracking-tight">{(player.ovCoin ?? 0).toLocaleString()}</span>
        </div>
        <Button asChild variant="ghost" size="icon" className="text-ov-gray hover:text-ov-primary hover:bg-ov-primary/10 transition-colors">
          <Link to="/inventory"><Package className="w-5 h-5" /></Link>
        </Button>
      </div>
      <div className="w-32 sm:w-48 space-y-1">
        <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-ov-primary/70 font-bold">
          <span>Corruption</span>
          <span>{player.corruption ?? 0}%</span>
        </div>
        <Progress value={player.corruption ?? 0} className="h-1 bg-ov-primary/10" />
      </div>
      {debt > 1000 && (
        <div className="fixed top-24 right-4 max-w-[280px] sm:max-w-xs animate-slide-up z-[70]">
          <div className="bg-red-950/90 border-2 border-red-500/50 p-3 rounded-xl backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.2)] flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-red-400 uppercase tracking-widest text-[10px]">RECOVERY_ALERT</p>
              <p className="text-red-100 italic mt-1 font-sans leading-tight">"{roast}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export function OVWLayout({ children }: { children: React.ReactNode }) {
  const loadPlayer = usePlayerStore((s) => s.loadPlayer);
  useEffect(() => {
    loadPlayer('PLAYER_ONE');
  }, [loadPlayer]);
  useEffect(() => {
    document.documentElement.classList.add('dark', 'ov-theme');
    return () => { document.documentElement.classList.remove('dark', 'ov-theme'); }
  }, []);
  return (
    <div className="min-h-screen bg-ov-dark text-ov-foreground font-mono selection:bg-ov-primary selection:text-black relative overflow-x-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanline opacity-[0.03]"></div>
      <div className="fixed inset-0 pointer-events-none z-[101] vignette opacity-50"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5 pointer-events-none"></div>
      <header className="fixed top-0 left-0 right-0 z-[60] p-4 backdrop-blur-2xl bg-ov-dark/80 border-b border-ov-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link
            to="/"
            className="font-display text-2xl md:text-3xl uppercase glitch-text hover:scale-105 transition-transform inline-block"
            data-text="O.V.W"
          >
            O.V.W
          </Link>
          <PlayerStats />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 pt-28 md:pt-36 lg:pt-40 min-h-screen">
          {children}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-6 text-center text-ov-gray/10 text-[10px] pointer-events-none uppercase tracking-[1em] z-40 bg-gradient-to-t from-ov-dark to-transparent">
        O.V. WORLD :: BUILT WITH REGRETS :: MMXXV
      </footer>
      <Toaster
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            zIndex: 9999,
            background: 'rgba(16, 18, 20, 0.95)',
            border: '1px solid rgba(255, 0, 229, 0.3)',
            backdropFilter: 'blur(12px)',
            fontFamily: 'VT323, monospace',
            textTransform: 'uppercase'
          }
        }}
      />
    </div>
  );
}