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

    const user = await db
      .collection<UserDocument>(collectionName)
      .findOneAndUpdate(
        { auth0Id: userData.auth0Id },
        {
          $set: {
            auth0Id: userData.auth0Id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
          },
        },
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
}

export { UserRepository };
