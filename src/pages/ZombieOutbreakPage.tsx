import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Heart, Shield, Zap } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { Zombie } from '@/components/Zombie';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
type GameState = 'idle' | 'playing' | 'finished';
interface ZombieInfo {
  id: number;
  initialX: number;
  duration: number;
  health: number;
}
interface FloatingPoint {
  id: number;
  x: number;
  y: number;
}
const COST_PER_GAME = 100;
const INITIAL_LIVES = 3;
const DEATH_WHISPERS = [
  "They lasted longer than you expected.",
  "You paid 100 for that performance?",
  "The street finds its own uses for bodies.",
  "Zero legacy confirmed.",
  "Was it worth the bandwidth?",
  "Another statistic for the morgue."
];
export function ZombieOutbreakPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const smashTerminal = usePlayerStore((s) => s.smashTerminal);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [zombies, setZombies] = useState<ZombieInfo[]>([]);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [hitFlash, setHitFlash] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [deathWhisper, setDeathWhisper] = useState("");
  const isSpawning = useRef(false);
  const losses = player?.consecutiveLosses ?? 0;
  const isTilted = losses >= 5;
  useEffect(() => {
    document.body.classList.add('game-active');
    return () => document.body.classList.remove('game-active');
  }, []);
  const createZombie = useCallback((id: number, currentWave: number): ZombieInfo => {
    return {
      id,
      initialX: Math.random() * (window.innerWidth * 0.8) + (window.innerWidth * 0.1),
      duration: Math.max(1.5, 8 - (currentWave * 0.5) - (Math.random() * 2)),
      health: 3,
    };
  }, []);
  const startGame = () => {
    if (!player) return;
    setOvCoin(player.ovCoin - COST_PER_GAME);
    setScore(0);
    setWave(1);
    setLives(INITIAL_LIVES);
    setGameState('playing');
    setZombies([]);
    setFloatingPoints([]);
    isSpawning.current = false;
  };
  const handleShoot = useCallback((id: number) => {
    setScore(prev => prev + 1);
    const z = document.querySelector(`[data-id="${id}"]`);
    if (z) {
      const rect = z.getBoundingClientRect();
      setFloatingPoints(prev => [...prev, { id: Date.now(), x: rect.left, y: rect.top }]);
    }
    setZombies(prev => prev.map(z => z.id === id ? { ...z, health: z.health - 1 } : z ).filter(z => z.health > 0 ));
  }, []);
  const handleEscape = useCallback((id: number) => {
    setZombies(prev => prev.filter(z => z.id !== id));
    setLives(prev => prev - 1);
    setHitFlash(true);
    setTimeout(() => setHitFlash(false), 150);
  }, []);
  useEffect(() => {
    if (gameState !== 'playing' || isSpawning.current) return;
    isSpawning.current = true;
    const zombiesToSpawn = wave * 2 + 3;
    const newHorde = Array.from({ length: zombiesToSpawn }, (_, i) =>
      createZombie(Date.now() + i * 10, wave)
    );
    setZombies(newHorde);
    toast.info(`WAVE ${wave} STARTING...`);
    setTimeout(() => {
      isSpawning.current = false;
    }, 500);
  }, [gameState, wave, createZombie]);
  useEffect(() => {
    if (gameState === 'playing' && zombies.length === 0 && !isSpawning.current) {
      const timer = setTimeout(() => {
        setWave(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [zombies.length, gameState]);
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      const freshPlayer = usePlayerStore.getState().player;
      if (!freshPlayer) return;
      setGameState('finished');
      setDeathWhisper(DEATH_WHISPERS[Math.floor(Math.random() * DEATH_WHISPERS.length)]);
      const winnings = score * 5;
      if (winnings > 0) {
        toast.success(`DEFEATED. Killed ${score} zombies. Earned ${winnings} O.V.C.`);
        setOvCoin(freshPlayer.ovCoin + winnings);
      } else {
        toast.error(`THE HORDE HAS CONSUMED YOU.`);
      }
      setZombies([]);
    }
  }, [lives, gameState, score, setOvCoin]);
  return (
    <OVWLayout>
      <div className={cn(
        "fixed inset-0 pointer-events-none z-[100] bg-red-600/20 transition-opacity",
        hitFlash ? "opacity-100" : "opacity-0"
      )} />
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
        <div className="text-center animate-fade-in relative z-10 pointer-events-none mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Quarantine Zone">
            The Quarantine Zone
          </h1>
          <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
            Pay 100. Kill for 5. Survival is not an option.
          </p>
        </div>
        <div id="game-area" className="fixed inset-0 w-screen h-screen overflow-hidden bg-gray-900/40 cursor-crosshair">
          {zombies.map(zombie => (
            <div key={zombie.id} data-id={zombie.id}>
              <Zombie
                id={zombie.id}
                initialX={zombie.initialX}
                duration={zombie.duration}
                onShoot={handleShoot}
                onEscape={handleEscape}
              />
            </div>
          ))}
          <AnimatePresence>
            {floatingPoints.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, y: p.y, x: p.x }}
                animate={{ opacity: 0, y: p.y - 100 }}
                exit={{ opacity: 0 }}
                onAnimationComplete={() => setFloatingPoints(prev => prev.filter(fp => fp.id !== p.id))}
                className="absolute text-ov-green font-bold text-xl pointer-events-none z-50"
              >
                +5 OVC
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="relative z-30 flex flex-col items-center">
          {gameState === 'idle' && (
            <Button size="lg" onClick={startGame} className="animate-pulse bg-red-600 hover:bg-red-700 text-white">
              Enter The Zone (100 O.V.C)
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
                <CardHeader>
                  <CardTitle className="text-red-500 font-display text-4xl uppercase">You Died</CardTitle>
                  <p className="text-xs italic text-ov-gray">"{deathWhisper}"</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xl uppercase tracking-widest text-ov-gray">Final Score: <span className="text-ov-green">{score}</span></p>
                  <p className="text-lg uppercase tracking-widest text-ov-gray">Waves Cleared: {wave - 1}</p>
                  <div className="p-4 bg-ov-green/10 border border-ov-green/30 rounded">
                     <p className="text-sm uppercase text-ov-gray">Payout Received</p>
                     <p className="text-2xl font-bold text-ov-green">{(score * 5).toLocaleString()} O.V.C</p>
                  </div>
                  <div className="grid gap-2">
                    <Button onClick={startGame} className="w-full h-12 uppercase bg-red-600 hover:bg-red-700">Respawn (100 O.V.C)</Button>
                    {isTilted && (
                      <Button onClick={smashTerminal} variant="outline" className="w-full border-ov-primary text-ov-primary hover:bg-ov-primary hover:text-black">
                        <Zap className="w-4 h-4 mr-2" /> Rage Rebirth
                      </Button>
                    )}
                  </div>
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
      </div>
    </OVWLayout>
  );
}