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

  setTheme(input: { userId: string; theme: string }): Promise<UserPreferences>;

  getAllUsageStats(): Promise<
    Array<{
      email: string;
      usageCount: number;
      totalUsageEver: number;
      limit: number;
      resetDate?: string;
      hasRequestedMoreUses?: boolean;
      loginCount?: number;
      lastLoginDate?: string;
    }>
  >;

  requestMoreUses(userId: string): Promise<UserPreferences>;
}
