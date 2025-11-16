import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Timer } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { Duck } from '@/components/Duck';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
type GameState = 'idle' | 'playing' | 'finished';
interface DuckInfo {
  id: number;
  initialX: number;
  initialY: number;
  duration: number;
  direction: 'left' | 'right';
  health: number;
}
interface FloatingPoint {
  id: number;
  x: number;
  y: number;
}
const COST_PER_GAME = 50;
const DUCKS_PER_ROUND = 5;
const ROUND_TIME = 10;
const ACCURACY_TAUNTS = [
  "Couldn't hit water from a boat.",
  "The ducks are laughing at you.",
  "Maybe try a larger screen?",
  "O.V. Corp thanks you for the donation.",
  "Accuracy: Statistical Noise.",
  "Your aim is as bad as your credit."
];
export function GanderGalleryPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [ducks, setDucks] = useState<DuckInfo[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [hitFlash, setHitFlash] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);
  const [taunt, setTaunt] = useState("");
  useEffect(() => {
    document.body.classList.add('game-active');
    return () => document.body.classList.remove('game-active');
  }, []);
  const createDuck = (id: number): DuckInfo => {
    const direction = Math.random() > 0.5 ? 'right' : 'left';
    return {
      id,
      initialX: direction === 'right' ? -100 : window.innerWidth + 100,
      initialY: Math.random() * (window.innerHeight * 0.6),
      duration: Math.random() * 3 + 4,
      direction,
      health: 3,
    };
  };
  const startGame = () => {
    if (!player || player.ovCoin < COST_PER_GAME) return;
    setOvCoin(player.ovCoin - COST_PER_GAME);
    setScore(0);
    setTimeLeft(ROUND_TIME);
    setGameState('playing');
    setFloatingPoints([]);
    const initialDucks = Array.from({ length: DUCKS_PER_ROUND }, (_, i) => createDuck(Date.now() + i));
    setDucks(initialDucks);
  };
  const handleShoot = useCallback((id: number) => {
    setScore(prev => prev + 1);
    setHitFlash(true);
    setTimeout(() => setHitFlash(false), 100);
    // Attempt to locate the duck for the popup
    const d = document.querySelector(`[data-duck-id="${id}"]`);
    if (d) {
      const rect = d.getBoundingClientRect();
      setFloatingPoints(prev => [...prev, { id: Date.now(), x: rect.left, y: rect.top }]);
    }
    setDucks(prev => {
      const targetDuck = prev.find(d => d.id === id);
      if (!targetDuck) return prev;
      const newDucks = prev.map(d => d.id === id ? { ...d, health: d.health - 1 } : d ).filter(d => d.health > 0);
      if (targetDuck.health === 1) {
        setTimeout(() => {
          setDucks(p => [...p, createDuck(Date.now())]);
        }, 500);
      }
      return newDucks;
    });
  }, []);
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('finished');
      setTaunt(ACCURACY_TAUNTS[Math.floor(Math.random() * ACCURACY_TAUNTS.length)]);
      const freshPlayer = usePlayerStore.getState().player;
      if (!freshPlayer) return;
      const winnings = score * 15;
      if (winnings > 0) {
        toast.success(`Time's up! You shot ${score} ducks and won ${winnings} O.V.C!`);
        setOvCoin(freshPlayer.ovCoin + winnings);
      } else {
        toast.info(`Time's up! You shot ${score} ducks. Better luck next time.`);
      }
      setDucks([]);
      return;
    }
  }, [gameState, timeLeft, score, setOvCoin]);
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);
  return (
    <OVWLayout>
      <div className={cn(
        "fixed inset-0 pointer-events-none z-[100] transition-opacity",
        hitFlash ? "bg-white/10 opacity-100" : "opacity-0"
      )} />
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
        <div className="text-center animate-fade-in relative z-10 pointer-events-none mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Glitchy Gander Gallery">
            The Glitchy Gander Gallery
          </h1>
          <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
            Pay 50. Each duck is worth 15. Don't miss.
          </p>
        </div>
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-blue-900/50 cursor-crosshair">
          {ducks.map(duck => (
            <div key={duck.id} data-duck-id={duck.id}>
              <Duck {...duck} onShoot={handleShoot} />
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
                className="absolute text-ov-primary font-bold text-xl pointer-events-none z-50"
              >
                +15 OVC
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-green-800/70 z-20" />
        </div>
        <div className="relative z-30 flex flex-col items-center">
          {gameState === 'idle' && (
            <Button size="lg" onClick={startGame} className="animate-pulse">
              Start Gallery (50 O.V.C)
            </Button>
          )}
          {gameState === 'playing' && (
            <Card className="bg-black/50 border-ov-primary/20">
              <CardContent className="p-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-ov-green" />
                  <span className="text-2xl font-bold">{score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="w-6 h-6 text-ov-primary" />
                  <span className="text-2xl font-bold">{timeLeft}s</span>
                </div>
              </CardContent>
            </Card>
          )}
          {gameState === 'finished' && (
            <div className="text-center">
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                  <Card className="bg-black/80 border-ov-primary/20">
                    <CardHeader>
                      <CardTitle className="text-ov-primary">Game Over</CardTitle>
                      <p className="text-xs italic text-ov-gray">"{taunt}"</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl">Final Score: {score}</p>
                      <p className="text-lg text-ov-green">Winnings: {(score * 15).toLocaleString()} O.V.C</p>
                      <Button onClick={startGame} className="mt-4">Play Again (50 O.V.C)</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          <Button asChild variant="link" className="mt-8 text-ov-primary hover:text-white transition-colors bg-black/30 backdrop-blur-sm">
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