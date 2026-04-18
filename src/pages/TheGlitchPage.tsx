import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Bot, Gem, Skull, Hammer, Zap } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SlotReel } from '@/components/SlotReel';
const SYMBOLS = [
  <Bot className="text-ov-primary" />,
  <Gem className="text-ov-green" />,
  <Skull className="text-destructive" />,
  <span className="text-yellow-400 font-display">7</span>,
  <Coins className="text-yellow-500" />,
];
const PAYOUTS: { [key: number]: number } = {
  0: 50, // 3 Bots
  1: 25, // 3 Gems
  3: 77, // 3 Sevens
};
export function TheGlitchPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const increaseCorruption = usePlayerStore((s) => s.increaseCorruption);
  const addHeat = usePlayerStore((s) => s.addHeat);
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFakeOut, setIsFakeOut] = useState(false);
  const [reels, setReels] = useState([0, 1, 2]);
  const [feedback, setFeedback] = useState('Pull the lever.');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const handleSpin = () => {
    if (isSpinning || !player) return;
    const bet = Number(betAmount);
    if (!bet || bet <= 0) { toast.error("Invalid bet amount."); return; }
    if (bet > player.ovCoin) { toast.error("You're broke."); return; }
    setIsSpinning(true);
    setIsFakeOut(false);
    setGameResult(null);
    setFeedback('PROCESSING...');
    setOvCoin(player.ovCoin - bet);
    increaseCorruption(1);
    addHeat(2);
    setTimeout(() => {
      const fakeOutChance = 0.05 + ((player.heat ?? 0) / 500);
      const isActuallyWinning = Math.random() < (0.1 - ((player.heat ?? 0) / 2000));
      const triggeringFakeOut = !isActuallyWinning && Math.random() < fakeOutChance;
      let newReels = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      if (isActuallyWinning) {
        const winningSymbolIndex = 3; 
        newReels = [winningSymbolIndex, winningSymbolIndex, winningSymbolIndex];
      } else if (triggeringFakeOut) {
        newReels = [3, 3, 3]; 
      }
      setReels(newReels);
      if (triggeringFakeOut) {
        setIsFakeOut(true);
        setFeedback("JACKPOT!! WINNER!");
        setGameResult('win');
        setTimeout(() => {
          setReels([3, 3, 2]); 
          setGameResult('loss');
          setIsFakeOut(false);
          setFeedback("ERROR: LMAO_NOPE");
          setIsSpinning(false);
          recordLoss();
          addHeat(10);
        }, 1200);
      } else {
        setIsSpinning(false);
        if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
          const mult = PAYOUTS[newReels[0]] || 10;
          const winnings = bet * mult;
          setGameResult('win');
          setFeedback(`REAL WIN! +${winnings.toLocaleString()}`);
          setOvCoin(player.ovCoin - bet + winnings);
          resetLosses();
          addHeat(-20);
        } else {
          setGameResult('loss');
          setFeedback('TRY AGAIN.');
          recordLoss();
        }
      }
    }, 2000);
  };
  const handleSmash = () => {
    if (!player) return;
    toast.error("SYSTEM TAMPERING DETECTED", { description: "+50 O.V. Coin but Heat level rising!" });
    setOvCoin(player.ovCoin + 50);
    addHeat(50);
    resetLosses();
  };
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Glitch">The Glitch</h1>
        <p className="mt-4 text-lg text-ov-gray">The odds are technically existing. Probably.</p>
      </div>
      <Card className={cn(
        "max-w-2xl mx-auto bg-black/60 border-ov-primary/20 transition-all duration-300",
        isFakeOut && "border-ov-primary shadow-[0_0_50px_rgba(255,0,229,0.4)] scale-105"
      )}>
        <CardContent className="p-8 flex flex-col items-center gap-8">
          <div className="flex justify-center items-center gap-4 p-6 bg-black/40 border-2 border-ov-primary/10 rounded-2xl relative overflow-hidden">
            {isFakeOut && <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.1 }} className="absolute inset-0 bg-ov-primary/20" />}
            <SlotReel symbols={SYMBOLS} finalIndex={reels[0]} isSpinning={isSpinning} delay={0} />
            <SlotReel symbols={SYMBOLS} finalIndex={reels[1]} isSpinning={isSpinning} delay={0.2} />
            <SlotReel symbols={SYMBOLS} finalIndex={reels[2]} isSpinning={isSpinning} delay={0.4} />
          </div>
          <div className="h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={feedback}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className={cn(
                  "text-3xl font-bold font-display uppercase text-center",
                  gameResult === 'win' && 'text-ov-green drop-shadow-[0_0_10px_rgba(0,255,156,0.5)]',
                  gameResult === 'loss' && 'text-red-500',
                  isFakeOut && 'animate-glitch text-ov-primary'
                )}
              >
                {feedback}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-ov-green" />
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isSpinning}
                className="text-center text-xl h-14 bg-ov-dark border-ov-primary/20"
              />
            </div>
            <Button
              size="lg"
              onClick={handleSpin}
              disabled={isSpinning || !betAmount}
              className="w-full h-16 text-2xl font-display uppercase tracking-widest relative overflow-hidden group"
            >
              <Zap className="absolute left-4 opacity-20 group-hover:opacity-100 transition-opacity" />
              {isSpinning ? 'SPINNING...' : 'PULL LEVER'}
            </Button>
            {(player.consecutiveLosses ?? 0) >= 5 && (
              <Button onClick={handleSmash} disabled={isSpinning} variant="destructive" className="w-full h-12 uppercase animate-pulse">
                <Hammer className="mr-2 w-4 h-4" /> Smash Machine (Emergency Cash / High Heat)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="mt-12 text-center">
        <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase tracking-widest">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> GTFO</Link>
        </Button>
      </div>
    </OVWLayout>
  );
}