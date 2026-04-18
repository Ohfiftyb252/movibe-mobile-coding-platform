import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Bot, Gem, Skull, Hammer, Zap, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react';
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
  0: 20, // 3 Bots
  1: 40, // 3 Gems
  3: 100, // 3 Sevens (Jackpot)
  4: 15, // 3 Coins
};
export function TheGlitchPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const increaseCorruption = usePlayerStore((s) => s.increaseCorruption);
  const addHeat = usePlayerStore((s) => s.addHeat);
  const adjustLuck = usePlayerStore((s) => s.adjustLuck);
  const addDebt = usePlayerStore((s) => s.addDebt);
  const currentOvCoin = usePlayerStore((s) => s.player?.ovCoin ?? 0);
  const currentLuck = usePlayerStore((s) => s.player?.luck ?? 50);
  const consecutiveLosses = usePlayerStore((s) => s.player?.consecutiveLosses ?? 0);
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFakeOut, setIsFakeOut] = useState(false);
  const [reels, setReels] = useState([0, 1, 2]);
  const [feedback, setFeedback] = useState('DEPOSIT HOPE HERE.');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | 'near-miss' | null>(null);
  const isTension = useMemo(() => {
    return isSpinning && reels[0] === reels[1] && reels[0] !== 2; // Tension if first two match and aren't skulls
  }, [isSpinning, reels]);
  const handleSpin = () => {
    if (isSpinning || !player) return;
    const bet = Number(betAmount);
    if (!bet || bet <= 0) { toast.error("INVALID INPUT DETECTED"); return; }
    if (bet > currentOvCoin) { toast.error("INSUFFICIENT LIQUIDITY"); return; }
    setIsSpinning(true);
    setIsFakeOut(false);
    setGameResult(null);
    setFeedback('PROCESSING DESPAIR...');
    setOvCoin(currentOvCoin - bet);
    increaseCorruption(1);
    addHeat(1);
    setTimeout(() => {
      const luckMultiplier = currentLuck / 100; // 0.5 at neutral
      const roll = Math.random();
      let outcomeType: 'jackpot' | 'win' | 'near-miss' | 'glitch' | 'loss' = 'loss';
      if (roll < 0.02 * luckMultiplier) outcomeType = 'jackpot';
      else if (roll < 0.10 * luckMultiplier) outcomeType = 'win';
      else if (roll < 0.25) outcomeType = 'near-miss';
      else if (roll < 0.35 + (0.1 * (1 - luckMultiplier))) outcomeType = 'glitch';
      else outcomeType = 'loss';
      let newReels = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      if (outcomeType === 'jackpot') {
        newReels = [3, 3, 3];
      } else if (outcomeType === 'win') {
        const sym = [0, 1, 4][Math.floor(Math.random() * 3)];
        newReels = [sym, sym, sym];
      } else if (outcomeType === 'near-miss') {
        const sym = Math.floor(Math.random() * SYMBOLS.length);
        const offset = Math.random() > 0.5 ? 1 : -1;
        let third = (sym + offset) % SYMBOLS.length;
        if (third < 0) third = SYMBOLS.length - 1;
        newReels = [sym, sym, third];
      } else if (outcomeType === 'glitch') {
        newReels = [3, 3, 3]; // Show jackpot initially
      }
      setReels(newReels);
      if (outcomeType === 'glitch') {
        setIsFakeOut(true);
        setFeedback("JACKPOT!!! UNBELIEVABLE!!");
        setGameResult('win');
        setTimeout(() => {
          setReels([3, 3, 2]); // Flip to 7-7-Skull
          setGameResult('loss');
          setIsFakeOut(false);
          setFeedback("FATAL: TRANSACTION_CORRUPT");
          setIsSpinning(false);
          recordLoss();
          adjustLuck(-20);
          addHeat(20);
          toast.error("SYSTEM CRASH", { description: "Winning packet intercepted by the House." });
        }, 1500);
      } else {
        setIsSpinning(false);
        if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
          const mult = PAYOUTS[newReels[0]] || 5;
          const winnings = bet * mult;
          setGameResult('win');
          setFeedback(`OUTLIER DETECTED! +${winnings.toLocaleString()}`);
          setOvCoin(currentOvCoin + winnings);
          resetLosses();
          adjustLuck(-15); // Winning burns luck
        } else if (newReels[0] === newReels[1]) {
          setGameResult('near-miss');
          setFeedback('SO CLOSE. TRY AGAIN?');
          adjustLuck(5); // Near misses build hope/luck
          recordLoss();
        } else {
          setGameResult('loss');
          setFeedback('EXPECTED OUTCOME.');
          recordLoss();
          adjustLuck(2); // Regular losses slightly increase luck
        }
      }
    }, 2000);
  };
  const handleCashOut = () => {
    if (!player) return;
    const bonus = Math.floor(Math.random() * 100) + 50;
    toast.success("TRANSFER INITIATED", {
      description: `Intercepting house packets... +${bonus} O.V.C secured.`,
    });
    setOvCoin(currentOvCoin + bonus);
    increaseCorruption(5);
    adjustLuck(-50); // Massive luck reset
  };
  const handleSmash = () => {
    if (!player) return;
    toast.error("PHYSICAL INTERFACE BREACHED", {
      description: "You recovered 50 O.V.C but the alarm is screaming.",
    });
    setOvCoin(currentOvCoin + 50);
    addHeat(150);
    addDebt(200);
    resetLosses();
  };
  return (
    <OVWLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="text-center animate-fade-in max-w-2xl mx-auto mb-12">
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase glitch-text" data-text="The Glitch">The Glitch</h1>
            <p className="mt-4 text-lg text-ov-gray uppercase tracking-widest italic">Our algorithms are fair. Your luck is just substandard.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <Card className={cn(
                "bg-black/80 border-2 border-ov-primary/20 transition-all duration-700 relative overflow-hidden",
                isFakeOut && "border-ov-primary shadow-[0_0_100px_rgba(255,0,229,0.4)] scale-[1.02]",
                isTension && "border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
              )}>
                {isFakeOut && <div className="absolute inset-0 bg-ov-primary/5 animate-pulse z-0" />}
                <CardContent className="p-8 md:p-12 flex flex-col items-center gap-12 relative z-10">
                  <div className="flex justify-center items-center gap-4 md:gap-8 p-8 bg-ov-dark/80 border-4 border-ov-primary/10 rounded-3xl backdrop-blur-xl">
                    <SlotReel symbols={SYMBOLS} finalIndex={reels[0]} isSpinning={isSpinning} delay={0} />
                    <SlotReel symbols={SYMBOLS} finalIndex={reels[1]} isSpinning={isSpinning} delay={0.2} />
                    <SlotReel symbols={SYMBOLS} finalIndex={reels[2]} isSpinning={isSpinning} delay={0.4} tension={isTension} />
                  </div>
                  <div className="h-20 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={feedback}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -10 }}
                        className={cn(
                          "text-3xl md:text-5xl font-bold font-display uppercase text-center tracking-tighter",
                          gameResult === 'win' && 'text-ov-green drop-shadow-[0_0_10px_rgba(0,255,156,0.5)]',
                          gameResult === 'loss' && 'text-red-500',
                          gameResult === 'near-miss' && 'text-yellow-500',
                          isFakeOut && 'animate-glitch text-ov-primary'
                        )}
                      >
                        {feedback}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentLuck > 80 && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Button 
                      onClick={handleCashOut}
                      className="w-full h-20 bg-ov-green/10 border-2 border-ov-green/40 text-ov-green hover:bg-ov-green hover:text-black font-display text-xl uppercase tracking-widest group relative overflow-hidden"
                    >
                      <motion.div 
                        className="absolute inset-0 bg-ov-green/20"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="relative flex items-center gap-2">
                        <ExternalLink className="w-6 h-6" /> CASH_OUT_ALPHA
                      </span>
                    </Button>
                  </motion.div>
                )}
                {consecutiveLosses >= 5 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Button 
                      onClick={handleSmash} 
                      variant="destructive" 
                      className="w-full h-20 border-2 border-red-500/50 uppercase font-display text-xl group overflow-hidden"
                    >
                      <Hammer className="mr-3 w-6 h-6 group-hover:rotate-45 transition-transform" />
                      BRUTE_FORCE_50
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
            <Card className="bg-black/60 border-ov-primary/10 backdrop-blur-md lg:sticky lg:top-32">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.3em] text-ov-primary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Probabilistic Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] uppercase text-ov-gray tracking-widest font-bold">Wager Amount</label>
                    <span className="text-[10px] text-ov-primary font-mono">MAX: {currentOvCoin}</span>
                  </div>
                  <div className="relative group">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-ov-green group-focus-within:animate-bounce" />
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={isSpinning}
                      className="pl-14 text-2xl h-16 bg-ov-dark/50 border-ov-primary/20 focus:border-ov-primary transition-all text-ov-green font-mono"
                    />
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSpin}
                    disabled={isSpinning || !betAmount}
                    className="w-full h-20 text-2xl font-display uppercase tracking-[0.2em] group relative overflow-hidden"
                  >
                    <Zap className={cn("absolute left-6 w-6 h-6 opacity-20 group-hover:opacity-100 transition-opacity", isSpinning && "animate-pulse")} />
                    {isSpinning ? 'CALCULATING...' : 'EXECUTE PULL'}
                  </Button>
                </div>
                <div className="pt-6 border-t border-ov-primary/5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ov-gray uppercase font-bold tracking-tighter">Current Luck Variance</span>
                    <span className={cn("font-bold font-mono", currentLuck > 70 ? "text-ov-green" : "text-red-400")}>{currentLuck}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ov-gray uppercase font-bold tracking-tighter">House Algorithmic Edge</span>
                    <span className="text-ov-primary font-bold font-mono">HIGH</span>
                  </div>
                  {isTension && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3 animate-pulse">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                      <p className="text-[10px] text-yellow-200 leading-relaxed uppercase">
                        Tension spike detected. Neural patterns suggest a high probability of frustration.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-16 text-center">
            <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase tracking-[0.5em] text-xs">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> TERMINATE_SIMULATION</Link>
            </Button>
          </div>
        </div>
      </div>
    </OVWLayout>
  );
}