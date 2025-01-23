import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { PlayerRepositoryInterface } from './player.repository.interface';
import { getDbClient } from '../../data/database/mongodb';
import { NewPlayer, Player } from '../../types/player';

@injectable()
export class PlayerRepository implements PlayerRepositoryInterface {
  private collectionName = 'players';

  public async savePlayer(input: NewPlayer): Promise<Player> {
    const { db } = await getDbClient();
    const docToInsert = {
      ...input,
      createdAt: new Date(),
    };
    const result = await db
      .collection(this.collectionName)
      .insertOne(docToInsert);

    return this.mapToPlayer({
      ...docToInsert,
      _id: result.insertedId,
    });
  }

  public async deletePlayer(id: string): Promise<boolean> {
    const { db } = await getDbClient();
    const result = await db
      .collection(this.collectionName)
      .deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  }

  public async getPlayersByIds(id: string[]): Promise<Player[]> {
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({ _id: { $in: id.map((i) => new ObjectId(i)) } })
      .toArray();

    return docs.map(this.mapToPlayer);
  }

  public async getAllPlayers(): Promise<Player[]> {
    const { db } = await getDbClient();
    const docs = await db.collection(this.collectionName).find().toArray();

    console.log('getAllPlayers', docs);
    return docs.map(this.mapToPlayer);
  }

  private mapToPlayer(doc: any): Player {
    return {
      _id: doc._id.toHexString(),
      name: doc.name,
    };
  }
}
