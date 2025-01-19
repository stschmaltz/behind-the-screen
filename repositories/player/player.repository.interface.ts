import { Player, NewPlayer } from '../../types/player';

export interface PlayerRepositoryInterface {
  savePlayer(input: NewPlayer): Promise<Player>;
  deletePlayer(id: string): Promise<boolean>;
  getPlayersByIds(id: string[]): Promise<Player[]>;
  getAllPlayers(): Promise<Player[]>;
}
