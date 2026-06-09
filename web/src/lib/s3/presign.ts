import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IMAGES_BUCKET, s3 } from './client';

/** Presigned PUT for a direct browser upload. ContentType must match the PUT. */
export function presignPut(key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: IMAGES_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 },
  );
}

/** Presigned GET so the browser can read a private object. */
export function presignGet(key: string): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: IMAGES_BUCKET, Key: key }),
    { expiresIn: 3600 },
  );
}
