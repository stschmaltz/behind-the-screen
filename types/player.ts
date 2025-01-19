import { OmitMongoFields } from './mongo-helpers';

export interface Player {
  name: string;
  _id: string;
}

export type NewPlayer = OmitMongoFields<Player>;
