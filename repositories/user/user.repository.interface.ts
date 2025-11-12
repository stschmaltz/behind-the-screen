import { ObjectId } from 'bson';
import { UserObject } from '../../types/user';

/**
 * Represents a user document as stored in MongoDB.
 */
export interface UserDocument {
  _id: ObjectId;
  auth0Id: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified?: boolean;
  aiUsageCount?: number;
  aiUsageResetDate?: Date;
  aiWeeklyLimit?: number;
  loginCount?: number;
  lastLoginDate?: Date;
}

/**
 * Data required for user sign-in
 */
export interface UserSignInData {
  auth0Id: string;
  email: string;
  name?: string;
  picture?: string;
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
   * Finds a user by their Auth0 ID.
   * @param auth0Id The Auth0 sub identifier.
   * @returns A promise resolving to the user object, or null if not found.
   */
  findUserByAuth0Id(auth0Id: string): Promise<UserObject | null>;

  /**
   * Creates or updates a user upon sign-in.
   * @param userData The user data from Auth0.
   * @returns A promise resolving to the upserted user object.
   */
  handleUserSignIn(userData: UserSignInData): Promise<UserObject>;

  /**
   * Returns the total number of users.
   */
  countUsers(): Promise<number>;

  /**
   * Returns a list of all users (with optional limit).
   */
  getAllUsers(limit?: number): Promise<UserObject[]>;
}
