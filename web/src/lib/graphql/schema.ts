import type { GraphQLSchema } from 'graphql';
import { builder } from './builder';
import { registerScalars } from './scalars';
import { registerTimelapseType } from './types/timelapse';
import { registerFrameType } from './types/frame';
import { registerQueries } from './resolvers/queries';
import { registerMutations } from './resolvers/mutations';

// Cache the built schema ON THE BUILDER INSTANCE — not globalThis. Next runs
// Server Components and route handlers in separate module realms, each with its
// own `graphql` instance; a globalThis cache would share one schema across both
// and trigger "GraphQLSchema from another realm" errors in execute(). The
// builder is per-realm, so this keeps each realm's schema matched to its own
// graphql while still surviving dev HMR (the builder persists across reloads,
// so registration runs at most once per realm).
const cache = builder as unknown as { __qtSchema?: GraphQLSchema };

function buildSchema(): GraphQLSchema {
  registerScalars();
  registerTimelapseType();
  registerFrameType();
  registerQueries();
  registerMutations();
  return builder.toSchema();
}

export const schema = cache.__qtSchema ?? (cache.__qtSchema = buildSchema());
