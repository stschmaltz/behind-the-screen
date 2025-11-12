import { OmitMongoFields } from './mongo-helpers';

export interface UserPreferences {
  _id: string;
  userId: string;
  activeCampaignId?: string;
  theme?: string;
  aiGenerationUsageCount?: number;
  aiUsageResetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUserPreferences = OmitMongoFields<UserPreferences>;
