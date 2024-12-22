import { ApiUser, fullUser } from './user';

const signInUserMutationGraphQL = `mutation userSignIn($input: UserSignInInput!) {
  userSignIn(input: $input) {
    user ${fullUser}
  }
}`;

export interface SignInUserMutationResponse {
  userSignIn: {
    user: ApiUser;
  };
}

export { signInUserMutationGraphQL };
