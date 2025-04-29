import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { getDbClient } from '../../data/database/mongodb';
import { Campaign } from '../../types/campaigns';
import { CampaignRepositoryInterface } from './campaign.repository.interface';
import { logger } from '../../lib/logger';

@injectable()
export class CampaignRepository implements CampaignRepositoryInterface {
  private collectionName = 'campaigns';

  public async saveCampaign(
    input: Partial<Campaign> & { id?: string; userId: string },
  ): Promise<Campaign> {
    const { db } = await getDbClient();
    const documentId = input.id || input._id;
    const { _id, id, userId, ...docToSet } = input;
    const now = new Date();

    const defaultValues = {
      status: 'active' as const,
    };

    let result;
    if (documentId) {
      const updateData = {
        ...defaultValues,
        ...docToSet,
        userId: new ObjectId(userId),
        updatedAt: now,
      };

      result = await db
        .collection(this.collectionName)
        .findOneAndUpdate(
          { _id: new ObjectId(documentId), userId: new ObjectId(userId) },
          { $set: updateData },
          { returnDocument: 'after' },
        );
    } else {
      const docToInsert = {
        ...defaultValues,
        ...docToSet,
        name: docToSet.name || 'Untitled Campaign',
        userId: new ObjectId(userId),
        createdAt: now,
        updatedAt: now,
      };

      const insertResult = await db
        .collection(this.collectionName)
        .insertOne(docToInsert);
      result = {
        ...docToInsert,
        _id: insertResult.insertedId,
      };
    }

    if (!result) {
      throw new Error('Failed to save campaign');
    }

    return this.mapToCampaign(result as any);
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
      _id: doc._id?.toString(),
      userId: doc.userId?.toString(),
      name: doc.name,
      status: doc.status || 'active',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
