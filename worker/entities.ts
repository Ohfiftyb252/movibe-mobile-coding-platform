import { IndexedEntity } from "./core-utils";
import type { Player } from "@shared/types";
export const MOCK_PLAYER: Player = {
  id: 'PLAYER_ONE',
  name: 'Player One',
  ovCoin: 1000,
  inventory: {
    hats: [],
  },
};
export class PlayerEntity extends IndexedEntity<Player> {
  static readonly entityName = "player";
  static readonly indexName = "players";
  static readonly initialState: Player = { id: "", name: "", ovCoin: 0, inventory: { hats: [] } };
  static seedData = [MOCK_PLAYER];
}