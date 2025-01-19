import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { Encounter, NewEncounter } from '../../types/encounters';
import { EncounterRepositoryInterface } from './encounter.repository.interface';
import { getDbClient } from '../../data/database/mongodb';

@injectable()
export class EncounterRepository implements EncounterRepositoryInterface {
  private collectionName = 'encounters';

  public async saveEncounter(input: NewEncounter): Promise<Encounter> {
    const { db } = await getDbClient();
    const docToInsert = {
      ...input,
      createdAt: new Date(),
    };
    const result = await db
      .collection(this.collectionName)
      .insertOne(docToInsert);

    return this.mapToEncounter({
      ...docToInsert,
      _id: result.insertedId,
    });
  }

  public async getEncounterById(id: string): Promise<Encounter | null> {
    const { db } = await getDbClient();
    const doc = await db
      .collection(this.collectionName)
      .findOne({ _id: new ObjectId(id) });

    return doc ? this.mapToEncounter(doc) : null;
  }

  public async getAllEncounters(): Promise<Encounter[]> {
    const { db } = await getDbClient();
    const docs = await db.collection(this.collectionName).find().toArray();

    console.log('getAllEncounters', docs);
    return docs.map(this.mapToEncounter);
  }

  private mapToEncounter(doc: any): Encounter {
    return {
      _id: doc._id.toHexString(),
      name: doc.name,
      createdAt: doc.createdAt,
      currentRound: doc.currentRound ?? 1,
      currentTurn: doc.currentTurn ?? 1,
      enemies: doc.enemies??[],
      initiativeOrder: doc.initiativeOrder ?? [],
      npcs: doc.npcs ??[],
      notes: doc.notes ?? [],
      players: doc.players??[],
      status: doc.status ?? 'inactive',
      description: doc.description,
    };
  }
}
