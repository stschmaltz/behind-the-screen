import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { getDbClient } from '../../data/database/mongodb';
import { UserPreferences } from '../../types/user-preferences';
import { UserPreferencesRepositoryInterface } from './user-preferences.repository.interface';
import { logger } from '../../lib/logger';

@injectable()
export class UserPreferencesRepository
  implements UserPreferencesRepositoryInterface
{
  private collectionName = 'userPreferences';

  public async saveUserPreferences(
    input: Partial<UserPreferences> & {
      userId: string;
    },
  ): Promise<UserPreferences> {
    const { db } = await getDbClient();
    const { _id, userId, ...docToInsert } = input;
    const now = new Date();

    let result;
    if (_id) {
      result = await db.collection(this.collectionName).findOneAndUpdate(
        { _id: new ObjectId(_id), userId: new ObjectId(userId) },
        {
          $set: {
            ...docToInsert,
            userId: new ObjectId(userId),
            updatedAt: now,
          },
        },
        { returnDocument: 'after' },
      );
    } else {
      const docWithDates = {
        ...docToInsert,
        userId: new ObjectId(userId),
        createdAt: now,
        updatedAt: now,
      };
      const insertResult = await db
        .collection(this.collectionName)
        .insertOne(docWithDates);
      result = {
        ...docWithDates,
        _id: insertResult.insertedId,
      };
    }

    if (!result) {
      throw new Error('Failed to save user preferences');
    }

    return this.mapToUserPreferences(result);
  }

  public async getUserPreferences(
    userId: string,
  ): Promise<UserPreferences | null> {
    const { db } = await getDbClient();
    const doc = await db.collection(this.collectionName).findOne({
      userId: new ObjectId(userId),
    });

    return doc ? this.mapToUserPreferences(doc) : null;
  }

  public async setActiveCampaign(input: {
    userId: string;
    campaignId: string | null;
  }): Promise<UserPreferences> {
    const { userId, campaignId } = input;
    const { db } = await getDbClient();
    const now = new Date();

    const existingPrefs = await this.getUserPreferences(userId);

    if (existingPrefs) {
      const result = await db.collection(this.collectionName).findOneAndUpdate(
        { _id: new ObjectId(existingPrefs._id), userId: new ObjectId(userId) },
        {
          $set: {
            activeCampaignId: campaignId ? new ObjectId(campaignId) : null,
            updatedAt: now,
          },
        },
        { returnDocument: 'after' },
      );

      if (!result) {
        throw new Error('Failed to update active campaign');
      }

      return this.mapToUserPreferences(result);
    } else {
      const newPrefs = {
        userId: new ObjectId(userId),
        activeCampaignId: campaignId ? new ObjectId(campaignId) : null,
        createdAt: now,
        updatedAt: now,
      };

      const insertResult = await db
        .collection(this.collectionName)
        .insertOne(newPrefs);

      return this.mapToUserPreferences({
        ...newPrefs,
        _id: insertResult.insertedId,
      });
    }
  }

  public async setTheme(input: {
    userId: string;
    theme: string;
  }): Promise<UserPreferences> {
    const { userId, theme } = input;
    const { db } = await getDbClient();
    const now = new Date();

    const existingPrefs = await this.getUserPreferences(userId);

    if (existingPrefs) {
      const result = await db.collection(this.collectionName).findOneAndUpdate(
        { _id: new ObjectId(existingPrefs._id), userId: new ObjectId(userId) },
        {
          $set: {
            theme,
            updatedAt: now,
          },
        },
        { returnDocument: 'after' },
      );

      if (!result) {
        throw new Error('Failed to update theme preference');
      }

      return this.mapToUserPreferences(result);
    } else {
      const newPrefs = {
        userId: new ObjectId(userId),
        theme,
        createdAt: now,
        updatedAt: now,
      };

      const insertResult = await db
        .collection(this.collectionName)
        .insertOne(newPrefs);

      return this.mapToUserPreferences({
        ...newPrefs,
        _id: insertResult.insertedId,
      });
    }
  }

  public async incrementAiGenerationUsage(
    userId: string,
  ): Promise<UserPreferences> {
    const { db } = await getDbClient();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const existingPrefs = await this.getUserPreferences(userId);

    if (existingPrefs) {
      const resetDate = existingPrefs.aiUsageResetDate || new Date(0);
      const shouldReset = resetDate < oneWeekAgo;

      const result = await db.collection(this.collectionName).findOneAndUpdate(
        { _id: new ObjectId(existingPrefs._id), userId: new ObjectId(userId) },
        shouldReset
          ? {
              $set: {
                aiGenerationUsageCount: 1,
                aiUsageResetDate: now,
                updatedAt: now,
              },
            }
          : {
              $inc: {
                aiGenerationUsageCount: 1,
              },
              $set: {
                updatedAt: now,
              },
            },
        { returnDocument: 'after' },
      );

      if (!result) {
        throw new Error('Failed to increment AI generation usage');
      }

      return this.mapToUserPreferences(result);
    } else {
      const newPrefs = {
        userId: new ObjectId(userId),
        aiGenerationUsageCount: 1,
        aiUsageResetDate: now,
        createdAt: now,
        updatedAt: now,
      };

      const insertResult = await db
        .collection(this.collectionName)
        .insertOne(newPrefs);

      return this.mapToUserPreferences({
        ...newPrefs,
        _id: insertResult.insertedId,
      });
    }
  }

  public async getAllUsageStats(): Promise<
    Array<{
      email: string;
      usageCount: number;
      limit: number;
      resetDate?: string;
      hasRequestedMoreUses?: boolean;
    }>
  > {
    try {
      const { db } = await getDbClient();
      const userPrefsCollection = db.collection(this.collectionName);
      const usersCollection = db.collection('users');

      const allUsers = await usersCollection.find({}).toArray();

      const stats = await Promise.all(
        allUsers.map(async (user) => {
          const prefs = await userPrefsCollection.findOne({
            userId: user._id,
          });

          return {
            email: user.email || 'Unknown',
            usageCount: prefs?.aiGenerationUsageCount || 0,
            limit: 25,
            resetDate: prefs?.aiUsageResetDate?.toISOString(),
            hasRequestedMoreUses: prefs?.hasRequestedMoreUses || false,
          };
        }),
      );

      return stats;
    } catch (error) {
      logger.error('Error fetching all usage stats', error);
      throw error;
    }
  }

  public async requestMoreUses(userId: string): Promise<UserPreferences> {
    try {
      const { db } = await getDbClient();
      const now = new Date();

      const existingPrefs = await this.getUserPreferences(userId);

      if (existingPrefs) {
        const result = await db.collection(this.collectionName).findOneAndUpdate(
          { _id: new ObjectId(existingPrefs._id), userId: new ObjectId(userId) },
          {
            $set: {
              hasRequestedMoreUses: true,
              updatedAt: now,
            },
          },
          { returnDocument: 'after' },
        );

        if (!result) {
          throw new Error('Failed to update request');
        }

        return this.mapToUserPreferences(result);
      } else {
        const newPrefs = {
          userId: new ObjectId(userId),
          hasRequestedMoreUses: true,
          createdAt: now,
          updatedAt: now,
        };

        const insertResult = await db
          .collection(this.collectionName)
          .insertOne(newPrefs);

        return this.mapToUserPreferences({
          ...newPrefs,
          _id: insertResult.insertedId,
        });
      }
    } catch (error) {
      logger.error('Error requesting more uses', error);
      throw error;
    }
  }

  private mapToUserPreferences(doc: any): UserPreferences {
    return {
      _id: doc._id?.toString() || doc._id,
      userId: doc.userId?.toString() || doc.userId,
      activeCampaignId:
        doc.activeCampaignId?.toString() || doc.activeCampaignId,
      theme: doc.theme,
      aiGenerationUsageCount: doc.aiGenerationUsageCount || 0,
      aiUsageResetDate: doc.aiUsageResetDate,
      hasRequestedMoreUses: doc.hasRequestedMoreUses || false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
