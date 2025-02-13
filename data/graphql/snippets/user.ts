// User fragment with all fields
export const fullUser = `{
  _id
  auth0Id
  email
  name
  picture
}`;

// Main user interface
export interface ApiUser {
  _id: string;
  auth0Id: string;
  email: string;
  name?: string;
  picture?: string;
}

// Sign in mutation
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

// Get user by ID query
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

// You might also want to add a query to get user by auth0Id
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
