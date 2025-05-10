import { OmitMongoFields } from './mongo-helpers';

export interface Player {
  name: string;
  _id: string;
  userId: string;
  campaignId: string;
  armorClass?: number;
  maxHP?: number;
  currentHP?: number;
  level?: number;
}

export type NewPlayer = OmitMongoFields<Player>;

export interface PlayerWithInitiative {
  player: Player;
  initiative: number | '';
}
