import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { getDbClient } from '../../data/database/mongodb';
import { LootGeneration } from '../../types/loot-generation';
import { LootGenerationRepositoryInterface } from './loot-generation.repository.interface';

@injectable()
export class LootGenerationRepository
  implements LootGenerationRepositoryInterface
{
  private collectionName = 'loot_generations';

  public async saveGeneration(
    input: Partial<LootGeneration> & { userId: string },
  ): Promise<LootGeneration> {
    const { db } = await getDbClient();
    const now = new Date();
    const { _id, ...rest } = input;
    const docToInsert = {
      ...rest,
      userId: new ObjectId(input.userId),
      timestamp: input.timestamp || Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    const insertResult = await db
      .collection(this.collectionName)
      .insertOne(docToInsert);
    const result = {
      ...docToInsert,
      _id: insertResult.insertedId,
    };
    return this.mapToLootGeneration(result as any);
  }

  public async getGenerationsByUser(input: {
    userId: string;
  }): Promise<LootGeneration[]> {
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({ userId: new ObjectId(input.userId) })
      .sort({ timestamp: -1 })
      .toArray();
    return docs.map(this.mapToLootGeneration);
  }

  private mapToLootGeneration(doc: any): LootGeneration {
    return {
      _id: doc._id?.toString(),
      userId: doc.userId?.toString(),
      timestamp: doc.timestamp,
      partyLevel: doc.partyLevel,
      srdItemCount: doc.srdItemCount,
      randomItemCount: doc.randomItemCount,
      context: doc.context,
      loot: doc.loot,
    };
  }
}
