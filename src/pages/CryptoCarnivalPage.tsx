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
import { PlayingCard } from '@/components/PlayingCard';
import { createDeck, shuffleDeck, getHandValue, determineWinner, type Deck, type Hand, type GameResult } from '@/lib/game-logic/blackjack';
type GameState = 'betting' | 'playing' | 'dealer_turn' | 'finished';
export function CryptoCarnivalPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const [betAmount, setBetAmount] = useState<number | ''>(10);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [deck, setDeck] = useState<Deck>([]);
  const [playerHand, setPlayerHand] = useState<Hand>([]);
  const [dealerHand, setDealerHand] = useState<Hand>([]);
  const [feedback, setFeedback] = useState('Place your bet to start the hand.');
  const playerValue = getHandValue(playerHand);
  const dealerValue = getHandValue(dealerHand);
  const startNewHand = () => {
    if (!player || !betAmount || betAmount <= 0) {
      toast.error("Invalid bet amount.");
      return;
    }
    if (betAmount > player.ovCoin) {
      toast.error("You don't have enough O.V. Coin.");
      return;
    }
    const newDeck = shuffleDeck(createDeck());
    const initialPlayerHand = [newDeck.pop()!, newDeck.pop()!];
    const initialDealerHand = [newDeck.pop()!, newDeck.pop()!];
    setPlayerHand(initialPlayerHand);
    setDealerHand(initialDealerHand);
    setDeck(newDeck);
    setGameState('playing');
    setFeedback('Your turn. Hit or Stand?');
    const result = determineWinner(initialPlayerHand, initialDealerHand);
    if (result === 'player_blackjack') {
      endHand(result, initialPlayerHand, initialDealerHand);
    }
  };
  const handleHit = () => {
    if (gameState !== 'playing' || !deck.length) return;
    const newCard = deck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck([...deck]);
    if (getHandValue(newHand) > 21) {
      endHand('player_bust', newHand, dealerHand);
    }
  };
  const handleStand = () => {
    if (gameState !== 'playing') return;
    setGameState('dealer_turn');
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    const dealerPlay = () => {
      if (getHandValue(currentDealerHand) < 17) {
        const newCard = currentDeck.pop()!;
        currentDealerHand.push(newCard);
        setDealerHand([...currentDealerHand]);
        setDeck([...currentDeck]);
        setTimeout(dealerPlay, 600);
      } else {
        endHand(determineWinner(playerHand, currentDealerHand), playerHand, currentDealerHand);
      }
    };
    setTimeout(dealerPlay, 600);
  };
  const endHand = (result: GameResult, finalPlayerHand: Hand, finalDealerHand: Hand) => {
    setGameState('finished');
    const bet = Number(betAmount);
    if (!player) return;
    const balanceBeforeWinnings = player.ovCoin - bet;
    switch (result) {
      case 'player_blackjack':
        setFeedback(`Blackjack! You win ${(bet * 2.5).toLocaleString()}!`);
        setOvCoin(balanceBeforeWinnings + bet * 2.5);
        resetLosses();
        break;
      case 'player_win':
      case 'dealer_bust':
        setFeedback(`You win ${(bet * 2).toLocaleString()}!`);
        setOvCoin(balanceBeforeWinnings + bet * 2);
        resetLosses();
        break;
      case 'push':
        setFeedback('Push. Your bet is returned.');
        setOvCoin(balanceBeforeWinnings + bet);
        break;
      case 'player_bust':
        setFeedback(`Bust! You lose ${bet.toLocaleString()}.`);
        setOvCoin(balanceBeforeWinnings);
        recordLoss();
        break;
      case 'dealer_win':
      default:
        setFeedback(`You lose ${bet.toLocaleString()}.`);
        setOvCoin(balanceBeforeWinnings);
        recordLoss();
        break;
    }
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
  const handleDeal = () => {
    if (!player || !betAmount || betAmount <= 0) {
      toast.error("Invalid bet amount.");
      return;
    }
    if (betAmount > player.ovCoin) {
      toast.error("You don't have enough O.V. Coin.");
      return;
    }
    setOvCoin(player.ovCoin - Number(betAmount));
    startNewHand();
  }
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Crypto Carnival">
          The Crypto Carnival
        </h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">
          The dealer hits on 16, stands on 17. Blackjack pays 3 to 2. Good luck, you'll need it.
        </p>
      </div>
      <Card className="mt-8 max-w-4xl mx-auto bg-green-900/30 border-ov-primary/20 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-center text-ov-primary font-display uppercase tracking-widest">
            Blackjack
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <div className="w-full">
            <h3 className="text-center text-xl mb-4">Dealer's Hand ({gameState === 'dealer_turn' || gameState === 'finished' ? dealerValue : '?'})</h3>
            <div className="flex justify-center items-center gap-4 min-h-[10rem]">
              {dealerHand.map((card, i) => (
                <PlayingCard key={i} card={card} hidden={i === 1 && gameState === 'playing'} delay={i * 0.2} />
              ))}
            </div>
          </div>
          <div className="w-full">
            <h3 className="text-center text-xl mb-4">Your Hand ({playerValue})</h3>
            <div className="flex justify-center items-center gap-4 min-h-[10rem]">
              {playerHand.map((card, i) => (
                <PlayingCard key={i} card={card} delay={i * 0.2} />
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl text-center font-bold font-display uppercase h-12"
            >
              {feedback}
            </motion.div>
          </AnimatePresence>
          <div className="w-full max-w-sm space-y-4">
            {gameState === 'betting' && (
              <>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-ov-green" />
                  <Input type="number" value={betAmount} onChange={handleBetChange} className="text-center text-lg bg-ov-dark border-ov-primary/30" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" onClick={() => setQuickBet(10)}>10</Button>
                    <Button variant="outline" onClick={() => setQuickBet(50)}>50</Button>
                    <Button variant="outline" onClick={() => setQuickBet(100)}>100</Button>
                    <Button variant="destructive" onClick={() => setQuickBet('all')}>All In</Button>
                </div>
                <Button size="lg" onClick={handleDeal} className="w-full">Deal Cards</Button>
              </>
            )}
            {gameState === 'playing' && (
              <div className="grid grid-cols-2 gap-4">
                <Button size="lg" onClick={handleHit}>Hit</Button>
                <Button size="lg" onClick={handleStand} variant="outline">Stand</Button>
              </div>
            )}
            {gameState === 'finished' && (
              <Button size="lg" onClick={() => {
                setGameState('betting');
                setPlayerHand([]);
                setDealerHand([]);
                setFeedback('Place your bet to start the hand.');
              }} className="w-full">New Hand</Button>
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