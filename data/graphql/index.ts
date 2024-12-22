import { mutationResolver, mutationTypeDefs } from './mutation';
import { queryResolver, queryTypeDefs } from './query';
import { userTypeDefs } from './user';

const typeDefs = [mutationTypeDefs, queryTypeDefs, userTypeDefs];
const resolvers = [queryResolver, mutationResolver];

export { typeDefs, resolvers };
