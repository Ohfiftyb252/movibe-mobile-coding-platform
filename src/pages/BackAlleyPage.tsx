import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Skull } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const Coin = ({ isFlipping, result }: { isFlipping: boolean; result: 'heads' | 'tails' | null }) => {
  return (
    <div className="w-40 h-40 perspective-1000">
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipping ? 1800 : (result === 'tails' ? 180 : 0) }}
        transition={{ duration: 2, ease: "circOut" }}
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
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const [betAmount, setBetAmount] = useState<number | ''>('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [feedback, setFeedback] = useState('');
  useEffect(() => {
    if (gameResult) {
      const timer = setTimeout(() => {
        setGameResult(null);
        setFeedback('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameResult]);
  const handleFlip = (choice: 'heads' | 'tails') => {
    if (isFlipping) return;
    const bet = Number(betAmount);
    if (!player || !bet || bet <= 0) {
      toast.error("Invalid bet amount.");
      return;
    }
    if (bet > player.ovCoin) {
      toast.error("You don't have enough O.V. Coin for that bet.");
      return;
    }
    setIsFlipping(true);
    setGameResult(null);
    setFeedback('');
    setOvCoin(player.ovCoin - bet);
    setTimeout(() => {
      const isRiggedLoss = Math.random() < 0.55; // 55% chance to lose
      const winningSide: 'heads' | 'tails' = choice === 'heads' ? 'tails' : 'heads';
      const flipResult = isRiggedLoss ? winningSide : choice;
      setCoinResult(flipResult);
      if (flipResult === choice) {
        setGameResult('win');
        setFeedback(`You won ${(bet * 2).toLocaleString()} O.V. Coin!`);
        setOvCoin(player.ovCoin + bet); // Winnings are bet * 2, but we already deducted bet. So just add bet back.
      } else {
        setGameResult('loss');
        setFeedback(`You lost ${bet.toLocaleString()} O.V. Coin. Tough luck.`);
      }
      setIsFlipping(false);
    }, 2100);
  };
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setBetAmount('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setBetAmount(numValue);
      }
    }
  };
  const setQuickBet = (amount: number | 'all') => {
    if (!player) return;
    if (amount === 'all') {
      setBetAmount(player.ovCoin);
    } else {
      setBetAmount(Math.min(amount, player.ovCoin));
    }
  };
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Back Alley Arena">
          The Back Alley Arena
        </h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          Heads or tails? The odds are... an opinion. Place your bets.
        </p>
      </div>
      <Card className="mt-8 max-w-2xl mx-auto bg-black/50 border-ov-primary/20 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-center text-ov-primary font-display uppercase tracking-widest">
            Rigged Coin Flip
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <Coin isFlipping={isFlipping} result={coinResult} />
          <AnimatePresence mode="wait">
            <motion.div
              key={gameResult}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "text-2xl font-bold font-display uppercase",
                gameResult === 'win' && 'text-ov-green',
                gameResult === 'loss' && 'text-destructive'
              )}
            >
              {feedback || "Place your bet"}
            </motion.div>
          </AnimatePresence>
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-ov-green" />
              <Input
                type="number"
                placeholder="Enter bet amount..."
                value={betAmount}
                onChange={handleBetChange}
                disabled={isFlipping}
                className="text-center text-lg bg-ov-dark border-ov-primary/30 focus:ring-ov-primary focus:border-ov-primary"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => setQuickBet(10)} disabled={isFlipping}>10</Button>
              <Button variant="outline" onClick={() => setQuickBet(50)} disabled={isFlipping}>50</Button>
              <Button variant="outline" onClick={() => setQuickBet(100)} disabled={isFlipping}>100</Button>
              <Button variant="destructive" onClick={() => setQuickBet('all')} disabled={isFlipping}>All In</Button>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button size="lg" onClick={() => handleFlip('heads')} disabled={isFlipping} className="bg-yellow-500 hover:bg-yellow-600 text-black">Bet on Heads</Button>
              <Button size="lg" onClick={() => handleFlip('tails')} disabled={isFlipping} className="bg-gray-700 hover:bg-gray-800 text-white">Bet on Tails</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button asChild variant="link" className="mt-8 text-ov-primary hover:text-white transition-colors">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to the Dive Bar
        </Link>
      </Button>
    </OVWLayout>
  );
}