import { GraphQLError } from 'graphql';
import { builder } from '../builder';
import { assertOwnsFrame, assertOwnsTimelapse, requireUserId } from '../auth';
import { presignPut } from '../../s3/presign';
import { deleteKeys, deletePrefix } from '../../s3/objects';
import {
  ALLOWED_CONTENT_TYPES,
  buildOriginalKey,
  buildProcessedKey,
  originalsPrefix,
  processedPrefix,
} from '../../s3/keys';

export function registerMutations() {
  const CreateTimelapseInput = builder.inputType('CreateTimelapseInput', {
    fields: (t) => ({
      title: t.string({ required: false }),
      canvasWidth: t.int({ required: false }),
      canvasHeight: t.int({ required: false }),
    }),
  });

  const UploadKind = builder.enumType('UploadKind', {
    values: ['ORIGINAL', 'PROCESSED'] as const,
  });

  const PresignUploadInput = builder.inputType('PresignUploadInput', {
    fields: (t) => ({
      timelapseId: t.id({ required: true }),
      kind: t.field({ type: UploadKind, required: true }),
      frameId: t.id({ required: false }),
      contentType: t.string({ required: true }),
    }),
  });

  const PresignedUpload = builder
    .objectRef<{ url: string; key: string }>('PresignedUpload')
    .implement({
      fields: (t) => ({
        url: t.exposeString('url'),
        key: t.exposeString('key'),
      }),
    });

  const CreateFrameInput = builder.inputType('CreateFrameInput', {
    fields: (t) => ({
      timelapseId: t.id({ required: true }),
      originalKey: t.string({ required: true }),
      width: t.int({ required: false }),
      height: t.int({ required: false }),
    }),
  });

  const SaveFrameTransformInput = builder.inputType('SaveFrameTransformInput', {
    fields: (t) => ({
      frameId: t.id({ required: true }),
      rotation: t.float({ required: true }),
      scale: t.float({ required: true }),
      offsetX: t.float({ required: true }),
      offsetY: t.float({ required: true }),
      processedKey: t.string({ required: false }),
    }),
  });

  builder.mutationType({
    fields: (t) => ({
      createTimelapse: t.prismaField({
        type: 'Timelapse',
        args: { input: t.arg({ type: CreateTimelapseInput, required: true }) },
        resolve: (query, _root, { input }, ctx) => {
          const userId = requireUserId(ctx);
          return ctx.prisma.timelapse.create({
            ...query,
            data: {
              ownerId: userId,
              title: input.title ?? 'Untitled',
              canvasWidth: input.canvasWidth ?? 1080,
              canvasHeight: input.canvasHeight ?? 1080,
            },
          });
        },
      }),

      renameTimelapse: t.prismaField({
        type: 'Timelapse',
        args: {
          id: t.arg.id({ required: true }),
          title: t.arg.string({ required: true }),
        },
        resolve: async (query, _root, args, ctx) => {
          await assertOwnsTimelapse(ctx, String(args.id));
          return ctx.prisma.timelapse.update({
            ...query,
            where: { id: String(args.id) },
            data: { title: args.title },
          });
        },
      }),

      updateGifDelay: t.prismaField({
        type: 'Timelapse',
        args: {
          id: t.arg.id({ required: true }),
          gifDelayMs: t.arg.int({ required: true }),
        },
        resolve: async (query, _root, args, ctx) => {
          await assertOwnsTimelapse(ctx, String(args.id));
          return ctx.prisma.timelapse.update({
            ...query,
            where: { id: String(args.id) },
            data: { gifDelayMs: Math.max(20, Math.min(10000, args.gifDelayMs)) },
          });
        },
      }),

      updateCanvas: t.prismaField({
        type: 'Timelapse',
        args: {
          id: t.arg.id({ required: true }),
          canvasWidth: t.arg.int({ required: true }),
          canvasHeight: t.arg.int({ required: true }),
        },
        resolve: async (query, _root, args, ctx) => {
          await assertOwnsTimelapse(ctx, String(args.id));
          return ctx.prisma.timelapse.update({
            ...query,
            where: { id: String(args.id) },
            data: {
              canvasWidth: args.canvasWidth,
              canvasHeight: args.canvasHeight,
            },
          });
        },
      }),

      deleteTimelapse: t.boolean({
        args: { id: t.arg.id({ required: true }) },
        resolve: async (_root, args, ctx) => {
          const userId = await assertOwnsTimelapse(ctx, String(args.id));
          await ctx.prisma.timelapse.delete({ where: { id: String(args.id) } });
          await deletePrefix(originalsPrefix(userId, String(args.id)));
          await deletePrefix(processedPrefix(userId, String(args.id)));
          return true;
        },
      }),

      // Mint a presigned PUT URL for a direct browser upload.
      presignUpload: t.field({
        type: PresignedUpload,
        args: { input: t.arg({ type: PresignUploadInput, required: true }) },
        resolve: async (_root, { input }, ctx) => {
          const userId = await assertOwnsTimelapse(
            ctx,
            String(input.timelapseId),
          );
          if (!ALLOWED_CONTENT_TYPES.includes(input.contentType as never)) {
            throw new GraphQLError(
              'Unsupported image type. Please use JPEG, PNG, or WebP.',
            );
          }
          let key: string;
          if (input.kind === 'PROCESSED') {
            if (!input.frameId) {
              throw new GraphQLError(
                'frameId is required for processed uploads.',
              );
            }
            const frame = await ctx.prisma.frame.findFirst({
              where: {
                id: String(input.frameId),
                timelapseId: String(input.timelapseId),
              },
              select: { id: true },
            });
            if (!frame) throw new GraphQLError('Frame not found.');
            key = buildProcessedKey(
              userId,
              String(input.timelapseId),
              String(input.frameId),
              input.contentType,
            );
          } else {
            key = buildOriginalKey(
              userId,
              String(input.timelapseId),
              input.contentType,
            );
          }
          const url = await presignPut(key, input.contentType);
          return { url, key };
        },
      }),

      // Confirm an uploaded original by creating its Frame row.
      createFrame: t.prismaField({
        type: 'Frame',
        args: { input: t.arg({ type: CreateFrameInput, required: true }) },
        resolve: async (query, _root, { input }, ctx) => {
          const userId = await assertOwnsTimelapse(
            ctx,
            String(input.timelapseId),
          );
          if (
            !input.originalKey.startsWith(
              originalsPrefix(userId, String(input.timelapseId)),
            )
          ) {
            throw new GraphQLError('Invalid originalKey.');
          }
          const last = await ctx.prisma.frame.findFirst({
            where: { timelapseId: String(input.timelapseId) },
            orderBy: { orderIndex: 'desc' },
            select: { orderIndex: true },
          });
          const orderIndex = (last?.orderIndex ?? -1) + 1;
          return ctx.prisma.frame.create({
            ...query,
            data: {
              timelapseId: String(input.timelapseId),
              originalKey: input.originalKey,
              width: input.width ?? null,
              height: input.height ?? null,
              orderIndex,
            },
          });
        },
      }),

      // Persist a frame's transform and (optionally) its freshly-baked composite.
      saveFrameTransform: t.prismaField({
        type: 'Frame',
        args: {
          input: t.arg({ type: SaveFrameTransformInput, required: true }),
        },
        resolve: async (query, _root, { input }, ctx) => {
          const { userId, timelapseId } = await assertOwnsFrame(
            ctx,
            String(input.frameId),
          );
          let processedKey: string | undefined;
          if (input.processedKey) {
            if (
              !input.processedKey.startsWith(
                processedPrefix(userId, timelapseId),
              )
            ) {
              throw new GraphQLError('Invalid processedKey.');
            }
            processedKey = input.processedKey;
          }
          const existing = await ctx.prisma.frame.findUnique({
            where: { id: String(input.frameId) },
            select: { processedKey: true },
          });
          const updated = await ctx.prisma.frame.update({
            ...query,
            where: { id: String(input.frameId) },
            data: {
              rotation: input.rotation,
              scale: input.scale,
              offsetX: input.offsetX,
              offsetY: input.offsetY,
              ...(processedKey ? { processedKey } : {}),
            },
          });
          // Clean up the superseded composite.
          if (
            processedKey &&
            existing?.processedKey &&
            existing.processedKey !== processedKey
          ) {
            await deleteKeys([existing.processedKey]);
          }
          return updated;
        },
      }),

      // Lock/unlock a frame to protect its alignment from accidental edits.
      setFrameLocked: t.prismaField({
        type: 'Frame',
        args: {
          id: t.arg.id({ required: true }),
          locked: t.arg.boolean({ required: true }),
        },
        resolve: async (query, _root, args, ctx) => {
          await assertOwnsFrame(ctx, String(args.id));
          return ctx.prisma.frame.update({
            ...query,
            where: { id: String(args.id) },
            data: { locked: args.locked },
          });
        },
      }),

      reorderFrames: t.prismaField({
        type: ['Frame'],
        args: {
          timelapseId: t.arg.id({ required: true }),
          orderedIds: t.arg.idList({ required: true }),
        },
        resolve: async (query, _root, args, ctx) => {
          await assertOwnsTimelapse(ctx, String(args.timelapseId));
          const ids = args.orderedIds.map(String);
          const existing = await ctx.prisma.frame.findMany({
            where: { timelapseId: String(args.timelapseId) },
            select: { id: true },
          });
          const existingIds = new Set(existing.map((f) => f.id));
          if (
            ids.length !== existing.length ||
            !ids.every((id) => existingIds.has(id))
          ) {
            throw new GraphQLError(
              'orderedIds must contain exactly the frames of this timelapse.',
            );
          }
          await ctx.prisma.$transaction(
            ids.map((id, index) =>
              ctx.prisma.frame.update({
                where: { id },
                data: { orderIndex: index },
              }),
            ),
          );
          return ctx.prisma.frame.findMany({
            ...query,
            where: { timelapseId: String(args.timelapseId) },
            orderBy: { orderIndex: 'asc' },
          });
        },
      }),

      deleteFrame: t.boolean({
        args: { id: t.arg.id({ required: true }) },
        resolve: async (_root, args, ctx) => {
          const { timelapseId } = await assertOwnsFrame(ctx, String(args.id));
          const frame = await ctx.prisma.frame.findUnique({
            where: { id: String(args.id) },
            select: { originalKey: true, processedKey: true },
          });
          await ctx.prisma.frame.delete({ where: { id: String(args.id) } });
          await deleteKeys([frame?.originalKey, frame?.processedKey]);
          // Reindex remaining frames to keep orderIndex contiguous.
          const remaining = await ctx.prisma.frame.findMany({
            where: { timelapseId },
            orderBy: { orderIndex: 'asc' },
            select: { id: true },
          });
          await ctx.prisma.$transaction(
            remaining.map((f, index) =>
              ctx.prisma.frame.update({
                where: { id: f.id },
                data: { orderIndex: index },
              }),
            ),
          );
          return true;
        },
      }),
    }),
  });
}
