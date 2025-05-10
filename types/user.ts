export interface UserObject {
  _id: string;
  email: string;
  auth0Id: string;
  name?: string;
  picture?: string;
  emailVerified?: boolean;
}
