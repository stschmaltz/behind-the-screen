import { OmitMongoFields } from './mongo-helpers';

export interface UserPreferences {
  _id: string;
  userId: string;
  activeCampaignId?: string;
  theme?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUserPreferences = OmitMongoFields<UserPreferences>;
