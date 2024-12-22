import { ObjectId } from 'bson';
import { UserObject } from '../../types/user';

/**
 * Represents a user document as stored in MongoDB.
 */
export interface UserDocument {
  _id: ObjectId;
  email: string;
}

/**
 * Defines the methods for the user repository.
 */
export interface UserRepositoryInterface {
  /**
   * Finds a single user by their ID.
   * @param id The MongoDB ObjectId as a string.
   * @returns A promise resolving to the user object.
   */
  findUser(id: string): Promise<UserObject>;

  /**
   * Creates or updates a user upon sign-in.
   * @param email The user’s email.
   * @returns A promise resolving to the upserted user object.
   */
  handleUserSignIn(email: string): Promise<UserObject>;

  /**
   * Saves a user document.
   * @param user The user object to be saved.
   * @returns The saved user object.
   */
  saveUser(user: UserObject): Promise<UserObject>;
}
