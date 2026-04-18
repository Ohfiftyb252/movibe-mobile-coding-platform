import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Skull } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { PlayingCard } from '@/components/PlayingCard';
import * as Tonk from '@/lib/game-logic/tonk';
import { shuffleDeck } from '@/lib/game-logic/blackjack';
import { cn } from '@/lib/utils';
type GameStage = 'betting' | 'playing' | 'finished';
export function VulturesNestPage() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const recordLoss = usePlayerStore((s) => s.recordLoss);
  const resetLosses = usePlayerStore((s) => s.resetLosses);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [gameStage, setGameStage] = useState<GameStage>('betting');
  const [gameState, setGameState] = useState<Tonk.GameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<Tonk.Card[]>([]);
  const [feedback, setFeedback] = useState("Place your bet to start.");
  const playerState = gameState?.players['player'];
  const opponentState = gameState?.players['opponent'];
  const isPlayerTurn = gameState?.currentPlayerId === 'player';
  const startNewGame = () => {
    if (!player || betAmount <= 0) {
      toast.error("Invalid bet.");
      return;
    }
    // Deduct bet immediately
    setOvCoin(player.ovCoin - betAmount);
    const deck = shuffleDeck(Tonk.createTonkDeck());
    const { players, remainingDeck } = Tonk.dealHands(deck, ['player', 'opponent']);
    const discardPile = [remainingDeck.pop()!];
    setGameState({
      deck: remainingDeck,
      discardPile,
      players,
      currentPlayerId: 'player',
      turnPhase: 'draw',
      winner: null,
      knockedPlayerId: null,
      lastTurnPlayerId: null,
    });
    setGameStage('playing');
    setFeedback("Your turn. Draw a card.");
  };
  const handleCardClick = (card: Tonk.Card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.rank === card.rank && c.suit === card.suit);
      if (isSelected) {
        return prev.filter(c => !(c.rank === card.rank && c.suit === card.suit));
      } else {
        return [...prev, card];
      }
    });
  };
  const handleDraw = (source: 'deck' | 'discard') => {
    if (!isPlayerTurn || gameState?.turnPhase !== 'draw') return;
    setGameState(prev => {
      if (!prev) return null;
      const newPlayerState = { ...prev.players['player'] };
      let newDeck = [...prev.deck];
      let newDiscardPile = [...prev.discardPile];
      if (source === 'deck' && newDeck.length > 0) {
        newPlayerState.hand.push(newDeck.pop()!);
      } else if (source === 'discard' && newDiscardPile.length > 0) {
        newPlayerState.hand.push(newDiscardPile.shift()!);
      } else {
        return prev;
      }
      return { ...prev, deck: newDeck, discardPile: newDiscardPile, players: { ...prev.players, player: newPlayerState }, turnPhase: 'play' };
    });
    setFeedback("Play spreads or discard.");
  };
  const handleSpread = () => {
    if (!isPlayerTurn || !playerState || selectedCards.length < 3 || gameState?.turnPhase !== 'play') return;
    if (Tonk.isValidSpread(selectedCards)) {
      setGameState(prev => {
        if (!prev) return null;
        const newPlayerState = { ...prev.players['player'] };
        newPlayerState.spreads.push([...selectedCards]);
        newPlayerState.hand = newPlayerState.hand.filter(
          handCard => !selectedCards.some(selCard => selCard.rank === handCard.rank && selCard.suit === handCard.suit)
        );
        return { ...prev, players: { ...prev.players, player: newPlayerState } };
      });
      setSelectedCards([]);
      toast.success("Spread played!");
    } else {
      toast.error("Invalid spread.");
    }
  };
  const handleDiscard = () => {
    if (!isPlayerTurn || selectedCards.length !== 1 || gameState?.turnPhase !== 'play') return;
    const cardToDiscard = selectedCards[0];
    setGameState(prev => {
      if (!prev) return null;
      const newPlayerState = { ...prev.players['player'] };
      newPlayerState.hand = newPlayerState.hand.filter(c => !(c.rank === cardToDiscard.rank && c.suit === cardToDiscard.suit));
      const newDiscardPile = [cardToDiscard, ...prev.discardPile];
      return { ...prev, players: { ...prev.players, player: newPlayerState }, discardPile: newDiscardPile, currentPlayerId: 'opponent', turnPhase: 'draw' };
    });
    setSelectedCards([]);
    setFeedback("Opponent's turn.");
  };
  const handleKnock = () => {
    if (!isPlayerTurn || !gameState || !playerState || !opponentState || gameState.turnPhase !== 'play') return;
    const pVal = Tonk.getHandValue(playerState.hand);
    const oVal = Tonk.getHandValue(opponentState.hand);
    const freshPlayer = usePlayerStore.getState().player;
    if (!freshPlayer) return;
    setGameStage('finished');
    if (pVal < oVal) {
      setGameState(prev => prev ? { ...prev, winner: 'player' } : null);
      setOvCoin(freshPlayer.ovCoin + (betAmount * 2));
      resetLosses();
      toast.success("KNOCK SUCCESS! You win.");
    } else {
      setGameState(prev => prev ? { ...prev, winner: 'opponent' } : null);
      // Bet already deducted, nothing to add
      recordLoss();
      toast.error("KNOCK FAILED! House wins.");
    }
  };
  useEffect(() => {
    if (gameState?.currentPlayerId === 'opponent' && gameState.winner === null) {
      const timer = setTimeout(() => {
        if (!mounted.current) return;
        setGameState(prev => {
          if (!prev) return null;
          let newState = Tonk.computerPlayerTurn(prev, 'opponent');
          if (newState.players.opponent.hand.length === 0) {
            newState.winner = 'opponent';
          } else {
            newState.currentPlayerId = 'player';
            newState.turnPhase = 'draw';
          }
          return newState;
        });
        setFeedback("Your turn. Draw a card.");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayerId, gameState?.winner]);
  useEffect(() => {
    if (gameState?.winner && gameStage === 'playing') {
      const freshPlayer = usePlayerStore.getState().player;
      if (!freshPlayer) return;
      setGameStage('finished');
      if (gameState.winner === 'opponent') {
        recordLoss();
      } else {
        setOvCoin(freshPlayer.ovCoin + (betAmount * 2));
        resetLosses();
      }
    }
  }, [gameState?.winner, gameStage, betAmount]);
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in mb-8">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Vulture's Nest">The Vulture's Nest</h1>
        <p className="mt-4 text-lg text-ov-gray">The house doesn't just play Tonk. It lives it.</p>
      </div>
      <UICard className="w-full max-w-6xl mx-auto bg-green-900/10 border-ov-primary/20 p-4">
        {gameStage === 'betting' ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <h2 className="text-2xl font-display text-ov-primary uppercase">Anty Up</h2>
            <div className="flex gap-4">
              {[10, 50, 100, 500].map(amt => (
                <Button key={amt} variant={betAmount === amt ? 'default' : 'outline'} onClick={() => setBetAmount(amt)} className="w-20">
                  {amt}
                </Button>
              ))}
            </div>
            <Button size="lg" onClick={startNewGame} className="w-full max-w-xs">DEAL IN</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <UICard className="bg-black/40 border-ov-primary/10">
                <CardHeader className="py-2"><CardTitle className="text-xs uppercase text-center text-ov-gray tracking-tighter">Opponent</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                   <div className="flex justify-center flex-wrap gap-1">
                      {opponentState?.hand.map((_, i) => <div key={i} className="w-8 h-12 bg-blue-950 border border-blue-400/30 rounded" />)}
                   </div>
                   <div className="w-full border-t border-ov-primary/5 pt-2">
                     <p className="text-[10px] uppercase text-ov-gray mb-1 text-center">Spreads</p>
                     <div className="flex flex-col gap-1">
                        {opponentState?.spreads.map((s, i) => (
                          <div key={i} className="flex -space-x-8 scale-75 origin-top">
                            {s.map((c, j) => <PlayingCard key={j} card={c} />)}
                          </div>
                        ))}
                     </div>
                   </div>
                </CardContent>
              </UICard>
              <UICard className="bg-black/40 border-ov-primary/10">
                <CardHeader className="py-2"><CardTitle className="text-xs uppercase text-center text-ov-gray tracking-tighter">Dealer Log</CardTitle></CardHeader>
                <CardContent className="text-center p-2">
                  <p className={cn("text-lg uppercase", isPlayerTurn ? "text-ov-green" : "text-ov-gray")}>
                    {isPlayerTurn ? ">> USER TURN" : ">> VULTURE TURN"}
                  </p>
                  <p className="text-xs text-ov-primary mt-2 uppercase tracking-tighter h-10">{feedback}</p>
                </CardContent>
              </UICard>
            </div>
            <div className="lg:col-span-2 flex flex-col items-center justify-start gap-12 py-8">
              <div className="flex gap-8">
                <div onClick={() => handleDraw('deck')} className={cn("cursor-pointer transition-transform hover:scale-105", !isPlayerTurn && "opacity-50 cursor-not-allowed")}>
                   <div className="w-24 h-36 md:w-28 md:h-40 bg-blue-700 border-4 border-white/10 rounded-lg flex items-center justify-center text-white/50 font-bold">DECK</div>
                </div>
                <div onClick={() => handleDraw('discard')} className={cn("cursor-pointer transition-transform hover:scale-105", !isPlayerTurn && "opacity-50 cursor-not-allowed")}>
                   {gameState?.discardPile && gameState.discardPile.length > 0 ? (
                     <PlayingCard card={gameState.discardPile[0]} />
                   ) : (
                     <div className="w-24 h-36 md:w-28 md:h-40 border-2 border-dashed border-ov-gray/20 rounded-lg flex items-center justify-center text-ov-gray text-[10px] uppercase">Discard</div>
                   )}
                </div>
              </div>
              <div className="w-full border-t border-ov-primary/10 pt-4">
                 <p className="text-center text-xs uppercase text-ov-gray mb-4">Your Portfolio (Value: {playerState ? Tonk.getHandValue(playerState.hand) : 0})</p>
                 <div className="flex justify-center flex-wrap gap-2">
                   {playerState?.hand.map((card, i) => (
                     <PlayingCard
                        key={`${card.rank}-${card.suit}`}
                        card={card}
                        onClick={handleCardClick}
                        isSelected={selectedCards.some(c => c.rank === card.rank && c.suit === card.suit)}
                     />
                   ))}
                 </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-4">
              <UICard className="bg-black/40 border-ov-primary/10">
                <CardHeader className="py-2"><CardTitle className="text-xs uppercase text-center text-ov-gray tracking-tighter">Table Actions</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-2">
                   <Button size="sm" onClick={handleSpread} disabled={!isPlayerTurn || selectedCards.length < 3 || gameState?.turnPhase !== 'play'}>Play Spread</Button>
                   <Button size="sm" onClick={handleDiscard} disabled={!isPlayerTurn || selectedCards.length !== 1 || gameState?.turnPhase !== 'play'} variant="secondary">Discard</Button>
                   <Button size="sm" onClick={handleKnock} disabled={!isPlayerTurn || gameState?.turnPhase !== 'play'} variant="destructive">Knock</Button>
                </CardContent>
              </UICard>
              {gameStage === 'finished' && (
                <div className="animate-fade-in flex flex-col items-center gap-4 bg-black/60 p-4 rounded-lg border border-ov-primary/30">
                  {gameState?.winner === 'player' ? (
                    <div className="text-ov-green flex flex-col items-center gap-2">
                      <Trophy className="w-12 h-12" />
                      <p className="text-2xl font-display uppercase tracking-widest">SUCCESS</p>
                      <p className="text-xs">+{betAmount} O.V.C</p>
                    </div>
                  ) : (
                    <div className="text-red-500 flex flex-col items-center gap-2">
                      <Skull className="w-12 h-12" />
                      <p className="text-2xl font-display uppercase tracking-widest">WASHED</p>
                      <p className="text-xs">-{betAmount} O.V.C</p>
                    </div>
                  )}
                  <Button onClick={() => setGameStage('betting')} className="w-full uppercase">New Hand</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </UICard>
      <div className="mt-8 text-center">
        <Button asChild variant="link" className="text-ov-primary hover:text-white uppercase"><Link to="/">Exit Nest</Link></Button>
      </div>
    </OVWLayout>
  );
}