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

  private mapToUserPreferences(doc: any): UserPreferences {
    return {
      _id: doc._id?.toString() || doc._id,
      userId: doc.userId?.toString() || doc.userId,
      activeCampaignId:
        doc.activeCampaignId?.toString() || doc.activeCampaignId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
