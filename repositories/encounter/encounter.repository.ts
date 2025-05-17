import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { Encounter, NewEncounter } from '../../types/encounters';
import { EncounterRepositoryInterface } from './encounter.repository.interface';
import { getDbClient } from '../../data/database/mongodb';
import { logger } from '../../lib/logger';

@injectable()
export class EncounterRepository implements EncounterRepositoryInterface {
  private collectionName = 'encounters';

  public async saveEncounter(
    input: Partial<Encounter> & {
      userId: string;
    },
  ): Promise<Encounter> {
    const { db } = await getDbClient();
    const { _id, userId, ...docToInsert } = input;

    const result = await db.collection(this.collectionName).findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          createdAt: new Date(),
          ...docToInsert,
          userId: new ObjectId(userId),
          campaignId: new ObjectId(docToInsert.campaignId),
          adventureId: docToInsert.adventureId
            ? new ObjectId(docToInsert.adventureId)
            : undefined,
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    if (!result) {
      throw new Error('Failed to save encounter');
    }

    return this.mapToEncounter(result);
  }

  public async getEncounterById(input: {
    id: string;
    userId: string;
  }): Promise<Encounter | null> {
    const { id, userId } = input;
    const { db } = await getDbClient();
    const doc = await db
      .collection(this.collectionName)
      .findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

    return doc ? this.mapToEncounter(doc) : null;
  }

  public async getAllEncounters(input: {
    userId: string;
  }): Promise<Encounter[]> {
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({
        userId: new ObjectId(input.userId),
      })
      .toArray();

    logger.info('getAllEncounters', docs);
    return docs
      .map(this.mapToEncounter)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  public async deleteEncounter(input: {
    id: string;
    userId: string;
  }): Promise<boolean> {
    logger.info('deleteEncounter', input);
    const { db } = await getDbClient();
    const result = await db.collection(this.collectionName).deleteOne({
      _id: new ObjectId(input.id),
      userId: new ObjectId(input.userId),
    });

    logger.info('deleteEncounter', result);
    return result.deletedCount === 1;
  }

  public async updateEncounterDescription(input: {
    _id: string;
    description: string;
    userId: string;
  }): Promise<Encounter | null> {
    const { _id, description, userId } = input;
    const { db } = await getDbClient();

    const result = await db.collection(this.collectionName).findOneAndUpdate(
      {
        _id: new ObjectId(_id),
        userId: new ObjectId(userId),
      },
      {
        $set: {
          description: description,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      },
    );

    if (!result) {
      logger.warn(
        'Attempted to update description for non-existent or unauthorized encounter',
        input,
      );
      return null;
    }

    return this.mapToEncounter(result);
  }

  private mapToEncounter(doc: any): Encounter {
    return {
      _id: doc._id.toHexString(),
      name: doc.name,
      createdAt: doc.createdAt,
      currentRound: doc.currentRound ?? 1,
      currentTurn: doc.currentTurn ?? 1,
      enemies: doc.enemies ?? [],
      initiativeOrder: doc.initiativeOrder ?? [],
      npcs: doc.npcs ?? [],
      notes: doc.notes ?? [],
      players: doc.players ?? [],
      status: doc.status ?? 'inactive',
      description: doc.description,
      userId: doc.userId.toHexString(),
      campaignId: doc.campaignId.toHexString(),
      adventureId: doc.adventureId?.toHexString(),
    };
  }
}
