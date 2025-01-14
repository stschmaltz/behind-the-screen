import { ObjectId } from 'bson';
import {
  UserDocument,
  UserRepositoryInterface,
} from './user.repository.interface';
import { getDbClient } from '../../data/database/mongodb';
import { UserObject } from '../../types/user';

const collectionName = 'users';

const mapUserDocumentToUserObject = (doc: UserDocument): UserObject => ({
  _id: doc._id,
  email: doc.email,
});

class UserRepository implements UserRepositoryInterface {
  public async findUser(id: string): Promise<UserObject> {
    try {
      const { db } = await getDbClient();

      const user = (await db
        .collection(collectionName)
        .findOne({ _id: new ObjectId(id) })) as UserDocument;

      if (!user) {
        throw new Error('User not found');
      }

      return mapUserDocumentToUserObject(user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async handleUserSignIn(email: string): Promise<UserObject> {
    console.log('handleUserSignIn', email);

    const { db } = await getDbClient();

    const user = await db
      .collection(collectionName)
      .findOneAndUpdate(
        { email },
        { $set: { email } },
        { upsert: true, returnDocument: 'after' },
      );

    if (!user) {
      throw new Error('User not found');
    }

    return {
      _id: user._id,
      email: user.email,
    };
  }

  public async saveUser(user: UserObject): Promise<UserObject> {
    try {
      const { db } = await getDbClient();

      await db.collection(collectionName).insertOne(user);

      return user;
    } catch (error) {
      console.log(error);
      throw new Error('User not found');
    }
  }
}

export { UserRepository };
