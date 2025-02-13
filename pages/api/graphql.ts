// pages/api/graphql.ts
import { createYoga } from 'graphql-yoga';
import { schema } from '../../data/graphql';
import { getSession } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';
import { appContainer } from '../../container/inversify.config';
import { TYPES } from '../../container/types';
import { ContextBuilder } from '../../lib/context';
import { UserRepository } from '../../repositories/user/user.repository';

const userRepository = appContainer.get<UserRepository>(TYPES.UserRepository);
const contextBuilder = new ContextBuilder(userRepository);

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  graphqlEndpoint: '/api/graphql',
  maskedErrors: true,
  context: async ({ req, res }) => {
    const session = await getSession(req, res);
    return contextBuilder.buildContext(session);
  }
});

