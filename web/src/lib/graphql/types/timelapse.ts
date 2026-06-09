import { builder } from '../builder';

export function registerTimelapseType() {
  builder.prismaObject('Timelapse', {
    fields: (t) => ({
      id: t.exposeID('id'),
      title: t.exposeString('title'),
      canvasWidth: t.exposeInt('canvasWidth'),
      canvasHeight: t.exposeInt('canvasHeight'),
      gifDelayMs: t.exposeInt('gifDelayMs'),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
      frames: t.relation('frames', {
        query: { orderBy: { orderIndex: 'asc' } },
      }),
    }),
  });
}
