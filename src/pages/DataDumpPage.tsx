import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, Eye } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dice } from '@/components/Dice';
type CeeLoResult = { outcome: 'win' | 'loss' | 'point' | 'reroll'; value: number; message: string; };
function getCeeLoResult(dice: [number, number, number]): CeeLoResult {
  const sorted = [...dice].sort();
  const [d1, d2, d3] = sorted;
  if (d1 === 4 && d2 === 5 && d3 === 6) return { outcome: 'win', value: 100, message: '4-5-6! WIN!' };
  if (d1 === d2 && d2 === d3) return d1 === 1 ? { outcome: 'loss', value: 0, message: 'TRIPS 1s! LOSS!' } : { outcome: 'win', value: d1, message: `TRIPS ${d1}s!` };
  if (d1 === 1 && d2 === 2 && d3 === 3) return { outcome: 'loss', value: 0, message: '1-2-3! LOSS!' };
  if (d1 === d2) return { outcome: 'point', value: d3, message: `POINT: ${d3}` };
  if (d2 === d3) return { outcome: 'point', value: d1, message: `POINT: ${d1}` };
  return { outcome: 'reroll', value: 0, message: 'REROLL...' };
}
export function DataDumpPage() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const increaseCorruption = usePlayerStore((s) => s.increaseCorruption);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [isRolling, setIsRolling] = useState(false);
  const [dice, setDice] = useState<[number, number, number]>([1, 1, 1]);
  const [feedback, setFeedback] = useState('Bones ready.');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const rollDice = (): [number, number, number] => [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ] as [number, number, number];
  const handleRoll = () => {
    if (isRolling || !player) return;
    const bet = Number(betAmount);
    if (!bet || bet <= 0) return;
    setIsRolling(true);
    setGameResult(null);
    setFeedback('PLAYER ROLLING...');
    increaseCorruption(2);
    setTimeout(() => {
      if (!mounted.current) return;
      let pRoll = rollDice();
      let pRes = getCeeLoResult(pRoll);
      while (pRes.outcome === 'reroll') { pRoll = rollDice(); pRes = getCeeLoResult(pRoll); }
      setDice(pRoll);
      setFeedback(pRes.message);
      if (pRes.outcome === 'win') {
        setGameResult('win'); setOvCoin(player.ovCoin + bet); resetLosses(); setIsRolling(false);
      } else if (pRes.outcome === 'loss') {
        setGameResult('loss'); setOvCoin(player.ovCoin - bet); recordLoss(); setIsRolling(false);
      } else {
        setFeedback(`${pRes.message}. HOUSE ROLLING...`);
        setTimeout(() => {
          if (!mounted.current) return;
          let hRoll = rollDice();
          let hRes = getCeeLoResult(hRoll);
          const houseAggression = (player.corruption / 20);
          for(let i=0; i<houseAggression; i++) {
            if (hRes.outcome === 'reroll' || (hRes.outcome === 'point' && hRes.value < pRes.value)) {
              hRoll = rollDice(); hRes = getCeeLoResult(hRoll);
            }
          }
          setDice(hRoll);
          if (hRes.outcome === 'win' || (hRes.outcome === 'point' && hRes.value > pRes.value)) {
            setGameResult('loss'); setFeedback(`HOUSE: ${hRes.message}. LOSS.`); setOvCoin(player.ovCoin - bet); recordLoss();
          } else {
            setGameResult('win'); setFeedback(`HOUSE: ${hRes.message}. WIN!`); setOvCoin(player.ovCoin + bet); resetLosses();
          }
          setIsRolling(false);
        }, 1500);
      }
    }, 1200);
  };
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in mb-8">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="Data Dump">Data Dump</h1>
        <p className="mt-4 text-ov-gray uppercase text-sm tracking-widest italic">The street finds its own uses for things. Like your money.</p>
      </div>
      <Card className="max-w-2xl mx-auto bg-black/60 border-ov-primary/20 p-8 flex flex-col items-center gap-8">
        <div className="flex gap-4 md:gap-8 min-h-[120px]">
          <Dice value={dice[0]} isRolling={isRolling} delay={0} />
          <Dice value={dice[1]} isRolling={isRolling} delay={0.1} />
          <Dice value={dice[2]} isRolling={isRolling} delay={0.2} />
        </div>
        <div className="h-8 text-center">
          <AnimatePresence mode="wait">
            <motion.p key={feedback} className={cn("text-2xl font-display uppercase", gameResult === 'win' ? "text-ov-green" : "text-red-500")}>
              {feedback}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <div className="relative">
            <Coins className="absolute left-3 top-3 w-5 h-5 text-ov-green" />
            <Input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="pl-10 text-xl" />
          </div>
          <Button size="lg" className="w-full h-16 uppercase" onClick={handleRoll} disabled={isRolling}>Throw Bones</Button>
          {player && player.luck > 80 && (
            <div className="p-3 bg-ov-primary/5 border border-ov-primary/20 rounded-lg flex items-center gap-3">
              <Eye className="w-5 h-5 text-ov-primary" />
              <div className="text-[10px] uppercase text-ov-primary/80 leading-tight">
                <span className="font-bold">Leaked Intel:</span> The house is currently using weighted algorithms. Roll with caution.
              </div>
            </div>
          )}
        </div>
      </Card>
      <div className="mt-12 text-center">
        <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> GTFO</Link>
        </Button>
      </div>
    </OVWLayout>
  );
}