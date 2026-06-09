// Loads an HTMLImageElement, cached by URL. crossOrigin='anonymous' keeps the
// canvas untainted (the bucket CORS allows GET) so toBlob/getImageData work.
const cache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(url: string): Promise<HTMLImageElement> {
  let promise = cache.get(url);
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
    cache.set(url, promise);
  }
  return promise;
}
