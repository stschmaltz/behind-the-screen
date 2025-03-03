import { OmitMongoFields } from './mongo-helpers';

export interface Player {
  name: string;
  _id: string;
  userId: string;
  armorClass?: number;
  maxHP?: number;
  currentHP?: number;
}

export type NewPlayer = OmitMongoFields<Player>;
