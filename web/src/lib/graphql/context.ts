import { auth } from '@clerk/nextjs/server';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '../db/prisma';

export interface GraphQLContext {
  userId: string | null;
  prisma: PrismaClient;
}

// Built per request by GraphQL Yoga. Clerk's auth() reads the request cookies
// available in the route handler scope.
export async function createContext(): Promise<GraphQLContext> {
  const { userId } = await auth();
  return { userId, prisma };
}
