import 'server-only';
import { execute } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { schema } from './schema';
import { createContext } from './context';

/**
 * Runs a GraphQL operation in-process against the Pothos schema for React
 * Server Components — no HTTP hop, single API surface. Auth/ownership are
 * enforced by the resolvers via the Clerk-derived context.
 */
export async function serverExecute<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  const contextValue = await createContext();
  const result = await execute({
    schema,
    document,
    contextValue,
    variableValues: variables as Record<string, unknown> | undefined,
  });
  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join('; '));
  }
  return result.data as TResult;
}
