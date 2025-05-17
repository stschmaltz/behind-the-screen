export const fullUser = `{
  _id
  auth0Id
  email
  name
  picture
}`;

export const signInUserMutation = `
  mutation userSignIn($input: UserSignInInput!) {
    userSignIn(input: $input) {
      user ${fullUser}
    }
  }
`;

export const getUserByIdQuery = `
  query getUserById($id: String!) {
    userById(id: $id) {
      ${fullUser}
    }
  }
`;

export const getUserByAuth0IdQuery = `
  query getUserByAuth0Id($auth0Id: String!) {
    userByAuth0Id(auth0Id: $auth0Id) {
      ${fullUser}
    }
  }
`;
