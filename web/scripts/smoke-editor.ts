/* eslint-disable @typescript-eslint/no-explicit-any */
// Integration smoke test for the editor mutations against real Neon + S3.
//   run: npx tsx scripts/smoke-editor.ts
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

const JPEG_1x1 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////' +
  '////////////////////////////////////////////2wBDAf//////////////////////////' +
  '//////////////////////////////////////////////////////////////////wAARCAABAAED' +
  'ASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA' +
  'AAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6' +
  'Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKz' +
  'tLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEB' +
  'AQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEI' +
  'FEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hp' +
  'anN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX' +
  '2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==';

void (async () => {
  const { execute, parse } = await import('graphql');
  const { schema } = await import('../src/lib/graphql/schema');
  const { prisma } = await import('../src/lib/db/prisma');

  const ctx = { userId: 'smoke_editor_user', prisma };
  const run = async (
    source: string,
    variableValues?: Record<string, unknown>,
  ): Promise<any> => {
    const res = await execute({ schema, document: parse(source), contextValue: ctx, variableValues });
    if (res.errors?.length) throw new Error(res.errors.map((e) => e.message).join('; '));
    return res.data as any;
  };
  const body = Buffer.from(JPEG_1x1, 'base64');

  const { createTimelapse } = await run(
    `mutation($i: CreateTimelapseInput!){ createTimelapse(input:$i){ id } }`,
    { i: { title: 'Editor smoke' } },
  );
  const timelapseId = createTimelapse.id;

  async function uploadOriginal(): Promise<string> {
    const { presignUpload } = await run(
      `mutation($i: PresignUploadInput!){ presignUpload(input:$i){ url key } }`,
      { i: { timelapseId, kind: 'ORIGINAL', contentType: 'image/jpeg' } },
    );
    const put = await fetch(presignUpload.url, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body });
    if (!put.ok) throw new Error('original PUT failed ' + put.status);
    const { createFrame } = await run(
      `mutation($i: CreateFrameInput!){ createFrame(input:$i){ id } }`,
      { i: { timelapseId, originalKey: presignUpload.key, width: 1, height: 1 } },
    );
    return createFrame.id;
  }

  const f1 = await uploadOriginal();
  const f2 = await uploadOriginal();
  console.log('uploaded frames:', f1, f2);

  // saveFrameTransform with a processed composite
  const { presignUpload: pp } = await run(
    `mutation($i: PresignUploadInput!){ presignUpload(input:$i){ url key } }`,
    { i: { timelapseId, kind: 'PROCESSED', frameId: f1, contentType: 'image/jpeg' } },
  );
  const putP = await fetch(pp.url, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body });
  if (!putP.ok) throw new Error('processed PUT failed ' + putP.status);
  const { saveFrameTransform } = await run(
    `mutation($i: SaveFrameTransformInput!){ saveFrameTransform(input:$i){ id rotation scale offsetX offsetY processedUrl } }`,
    { i: { frameId: f1, rotation: 10, scale: 1.25, offsetX: 5, offsetY: -5, processedKey: pp.key } },
  );
  console.log('saved transform; processedUrl present:', !!saveFrameTransform.processedUrl, 'rotation:', saveFrameTransform.rotation);

  // reorder: f2 first
  const { reorderFrames } = await run(
    `mutation($t: ID!, $o: [ID!]!){ reorderFrames(timelapseId:$t, orderedIds:$o){ id orderIndex } }`,
    { t: timelapseId, o: [f2, f1] },
  );
  const order = Object.fromEntries(reorderFrames.map((f: any) => [f.id, f.orderIndex]));
  console.log('reordered -> f2:', order[f2], 'f1:', order[f1]);

  // delete f2
  await run(`mutation($id: ID!){ deleteFrame(id:$id) }`, { id: f2 });
  const after = await run(`query($id: ID!){ timelapse(id:$id){ frames { id orderIndex processedUrl } } }`, { id: timelapseId });
  console.log('frames after delete:', after.timelapse.frames.length, 'remaining order:', after.timelapse.frames.map((f: any) => f.orderIndex));

  // cleanup
  await run(`mutation($id: ID!){ deleteTimelapse(id:$id) }`, { id: timelapseId });
  await prisma.$disconnect();

  const ok =
    !!saveFrameTransform.processedUrl &&
    saveFrameTransform.rotation === 10 &&
    order[f2] === 0 &&
    order[f1] === 1 &&
    after.timelapse.frames.length === 1 &&
    after.timelapse.frames[0].orderIndex === 0;
  if (!ok) {
    console.error('EDITOR SMOKE FAILED');
    process.exit(1);
  }
  console.log('EDITOR SMOKE OK');
})();
