import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { getDbClient } from '../../data/database/mongodb';
import { NpcGeneration } from '../../types/npc-generation';
import { NpcGenerationRepositoryInterface } from './npc-generation.repository.interface';

@injectable()
export class NpcGenerationRepository
  implements NpcGenerationRepositoryInterface
{
  private collectionName = 'npc_generations';

  public async saveGeneration(
    input: Partial<NpcGeneration> & { userId: string },
  ): Promise<NpcGeneration> {
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
    return this.mapToNpcGeneration(result as any);
  }

  public async getGenerationsByUser(input: {
    userId: string;
  }): Promise<NpcGeneration[]> {
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({ userId: new ObjectId(input.userId) })
      .sort({ timestamp: -1 })
      .toArray();
    return docs.map(this.mapToNpcGeneration);
  }

  public async countAiGenerations(input: {
    userId: string;
    since: Date;
  }): Promise<number> {
    const { db } = await getDbClient();
    const count = await db.collection(this.collectionName).countDocuments({
      userId: new ObjectId(input.userId),
      timestamp: { $gte: input.since.getTime() },
    });
    return count;
  }

  private mapToNpcGeneration(doc: any): NpcGeneration {
    return {
      _id: doc._id?.toString(),
      userId: doc.userId?.toString(),
      timestamp: doc.timestamp,
      race: doc.race,
      occupation: doc.occupation,
      context: doc.context,
      includeSecret: doc.includeSecret,
      includeBackground: doc.includeBackground,
      npc: doc.npc,
    };
  }
}

