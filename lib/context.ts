// lib/context.ts
import { UserRepositoryInterface } from '../repositories/user/user.repository.interface';
import { UserObject } from '../types/user';
import { UserCache } from './user-cache';
import { Session } from '@auth0/nextjs-auth0';

export interface GraphQLContext {
  auth0Id?: string;
  user: UserObject | null;
  userRepository: UserRepositoryInterface;
}

export class ContextBuilder {
  private userCache: UserCache;

  constructor(
    private userRepository: UserRepositoryInterface,
    cacheTtlMinutes: number = 5
  ) {
    this.userCache = new UserCache(cacheTtlMinutes);
  }

  async buildContext(session: Session | null| undefined): Promise<GraphQLContext> {
    const auth0Id = session?.user?.sub;
    let user: UserObject | null = null;

    if (auth0Id) {
      user = this.userCache.get(auth0Id);
      
      if (!user) {
        user = await this.userRepository.findUserByAuth0Id(auth0Id);
        if (user) {
          this.userCache.set(auth0Id, user);
        }
      }
    }

    return {
      auth0Id,
      user,
      userRepository: this.userRepository
    };
  }
}