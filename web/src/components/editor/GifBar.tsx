'use client';

import { useEffect, useState } from 'react';
import { buildGif } from '@/lib/image/gif';
import type { EditorFrame } from './types';

type Props = {
  frames: EditorFrame[];
  canvasW: number;
  canvasH: number;
  gifDelayMs: number;
  onDelayChange: (ms: number) => void;
  fileName: string;
};

export function GifBar({
  frames,
  canvasW,
  canvasH,
  gifDelayMs,
  onDelayChange,
  fileName,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playing || frames.length === 0) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % frames.length),
      Math.max(20, gifDelayMs),
    );
    return () => clearInterval(id);
  }, [playing, gifDelayMs, frames.length]);

  const current = frames.length > 0 ? frames[index % frames.length] : null;
  const aspect = canvasW / canvasH;

  async function download() {
    if (frames.length === 0) return;
    setBuilding(true);
    setError(null);
    try {
      const blob = await buildGif(
        frames.map((f) => ({
          originalUrl: f.originalUrl,
          rotation: f.rotation,
          scale: f.scale,
          offsetX: f.offsetX,
          offsetY: f.offsetY,
        })),
        canvasW,
        canvasH,
        Math.max(20, gifDelayMs),
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName || 'timelapse'}.gif`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to build GIF.');
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">GIF preview</h2>
        <span className="text-xs text-zinc-500">
          {frames.length} frame{frames.length === 1 ? '' : 's'}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        disabled={frames.length === 0}
        className="relative w-full overflow-hidden rounded-md bg-black disabled:opacity-50"
        style={{ aspectRatio: String(aspect) }}
        title={playing ? 'Pause' : 'Play'}
      >
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.processedUrl ?? current.originalUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        )}
        {!playing && frames.length > 0 && (
          <span className="absolute inset-0 grid place-items-center text-4xl text-white/90">
            ▶
          </span>
        )}
      </button>

      <label className="flex flex-col gap-1 text-sm">
        <span>
          Frame delay · {gifDelayMs} ms (
          {(1000 / Math.max(20, gifDelayMs)).toFixed(1)} fps)
        </span>
        <input
          type="range"
          min={40}
          max={2000}
          step={10}
          value={gifDelayMs}
          onChange={(e) => onDelayChange(Number(e.target.value))}
        />
      </label>

      <button
        type="button"
        onClick={download}
        disabled={building || frames.length === 0}
        className="h-10 rounded-full bg-foreground text-sm text-background disabled:opacity-50"
      >
        {building ? 'Building GIF…' : 'Download GIF'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-zinc-500">
        Click the preview to play/pause. The download composites every frame to
        the canvas size for a clean, uniform GIF.
      </p>
    </div>
  );
}
