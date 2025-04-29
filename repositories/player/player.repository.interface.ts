import { Player, NewPlayer } from '../../types/player';

export interface BulkUpdatePlayersInput {
  userId: string;
  campaignId: string;
  armorClass?: number;
  maxHP?: number;
  level?: number;
  levelUp?: boolean;
}

export interface PlayerRepositoryInterface {
  createPlayer(input: NewPlayer): Promise<Player>;
  updatePlayer(
    input: { _id: string; userId: string } & Partial<NewPlayer>,
  ): Promise<Player>;
  deletePlayer(input: { id: string; userId: string }): Promise<boolean>;
  getPlayersByIds(input: { ids: string[]; userId: string }): Promise<Player[]>;
  getAllPlayers(input: { userId: string }): Promise<Player[]>;
  bulkUpdatePlayers(input: BulkUpdatePlayersInput): Promise<boolean>;
}
