import { GraphQLScalarType, Kind } from 'graphql';

export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'A custom scalar to handle JavaScript Date objects',
  parseValue(value: unknown) {
    if (typeof value === 'number') {
      return new Date(value);
    }
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) {
        return new Date(parsed);
      }
    }
    throw new Error('Invalid date value provided');
  },
  serialize(value: unknown) {
    if (!(value instanceof Date)) {
      throw new Error('DateScalar can only serialize Date objects');
    }
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    if (ast.kind === Kind.STRING) {
      const parsed = Date.parse(ast.value);
      if (!isNaN(parsed)) {
        return new Date(parsed);
      }
    }
    return null;
  },
});
