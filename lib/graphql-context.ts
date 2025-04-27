import { Session } from '@auth0/nextjs-auth0';
import { UserCache } from './user-cache';
import { UserRepositoryInterface } from '../repositories/user/user.repository.interface';
import { UserObject } from '../types/user';
import { logger } from './logger';

export interface GraphQLContext {
  auth0Id?: string;
  user: UserObject | null;
  userRepository: UserRepositoryInterface;
}

export class ContextBuilder {
  private userCache: UserCache;

  constructor(
    private userRepository: UserRepositoryInterface,
    cacheTtlMinutes: number = 5,
  ) {
    this.userCache = new UserCache(cacheTtlMinutes);
  }

  async buildContext(
    session: Session | null | undefined,
  ): Promise<GraphQLContext> {
    const auth0Id = session?.user?.sub;
    let user: UserObject | null = null;

    if (auth0Id) {
      user = this.userCache.get(auth0Id);

      if (!user) {
        try {
          user = await this.userRepository.findUserByAuth0Id(auth0Id);
          if (user) {
            this.userCache.set(auth0Id, user);
          }
        } catch (error) {
          logger.error('Error finding user by Auth0 ID', error);
        }
      }
    }

    return {
      auth0Id,
      user,
      userRepository: this.userRepository,
    };
  }
}

export const hasUser = (context: GraphQLContext): boolean => !!context.user;
export const isAuthorized = (
  context: GraphQLContext,
): context is GraphQLContext & {
  user: UserObject;
} => {
  return hasUser(context);
};

export function isAuthorizedOrThrow(
  context: GraphQLContext,
): asserts context is GraphQLContext & { user: UserObject } {
  if (!isAuthorized(context)) {
    throw new Error('Unauthorized');
  }
}
