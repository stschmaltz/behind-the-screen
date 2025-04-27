import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import { PlayerRepositoryInterface } from './player.repository.interface';
import { getDbClient } from '../../data/database/mongodb';
import { NewPlayer, Player } from '../../types/player';
import { logger } from '../../lib/logger';

@injectable()
export class PlayerRepository implements PlayerRepositoryInterface {
  private collectionName = 'players';

  public async savePlayer(input: NewPlayer): Promise<Player> {
    const { db } = await getDbClient();
    const docToInsert = {
      ...input,
      userId: new ObjectId(input.userId),
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

  public async deletePlayer(input: {
    id: string;
    userId: string;
  }): Promise<boolean> {
    const { id, userId } = input;
    const { db } = await getDbClient();
    const result = await db
      .collection(this.collectionName)
      .deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

    return result.deletedCount === 1;
  }

  public async getPlayersByIds(input: {
    ids: string[];
    userId: string;
  }): Promise<Player[]> {
    const { ids, userId } = input;
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({
        _id: {
          $in: ids.map((id) => new ObjectId(id)),
          userId: new ObjectId(userId),
        },
      })
      .toArray();

    return docs.map(this.mapToPlayer);
  }

  public async getAllPlayers(input: { userId: string }): Promise<Player[]> {
    const { userId } = input;
    logger.info('getAllPlayers', userId);
    const { db } = await getDbClient();
    const docs = await db
      .collection(this.collectionName)
      .find({ userId: new ObjectId(userId) })
      .toArray();

    logger.info('getAllPlayers', docs);
    return docs.map(this.mapToPlayer);
  }

  private mapToPlayer(doc: any): Player {
    return {
      _id: doc._id.toHexString(),
      name: doc.name,
      userId: doc.userId,
      armorClass: doc.armorClass,
      currentHP: doc.currentHP,
      maxHP: doc.maxHP,
    };
  }
}
