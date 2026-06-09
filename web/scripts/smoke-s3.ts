/* eslint-disable @typescript-eslint/no-explicit-any */
// Integration smoke test for the S3 upload pipeline against the real bucket.
// Exercises presignUpload -> PUT bytes -> createFrame -> presigned GET -> delete,
// bypassing the browser (uses AWS_PROFILE creds via the default chain).
//   run: npx tsx scripts/smoke-s3.ts
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

// 1x1 JPEG.
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

  const ctx = { userId: 'smoke_s3_user', prisma };
  const run = async (
    source: string,
    variableValues?: Record<string, unknown>,
  ): Promise<any> => {
    const res = await execute({
      schema,
      document: parse(source),
      contextValue: ctx,
      variableValues,
    });
    if (res.errors?.length) {
      throw new Error(res.errors.map((e) => e.message).join('; '));
    }
    return res.data as any;
  };

  const { createTimelapse } = await run(
    `mutation($input: CreateTimelapseInput!){ createTimelapse(input:$input){ id } }`,
    { input: { title: 'S3 smoke' } },
  );
  const timelapseId = createTimelapse.id;
  console.log('timelapse:', timelapseId);

  const { presignUpload } = await run(
    `mutation($input: PresignUploadInput!){ presignUpload(input:$input){ url key } }`,
    {
      input: {
        timelapseId,
        kind: 'ORIGINAL',
        contentType: 'image/jpeg',
      },
    },
  );
  console.log('presigned key:', presignUpload.key);

  const body = Buffer.from(JPEG_1x1, 'base64');
  const put = await fetch(presignUpload.url, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body,
  });
  console.log('PUT status:', put.status);
  if (!put.ok) throw new Error(`PUT failed: ${put.status} ${await put.text()}`);

  const { createFrame } = await run(
    `mutation($input: CreateFrameInput!){ createFrame(input:$input){ id orderIndex } }`,
    { input: { timelapseId, originalKey: presignUpload.key, width: 1, height: 1 } },
  );
  console.log('frame:', createFrame.id, 'order', createFrame.orderIndex);

  const { timelapse } = await run(
    `query($id: ID!){ timelapse(id:$id){ frames { id originalUrl } } }`,
    { id: timelapseId },
  );
  const getUrl = timelapse.frames[0].originalUrl;
  const get = await fetch(getUrl);
  const bytes = (await get.arrayBuffer()).byteLength;
  console.log('GET status:', get.status, 'bytes:', bytes);

  // Cleanup; deleting the timelapse should also remove the S3 object.
  await run(`mutation($id: ID!){ deleteTimelapse(id:$id) }`, { id: timelapseId });
  const afterDelete = await fetch(getUrl);
  console.log('GET after delete:', afterDelete.status, '(expect non-200)');

  await prisma.$disconnect();

  if (!put.ok || get.status !== 200 || bytes === 0 || afterDelete.status === 200) {
    console.error('S3 SMOKE FAILED');
    process.exit(1);
  }
  console.log('S3 SMOKE OK');
})();
