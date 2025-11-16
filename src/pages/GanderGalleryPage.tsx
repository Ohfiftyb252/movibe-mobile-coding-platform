import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Timer } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { Duck } from '@/components/Duck';
import { AnimatePresence, motion } from 'framer-motion';
type GameState = 'idle' | 'playing' | 'finished';
interface DuckInfo {
  id: number;
  initialX: number;
  initialY: number;
  duration: number;
  direction: 'left' | 'right';
}
const COST_PER_GAME = 50;
const DUCKS_PER_ROUND = 5;
const ROUND_TIME = 10; // seconds
export function GanderGalleryPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [ducks, setDucks] = useState<DuckInfo[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const createDuck = (id: number): DuckInfo => {
    const direction = Math.random() > 0.5 ? 'right' : 'left';
    return {
      id,
      initialX: direction === 'right' ? -100 : window.innerWidth + 100,
      initialY: Math.random() * (window.innerHeight * 0.6),
      duration: Math.random() * 3 + 4, // 4-7 seconds
      direction,
    };
  };
  const startGame = () => {
    if (!player || player.ovCoin < COST_PER_GAME) {
      toast.error(`You need ${COST_PER_GAME} O.V. Coin to play.`);
      return;
    }
    setOvCoin(player.ovCoin - COST_PER_GAME);
    setScore(0);
    setTimeLeft(ROUND_TIME);
    setGameState('playing');
    const initialDucks = Array.from({ length: DUCKS_PER_ROUND }, (_, i) => createDuck(Date.now() + i));
    setDucks(initialDucks);
  };
  const handleShoot = useCallback((id: number) => {
    setScore(prev => prev + 1);
    setDucks(prev => prev.filter(d => d.id !== id));
    setTimeout(() => {
      setDucks(prev => [...prev, createDuck(Date.now())]);
    }, 500); // Spawn a new duck after a delay
  }, []);
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('finished');
      const winnings = score * 15; // 15 coins per duck
      if (winnings > 0 && player) {
        toast.success(`Time's up! You shot ${score} ducks and won ${winnings} O.V. Coin!`);
        setOvCoin(player.ovCoin - COST_PER_GAME + winnings);
      } else {
        toast.info(`Time's up! You shot ${score} ducks. Better luck next time.`);
      }
      setDucks([]);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, player, setOvCoin]);
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in relative z-10">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Glitchy Gander Gallery">
          The Glitchy Gander Gallery
        </h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          It costs 50 O.V. Coin to play. Each duck is worth 15. Don't miss.
        </p>
      </div>
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-blue-900/50 cursor-crosshair">
        {/* Game Area */}
        {ducks.map(duck => (
          <Duck key={duck.id} {...duck} onShoot={handleShoot} />
        ))}
        {/* Foreground Grass */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-green-800/70 z-20" />
      </div>
      <div className="relative z-30 mt-8 flex flex-col items-center">
        {gameState === 'idle' && (
          <Button size="lg" onClick={startGame} className="animate-pulse">
            Pay {COST_PER_GAME} O.V. Coin to Start
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
                <Card className="bg-black/50 border-ov-primary/20">
                  <CardHeader><CardTitle className="text-ov-primary">Game Over</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-2xl">Final Score: {score}</p>
                    <p className="text-lg text-ov-green">Winnings: {(score * 15).toLocaleString()} O.V. Coin</p>
                    <Button onClick={startGame} className="mt-4">Play Again (50 O.V. Coin)</Button>
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
    </OVWLayout>
  );
}