import type { CodegenConfig } from '@graphql-codegen/cli';

// Schema is emitted to schema.graphql by `npm run schema` (scripts/print-schema.ts).
// Client preset generates typed document helpers into src/gql.
const config: CodegenConfig = {
  schema: 'schema.graphql',
  documents: ['src/**/*.graphql', 'src/**/*.{ts,tsx}', '!src/gql/**'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        scalars: { DateTime: 'string' },
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
