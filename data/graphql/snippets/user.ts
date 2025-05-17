export const userQuery = /* GraphQL */ `
  query User($id: ID!) {
    getUser(id: $id) {
      _id
      name
      email
      createdAt
      updatedAt
    }
  }
`;

export const updateUserMutation = /* GraphQL */ `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      _id
      name
      email
      createdAt
      updatedAt
    }
  }
`;

export const signInUserMutation = /* GraphQL */ `
  mutation userSignIn($input: UserSignInInput!) {
    userSignIn(input: $input) {
      user {
        _id
        name
        email
        auth0Id
        picture
      }
    }
  }
`;
