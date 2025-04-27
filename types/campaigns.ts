import { OmitMongoFields } from './mongo-helpers';

export interface Campaign {
  _id: string;
  userId: string;
  name: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export type NewCampaign = OmitMongoFields<Campaign>;
