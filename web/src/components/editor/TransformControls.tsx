'use client';

import type { Transform } from '@/lib/image/composite';
import type { EditorFrame } from './types';

type Props = {
  active: EditorFrame | null;
  hasOnion: boolean;
  onionOpacity: number;
  onOnionOpacity: (v: number) => void;
  onTransform: (t: Transform) => void;
  onReset: () => void;
  onApply: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
};

const btn =
  'rounded-md border border-black/15 px-3 py-1 text-sm disabled:opacity-40 dark:border-white/20';

export function TransformControls({
  active,
  hasOnion,
  onionOpacity,
  onOnionOpacity,
  onTransform,
  onReset,
  onApply,
  onDelete,
  onToggleLock,
  saveStatus,
}: Props) {
  const a = active;
  const locked = !!a?.locked;
  const set = (patch: Partial<Transform>) => {
    if (!a) return;
    onTransform({
      rotation: a.rotation,
      scale: a.scale,
      offsetX: a.offsetX,
      offsetY: a.offsetY,
      ...patch,
    });
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <button
        type="button"
        onClick={onToggleLock}
        disabled={!a}
        className={`flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40 ${
          locked
            ? 'border-amber-500/60 bg-amber-500/15 text-amber-700 dark:text-amber-300'
            : 'border-black/15 dark:border-white/20'
        }`}
        title="Lock this frame's alignment so it can't be moved, rotated, or zoomed by accident"
      >
        {locked ? '🔒 Locked — click to unlock' : '🔓 Lock alignment'}
      </button>

      <label className="flex flex-col gap-1">
        <span>
          Onion-skin{hasOnion ? '' : ' (no previous frame)'} ·{' '}
          {Math.round(onionOpacity * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={onionOpacity}
          disabled={!hasOnion}
          onChange={(e) => onOnionOpacity(Number(e.target.value))}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Rotation · {(a?.rotation ?? 0).toFixed(0)}°</span>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={a?.rotation ?? 0}
          disabled={!a || locked}
          onChange={(e) => set({ rotation: Number(e.target.value) })}
        />
      </label>

      <div className="flex items-center gap-3">
        <span>Zoom</span>
        <button
          type="button"
          className={btn}
          disabled={!a || locked}
          onClick={() => set({ scale: Math.max(0.05, (a?.scale ?? 1) * 0.9) })}
        >
          −
        </button>
        <span className="w-12 text-center tabular-nums">
          {Math.round((a?.scale ?? 1) * 100)}%
        </span>
        <button
          type="button"
          className={btn}
          disabled={!a || locked}
          onClick={() => set({ scale: Math.min(20, (a?.scale ?? 1) * 1.1) })}
        >
          ＋
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btn}
          disabled={!a || locked}
          onClick={onReset}
        >
          Reset
        </button>
        <button type="button" className={btn} disabled={!a} onClick={onApply}>
          Save now
        </button>
        <button
          type="button"
          className={`${btn} text-red-600`}
          disabled={!a}
          onClick={onDelete}
        >
          Delete frame
        </button>
      </div>

      <p className="h-4 text-xs text-zinc-500">
        {saveStatus === 'saving'
          ? 'Saving…'
          : saveStatus === 'saved'
            ? 'All changes saved'
            : saveStatus === 'error'
              ? 'Save failed — will retry on next edit'
              : ''}
      </p>
      <p className="text-xs text-zinc-400">
        Drag to move · scroll to zoom · <b>Ctrl+drag</b> to rotate ·{' '}
        <b>Ctrl+scroll</b> to fade the onion-skin. The frame edge is the crop.
      </p>
    </div>
  );
}
