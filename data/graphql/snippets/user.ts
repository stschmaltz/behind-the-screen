export const fullUser = `{ _id, email }`;

export interface ApiUser {
  _id: string;
  email: string;
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
      _id
      email
    }
  }
`;

export interface GetUserByIdResponse {
  userById: ApiUser;
}
