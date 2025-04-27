export const fullUser = `{
  _id
  auth0Id
  email
  name
  picture
}`;

export interface ApiUser {
  _id: string;
  auth0Id: string;
  email: string;
  name?: string;
  picture?: string;
}

export const signInUserMutation = `
  mutation userSignIn($input: UserSignInInput!) {
    userSignIn(input: $input) {
      user ${fullUser}
    }
  }
`;

export interface SignInUserMutationResponse {
  userSignIn: {
    user: ApiUser;
  };
}

export const getUserByIdQuery = `
  query getUserById($id: String!) {
    userById(id: $id) {
      ${fullUser}
    }
  }
`;

export interface GetUserByIdResponse {
  userById: ApiUser;
}

export const getUserByAuth0IdQuery = `
  query getUserByAuth0Id($auth0Id: String!) {
    userByAuth0Id(auth0Id: $auth0Id) {
      ${fullUser}
    }
  }
`;

export interface GetUserByAuth0IdResponse {
  userByAuth0Id: ApiUser;
}
