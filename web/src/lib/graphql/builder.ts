import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '../../generated/pothos-types';
import { getDatamodel } from '../../generated/pothos-types';
import { prisma } from '../db/prisma';
import type { GraphQLContext } from './context';

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: GraphQLContext;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
  };
}>({
  plugins: [PrismaPlugin],
  // Fields are non-null by default; opt into nullability explicitly per field.
  // Pothos reads options.defaultFieldNullability at runtime, but the option is
  // missing from the public SchemaBuilderOptions type.
  // @ts-expect-error -- valid runtime option, absent from the typings
  defaultFieldNullability: false,
  prisma: {
    client: prisma,
    // Prisma 7 no longer ships a runtime DMMF; the Pothos generator emits one.
    dmmf: getDatamodel(),
  },
});
