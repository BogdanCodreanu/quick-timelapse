// Client-side image normalization: applies EXIF orientation, downscales large
// images, and re-encodes to JPEG so every "original" is a consistent working
// source. HEIC (common from iPhones) is rejected with a clear message.
const MAX_EDGE = 2000;

export type NormalizedImage = {
  blob: Blob;
  width: number;
  height: number;
  contentType: 'image/jpeg';
};

export async function normalizeImage(file: File): Promise<NormalizedImage> {
  const name = file.name.toLowerCase();
  if (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  ) {
    throw new Error(
      'HEIC images aren’t supported yet. Please upload JPEG or PNG ' +
        '(on iPhone: Settings → Camera → Formats → Most Compatible).',
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Could not read this image. Please use a JPEG or PNG.');
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas is not supported in this browser.');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92),
  );
  if (!blob) throw new Error('Failed to process image.');

  return { blob, width, height, contentType: 'image/jpeg' };
}
