import { IndexedEntity } from "./core-utils";
import type { Player } from "@shared/types";
export const MOCK_PLAYER: Player = {
  id: 'PLAYER_ONE',
  name: 'Player One',
  ovCoin: 1000,
  inventory: {
    hats: [],
  },
  consecutiveLosses: 0,
  debt: 0,
  heat: 0,
  luck: 50,
  corruption: 0,
  spinsSinceBigWin: 99,
};
export class PlayerEntity extends IndexedEntity<Player> {
  static readonly entityName = "player";
  static readonly indexName = "players";
  static readonly initialState: Player = {
    id: "",
    name: "",
    ovCoin: 0,
    inventory: { hats: [] },
    consecutiveLosses: 0,
    debt: 0,
    heat: 0,
    luck: 50,
    corruption: 0,
    spinsSinceBigWin: 99
  };
  static seedData = [MOCK_PLAYER];
}