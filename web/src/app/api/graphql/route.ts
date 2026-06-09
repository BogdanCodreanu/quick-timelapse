import { createYoga } from 'graphql-yoga';
import { createContext } from '@/lib/graphql/context';
import { schema } from '@/lib/graphql/schema';

// Neon ws driver + Prisma require the Node.js runtime (not edge).
export const runtime = 'nodejs';

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  // Use the platform Response so Next.js can stream the result.
  fetchAPI: { Response },
  context: createContext,
});

// Wrap in Next 16-compatible route handlers (Yoga's own signature doesn't match
// Next's RouteHandlerConfig). The empty server context is fine — the GraphQL
// context factory reads the user from Clerk via the request scope.
export function GET(request: Request) {
  return handleRequest(request, {});
}

export function POST(request: Request) {
  return handleRequest(request, {});
}

export function OPTIONS(request: Request) {
  return handleRequest(request, {});
}
