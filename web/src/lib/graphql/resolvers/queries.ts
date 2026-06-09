import { builder } from '../builder';
import { requireUserId } from '../auth';

export function registerQueries() {
  builder.queryType({
    fields: (t) => ({
      // Smoke-test field: current Clerk user id (null if signed out).
      me: t.string({
        nullable: true,
        resolve: (_root, _args, ctx) => ctx.userId,
      }),

      myTimelapses: t.prismaField({
        type: ['Timelapse'],
        resolve: (query, _root, _args, ctx) => {
          const userId = requireUserId(ctx);
          return ctx.prisma.timelapse.findMany({
            ...query,
            where: { ownerId: userId },
            orderBy: { updatedAt: 'desc' },
          });
        },
      }),

      timelapse: t.prismaField({
        type: 'Timelapse',
        nullable: true,
        args: { id: t.arg.id({ required: true }) },
        resolve: (query, _root, args, ctx) => {
          const userId = requireUserId(ctx);
          return ctx.prisma.timelapse.findFirst({
            ...query,
            where: { id: String(args.id), ownerId: userId },
          });
        },
      }),
    }),
  });
}
