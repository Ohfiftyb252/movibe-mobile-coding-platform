import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Heart, Shield } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { Zombie } from '@/components/Zombie';
import { AnimatePresence, motion } from 'framer-motion';
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
  const createZombie = (id: number): ZombieInfo => {
    return {
      id,
      initialX: Math.random() * (window.innerWidth * 0.9),
      duration: Math.random() * 3 + (8 - wave * 0.5), // Zombies get faster each wave
    };
  };
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
  };
  const handleShoot = useCallback((id: number) => {
    setScore(prev => prev + 1);
    setZombies(prev => prev.filter(z => z.id !== id));
  }, []);
  const handleZombieEscape = useCallback((id: number) => {
    setZombies(prev => prev.filter(z => z.id !== id));
    setLives(prev => prev - 1);
  }, []);
  // Wave Management
  useEffect(() => {
    if (gameState !== 'playing') return;
    const zombiesToSpawn = wave * 2 + 3;
    const initialZombies = Array.from({ length: zombiesToSpawn }, (_, i) => createZombie(Date.now() + i));
    setZombies(initialZombies);
    const waveTimer = setInterval(() => {
      if (zombies.length === 0) {
        setWave(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(waveTimer);
  }, [gameState, wave]);
  // Zombie Escape Listener
  useEffect(() => {
    if (gameState !== 'playing') return;
    const escapeCheckInterval = setInterval(() => {
      const gameArea = document.getElementById('game-area');
      if (!gameArea) return;
      const gameAreaHeight = gameArea.clientHeight;
      document.querySelectorAll('.zombie-instance').forEach(zombieEl => {
        const zombieId = parseInt(zombieEl.getAttribute('data-id') || '0', 10);
        const rect = zombieEl.getBoundingClientRect();
        if (rect.top > gameAreaHeight) {
          handleZombieEscape(zombieId);
        }
      });
    }, 100);
    return () => clearInterval(escapeCheckInterval);
  }, [gameState, handleZombieEscape]);
  // Game Over
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      setGameState('finished');
      const winnings = score * 5; // 5 coins per zombie
      if (winnings > 0 && player) {
        toast.success(`You survived ${wave - 1} waves and killed ${score} zombies. You earned ${winnings} O.V. Coin!`);
        setOvCoin(player.ovCoin - COST_PER_GAME + winnings);
      } else {
        toast.error(`The horde overwhelmed you. You survived ${wave - 1} waves.`);
      }
      setZombies([]);
    }
  }, [lives, gameState, wave, score, player, setOvCoin]);
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in relative z-10">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Quarantine Zone">
          The Quarantine Zone
        </h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          It costs 100 O.V. Coin for supplies. Each kill is worth 5. Don't let them reach the bottom.
        </p>
      </div>
      <div id="game-area" className="fixed inset-0 w-screen h-screen overflow-hidden bg-gray-800/80 cursor-crosshair">
        {zombies.map(zombie => (
          <div key={zombie.id} className="zombie-instance" data-id={zombie.id}>
            <Zombie {...zombie} onShoot={handleShoot} />
          </div>
        ))}
      </div>
      <div className="relative z-30 mt-8 flex flex-col items-center">
        {gameState === 'idle' && (
          <Button size="lg" onClick={startGame} className="animate-pulse">
            Pay {COST_PER_GAME} O.V. Coin to Enter
          </Button>
        )}
        {gameState === 'playing' && (
          <Card className="bg-black/50 border-ov-primary/20">
            <CardContent className="p-4 flex items-center gap-6">
              <div className="flex items-center gap-2" title="Score">
                <Coins className="w-6 h-6 text-ov-green" />
                <span className="text-2xl font-bold">{score}</span>
              </div>
              <div className="flex items-center gap-2" title="Wave">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="text-2xl font-bold">{wave}</span>
              </div>
              <div className="flex items-center gap-2" title="Lives">
                <Heart className="w-6 h-6 text-red-500" />
                <span className="text-2xl font-bold">{lives}</span>
              </div>
            </CardContent>
          </Card>
        )}
        {gameState === 'finished' && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-black/50 border-ov-primary/20 text-center">
              <CardHeader><CardTitle className="text-ov-primary">You Died</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl">Final Score: {score}</p>
                <p className="text-lg">Survived Waves: {wave - 1}</p>
                <p className="text-lg text-ov-green">Winnings: {(score * 5).toLocaleString()} O.V. Coin</p>
                <Button onClick={startGame} className="mt-4">Try Again (100 O.V. Coin)</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <Button asChild variant="link" className="mt-8 text-ov-primary hover:text-white transition-colors bg-black/30 backdrop-blur-sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to the Dive Bar
          </Link>
        </Button>
      </div>
    </OVWLayout>
  );
}