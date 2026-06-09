// Shared transform + compositing math. The SAME formula drives the interactive
// editor (via CSS transforms) and the baked output (canvas), so what you see is
// what gets exported. The fixed output canvas is the crop frame.
export type Transform = {
  rotation: number; // degrees
  scale: number; // multiplier on the contain-fit base scale
  offsetX: number; // canvas px from center
  offsetY: number; // canvas px from center
};

/** Scale that fits the image inside the canvas (contain) at transform scale=1. */
export function baseScale(
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number,
): number {
  return Math.min(canvasW / imgW, canvasH / imgH);
}

/** Draw a frame onto a canvas context the SAME way the editor displays it. */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  t: Transform,
  canvasW: number,
  canvasH: number,
  background = '#000',
): void {
  ctx.save();
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvasW, canvasH);
  const eff = baseScale(img.naturalWidth, img.naturalHeight, canvasW, canvasH) * t.scale;
  ctx.translate(canvasW / 2 + t.offsetX, canvasH / 2 + t.offsetY);
  ctx.rotate((t.rotation * Math.PI) / 180);
  ctx.scale(eff, eff);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
}

/** Composite a frame to a full-resolution JPEG blob (the baked output). */
export async function compositeToBlob(
  img: HTMLImageElement,
  t: Transform,
  canvasW: number,
  canvasH: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  drawFrame(ctx, img, t, canvasW, canvasH);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.9,
    ),
  );
}
