import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OVWLayout } from '@/components/OVWLayout';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { toast } from 'sonner';
import { PlayingCard } from '@/components/PlayingCard';
import * as Tonk from '@/lib/game-logic/tonk';
import { shuffleDeck } from '@/lib/game-logic/blackjack';
import { cn } from '@/lib/utils';
type GameStage = 'betting' | 'playing' | 'finished';
export function VulturesNestPage() {
  const player = usePlayerStore((s) => s.player);
  const setOvCoin = usePlayerStore((s) => s.setOvCoin);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [gameStage, setGameStage] = useState<GameStage>('betting');
  const [gameState, setGameState] = useState<Tonk.GameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<Tonk.Card[]>([]);
  const [feedback, setFeedback] = useState("Place your bet to start.");
  const playerState = gameState?.players['player'];
  const opponentState = gameState?.players['opponent'];
  const isPlayerTurn = gameState?.currentPlayerId === 'player';
  const startNewGame = () => {
    if (!player || betAmount <= 0 || betAmount > player.ovCoin) {
      toast.error("Invalid bet.");
      return;
    }
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
  useEffect(() => {
    if (gameState?.currentPlayerId === 'opponent' && gameState.winner === null) {
      const timer = setTimeout(() => {
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
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayerId, gameState?.winner]);
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
  return (
    <OVWLayout>
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase glitch-text" data-text="The Vulture's Nest">The Vulture's Nest</h1>
        <p className="mt-4 text-lg text-ov-gray max-w-xl mx-auto">A game of Tonk. Spread, hit, or get dropped.</p>
      </div>
      <UICard className="mt-8 w-full max-w-6xl mx-auto bg-green-900/30 border-ov-primary/20 animate-slide-up p-4">
        <div className="grid grid-cols-3 gap-4 items-start">
          {/* Left Panel: Opponent & Info */}
          <div className="col-span-1 space-y-4">
            <UICard className="bg-black/30">
              <CardHeader><CardTitle className="text-ov-primary text-center">Opponent</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-center flex-wrap gap-1">
                  {opponentState?.hand.map((_, i) => <PlayingCard key={i} hidden />)}
                </div>
                <div className="mt-4 border-t border-ov-primary/20 pt-4">
                  <h4 className="text-center mb-2">Spreads</h4>
                  <div className="flex flex-col items-center gap-2">
                    {opponentState?.spreads.map((spread, i) => (
                      <div key={i} className="flex -space-x-12">
                        {spread.map((card, j) => <PlayingCard key={j} card={card} />)}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </UICard>
            <UICard className="bg-black/30">
              <CardHeader><CardTitle className="text-ov-primary text-center">Game Info</CardTitle></CardHeader>
              <CardContent className="text-center space-y-2">
                <p>Deck: {gameState?.deck.length || 0} cards</p>
                <p className={cn("font-bold text-xl", isPlayerTurn ? "text-ov-green animate-pulse" : "text-ov-gray")}>
                  {isPlayerTurn ? "YOUR TURN" : "OPPONENT'S TURN"}
                </p>
                <p className="text-lg h-6">{feedback}</p>
              </CardContent>
            </UICard>
          </div>
          {/* Center Panel: Deck & Discard */}
          <div className="col-span-1 flex flex-col items-center justify-start pt-16 space-y-8">
            <div onClick={() => handleDraw('deck')} className="cursor-pointer">
              <PlayingCard hidden />
            </div>
            <div onClick={() => handleDraw('discard')} className="cursor-pointer">
              {gameState?.discardPile && gameState.discardPile.length > 0 ? <PlayingCard card={gameState.discardPile[0]} /> : <div className="w-28 h-40 rounded-lg border-2 border-dashed border-ov-gray/50 flex items-center justify-center text-ov-gray">EMPTY</div>}
            </div>
          </div>
          {/* Right Panel: Player Actions */}
          <div className="col-span-1 space-y-4">
            <UICard className="bg-black/30">
              <CardHeader><CardTitle className="text-ov-primary text-center">Actions</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-2">
                <Button onClick={handleSpread} disabled={!isPlayerTurn || selectedCards.length < 3 || gameState?.turnPhase !== 'play'}>Play Spread</Button>
                <Button onClick={handleDiscard} disabled={!isPlayerTurn || selectedCards.length !== 1 || gameState?.turnPhase !== 'play'} variant="destructive">Discard</Button>
                <Button disabled={!isPlayerTurn || gameState?.turnPhase !== 'play'}>Knock</Button>
              </CardContent>
            </UICard>
          </div>
        </div>
        {/* Player Hand Area */}
        <div className="mt-8 border-t-4 border-ov-primary/50 pt-4">
          <h3 className="text-center text-2xl font-display text-ov-primary mb-4">Your Hand (Value: {playerState ? Tonk.getHandValue(playerState.hand) : 0})</h3>
          <div className="flex justify-center flex-wrap gap-2 min-h-[11rem]">
            {playerState?.hand.map((card, i) => (
              <PlayingCard
                key={`${card.rank}-${card.suit}`}
                card={card}
                onClick={handleCardClick}
                isSelected={selectedCards.some(c => c.rank === card.rank && c.suit === card.suit)}
              />
            ))}
          </div>
          <div className="mt-4">
            <h4 className="text-center mb-2">Your Spreads</h4>
            <div className="flex justify-center gap-4">
              {playerState?.spreads.map((spread, i) => (
                <div key={i} className="flex -space-x-12">
                  {spread.map((card, j) => <PlayingCard key={j} card={card} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </UICard>
      <Button asChild variant="link" className="mt-8 text-ov-primary hover:text-white transition-colors">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to the Dive Bar
        </Link>
      </Button>
    </OVWLayout>
  );
}