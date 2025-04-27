import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { getDbClient } from '../../data/database/mongodb';
import { Adventure, NewAdventure } from '../../types/adventures';
import { AdventureRepositoryInterface } from './adventure.repository.interface';
import { logger } from '../../lib/logger';

@injectable()
export class AdventureRepository implements AdventureRepositoryInterface {
  private collectionName = 'adventures';

  public async saveAdventure(
    input: Partial<Adventure> & {
      userId: string;
      campaignId: string;
    },
  ): Promise<Adventure> {
    const { db } = await getDbClient();
    const { _id, userId, campaignId, ...docToInsert } = input;
    const now = new Date();

    let result;
    if (_id) {
      result = await db.collection(this.collectionName).findOneAndUpdate(
        { _id: new ObjectId(_id), userId: new ObjectId(userId) },
        {
          $set: {
            ...docToInsert,
            userId: new ObjectId(userId),
            campaignId: new ObjectId(campaignId),
            updatedAt: now,
          },
        },
        { returnDocument: 'after' },
      );
    } else {
      const docWithDates = {
        ...docToInsert,
        userId: new ObjectId(userId),
        campaignId: new ObjectId(campaignId),
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
      throw new Error('Failed to save adventure');
    }

    return this.mapToAdventure(result);
  }

  public async getAdventureById(input: {
    id: string;
    userId: string;
  }): Promise<Adventure | null> {
    const { db } = await getDbClient();
    const doc = await db.collection(this.collectionName).findOne({
      _id: new ObjectId(input.id),
      userId: new ObjectId(input.userId),
    });

    return doc ? this.mapToAdventure(doc) : null;
  }

  public async getAllAdventures(input: {
    userId: string;
  }): Promise<Adventure[]> {
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({
        userId: new ObjectId(input.userId),
      })
      .toArray();

    logger.info('getAllAdventures', docs);
    return docs.map(this.mapToAdventure);
  }

  public async getAdventuresByCampaign(input: {
    userId: string;
    campaignId: string;
  }): Promise<Adventure[]> {
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({
        userId: new ObjectId(input.userId),
        campaignId: new ObjectId(input.campaignId),
      })
      .toArray();

    logger.info('getAdventuresByCampaign', docs);
    return docs.map(this.mapToAdventure);
  }

  public async deleteAdventure(input: {
    id: string;
    userId: string;
  }): Promise<boolean> {
    logger.info('deleteAdventure', input);
    const { db } = await getDbClient();
    const result = await db.collection(this.collectionName).deleteOne({
      _id: new ObjectId(input.id),
      userId: new ObjectId(input.userId),
    });

    logger.info('deleteAdventure', result);
    return result.deletedCount === 1;
  }

  private mapToAdventure(doc: any): Adventure {
    return {
      _id: doc._id?.toString() || doc._id,
      userId: doc.userId?.toString() || doc.userId,
      campaignId: doc.campaignId?.toString() || doc.campaignId,
      name: doc.name,
      description: doc.description,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
