'use client';

import {
  UrqlProvider,
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
} from '@urql/next';
import { useMemo, type ReactNode } from 'react';

// Client-side urql provider. Same-origin requests to /api/graphql automatically
// carry the Clerk session cookie, so resolvers can read the current user.
export function Providers({ children }: { children: ReactNode }) {
  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange();
    const client = createClient({
      url: '/api/graphql',
      exchanges: [cacheExchange, ssr, fetchExchange],
      suspense: false,
    });
    return [client, ssr];
  }, []);

  return (
    <UrqlProvider client={client} ssr={ssr}>
      {children}
    </UrqlProvider>
  );
}
