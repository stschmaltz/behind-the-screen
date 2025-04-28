import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import {
  PlayerRepositoryInterface,
  BulkUpdatePlayersInput,
} from './player.repository.interface';
import { getDbClient } from '../../data/database/mongodb';
import { NewPlayer, Player } from '../../types/player';
import { logger } from '../../lib/logger';

@injectable()
export class PlayerRepository implements PlayerRepositoryInterface {
  private collectionName = 'players';

  public async savePlayer(input: NewPlayer): Promise<Player> {
    if (!input.campaignId) {
      throw new Error('Campaign ID is required when saving a player');
    }

    const { db } = await getDbClient();
    const docToInsert = {
      ...input,
      userId: new ObjectId(input.userId),
      campaignId: new ObjectId(input.campaignId),
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
        },
        userId: new ObjectId(userId),
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

  public async bulkUpdatePlayers(
    input: BulkUpdatePlayersInput,
  ): Promise<boolean> {
    const { userId, campaignId, armorClass, maxHP, level, levelUp } = input;
    const { db } = await getDbClient();

    const filter = {
      userId: new ObjectId(userId),
      campaignId: new ObjectId(campaignId),
    };

    const updateObj: Record<string, any> = {};

    if (armorClass !== undefined) {
      updateObj.armorClass = armorClass;
    }

    if (maxHP !== undefined) {
      updateObj.maxHP = maxHP;
    }

    if (level !== undefined) {
      updateObj.level = level;
    } else if (levelUp) {
      // If levelUp is true, increment the level
      const result = await db
        .collection(this.collectionName)
        .updateMany(filter, { $inc: { level: 1 } });

      return result.modifiedCount > 0;
    }

    if (Object.keys(updateObj).length === 0) {
      return false; // Nothing to update
    }

    const result = await db
      .collection(this.collectionName)
      .updateMany(filter, { $set: updateObj });

    return result.modifiedCount > 0;
  }

  private mapToPlayer(doc: any): Player {
    return {
      _id: doc._id.toHexString(),
      name: doc.name,
      userId: doc.userId.toHexString(),
      campaignId: doc.campaignId.toHexString(),
      armorClass: doc.armorClass,
      currentHP: doc.currentHP,
      maxHP: doc.maxHP,
      level: doc.level || 1, // Default to level 1
    };
  }
}
