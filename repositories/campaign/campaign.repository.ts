import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { getDbClient } from '../../data/database/mongodb';
import { Campaign, NewCampaign } from '../../types/campaigns';
import { CampaignRepositoryInterface } from './campaign.repository.interface';
import { logger } from '../../lib/logger';

@injectable()
export class CampaignRepository implements CampaignRepositoryInterface {
  private collectionName = 'campaigns';

  public async saveCampaign(
    input: Partial<Campaign> & {
      userId: string;
    },
  ): Promise<Campaign> {
    const { db } = await getDbClient();
    const { _id, userId, ...docToInsert } = input;
    const now = new Date();

    const defaultValues = {
      status: 'active',
    };

    let result;
    if (_id) {
      result = await db.collection(this.collectionName).findOneAndUpdate(
        { _id: new ObjectId(_id), userId: new ObjectId(userId) },
        {
          $set: {
            ...defaultValues,
            ...docToInsert,
            userId: new ObjectId(userId),
            updatedAt: now,
          },
        },
        { returnDocument: 'after' },
      );
    } else {
      const docWithDates = {
        ...defaultValues,
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
      throw new Error('Failed to save campaign');
    }

    return this.mapToCampaign(result);
  }

  public async getCampaignById(input: {
    id: string;
    userId: string;
  }): Promise<Campaign | null> {
    const { db } = await getDbClient();
    const doc = await db.collection(this.collectionName).findOne({
      _id: new ObjectId(input.id),
      userId: new ObjectId(input.userId),
    });

    return doc ? this.mapToCampaign(doc) : null;
  }

  public async getAllCampaigns(input: { userId: string }): Promise<Campaign[]> {
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({
        userId: new ObjectId(input.userId),
      })
      .toArray();

    return docs.map(this.mapToCampaign);
  }

  public async deleteCampaign(input: {
    id: string;
    userId: string;
  }): Promise<boolean> {
    logger.info('deleteCampaign', input);
    const { db } = await getDbClient();
    const result = await db.collection(this.collectionName).deleteOne({
      _id: new ObjectId(input.id),
      userId: new ObjectId(input.userId),
    });

    return result.deletedCount === 1;
  }

  private mapToCampaign(doc: any): Campaign {
    return {
      _id: doc._id?.toString() || doc._id,
      userId: doc.userId?.toString() || doc.userId,
      name: doc.name,
      status: doc.status || 'active',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
