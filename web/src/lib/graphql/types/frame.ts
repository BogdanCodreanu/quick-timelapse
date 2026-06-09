import { builder } from '../builder';
import { presignGet } from '../../s3/presign';

export function registerFrameType() {
  builder.prismaObject('Frame', {
    fields: (t) => ({
      id: t.exposeID('id'),
      orderIndex: t.exposeInt('orderIndex'),
      originalKey: t.exposeString('originalKey'),
      processedKey: t.exposeString('processedKey', { nullable: true }),
      cropX: t.exposeFloat('cropX', { nullable: true }),
      cropY: t.exposeFloat('cropY', { nullable: true }),
      cropW: t.exposeFloat('cropW', { nullable: true }),
      cropH: t.exposeFloat('cropH', { nullable: true }),
      rotation: t.exposeFloat('rotation'),
      scale: t.exposeFloat('scale'),
      offsetX: t.exposeFloat('offsetX'),
      offsetY: t.exposeFloat('offsetY'),
      width: t.exposeInt('width', { nullable: true }),
      height: t.exposeInt('height', { nullable: true }),
      locked: t.exposeBoolean('locked'),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

      // Presigned GET URLs computed per request (the bucket is private).
      originalUrl: t.field({
        type: 'String',
        resolve: (frame) => presignGet(frame.originalKey),
      }),
      processedUrl: t.field({
        type: 'String',
        nullable: true,
        resolve: (frame) =>
          frame.processedKey ? presignGet(frame.processedKey) : null,
      }),
    }),
  });
}
