import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Coins, ShieldAlert } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { PlayingCard } from '@/components/PlayingCard';
import { cn } from '@/lib/utils';
import { createDeck, shuffleDeck, getHandValue, determineWinner, type Deck, type Hand, type GameResult } from '@/lib/game-logic/blackjack';
type GameState = 'betting' | 'playing' | 'dealer_turn' | 'finished';
export function CryptoCarnivalPage() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const increaseCorruption = usePlayerStore((s) => s.increaseCorruption);
  const adjustLuck = usePlayerStore((s) => s.adjustLuck);
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [deck, setDeck] = useState<Deck>([]);
  const [playerHand, setPlayerHand] = useState<Hand>([]);
  const [dealerHand, setDealerHand] = useState<Hand>([]);
  const [feedback, setFeedback] = useState('Deposit O.V. for liquidity.');
  const [isRugPull, setIsRugPull] = useState(false);
  const playerValue = getHandValue(playerHand);
  const dealerValue = getHandValue(dealerHand);
  const startNewHand = () => {
    if (!player || !betAmount || betAmount <= 0) return;
    setIsRugPull(false);
    increaseCorruption(2);
    // Deduct bet immediately
    setOvCoin(player.ovCoin - Number(betAmount));
    const d = shuffleDeck(createDeck());
    if ((player.luck ?? 50) > 70 && Math.random() < 0.3) {
      const highCardIndex = d.findIndex(c => ['10', 'J', 'Q', 'K', 'A'].includes(c.rank));
      if (highCardIndex > -1) [d[d.length - 1], d[highCardIndex]] = [d[highCardIndex], d[d.length - 1]];
    }
    const initialPlayerHand = [d.pop()!, d.pop()!];
    const initialDealerHand = [d.pop()!, d.pop()!];
    setPlayerHand(initialPlayerHand);
    setDealerHand(initialDealerHand);
    setDeck(d);
    setGameState('playing');
    setFeedback('YOUR TURN. HODL OR SELL?');
    if (getHandValue(initialPlayerHand) === 21) {
      endHand('player_blackjack', initialPlayerHand, initialDealerHand);
    }
  };
  const endHand = (result: GameResult, pHand: Hand, dHand: Hand) => {
    if (!mounted.current) return;
    setGameState('finished');
    const bet = Number(betAmount);
    const freshPlayer = usePlayerStore.getState().player;
    if (!freshPlayer) return;
    const rugPullChance = 0.05 + ((100 - (freshPlayer.luck ?? 50)) / 500);
    const isActuallyWinning = ['player_win', 'player_blackjack', 'dealer_bust'].includes(result);
    const rugTriggered = isActuallyWinning && Math.random() < rugPullChance;
    if (rugTriggered) {
      setIsRugPull(true);
      setFeedback("RUG PULL! LIQUIDITY DRAINED");
      // Already deducted bet, now drain more
      setOvCoin(freshPlayer.ovCoin - 50);
      adjustLuck(-5);
      recordLoss();
      toast.error("RUG PULL ALERT!", { description: "Your profits were liquidated for 'Gas Fees'." });
      return;
    }
    const base = freshPlayer.ovCoin;
    switch (result) {
      case 'player_blackjack':
        setFeedback(`MOONED! +${(bet * 2.5).toLocaleString()}`);
        setOvCoin(base + bet * 2.5); // Return original stake + 1.5 profit
        resetLosses();
        adjustLuck(2);
        break;
      case 'player_win':
      case 'dealer_bust':
        setFeedback(`PROFIT SECURED! +${(bet * 2).toLocaleString()}`);
        setOvCoin(base + bet * 2); // Return original stake + profit
        resetLosses();
        adjustLuck(1);
        break;
      case 'push':
        setFeedback('FLAT LINE. STAKE RETURNED.');
        setOvCoin(base + bet); // Return original stake
        break;
      case 'player_bust':
      case 'dealer_win':
      default:
        setFeedback(`LIQUIDATED! -${bet.toLocaleString()}`);
        // Bet already deducted, nothing to add back
        recordLoss();
        adjustLuck(-1);
        break;
    }
  };
  const handleHit = () => {
    if (gameState !== 'playing' || !deck.length) return;
    const nCard = deck.pop()!;
    const nHand = [...playerHand, nCard];
    setPlayerHand(nHand);
    setDeck([...deck]);
    if (getHandValue(nHand) > 21) endHand('player_bust', nHand, dealerHand);
  };
  const handleStand = () => {
    if (gameState !== 'playing') return;
    setGameState('dealer_turn');
    let cDealer = [...dealerHand];
    let cDeck = [...deck];
    const play = () => {
      if (!mounted.current) return;
      if (getHandValue(cDealer) < 17) {
        cDealer.push(cDeck.pop()!);
        setDealerHand([...cDealer]);
        setDeck([...cDeck]);
        setTimeout(play, 600);
      } else {
        endHand(determineWinner(playerHand, cDealer), playerHand, cDealer);
      }
    };
    setTimeout(play, 600);
  };
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in mb-8">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="Crypto Carnival">Crypto Carnival</h1>
        <p className="mt-4 text-ov-gray uppercase text-sm tracking-widest">High Stakes. Low Liquidity. No Exit Strategy.</p>
      </div>
      <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        <Card className="lg:col-span-3 bg-green-950/20 border-ov-green/20 relative overflow-hidden">
          {isRugPull && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none z-10" />}
          <CardContent className="p-8 flex flex-col gap-12">
            <div className="space-y-4">
              <h3 className="text-center text-xs uppercase text-ov-gray tracking-tighter">Whale Wallet ({gameState === 'playing' ? '?' : dealerValue})</h3>
              <div className="flex justify-center gap-4 min-h-[160px]">
                {dealerHand.map((c, i) => <PlayingCard key={i} card={c} hidden={i === 1 && gameState === 'playing'} delay={i * 0.1} />)}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-center text-xs uppercase text-ov-primary tracking-tighter">Your Portfolio ({playerValue})</h3>
              <div className="flex justify-center gap-4 min-h-[160px]">
                {playerHand.map((c, i) => <PlayingCard key={i} card={c} delay={i * 0.1} />)}
              </div>
            </div>
            <div className="text-center h-8">
              <AnimatePresence mode="wait">
                <motion.p key={feedback} className={cn("text-2xl font-display uppercase", isRugPull ? "text-red-500 animate-bounce" : "text-ov-green")}>
                  {feedback}
                </motion.p>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-ov-primary/10 flex flex-col">
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-ov-primary">Market Terminal</CardTitle></CardHeader>
          <CardContent className="flex-1 space-y-6">
            {gameState === 'betting' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-ov-gray">Stake Amount</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-3 w-4 h-4 text-ov-green" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full bg-ov-dark/50 border border-ov-primary/20 rounded-md p-2 pl-10 text-ov-foreground outline-none focus:border-ov-primary transition-colors"
                    />
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={startNewHand}>OPEN POSITION</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {gameState === 'playing' ? (
                  <>
                    <Button size="lg" className="w-full bg-ov-green text-black hover:bg-ov-green/80" onClick={handleHit}>BUY DIP (HIT)</Button>
                    <Button size="lg" variant="outline" className="w-full border-red-500/50 text-red-500" onClick={handleStand}>SELL (STAND)</Button>
                  </>
                ) : (
                  <Button size="lg" className="w-full" onClick={() => { setGameState('betting'); setPlayerHand([]); setDealerHand([]); setIsRugPull(false); }}>NEW ROUND</Button>
                )}
              </div>
            )}
            <div className="pt-6 border-t border-ov-primary/5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-ov-gray uppercase">Market Volatility</span>
                <span className="text-red-400 font-bold">EXTREME</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-ov-gray uppercase">Rug Risk</span>
                <span className="text-orange-400">{( (100 - (player?.luck ?? 50)) / 10 ).toFixed(1)}%</span>
              </div>
              {isRugPull && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded flex items-center gap-2 text-[10px] text-red-200 uppercase">
                  <ShieldAlert className="w-4 h-4" /> SCAM DETECTED
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-12 text-center">
        <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> RETREAT</Link>
        </Button>
      </div>
    </OVWLayout>
  );
}