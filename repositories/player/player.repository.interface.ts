import { Player, NewPlayer } from '../../types/player';

export interface PlayerRepositoryInterface {
  savePlayer(input: NewPlayer): Promise<Player>;
  deletePlayer(input: { id: string; userId: string }): Promise<boolean>;
  getPlayersByIds(input: { ids: string[]; userId: string }): Promise<Player[]>;
  getAllPlayers(input: { userId: string }): Promise<Player[]>;
}
