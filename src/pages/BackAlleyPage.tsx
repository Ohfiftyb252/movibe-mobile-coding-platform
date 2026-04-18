import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Coins, Skull, AlertTriangle, Flame, HelpCircle } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const Coin = ({ isFlipping, result, heat }: { isFlipping: boolean; result: 'heads' | 'tails' | null; heat: number }) => {
  const [showRealityFlicker, setShowRealityFlicker] = useState(false);
  useEffect(() => {
    if (heat > 75 && !isFlipping) {
      const interval = setInterval(() => {
        if (Math.random() < 0.2) {
          setShowRealityFlicker(true);
          setTimeout(() => setShowRealityFlicker(false), 80);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [heat, isFlipping]);
  return (
    <div className="w-48 h-48 perspective-1000">
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{
          // Use keyframes for a mechanical stutter effect instead of a custom string easing
          rotateY: isFlipping 
            ? [0, 500, 480, 1000, 980, 1500, 1480, 1800] 
            : (result === 'tails' ? 180 : 0),
          scale: isFlipping ? 1.15 : 1
        }}
        transition={{
          duration: isFlipping ? 1.8 : 0.6,
          ease: "easeInOut"
        }}
      >
        {/* Front: HEADS */}
        <div className={cn(
          "absolute w-full h-full backface-hidden flex flex-col items-center justify-center rounded-full border-8 border-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.4)] bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 overflow-hidden",
          showRealityFlicker && "opacity-40 brightness-150"
        )}>
          <div className="coin-shimmer absolute inset-0 pointer-events-none opacity-50" />
          <Skull className="w-20 h-20 text-yellow-900 drop-shadow-lg" />
          <span className="text-2xl font-display font-black text-yellow-900 tracking-tighter mt-1">HEADS</span>
        </div>
        {/* Back: ALSO HEADS (Tails Result) */}
        <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center rounded-full border-8 border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-gradient-to-tr from-neutral-800 via-neutral-900 to-black transform rotate-y-180 melted-border relative overflow-hidden">
          <div className="cracked-surface absolute inset-0 opacity-40" />
          <Skull className="w-20 h-20 text-red-900 warped-sigil" />
          <span className="text-xl font-display font-black text-red-800 tracking-widest mt-1 relative z-10 reality-glitch" data-text="ALSO HEADS">ALSO HEADS</span>
          <div className="absolute top-4 text-[8px] text-red-500/30 uppercase font-black tracking-[0.5em]">RIGGED_PROTOCOL_V4</div>
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
  const recordRegret = usePlayerStore((s) => s.recordRegret);
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [feedback, setFeedback] = useState('TRUST THE COIN.');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const handleFlip = (choice: 'heads' | 'tails', isFixed: boolean = false) => {
    if (isFlipping || !player) return;
    const bet = Number(betAmount);
    if (!bet || bet <= 0) return;
    if (bet > player.ovCoin) {
      toast.error("INSUFFICIENT LIQUIDITY", { description: "You can't even afford to lose." });
      return;
    }
    setIsFlipping(true);
    setGameResult(null);
    setFeedback('MANIPULATING PROBABILITY...');
    increaseCorruption(1);
    addHeat(isFixed ? 30 : 5);
    setTimeout(() => {
      if (!mounted.current) return;
      const winChance = isFixed ? 0.05 : 0.38;
      const playerWins = Math.random() < winChance;
      const flipResult = playerWins ? choice : (choice === 'heads' ? 'tails' : 'heads');
      setCoinResult(flipResult);
      setIsFlipping(false);
      if (playerWins) {
        const mult = isFixed ? 6 : 2;
        const winnings = bet * mult;
        setGameResult('win');
        setFeedback(`STATISTICAL ANOMALY! +${winnings.toLocaleString()}`);
        setOvCoin(player.ovCoin - bet + winnings);
        resetLosses();
      } else {
        setGameResult('loss');
        setFeedback(flipResult === 'tails' ? "HEADS YOU LOSE. ALSO HEADS." : "THE HOUSE FLIPS BOTH WAYS.");
        setOvCoin(player.ovCoin - bet);
        recordLoss();
        recordRegret();
      }
    }, 1900); // Synchronized with 1.8s duration + padding
  };
  const heat = player?.heat ?? 0;
  const isTilted = (player?.consecutiveLosses ?? 0) >= 5;
  return (
    <OVWLayout>
      <div className={cn("text-center animate-fade-in mb-12", gameResult === 'loss' && "shake-sm")}>
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="Back Alley Arena">Back Alley Arena</h1>
        <p className="mt-4 text-ov-gray uppercase tracking-widest text-xs italic">
          {gameResult === 'loss' ? "THE COIN WAS NEVER ON YOUR SIDE." : "FAIR GAMES ARE FOR PEOPLE WITH MONEY TO SPARE."}
        </p>
      </div>
      <Card className={cn(
        "max-w-2xl mx-auto bg-black/50 border-ov-primary/20 p-8 flex flex-col items-center gap-12 transition-all duration-500 relative overflow-hidden",
        gameResult === 'loss' && "border-red-500/50 shadow-[inset_0_0_50px_rgba(220,38,38,0.2)]"
      )}>
        {gameResult === 'loss' && <div className="absolute inset-0 bg-red-950/10 reality-glitch pointer-events-none" />}
        <Coin isFlipping={isFlipping} result={coinResult} heat={heat} />
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={feedback}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-2xl font-display uppercase text-center tracking-tighter",
                gameResult === 'win' ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" :
                gameResult === 'loss' ? "text-red-600 reality-glitch" : "text-ov-primary"
              )}
            >
              {feedback}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase font-bold text-ov-gray px-1">
              <span>Wager Size</span>
              <span>Balance: {(player?.ovCoin ?? 0).toLocaleString()}</span>
            </div>
            <div className="relative">
              <Coins className="absolute left-3 top-3 w-5 h-5 text-ov-green" />
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-ov-dark border-ov-primary/20 text-xl pl-10 font-mono text-ov-green h-12"
                disabled={isFlipping}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              onClick={() => handleFlip('heads')}
              disabled={isFlipping}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-black border-b-4 border-yellow-800 active:border-b-0 h-14 group"
            >
              <Skull className="w-4 h-4 mr-2 group-hover:animate-bounce" /> HEADS
            </Button>
            <Button
              size="lg"
              onClick={() => handleFlip('tails')}
              disabled={isFlipping}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-black border-b-4 border-black active:border-b-0 h-14"
            >
              <HelpCircle className="w-4 h-4 mr-2" /> ALSO HEADS?
            </Button>
          </div>
          {heat > 50 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Button
                variant="destructive"
                size="lg"
                className="w-full h-20 border-2 border-red-500/50 bg-red-950/40 animate-pulse flex flex-col group overflow-hidden"
                onClick={() => handleFlip('heads', true)}
                disabled={isFlipping}
              >
                <div className="flex items-center gap-2 text-red-500 font-black">
                  <Flame className="w-5 h-5 group-hover:animate-bounce" />
                  RIG THE REVEAL
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-[10px] opacity-70 tracking-[0.2em]">6X PAYOUT // HIGH DETECTION RISK</span>
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
      <div className="mt-16 text-center space-y-4">
        {isTilted && (
          <p className="text-red-500 text-xs animate-bounce uppercase font-bold">
            The machine knows you're angry. It likes it.
          </p>
        )}
        <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase tracking-widest text-xs">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> RETREAT TO THE BAR</Link>
        </Button>
      </div>
    </OVWLayout>
  );
}