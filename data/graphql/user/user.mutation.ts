import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { UserRepositoryInterface } from '../../../repositories/user/user.repository.interface';
import { UserObject } from '../../../types/user';

const userRepository = appContainer.get<UserRepositoryInterface>(
  TYPES.UserRepository,
);

const userMutationTypeDefs = /* GraphQL */ `
  extend type Mutation {
    userSignIn(input: UserSignInInput!): UserSignInResponse
  }
`;

interface UserSignInInput {
  input: { email: string };
}

const userMutationResolver = {
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

export { userMutationTypeDefs, userMutationResolver };
