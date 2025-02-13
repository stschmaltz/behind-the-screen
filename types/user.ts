import { ObjectId } from 'bson';

export interface UserObject {
  _id: ObjectId;
  email: string;
  auth0Id: string;
  name?: string;
  picture?: string;
}
