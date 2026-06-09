import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// App pages that require a signed-in user. The GraphQL endpoint (/api/graphql)
// is intentionally NOT matched here — its resolvers enforce auth/ownership and
// return proper GraphQL errors instead of a page redirect.
const isProtectedPage = createRouteMatcher(['/dashboard(.*)', '/timelapses(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPage(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
