import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { drawFrame, type Transform } from './composite';
import { loadImage } from './load-image';

export type GifFrame = Transform & { originalUrl: string };

/**
 * Build an animated GIF by compositing each frame onto the (downscaled) output
 * canvas — guaranteeing uniform frame size — then quantizing with gifenc.
 */
export async function buildGif(
  frames: GifFrame[],
  canvasW: number,
  canvasH: number,
  delayMs: number,
  maxEdge = 600,
): Promise<Blob> {
  const ds = Math.min(1, maxEdge / Math.max(canvasW, canvasH));
  const gw = Math.max(1, Math.round(canvasW * ds));
  const gh = Math.max(1, Math.round(canvasH * ds));

  const full = document.createElement('canvas');
  full.width = canvasW;
  full.height = canvasH;
  const fctx = full.getContext('2d');

  const out = document.createElement('canvas');
  out.width = gw;
  out.height = gh;
  const octx = out.getContext('2d');
  if (!fctx || !octx) throw new Error('Canvas is not supported in this browser.');

  const gif = GIFEncoder();
  for (const frame of frames) {
    const img = await loadImage(frame.originalUrl);
    drawFrame(fctx, img, frame, canvasW, canvasH);
    octx.clearRect(0, 0, gw, gh);
    octx.drawImage(full, 0, 0, gw, gh);
    const { data } = octx.getImageData(0, 0, gw, gh);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, gw, gh, { palette, delay: delayMs });
  }
  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: 'image/gif' });
}
