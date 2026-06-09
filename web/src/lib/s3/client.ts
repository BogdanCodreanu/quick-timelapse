import { S3Client } from '@aws-sdk/client-s3';

// Region from env; credentials come from the default provider chain, which
// reads AWS_PROFILE (=bogdan) locally. No secrets in the repo.
// requestChecksumCalculation: 'WHEN_REQUIRED' keeps the SDK from adding the
// x-amz-checksum-crc32 query params to presigned PUTs, which break browser uploads.
export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

export const IMAGES_BUCKET = process.env.IMAGES_BUCKET_NAME!;
