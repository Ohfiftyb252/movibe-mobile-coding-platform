import { type Card, type Deck, createDeck as createBlackjackDeck, shuffleDeck } from './blackjack';
export type { Card, Deck };
export type Hand = Card[];
export type Spread = Card[]; // A set or a run
export interface PlayerState {
  hand: Hand;
  spreads: Spread[];
}
export interface GameState {
  deck: Deck;
  discardPile: Card[];
  players: {
    [id: string]: PlayerState;
  };
  currentPlayerId: string;
  turnPhase: 'draw' | 'play' | 'discard';
  winner: string | null;
  knockedPlayerId: string | null;
  lastTurnPlayerId: string | null;
}
export const RANK_VALUES: { [key: string]: number } = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10
};
export const createTonkDeck = (): Deck => createBlackjackDeck();
export const getHandValue = (hand: Hand): number => {
  return hand.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0);
};
export const dealHands = (deck: Deck, playerIds: string[], handSize: number = 5): { players: { [id: string]: PlayerState }, remainingDeck: Deck } => {
  const players: { [id: string]: PlayerState } = {};
  playerIds.forEach(id => {
    players[id] = { hand: [], spreads: [] };
  });
  for (let i = 0; i < handSize; i++) {
    for (const id of playerIds) {
      players[id].hand.push(deck.pop()!);
    }
  }
  return { players, remainingDeck: deck };
};
export const isSet = (cards: Card[]): boolean => {
  if (cards.length < 3) return false;
  const firstRank = cards[0].rank;
  return cards.every(card => card.rank === firstRank);
};
export const isRun = (cards: Card[]): boolean => {
  if (cards.length < 3) return false;
  const firstSuit = cards[0].suit;
  if (!cards.every(card => card.suit === firstSuit)) return false;
  const sortedRanks = cards.map(c => RANK_VALUES[c.rank]).sort((a, b) => a - b);
  for (let i = 0; i < sortedRanks.length - 1; i++) {
    if (sortedRanks[i+1] !== sortedRanks[i] + 1) return false;
  }
  return true;
};
export const isValidSpread = (cards: Card[]): boolean => {
  return isSet(cards) || isRun(cards);
};
export const findSpreadsInHand = (hand: Hand): Spread[] => {
  const spreads: Spread[] = [];
  const remainingHand = [...hand];
  // Find sets
  const ranks: { [key: string]: Card[] } = {};
  remainingHand.forEach(card => {
    if (!ranks[card.rank]) ranks[card.rank] = [];
    ranks[card.rank].push(card);
  });
  Object.values(ranks).forEach(cards => {
    if (cards.length >= 3) {
      spreads.push(cards);
      cards.forEach(c => {
        const index = remainingHand.findIndex(rc => rc.rank === c.rank && rc.suit === c.suit);
        if (index > -1) remainingHand.splice(index, 1);
      });
    }
  });
  // This is a simplified version. A full implementation would check for runs, which is more complex.
  // For this game, we'll stick to sets for AI simplicity.
  return spreads;
};
export const canHitSpread = (card: Card, spread: Spread): boolean => {
  if (isSet(spread)) {
    return card.rank === spread[0].rank;
  }
  if (isRun(spread)) {
    if (card.suit !== spread[0].suit) return false;
    const spreadValues = spread.map(c => RANK_VALUES[c.rank]).sort((a, b) => a - b);
    const cardValue = RANK_VALUES[card.rank];
    return cardValue === spreadValues[0] - 1 || cardValue === spreadValues[spreadValues.length - 1] + 1;
  }
  return false;
};
export const computerPlayerTurn = (gameState: GameState, computerId: string): GameState => {
  let newState = { ...gameState };
  const computer = newState.players[computerId];
  // 1. Draw
  if (newState.deck.length > 0) {
    computer.hand.push(newState.deck.pop()!);
  }
  // 2. Play Spreads
  const newSpreads = findSpreadsInHand(computer.hand);
  if (newSpreads.length > 0) {
    newSpreads.forEach(spread => {
      computer.spreads.push(spread);
      spread.forEach(card => {
        const index = computer.hand.findIndex(c => c.rank === card.rank && c.suit === card.suit);
        if (index > -1) computer.hand.splice(index, 1);
      });
    });
  }
  // 3. Discard
  if (computer.hand.length > 0) {
    // Discard highest value card
    computer.hand.sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
    const discard = computer.hand.shift()!;
    newState.discardPile.unshift(discard);
  }
  return newState;
};