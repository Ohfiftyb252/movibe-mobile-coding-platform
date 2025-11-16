import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '@/stores/player-store';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Coins, Package } from 'lucide-react';
interface OVWLayoutProps {
  children: React.ReactNode;
}
function PlayerStats() {
  const player = usePlayerStore((s) => s.player);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const error = usePlayerStore((s) => s.error);
  if (isLoading) {
    return <div className="text-ov-gray animate-pulse">Loading Player_One...</div>;
  }
  if (error || !player) {
    return <div className="text-red-500">Error: Cannot load player data.</div>;
  }
  return (
    <div className="flex items-center gap-4">
      <div className="text-ov-gray">{player.name}</div>
      <div className="flex items-center gap-2 bg-black/50 border border-ov-primary/20 px-3 py-1 rounded">
        <Coins className="w-4 h-4 text-ov-green" />
        <span className="font-mono text-ov-green font-bold">{player.ovCoin.toLocaleString()}</span>
      </div>
      <Button asChild variant="ghost" size="icon" className="text-ov-gray hover:text-ov-primary hover:bg-ov-primary/10">
        <Link to="/inventory">
          <Package className="w-5 h-5" />
        </Link>
      </Button>
    </div>
  );
}
export function OVWLayout({ children }: OVWLayoutProps) {
  const loadPlayer = usePlayerStore((s) => s.loadPlayer);
  useEffect(() => {
    loadPlayer('PLAYER_ONE');
  }, [loadPlayer]);
  useEffect(() => {
    document.documentElement.classList.add('dark', 'ov-theme');
    return () => {
      document.documentElement.classList.remove('dark', 'ov-theme');
    }
  }, []);
  return (
    <div className="min-h-screen bg-ov-dark text-ov-foreground font-mono selection:bg-ov-primary selection:text-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black pointer-events-none"></div>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 backdrop-blur-sm bg-ov-dark/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="font-display text-lg uppercase glitch-text" data-text="O.V.W">O.V.W</Link>
          <PlayerStats />
        </div>
      </header>
      <main className="min-h-screen flex flex-col items-center justify-center p-4 pt-24">
        <div className="max-w-7xl w-full">
          {children}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-ov-gray/50 text-sm pointer-events-none">
        <p>Built with ❤️ at Cloudflare. All games are probably rigged. Gamble responsibly (or don't, we don't care).</p>
      </footer>
      <Toaster theme="dark" richColors closeButton />
    </div>
  );
}