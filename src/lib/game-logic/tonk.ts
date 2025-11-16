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
  const newDeck = [...deck];
  for (let i = 0; i < handSize; i++) {
    for (const id of playerIds) {
      players[id].hand.push(newDeck.pop()!);
    }
  }
  return { players, remainingDeck: newDeck };
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
export const findSpreadsInHand = (hand: Hand): { spreads: Spread[], remaining: Hand } => {
  const spreads: Spread[] = [];
  let remainingHand = [...hand];
  const ranks: { [key: string]: Card[] } = {};
  remainingHand.forEach(card => {
    if (!ranks[card.rank]) ranks[card.rank] = [];
    ranks[card.rank].push(card);
  });
  Object.entries(ranks).forEach(([rank, cards]) => {
    if (cards.length >= 3) {
      spreads.push([...cards]);
      remainingHand = remainingHand.filter(rc => rc.rank !== rank);
    }
  });
  return { spreads, remaining: remainingHand };
};
export const computerPlayerTurn = (gameState: GameState, computerId: string): GameState => {
  const computer = gameState.players[computerId];
  if (!computer) return gameState;
  let newDeck = [...gameState.deck];
  let newHand = [...computer.hand];
  let newSpreads = [...computer.spreads];
  let newDiscardPile = [...gameState.discardPile];
  // 1. Draw
  if (newDeck.length > 0) {
    newHand.push(newDeck.pop()!);
  }
  // 2. Play Spreads
  const { spreads: foundSpreads, remaining } = findSpreadsInHand(newHand);
  if (foundSpreads.length > 0) {
    newSpreads = [...newSpreads, ...foundSpreads];
    newHand = remaining;
  }
  // 3. Discard
  if (newHand.length > 0) {
    const sortedHand = [...newHand].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);
    const discard = sortedHand[0];
    newHand = newHand.filter(c => !(c.rank === discard.rank && c.suit === discard.suit));
    newDiscardPile = [discard, ...newDiscardPile];
  }
  return {
    ...gameState,
    deck: newDeck,
    discardPile: newDiscardPile,
    players: {
      ...gameState.players,
      [computerId]: {
        hand: newHand,
        spreads: newSpreads,
      }
    }
  };
};