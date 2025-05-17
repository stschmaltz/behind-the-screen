import { ObjectId } from 'bson';
import { injectable } from 'inversify';
import {
  PlayerRepositoryInterface,
  BulkUpdatePlayersInput,
} from './player.repository.interface';
import { getDbClient } from '../../data/database/mongodb';
import type { NewPlayerInput, Player } from '../../src/generated/graphql';
import { logger } from '../../lib/logger';

@injectable()
export class PlayerRepository implements PlayerRepositoryInterface {
  private collectionName = 'players';

  public async createPlayer(
    input: NewPlayerInput,
    userId: string,
  ): Promise<Player> {
    if (!input.campaignId) {
      throw new Error('Campaign ID is required when saving a player');
    }

    const { db } = await getDbClient();
    const docToInsert = {
      ...input,
      campaignId: new ObjectId(input.campaignId),
      createdAt: new Date(),
      userId: new ObjectId(userId),
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
      const result = await db
        .collection(this.collectionName)
        .updateMany(filter, { $inc: { level: 1 } });

      return result.modifiedCount > 0;
    }

    if (Object.keys(updateObj).length === 0) {
      return false;
    }

    const result = await db
      .collection(this.collectionName)
      .updateMany(filter, { $set: updateObj });

    return result.modifiedCount > 0;
  }

  public async updatePlayer(
    input: { _id: string; userId: string } & Partial<NewPlayerInput>,
  ): Promise<Player> {
    const { _id, userId, ...updateData } = input;
    const { db } = await getDbClient();

    logger.info('updatePlayer: starting update', { _id, userId });

    const updateFields: Record<string, any> = {};

    if (updateData.name !== undefined) {
      updateFields.name = updateData.name;
    }

    if (updateData.campaignId !== undefined) {
      updateFields.campaignId = new ObjectId(updateData.campaignId);
    }

    if (updateData.armorClass !== undefined) {
      updateFields.armorClass = updateData.armorClass;
    }

    if (updateData.maxHP !== undefined) {
      updateFields.maxHP = updateData.maxHP;
    }

    if (updateData.level !== undefined) {
      updateFields.level = updateData.level;
    }

    logger.info('updatePlayer: update fields prepared', updateFields);

    if (Object.keys(updateFields).length === 0) {
      const existingDoc = await db
        .collection(this.collectionName)
        .findOne({ _id: new ObjectId(_id), userId: new ObjectId(userId) });

      if (!existingDoc) {
        logger.error(
          'updatePlayer: Player not found when checking existing document',
          { _id, userId },
        );
        throw new Error('Player not found');
      }

      return this.mapToPlayer(existingDoc);
    }

    updateFields.updatedAt = new Date();

    try {
      const result = await db
        .collection(this.collectionName)
        .findOneAndUpdate(
          { _id: new ObjectId(_id), userId: new ObjectId(userId) },
          { $set: updateFields },
          { returnDocument: 'after' },
        );

      if (!result) {
        throw new Error('Player not found');
      }

      return this.mapToPlayer(result);
    } catch (error) {
      logger.error('updatePlayer: Exception during update', {
        error,
        _id,
        userId,
      });
      throw error;
    }
  }

  private mapToPlayer(doc: any): Player {
    return {
      _id: doc._id.toHexString(),
      name: doc.name,
      userId: doc.userId.toHexString(),
      campaignId: doc.campaignId.toHexString(),
      armorClass: doc.armorClass,
      maxHP: doc.maxHP,
      level: doc.level || 1,
      createdAt: doc.createdAt,
    };
  }
}
