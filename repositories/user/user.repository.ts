import { ObjectId } from 'bson';
import {
  UserDocument,
  UserRepositoryInterface,
  UserSignInData,
} from './user.repository.interface';
import { getDbClient } from '../../data/database/mongodb';
import { UserObject } from '../../types/user';
import { logger } from '../../lib/logger';

const collectionName = 'users';

const mapUserDocumentToUserObject = (doc: UserDocument): UserObject => ({
  _id: doc._id.toHexString(),
  auth0Id: doc.auth0Id,
  email: doc.email,
  name: doc.name,
  picture: doc.picture,
  emailVerified: doc.emailVerified ?? false,
  aiUsageCount: doc.aiUsageCount ?? 0,
  aiUsageResetDate: doc.aiUsageResetDate,
  aiWeeklyLimit: doc.aiWeeklyLimit ?? 25,
  loginCount: doc.loginCount ?? 0,
  lastLoginDate: doc.lastLoginDate,
});

class UserRepository implements UserRepositoryInterface {
  public async findUser(id: string): Promise<UserObject> {
    try {
      const { db } = await getDbClient();

      const user = await db
        .collection<UserDocument>(collectionName)
        .findOne({ _id: new ObjectId(id) });

      if (!user) {
        throw new Error('User not found');
      }

      return mapUserDocumentToUserObject(user);
    } catch (error) {
      logger.error('Error finding user', error);
      throw error;
    }
  }

  public async findUserByAuth0Id(auth0Id: string): Promise<UserObject | null> {
    try {
      const { db } = await getDbClient();

      const user = await db
        .collection<UserDocument>(collectionName)
        .findOne({ auth0Id });

      if (!user) {
        return null;
      }

      return mapUserDocumentToUserObject(user);
    } catch (error) {
      logger.error('Error finding user by auth0Id', error);
      throw error;
    }
  }

  public async handleUserSignIn(userData: UserSignInData): Promise<UserObject> {
    logger.info('handleUserSignIn', userData);

    const { db } = await getDbClient();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const existingUser = await db
      .collection<UserDocument>(collectionName)
      .findOne({ auth0Id: userData.auth0Id });

    const shouldIncrementLoginCount =
      !existingUser ||
      !existingUser.lastLoginDate ||
      existingUser.lastLoginDate < oneHourAgo;

    const updateOperation: any = {
      $set: {
        auth0Id: userData.auth0Id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        emailVerified: false,
        lastLoginDate: now,
      },
    };

    if (shouldIncrementLoginCount) {
      updateOperation.$inc = { loginCount: 1 };
    }

    const user = await db
      .collection<UserDocument>(collectionName)
      .findOneAndUpdate(
        { auth0Id: userData.auth0Id },
        updateOperation,
        { upsert: true, returnDocument: 'after' },
      );

    if (!user) {
      throw new Error('User not found');
    }

    return mapUserDocumentToUserObject(user);
  }

  public async countUsers(): Promise<number> {
    try {
      const { db } = await getDbClient();
      return db.collection<UserDocument>(collectionName).countDocuments();
    } catch (error) {
      logger.error('Error counting users', error);
      throw error;
    }
  }

  public async getAllUsers(limit = 100): Promise<UserObject[]> {
    try {
      const { db } = await getDbClient();
      const users = await db
        .collection<UserDocument>(collectionName)
        .find({})
        .limit(limit)
        .toArray();
      return users.map(mapUserDocumentToUserObject);
    } catch (error) {
      logger.error('Error fetching all users', error);
      throw error;
    }
  }

  public async incrementAiUsage(auth0Id: string): Promise<UserObject> {
    try {
      const { db } = await getDbClient();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const user = await db.collection<UserDocument>(collectionName).findOne({
        auth0Id,
      });

      if (!user) {
        throw new Error('User not found');
      }

      const resetDate = user.aiUsageResetDate || new Date(0);
      const shouldReset = resetDate < oneWeekAgo;

      const updatedUser = await db
        .collection<UserDocument>(collectionName)
        .findOneAndUpdate(
          { auth0Id },
          {
            $set: {
              aiUsageCount: shouldReset ? 1 : (user.aiUsageCount || 0) + 1,
              aiUsageResetDate: shouldReset ? now : resetDate,
              aiWeeklyLimit: 25,
            },
          },
          { returnDocument: 'after' },
        );

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      return mapUserDocumentToUserObject(updatedUser);
    } catch (error) {
      logger.error('Error incrementing AI usage', error);
      throw error;
    }
  }

  public async checkAiUsageLimit(auth0Id: string): Promise<{
    canUse: boolean;
    remaining: number;
    limit: number;
    resetDate: Date;
  }> {
    try {
      const { db } = await getDbClient();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const user = await db.collection<UserDocument>(collectionName).findOne({
        auth0Id,
      });

      if (!user) {
        throw new Error('User not found');
      }

      const resetDate = user.aiUsageResetDate || new Date(0);
      const shouldReset = resetDate < oneWeekAgo;
      const limit = user.aiWeeklyLimit || 25;
      const currentUsage = shouldReset ? 0 : user.aiUsageCount || 0;

      return {
        canUse: currentUsage < limit,
        remaining: Math.max(0, limit - currentUsage),
        limit,
        resetDate: shouldReset ? now : resetDate,
      };
    } catch (error) {
      logger.error('Error checking AI usage limit', error);
      throw error;
    }
  }

  public async getAiUsageStats(): Promise<
    Array<{
      email: string;
      usageCount: number;
      limit: number;
      resetDate: Date | undefined;
    }>
  > {
    try {
      const { db } = await getDbClient();
      const users = await db
        .collection<UserDocument>(collectionName)
        .find({})
        .toArray();

      return users.map((user) => ({
        email: user.email,
        usageCount: user.aiUsageCount || 0,
        limit: user.aiWeeklyLimit || 25,
        resetDate: user.aiUsageResetDate,
      }));
    } catch (error) {
      logger.error('Error fetching AI usage stats', error);
      throw error;
    }
  }
}

export { UserRepository };
