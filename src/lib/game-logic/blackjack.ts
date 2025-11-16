export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export interface Card {
  suit: Suit;
  rank: Rank;
}
export type Deck = Card[];
export type Hand = Card[];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const createDeck = (): Deck => {
  const deck: Deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};
export const shuffleDeck = (deck: Deck): Deck => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
export const getHandValue = (hand: Hand): number => {
  let value = 0;
  let aceCount = 0;
  for (const card of hand) {
    if (card.rank === 'A') {
      aceCount++;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank, 10);
    }
  }
  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }
  return value;
};
export type GameResult = 'player_blackjack' | 'player_bust' | 'player_win' | 'dealer_bust' | 'dealer_win' | 'push';
export const determineWinner = (playerHand: Hand, dealerHand: Hand): GameResult => {
  const playerValue = getHandValue(playerHand);
  const dealerValue = getHandValue(dealerHand);
  const isPlayerBlackjack = playerValue === 21 && playerHand.length === 2;
  const isDealerBlackjack = dealerValue === 21 && dealerHand.length === 2;
  if (isPlayerBlackjack && !isDealerBlackjack) return 'player_blackjack';
  if (playerValue > 21) return 'player_bust';
  if (dealerValue > 21) return 'dealer_bust';
  if (isPlayerBlackjack && isDealerBlackjack) return 'push';
  if (playerValue > dealerValue) return 'player_win';
  if (dealerValue > playerValue) return 'dealer_win';
  return 'push';
};