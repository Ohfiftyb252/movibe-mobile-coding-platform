import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Bot, Gem, Skull, Hammer } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SlotReel } from '@/components/SlotReel';
const SYMBOLS = [
  <Bot className="text-ov-primary" />,
  <Gem className="text-ov-green" />,
  <Skull className="text-destructive" />,
  <span className="text-yellow-400">7</span>,
  <Coins className="text-yellow-500" />,
];
const PAYOUTS: { [key: number]: number } = {
  0: 50, // 3 Bots
  1: 25, // 3 Gems
  3: 77, // 3 Sevens
};
const RAGE_QUIT_THRESHOLD = 5;
export function TheGlitchPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([0, 1, 2]);
  const [feedback, setFeedback] = useState('Pull the lever.');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const handleSpin = () => {
    if (isSpinning) return;
    const bet = Number(betAmount);
    if (!player || !bet || bet <= 0) {
      toast.error("Invalid bet amount.");
      return;
    }
    if (bet > player.ovCoin) {
      toast.error("You don't have enough O.V. Coin.");
      return;
    }
    setIsSpinning(true);
    setGameResult(null);
    setFeedback('...');
    setOvCoin(player.ovCoin - bet);
    setTimeout(() => {
      const newReels = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      // Rig the game slightly
      if (Math.random() < 0.1) { // 10% chance of winning
        const winningSymbolIndex = Object.keys(PAYOUTS)[Math.floor(Math.random() * Object.keys(PAYOUTS).length)];
        newReels[0] = newReels[1] = newReels[2] = parseInt(winningSymbolIndex);
      } else if (Math.random() < 0.3) { // 30% chance of near miss
        const symbol = Math.floor(Math.random() * SYMBOLS.length);
        newReels[0] = newReels[1] = symbol;
        newReels[2] = (symbol + 1) % SYMBOLS.length;
      }
      setReels(newReels);
      setIsSpinning(false);
      // Check for win
      if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
        const payoutMultiplier = PAYOUTS[newReels[0]];
        if (payoutMultiplier) {
          const winnings = bet * payoutMultiplier;
          setGameResult('win');
          setFeedback(`JACKPOT! You won ${winnings.toLocaleString()}!`);
          setOvCoin(player.ovCoin - bet + winnings);
          resetLosses();
          return;
        }
      }
      setGameResult('loss');
      setFeedback('Try again.');
      recordLoss();
    }, 3000);
  };
  const handleSmash = () => {
    if (!player) return;
    const catharsisWinnings = 50;
    toast.error("You smash the machine in a fit of rage! It spits out a few coins.", {
      description: `+${catharsisWinnings} O.V. Coin`,
    });
    setOvCoin(player.ovCoin + catharsisWinnings);
    resetLosses();
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
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Glitch">
          The Glitch
        </h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          Match three to win. Or don't. The machine doesn't care.
        </p>
      </div>
      <Card className="mt-8 max-w-2xl mx-auto bg-black/50 border-ov-primary/20 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-center text-ov-primary font-display uppercase tracking-widest">
            Slot Machine
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <div className="flex justify-center items-center gap-4 md:gap-6 p-4 bg-black/30 border-2 border-ov-primary/10 rounded-xl">
            <SlotReel symbols={SYMBOLS} finalIndex={reels[0]} isSpinning={isSpinning} delay={0} />
            <SlotReel symbols={SYMBOLS} finalIndex={reels[1]} isSpinning={isSpinning} delay={0.2} />
            <SlotReel symbols={SYMBOLS} finalIndex={reels[2]} isSpinning={isSpinning} delay={0.4} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "text-2xl font-bold font-display uppercase h-8",
                gameResult === 'win' && 'text-ov-green animate-flicker',
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
                disabled={isSpinning}
                className="text-center text-lg bg-ov-dark border-ov-primary/30 focus:ring-ov-primary focus:border-ov-primary"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => setQuickBet(10)} disabled={isSpinning}>10</Button>
              <Button variant="outline" onClick={() => setQuickBet(50)} disabled={isSpinning}>50</Button>
              <Button variant="outline" onClick={() => setQuickBet(100)} disabled={isSpinning}>100</Button>
              <Button variant="destructive" onClick={() => setQuickBet('all')} disabled={isSpinning}>All In</Button>
            </div>
            <div className="pt-4">
              <Button size="lg" onClick={handleSpin} disabled={isSpinning || !betAmount} className="w-full h-16 text-2xl font-display">
                {isSpinning ? 'Spinning...' : 'Pull Lever'}
              </Button>
            </div>
            {player && player.consecutiveLosses >= RAGE_QUIT_THRESHOLD && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                <Button size="lg" onClick={handleSmash} disabled={isSpinning} className="w-full h-16 text-2xl font-display bg-red-800 hover:bg-red-700 animate-pulse">
                  <Hammer className="mr-4" />
                  SMASH MACHINE
                </Button>
              </motion.div>
            )}
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