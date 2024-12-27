// mutation.ts
import { appContainer } from '../../container/inversify.config';
import { UserObject } from '../../types/user';
import { TYPES } from '../../container/types'; // <-- import the symbols
import { UserRepositoryInterface } from '../../repositories/user.repository/user.repository.interface';

const userRepository = appContainer.get<UserRepositoryInterface>(
  TYPES.UserRepository,
);

const mutationTypeDefs = /* GraphQL */ `
  type Mutation {
    userSignIn(input: UserSignInInput!): UserSignInResponse
  }
`;

export interface UserSignInInput {
  input: { email: string };
}

const mutationResolver = {
  Mutation: {
    async userSignIn(
      _: never,
      { input: { email } }: UserSignInInput,
    ): Promise<{ user: UserObject }> {
      try {
        const user = await userRepository.handleUserSignIn(email);

        return { user };
      } catch (error) {
        console.error(error);
        throw new Error('User not found');
      }
    },
  },
};

export { mutationResolver, mutationTypeDefs };
