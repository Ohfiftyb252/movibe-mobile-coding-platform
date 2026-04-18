import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Coins, Skull, Flame, TrendingUp } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const Coin = ({ isFlipping, result }: { isFlipping: boolean; result: 'heads' | 'tails' | null }) => {
  return (
    <div className="w-40 h-40 perspective-1000">
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipping ? 1800 : (result === 'tails' ? 180 : 0) }}
        transition={{ duration: 1.5, ease: "circOut" }}
      >
        <div className="absolute w-full h-full backface-hidden flex items-center justify-center rounded-full bg-yellow-400 border-4 border-yellow-600 shadow-lg">
          <Coins className="w-24 h-24 text-yellow-700" />
        </div>
        <div className="absolute w-full h-full backface-hidden flex items-center justify-center rounded-full bg-gray-600 border-4 border-gray-800 shadow-lg transform rotate-y-180">
          <Skull className="w-24 h-24 text-gray-300" />
        </div>
      </motion.div>
    </div>
  );
};
export function BackAlleyPage() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const addHeat = usePlayerStore((s) => s.addHeat);
  const increaseCorruption = usePlayerStore((s) => s.increaseCorruption);
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [feedback, setFeedback] = useState('Pick a side, chump.');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const handleFlip = (choice: 'heads' | 'tails', isFixed: boolean = false) => {
    if (isFlipping || !player) return;
    const bet = Number(betAmount);
    if (!bet || bet <= 0) return;
    setIsFlipping(true);
    setGameResult(null);
    setFeedback('FLIPPING...');
    increaseCorruption(1);
    addHeat(isFixed ? 25 : 5);
    setTimeout(() => {
      if (!mounted.current) return;
      const winChance = isFixed ? 0.15 : 0.45;
      const playerWins = Math.random() < winChance;
      const flipResult = playerWins ? choice : (choice === 'heads' ? 'tails' : 'heads');
      setCoinResult(flipResult);
      setIsFlipping(false);
      if (playerWins) {
        const mult = isFixed ? 5 : 2;
        const winnings = bet * mult;
        setGameResult('win');
        setFeedback(`WINNER! +${winnings.toLocaleString()}`);
        setOvCoin(player.ovCoin - bet + winnings);
        resetLosses();
      } else {
        setGameResult('loss');
        setFeedback(isFixed ? "FIXED FOR THE HOUSE, LMAO" : "TOUGH BREAK.");
        setOvCoin(player.ovCoin - bet);
        recordLoss();
      }
    }, 1500 - ((player?.corruption ?? 0) * 10));
  };
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="Back Alley Arena">Back Alley Arena</h1>
        <p className="mt-4 text-ov-gray">The rules are whatever we say they are.</p>
      </div>
      <Card className="max-w-2xl mx-auto bg-black/50 border-ov-primary/20 p-8 flex flex-col items-center gap-8">
        <Coin isFlipping={isFlipping} result={coinResult} />
        <div className="h-8">
          <AnimatePresence mode="wait">
            <motion.p key={feedback} className={cn("text-2xl font-display uppercase", gameResult === 'win' ? "text-ov-green" : "text-red-500")}>
              {feedback}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-ov-green" />
            <Input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="bg-ov-dark" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" onClick={() => handleFlip('heads')} disabled={isFlipping} className="bg-yellow-600">HEADS</Button>
            <Button size="lg" onClick={() => handleFlip('tails')} disabled={isFlipping} className="bg-gray-600">TAILS</Button>
          </div>
          {player && player.heat > 50 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-16 border-2 border-ov-primary/50 animate-pulse flex flex-col"
                onClick={() => handleFlip(Math.random() > 0.5 ? 'heads' : 'tails', true)}
                disabled={isFlipping}
              >
                <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> FIXED FIGHT <TrendingUp className="w-4 h-4" /></div>
                <span className="text-[10px] opacity-70">5X PAYOUT (HIGH RISK)</span>
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
      <div className="mt-12 text-center">
        <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Retreat</Link>
        </Button>
      </div>
    </OVWLayout>
  );
}