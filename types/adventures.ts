import { OmitMongoFields } from './mongo-helpers';

export interface Adventure {
  _id: string;
  userId: string;
  campaignId: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export type NewAdventure = OmitMongoFields<Adventure>;
