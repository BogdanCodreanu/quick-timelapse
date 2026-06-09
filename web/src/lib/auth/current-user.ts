import { auth } from '@clerk/nextjs/server';

/** For RSC / server code: returns the Clerk user id or throws if signed out. */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}
