// Emits the Pothos GraphQL schema to schema.graphql for graphql-codegen.
// Loads env BEFORE importing the schema (which constructs the Prisma client),
// using dynamic imports inside an async IIFE so dotenv runs first.
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

void (async () => {
  const { writeFileSync } = await import('node:fs');
  const { printSchema, lexicographicSortSchema } = await import('graphql');
  const { schema } = await import('../src/lib/graphql/schema');

  writeFileSync(
    'schema.graphql',
    printSchema(lexicographicSortSchema(schema)) + '\n',
  );
  console.log('Wrote schema.graphql');
})();
