import { createYoga } from 'graphql-yoga';
import { schema } from '../../data/graphql';

export default createYoga({
  schema,
  // Needed to be defined explicitly because the   endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: '/api/graphql',
  maskedErrors: true,
});
