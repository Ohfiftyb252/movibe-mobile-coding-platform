import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Heart, Shield } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { Zombie } from '@/components/Zombie';
import { motion } from 'framer-motion';
type GameState = 'idle' | 'playing' | 'finished';
interface ZombieInfo {
  id: number;
  initialX: number;
  duration: number;
}
const COST_PER_GAME = 100;
const INITIAL_LIVES = 3;
export function ZombieOutbreakPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [zombies, setZombies] = useState<ZombieInfo[]>([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const createZombie = useCallback((id: number, currentWave: number): ZombieInfo => {
    return {
      id,
      initialX: Math.random() * (window.innerWidth * 0.8) + (window.innerWidth * 0.05),
      duration: Math.max(2, 8 - (currentWave * 0.4) - (Math.random() * 2)), 
    };
  }, []);
  const startGame = () => {
    if (!player || player.ovCoin < COST_PER_GAME) {
      toast.error(`You need ${COST_PER_GAME} O.V. Coin to play.`);
      return;
    }
    setOvCoin(player.ovCoin - COST_PER_GAME);
    setScore(0);
    setWave(1);
    setLives(INITIAL_LIVES);
    setGameState('playing');
    setZombies([]);
  };
  const handleShoot = useCallback((id: number) => {
    setScore(prev => prev + 1);
    setZombies(prev => prev.filter(z => z.id !== id));
  }, []);
  const handleEscape = useCallback((id: number) => {
    setZombies(prev => prev.filter(z => z.id !== id));
    setLives(prev => prev - 1);
  }, []);
  // Effect to spawn new wave when 'wave' counter increases
  useEffect(() => {
    if (gameState !== 'playing') return;
    const zombiesToSpawn = wave * 2 + 3;
    const newHorde = Array.from({ length: zombiesToSpawn }, (_, i) => 
      createZombie(Date.now() + i + (wave * 1000), wave)
    );
    setZombies(newHorde);
    toast.info(`WAVE ${wave} STARTING...`);
  }, [gameState, wave, createZombie]);
  // Effect to monitor wave completion
  useEffect(() => {
    if (gameState === 'playing' && zombies.length === 0) {
      // Small delay before next wave for pacing
      const timer = setTimeout(() => {
        setWave(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [zombies.length, gameState]);
  // Game Over
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      setGameState('finished');
      const winnings = score * 5;
      if (winnings > 0 && player) {
        toast.success(`DEFEATED. Killed ${score} zombies. Earned ${winnings} O.V. Coin.`);
        // Payout logic
        setOvCoin(player.ovCoin + winnings);
      } else {
        toast.error(`THE HORDE HAS CONSUMED YOU.`);
      }
      setZombies([]);
    }
  }, [lives, gameState, score, player, setOvCoin]);
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in relative z-10 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Quarantine Zone">
          The Quarantine Zone
        </h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          Pay 100. Kill for 5. Survival is not an option.
        </p>
      </div>
      <div id="game-area" className="fixed inset-0 w-screen h-screen overflow-hidden bg-gray-900/40 cursor-crosshair">
        {zombies.map(zombie => (
          <Zombie 
            key={zombie.id} 
            {...zombie} 
            onShoot={handleShoot} 
            onEscape={handleEscape}
          />
        ))}
      </div>
      <div className="relative z-30 mt-8 flex flex-col items-center">
        {gameState === 'idle' && (
          <Button size="lg" onClick={startGame} className="animate-pulse bg-red-600 hover:bg-red-700 text-white">
            Pay {COST_PER_GAME} O.V. Coin to Enter
          </Button>
        )}
        {gameState === 'playing' && (
          <Card className="bg-black/70 border-ov-primary/40 backdrop-blur-md">
            <CardContent className="p-4 flex items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase text-ov-gray">Bounty</span>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-ov-green" />
                  <span className="text-xl font-bold">{score}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-ov-primary/20" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase text-ov-gray">Threat</span>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-xl font-bold">{wave}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-ov-primary/20" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase text-ov-gray">Vitals</span>
                <div className="flex items-center gap-2">
                  <Heart className={lives === 1 ? "w-5 h-5 text-red-500 animate-pulse" : "w-5 h-5 text-red-500"} />
                  <span className="text-xl font-bold">{lives}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-black/80 border-red-500/50 text-center max-w-sm">
              <CardHeader><CardTitle className="text-red-500 font-display text-4xl uppercase">You Died</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xl uppercase tracking-widest text-ov-gray">Final Score: <span className="text-ov-green">{score}</span></p>
                <p className="text-lg uppercase tracking-widest text-ov-gray">Waves Cleared: {wave - 1}</p>
                <div className="p-4 bg-ov-green/10 border border-ov-green/30 rounded">
                   <p className="text-sm uppercase text-ov-gray">Payout Received</p>
                   <p className="text-2xl font-bold text-ov-green">{(score * 5).toLocaleString()} O.V.C</p>
                </div>
                <Button onClick={startGame} className="w-full h-12 uppercase bg-red-600 hover:bg-red-700">Respawn (100 O.V.C)</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <Button asChild variant="link" className="mt-8 text-ov-primary hover:text-white transition-colors bg-black/40 backdrop-blur-sm px-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to the Dive Bar
          </Link>
        </Button>
      </div>
    </OVWLayout>
  );
}