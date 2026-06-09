import { randomUUID } from 'node:crypto';

export const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function extForContentType(contentType: string): string {
  return EXT_BY_TYPE[contentType] ?? 'bin';
}

/** Untouched upload: originals/<userId>/<timelapseId>/<random>.<ext> */
export function buildOriginalKey(
  userId: string,
  timelapseId: string,
  contentType: string,
): string {
  return `originals/${userId}/${timelapseId}/${randomUUID()}.${extForContentType(contentType)}`;
}

/** Baked composite: processed/<userId>/<timelapseId>/<frameId>-<version>.<ext> */
export function buildProcessedKey(
  userId: string,
  timelapseId: string,
  frameId: string,
  contentType: string,
): string {
  // Version segment busts browser/CDN caching when a frame is re-baked.
  return `processed/${userId}/${timelapseId}/${frameId}-${randomUUID()}.${extForContentType(contentType)}`;
}

export function originalsPrefix(userId: string, timelapseId: string): string {
  return `originals/${userId}/${timelapseId}/`;
}

export function processedPrefix(userId: string, timelapseId: string): string {
  return `processed/${userId}/${timelapseId}/`;
}
