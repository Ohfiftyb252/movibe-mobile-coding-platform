import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Bot, Gem, Skull, Zap, TrendingUp, ExternalLink, ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SlotReel } from '@/components/SlotReel';
import { PsychologicalWhispers } from '@/components/PsychologicalWhispers';
const SYMBOLS = [
  <Bot className="text-ov-primary" />,
  <Gem className="text-ov-green" />,
  <Skull className="text-destructive" />,
  <span className="text-yellow-400 font-display">7</span>,
  <Coins className="text-yellow-500" />,
];
const PAYOUTS: { [key: number]: number } = {
  0: 5,   // 3 Bots
  1: 10,  // 3 Gems
  3: 50,  // 3 Sevens (Jackpot)
  4: 3,   // 3 Coins
};
export function TheGlitchPage() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const player = usePlayerStore(s => s.player);
  const setOvCoin = usePlayerStore(s => s.setOvCoin);
  const recordLoss = usePlayerStore(s => s.recordLoss);
  const resetLosses = usePlayerStore(s => s.resetLosses);
  const increaseCorruption = usePlayerStore(s => s.increaseCorruption);
  const addHeat = usePlayerStore(s => s.addHeat);
  const adjustLuck = usePlayerStore(s => s.adjustLuck);
  const incrementSpinsSinceBigWin = usePlayerStore(s => s.incrementSpinsSinceBigWin);
  const resetSpinsSinceBigWin = usePlayerStore(s => s.resetSpinsSinceBigWin);
  const recordRegret = usePlayerStore(s => s.recordRegret);
  const currentOvCoin = player?.ovCoin ?? 0;
  const currentLuck = player?.luck ?? 50;
  const consecutiveLosses = player?.consecutiveLosses ?? 0;
  const spinsSinceBigWin = player?.spinsSinceBigWin ?? 99;
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFakeOut, setIsFakeOut] = useState(false);
  const [reels, setReels] = useState([0, 1, 2]);
  const [feedback, setFeedback] = useState('DEPOSIT HOPE HERE.');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | 'near-miss' | null>(null);
  const [showTrap, setShowTrap] = useState(false);
  const [lastTrapResult, setLastTrapResult] = useState<boolean | null>(null);
  // Derived state for the UI components
  const isTension = useMemo(() => {
    return isSpinning && reels[0] === reels[1] && reels[0] !== 2;
  }, [isSpinning, reels]);
  useEffect(() => {
    if (currentLuck > 80 && !isSpinning && !showTrap) {
      if (Math.random() < 0.3) {
        setShowTrap(true);
        const timer = setTimeout(() => setShowTrap(false), 2000 + Math.random() * 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentLuck, isSpinning, showTrap]);
  const handleSpin = () => {
    if (isSpinning || !player) return;
    const bet = Number(betAmount);
    if (!bet || bet <= 0) { toast.error("INVALID INPUT"); return; }
    if (bet > currentOvCoin) { toast.error("INSUFFICIENT LIQUIDITY"); return; }
    const hadTrapBonus = lastTrapResult === true;
    setIsSpinning(true);
    setIsFakeOut(false);
    setGameResult(null);
    setShowTrap(false);
    setFeedback('PROCESSING DESPAIR...');
    setOvCoin(currentOvCoin - bet);
    increaseCorruption(1);
    addHeat(1);
    incrementSpinsSinceBigWin();
    setTimeout(() => {
      if (!mounted.current) return;
      const luckFactor = (currentLuck - 50) / 50;
      let pSmallWin = 0.42;
      let pBigWin = 0.06;
      let pNearMiss = 0.38;
      let pGlitch = 0.14;
      if (luckFactor > 0) {
        pBigWin += (luckFactor * 0.1);
        pGlitch -= (luckFactor * 0.1);
        if (currentLuck > 80) pNearMiss += 0.1;
      } else if (luckFactor < 0) {
        pGlitch += Math.abs(luckFactor * 0.2);
        pBigWin -= Math.abs(luckFactor * 0.04);
      }
      if (spinsSinceBigWin < 2) {
        pNearMiss += pBigWin;
        pGlitch += 0.05;
        pBigWin = 0;
      }
      const roll = Math.random();
      let outcome: 'small' | 'big' | 'near' | 'glitch' | 'loss' = 'loss';
      if (roll < pBigWin) outcome = 'big';
      else if (roll < pBigWin + pSmallWin) outcome = 'small';
      else if (roll < pBigWin + pSmallWin + pNearMiss) outcome = 'near';
      else if (roll < pBigWin + pSmallWin + pNearMiss + pGlitch) outcome = 'glitch';
      let newReels = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ];
      if (outcome === 'big') {
        newReels = [3, 3, 3];
      } else if (outcome === 'small') {
        const sym = [0, 1, 4][Math.floor(Math.random() * 3)];
        newReels = [sym, sym, sym];
      } else if (outcome === 'near') {
        const sym = Math.floor(Math.random() * SYMBOLS.length);
        newReels = [sym, sym, (sym + 1) % SYMBOLS.length];
      } else if (outcome === 'glitch') {
        newReels = [3, 3, 3];
      }
      // Calculate tension locally to determine timeout
      const targetIsTension = newReels[0] === newReels[1] && newReels[0] !== 2;
      setReels(newReels);
      if (outcome === 'glitch') {
        setIsFakeOut(true);
        setFeedback("JACKPOT!!! UNBELIEVABLE!!");
        setTimeout(() => {
          if (!mounted.current) return;
          setReels([3, 3, 2]);
          setGameResult('loss');
          setIsFakeOut(false);
          setFeedback("FATAL: TRANSACTION_CORRUPT");
          setIsSpinning(false);
          recordLoss();
          adjustLuck(-2);
          addHeat(20);
          recordRegret();
          toast.error("DOPAMINE CRASH", { description: "The house always takes what it 'accidentally' gave." });
        }, 1500);
      } else {
        // Logic Timeout synchronized with SlotReel's 'stop' transition duration
        const stopTimeout = targetIsTension ? 1500 : 800;
        setTimeout(() => {
          if (!mounted.current) return;
          setIsSpinning(false);
          if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
            const mult = PAYOUTS[newReels[0]] || 5;
            const winnings = bet * mult;
            setGameResult('win');
            setFeedback(`OUTLIER DETECTED! +${winnings.toLocaleString()}`);
            setOvCoin(currentOvCoin + winnings);
            resetLosses();
            if (outcome === 'big') resetSpinsSinceBigWin();
            adjustLuck(-10);
            setLastTrapResult(null);
          } else if (newReels[0] === newReels[1]) {
            setGameResult('near-miss');
            setFeedback('SO CLOSE. TRY AGAIN?');
            adjustLuck(1);
            recordLoss();
            recordRegret();
            setLastTrapResult(null);
          } else {
            setGameResult('loss');
            setFeedback('EXPECTED OUTCOME.');
            recordLoss();
            if (hadTrapBonus) recordRegret();
            setLastTrapResult(null);
          }
        }, stopTimeout);
      }
    }, 1200);
  };
  const handleTrap = () => {
    const bonus = Math.floor(Math.random() * 100) + 50;
    toast.success("TRAP SPRUNG", { description: `Intercepted +${bonus} O.V.C. Greed pays... sometimes.` });
    setOvCoin(currentOvCoin + bonus);
    setShowTrap(false);
    adjustLuck(-5);
    setLastTrapResult(true);
  };
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in max-w-2xl mx-auto mb-12">
        <h1 className="text-5xl md:text-7xl font-display font-bold uppercase glitch-text" data-text="The Glitch">The Glitch</h1>
        <p className="mt-4 text-lg text-ov-gray uppercase tracking-widest italic">Our algorithms are fair. Your luck is just substandard.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-8 items-start relative">
        <PsychologicalWhispers trigger={consecutiveLosses} />
        <div className="lg:col-span-2 space-y-8">
          <Card className={cn(
            "bg-black/80 border-2 border-ov-primary/20 transition-all duration-700 relative overflow-hidden",
            isFakeOut && "border-ov-primary shadow-[0_0_100px_rgba(255,0,229,0.4)] scale-[1.02]",
            isTension && "border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          )}>
            <CardContent className="p-8 md:p-12 flex flex-col items-center gap-12 relative z-10">
              <div className="flex justify-center items-center gap-4 md:gap-8 p-8 bg-ov-dark/80 border-4 border-ov-primary/10 rounded-3xl backdrop-blur-xl relative">
                <SlotReel symbols={SYMBOLS} finalIndex={reels[0]} isSpinning={isSpinning} delay={0} />
                <SlotReel symbols={SYMBOLS} finalIndex={reels[1]} isSpinning={isSpinning} delay={0.2} />
                <SlotReel symbols={SYMBOLS} finalIndex={reels[2]} isSpinning={isSpinning} delay={0.4} tension={isTension} isGlitching={isFakeOut} />
                <AnimatePresence>
                  {showTrap && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute -right-4 top-0 z-50"
                    >
                      <Button 
                        onClick={handleTrap} 
                        className="rounded-full w-16 h-16 bg-ov-green border-4 border-black text-black hover:scale-110 shadow-[0_0_20px_rgba(0,255,156,0.8)]"
                      >
                        <ExternalLink />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-20 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={feedback}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
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
        </div>
        <Card className="bg-black/60 border-ov-primary/10 backdrop-blur-md lg:sticky lg:top-32">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.3em] text-ov-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Probabilistic Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end text-[10px] uppercase font-bold">
                <span className="text-ov-gray">Balance</span>
                <span className="text-ov-primary">{currentOvCoin.toLocaleString()}</span>
              </div>
              <div className="relative group">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-ov-green" />
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
          </CardContent>
        </Card>
      </div>
      <div className="mt-16 text-center">
        <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase tracking-[0.5em] text-xs">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> TERMINATE_SIMULATION</Link>
        </Button>
      </div>
    </OVWLayout>
  );
}