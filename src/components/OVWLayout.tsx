import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '@/stores/player-store';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, Package, Flame, Clover, Skull, AlertCircle } from 'lucide-react';
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
  const roast = useMemo(() => DEBT_ROASTS[Math.floor(Math.random() * DEBT_ROASTS.length)], []);
  if (isLoading) return <div className="text-ov-gray animate-pulse text-xs">Syncing Player_One...</div>;
  if (error || !player) return <div className="text-red-500 text-xs font-bold uppercase">System Offline</div>;
  const debt = player.debt ?? 0;
  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-4 px-3 py-1 bg-black/60 border border-ov-primary/20 rounded-full text-[10px] uppercase tracking-tighter">
          <div className="flex items-center gap-1 text-orange-500" title="Heat (Cops Watching)">
            <Flame className="w-3 h-3" /> {player.heat ?? 0}
          </div>
          <div className="flex items-center gap-1 text-green-400" title="Luck (Street Cred)">
            <Clover className="w-3 h-3" /> {player.luck ?? 50}%
          </div>
          <div className="flex items-center gap-1 text-red-400 font-bold" title="Debt (The Real Boss)">
            <Skull className="w-3 h-3" /> {debt.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-ov-green/10 border border-ov-green/30 px-3 py-1 rounded shadow-[0_0_10px_rgba(0,255,156,0.1)]">
          <Coins className="w-4 h-4 text-ov-green" />
          <span className="font-mono text-ov-green font-bold">{(player.ovCoin ?? 0).toLocaleString()}</span>
        </div>
        <Button asChild variant="ghost" size="icon" className="text-ov-gray hover:text-ov-primary hover:bg-ov-primary/10 transition-colors">
          <Link to="/inventory"><Package className="w-5 h-5" /></Link>
        </Button>
      </div>
      <div className="w-32 sm:w-48 space-y-1">
        <div className="flex justify-between text-[10px] uppercase tracking-tighter text-ov-primary/70">
          <span>Corruption</span>
          <span>{player.corruption ?? 0}%</span>
        </div>
        <Progress value={player.corruption ?? 0} className="h-1 bg-ov-primary/10" />
      </div>
      {debt > 1000 && (
        <div className="fixed top-24 right-4 max-w-[280px] sm:max-w-xs animate-slide-up z-[70]">
          <div className="bg-red-950/90 border-2 border-red-500/50 p-3 rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.3)] flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-red-400 uppercase tracking-widest">DEBT ALERT</p>
              <p className="text-red-100 italic mt-1 font-sans">"{roast}"</p>
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
      <header className="fixed top-0 left-0 right-0 z-[60] p-4 backdrop-blur-lg bg-ov-dark/60 border-b border-ov-primary/20">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <Link 
            to="/" 
            className="font-display text-xl uppercase glitch-text mt-1 hover:scale-105 transition-transform inline-block" 
            data-text="O.V.W"
          >
            O.V.W
          </Link>
          <PlayerStats />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-24 pb-20 md:pt-32 lg:pt-36">
          {children}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-ov-gray/20 text-[10px] pointer-events-none uppercase tracking-[0.5em] z-40">
        O.V. WORLD :: BUILT WITH REGRETS :: 2025
      </footer>
      <Toaster 
        theme="dark" 
        richColors 
        closeButton 
        toastOptions={{
          style: { zIndex: 9999, background: '#101214', border: '1px solid rgba(255, 0, 229, 0.3)' }
        }}
      />
    </div>
  );
}