import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dice } from '@/components/Dice';
type CeeLoResult = {
  outcome: 'win' | 'loss' | 'point' | 'reroll';
  value: number;
  message: string;
};
function getCeeLoResult(dice: [number, number, number]): CeeLoResult {
  const sorted = [...dice].sort();
  const [d1, d2, d3] = sorted;
  // Automatic win
  if (d1 === 4 && d2 === 5 && d3 === 6) return { outcome: 'win', value: 100, message: '4-5-6! Automatic Win!' };
  // Trips
  if (d1 === d2 && d2 === d3) {
    if (d1 === 1) return { outcome: 'loss', value: 0, message: 'Trips 1s! Automatic Loss!' };
    return { outcome: 'win', value: d1, message: `Trips ${d1}s! You Win!` };
  }
  // Automatic loss
  if (d1 === 1 && d2 === 3) return { outcome: 'loss', value: 0, message: '1-2-3! Automatic Loss!' };
  // Point
  if (d1 === d2) return { outcome: 'point', value: d3, message: `You set a point of ${d3}!` };
  if (d2 === d3) return { outcome: 'point', value: d1, message: `You set a point of ${d1}!` };
  // Reroll
  return { outcome: 'reroll', value: 0, message: 'No combination. Reroll!' };
}
export function DataDumpPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const [betAmount, setBetAmount] = useState<number | ''>('');
  const [isRolling, setIsRolling] = useState(false);
  const [dice, setDice] = useState<[number, number, number]>([1, 1, 1]);
  const [feedback, setFeedback] = useState('Place your bet to roll.');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const rollDice = (): [number, number, number] => {
    return [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ] as [number, number, number];
  };
  const handleRoll = () => {
    if (isRolling || !player) return;
    const bet = Number(betAmount);
    if (!bet || bet <= 0) {
      toast.error("Invalid bet amount.");
      return;
    }
    if (bet > player.ovCoin) {
      toast.error("You don't have enough O.V. Coin for that bet.");
      return;
    }
    setIsRolling(true);
    setGameResult(null);
    setFeedback('Rolling...');
    const newBalanceAfterBet = player.ovCoin - bet;
    setTimeout(() => {
      let playerRoll = rollDice();
      let playerResult = getCeeLoResult(playerRoll);
      while (playerResult.outcome === 'reroll') {
        playerRoll = rollDice();
        playerResult = getCeeLoResult(playerRoll);
      }
      setDice(playerRoll);
      setFeedback(playerResult.message);
      if (playerResult.outcome === 'win') {
        setGameResult('win');
        setOvCoin(newBalanceAfterBet + bet * 2);
        toast.success(`You won ${bet.toLocaleString()} O.V. Coin!`);
        resetLosses();
        setIsRolling(false);
      } else if (playerResult.outcome === 'loss') {
        setGameResult('loss');
        setOvCoin(newBalanceAfterBet);
        toast.error(`You lost ${bet.toLocaleString()} O.V. Coin.`);
        recordLoss();
        setIsRolling(false);
      } else {
        setFeedback(prev => prev + " Now the house rolls...");
        setTimeout(() => {
          let houseRoll = rollDice();
          let houseResult = getCeeLoResult(houseRoll);
          while (houseResult.outcome === 'reroll' || (houseResult.outcome === 'point' && houseResult.value < playerResult.value)) {
            houseRoll = rollDice();
            houseResult = getCeeLoResult(houseRoll);
          }
          setDice(houseRoll);
          if (houseResult.outcome === 'win' || (houseResult.outcome === 'point' && houseResult.value > playerResult.value)) {
            setGameResult('loss');
            setFeedback(`House rolls ${houseRoll.join('-')} (${houseResult.message}). You lose.`);
            setOvCoin(newBalanceAfterBet);
            toast.error(`You lost ${bet.toLocaleString()} O.V. Coin.`);
            recordLoss();
          } else {
            setGameResult('win');
            setFeedback(`House rolls ${houseRoll.join('-')} (${houseResult.message}). You win!`);
            setOvCoin(newBalanceAfterBet + bet * 2);
            toast.success(`You won ${bet.toLocaleString()} O.V. Coin!`);
            resetLosses();
          }
          setIsRolling(false);
        }, 2000);
      }
    }, 1600);
  };
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetAmount(value === '' ? '' : Math.max(0, parseInt(value, 10) || 0));
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
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Data Dump">
          The Data Dump
        </h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          Roll the bones. Cee-lo is the game. 4-5-6 wins, 1-2-3 loses. Trips are high, points are... the point.
        </p>
      </div>
      <Card className="mt-8 max-w-2xl mx-auto bg-black/50 border-ov-primary/20 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-center text-ov-primary font-display uppercase tracking-widest">
            Cee-lo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <div className="flex justify-center items-center gap-4 md:gap-8 h-24 md:h-28">
            <Dice value={dice[0]} isRolling={isRolling} delay={0} />
            <Dice value={dice[1]} isRolling={isRolling} delay={0.1} />
            <Dice value={dice[2]} isRolling={isRolling} delay={0.2} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "text-xl text-center font-bold font-display uppercase h-12",
                gameResult === 'win' && 'text-ov-green',
                gameResult === 'loss' && 'text-destructive'
              )}
            >
              {feedback}
            </motion.div>
          </AnimatePresence>
          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-ov-green" />
              <Input
                type="number"
                placeholder="Enter bet amount..."
                value={betAmount}
                onChange={handleBetChange}
                disabled={isRolling}
                className="text-center text-lg bg-ov-dark border-ov-primary/30 focus:ring-ov-primary focus:border-ov-primary"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => setQuickBet(10)} disabled={isRolling}>10</Button>
              <Button variant="outline" onClick={() => setQuickBet(50)} disabled={isRolling}>50</Button>
              <Button variant="outline" onClick={() => setQuickBet(100)} disabled={isRolling}>100</Button>
              <Button variant="destructive" onClick={() => setQuickBet('all')} disabled={isRolling}>All In</Button>
            </div>
            <div className="pt-4">
              <Button size="lg" onClick={handleRoll} disabled={isRolling || !betAmount} className="w-full">
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </Button>
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