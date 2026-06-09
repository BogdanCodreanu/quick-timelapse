import { GraphQLError } from 'graphql';
import type { GraphQLContext } from './context';

/** Throws UNAUTHENTICATED if there is no signed-in user; returns the user id. */
export function requireUserId(ctx: GraphQLContext): string {
  if (!ctx.userId) {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return ctx.userId;
}

/**
 * Asserts the current user owns the given timelapse. Throws FORBIDDEN otherwise.
 * Returns the owner (current) user id.
 */
export async function assertOwnsTimelapse(
  ctx: GraphQLContext,
  timelapseId: string,
): Promise<string> {
  const userId = requireUserId(ctx);
  const found = await ctx.prisma.timelapse.findFirst({
    where: { id: timelapseId, ownerId: userId },
    select: { id: true },
  });
  if (!found) {
    throw new GraphQLError('Timelapse not found', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return userId;
}

/**
 * Asserts the current user owns the frame (via its parent timelapse). Throws
 * FORBIDDEN otherwise. Returns the owner id and the parent timelapse id.
 */
export async function assertOwnsFrame(
  ctx: GraphQLContext,
  frameId: string,
): Promise<{ userId: string; timelapseId: string }> {
  const userId = requireUserId(ctx);
  const frame = await ctx.prisma.frame.findFirst({
    where: { id: frameId, timelapse: { ownerId: userId } },
    select: { timelapseId: true },
  });
  if (!frame) {
    throw new GraphQLError('Frame not found', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return { userId, timelapseId: frame.timelapseId };
}
