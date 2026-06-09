'use client';

import { useRef, useState } from 'react';
import type { EditorFrame } from './types';

type Props = {
  frames: EditorFrame[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  busy: boolean;
  progress: { done: number; total: number } | null;
};

export function FrameStrip({
  frames,
  activeId,
  onSelect,
  onReorder,
  onDelete,
  onAdd,
  busy,
  progress,
}: Props) {
  const dragId = useRef<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function reorderTo(targetId: string) {
    const from = dragId.current;
    dragId.current = null;
    setOverId(null);
    if (!from || from === targetId) return;
    const ids = frames.map((f) => f.id);
    const fromIdx = ids.indexOf(from);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    ids.splice(toIdx, 0, ids.splice(fromIdx, 1)[0]);
    onReorder(ids);
  }

  return (
    <div className="flex h-full items-center gap-3 overflow-x-auto px-1">
      {frames.map((frame, i) => (
        <div
          key={frame.id}
          draggable
          onDragStart={() => {
            dragId.current = frame.id;
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (overId !== frame.id) setOverId(frame.id);
          }}
          onDragLeave={() =>
            setOverId((o) => (o === frame.id ? null : o))
          }
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            reorderTo(frame.id);
          }}
          className={`group relative shrink-0 rounded-md ${
            activeId === frame.id
              ? 'ring-2 ring-blue-500'
              : overId === frame.id
                ? 'ring-2 ring-blue-300'
                : ''
          }`}
          title="Drag to reorder"
        >
          <button
            type="button"
            onClick={() => onSelect(frame.id)}
            className="block h-20 w-20 cursor-pointer overflow-hidden rounded-md border border-black/10 bg-black dark:border-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={frame.processedUrl ?? frame.originalUrl}
              alt={`Frame ${i + 1}`}
              draggable={false}
              className="h-full w-full object-cover"
            />
          </button>
          <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            {i + 1}
          </span>
          <button
            type="button"
            onClick={() => onDelete(frame.id)}
            className="absolute right-1 top-1 hidden rounded bg-black/70 px-1 text-[11px] leading-tight text-red-300 group-hover:block"
            title="Delete frame"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-black/20 text-zinc-500 transition-colors hover:border-foreground hover:text-foreground dark:border-white/25"
        title="Add frames (or drop / paste anywhere)"
      >
        <span className="text-2xl leading-none">＋</span>
        <span className="text-[10px]">
          {busy ? `${progress?.done ?? 0}/${progress?.total ?? 0}` : 'Add'}
        </span>
      </button>
    </div>
  );
}
