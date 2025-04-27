import { UserPreferences } from '../../types/user-preferences';

export interface UserPreferencesRepositoryInterface {
  saveUserPreferences(
    input: Partial<UserPreferences> & { userId: string },
  ): Promise<UserPreferences>;

  getUserPreferences(userId: string): Promise<UserPreferences | null>;

  setActiveCampaign(input: {
    userId: string;
    campaignId: string | null;
  }): Promise<UserPreferences>;
}
