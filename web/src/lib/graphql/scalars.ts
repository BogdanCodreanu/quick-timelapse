import { GraphQLError } from 'graphql';
import { builder } from './builder';

export function registerScalars() {
  builder.scalarType('DateTime', {
    serialize: (value) =>
      value instanceof Date ? value.toISOString() : String(value),
    parseValue: (value) => {
      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new GraphQLError('DateTime must be an ISO string or epoch number');
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        throw new GraphQLError('Invalid DateTime value');
      }
      return date;
    },
  });
}
