import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { IMAGES_BUCKET, s3 } from './client';

/** Best-effort delete of every object under a key prefix. */
export async function deletePrefix(prefix: string): Promise<void> {
  let continuationToken: string | undefined;
  do {
    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: IMAGES_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    const objects = listed.Contents?.map((o) => ({ Key: o.Key! })) ?? [];
    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: IMAGES_BUCKET,
          Delete: { Objects: objects },
        }),
      );
    }
    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

/** Delete specific object keys (ignores empty/undefined). */
export async function deleteKeys(keys: (string | null | undefined)[]): Promise<void> {
  const objects = keys.filter((k): k is string => !!k).map((Key) => ({ Key }));
  if (objects.length === 0) return;
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: IMAGES_BUCKET,
      Delete: { Objects: objects },
    }),
  );
}
