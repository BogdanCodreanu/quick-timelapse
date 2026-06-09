'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'urql';
import {
  DeleteFrameMutation,
  PresignUploadMutation,
  RenameTimelapseMutation,
  ReorderFramesMutation,
  SaveFrameTransformMutation,
  UpdateCanvasMutation,
  UpdateGifDelayMutation,
} from '@/graphql/operations';
import { compositeToBlob, type Transform } from '@/lib/image/composite';
import { loadImage } from '@/lib/image/load-image';
import { EditorCanvas } from './EditorCanvas';
import { FrameStrip } from './FrameStrip';
import { GifBar } from './GifBar';
import { TransformControls } from './TransformControls';
import { useUploader } from './use-uploader';
import type { EditorFrame, EditorTimelapse } from './types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Cap the output canvas so composites/GIFs stay a reasonable size.
const MAX_CANVAS_EDGE = 1280;

export function TimelapseEditor({ timelapse }: { timelapse: EditorTimelapse }) {
  const timelapseId = timelapse.id;

  const [frames, setFrames] = useState<EditorFrame[]>(timelapse.frames);
  const [activeId, setActiveId] = useState<string | null>(
    timelapse.frames[0]?.id ?? null,
  );
  const [canvas, setCanvas] = useState({
    w: timelapse.canvasWidth,
    h: timelapse.canvasHeight,
  });
  const [title, setTitle] = useState(timelapse.title);
  const [onionOpacity, setOnionOpacity] = useState(0.5);
  const [gifDelayMs, setGifDelayMs] = useState(timelapse.gifDelayMs);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const [, presignUpload] = useMutation(PresignUploadMutation);
  const [, saveTransform] = useMutation(SaveFrameTransformMutation);
  const [, deleteFrameMut] = useMutation(DeleteFrameMutation);
  const [, reorderMut] = useMutation(ReorderFramesMutation);
  const [, updateGifDelay] = useMutation(UpdateGifDelayMutation);
  const [, updateCanvasMut] = useMutation(UpdateCanvasMutation);
  const [, renameMut] = useMutation(RenameTimelapseMutation);

  const framesRef = useRef(frames);
  const activeIdRef = useRef(activeId);
  const canvasRef = useRef(canvas);

  const dirty = useRef<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushing = useRef<Promise<void> | null>(null);

  async function saveFrame(id: string) {
    const f = framesRef.current.find((x) => x.id === id);
    if (!f) return;
    const { w, h } = canvasRef.current;
    setSaveStatus('saving');
    try {
      const img = await loadImage(f.originalUrl);
      const blob = await compositeToBlob(img, f, w, h);
      const pres = await presignUpload({
        input: {
          timelapseId,
          kind: 'PROCESSED',
          frameId: id,
          contentType: 'image/jpeg',
        },
      });
      if (pres.error || !pres.data) {
        throw new Error(pres.error?.message ?? 'Could not prepare the save.');
      }
      const { url, key } = pres.data.presignUpload;
      const put = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      });
      if (!put.ok) throw new Error('Saving the composite failed.');
      const res = await saveTransform({
        input: {
          frameId: id,
          rotation: f.rotation,
          scale: f.scale,
          offsetX: f.offsetX,
          offsetY: f.offsetY,
          processedKey: key,
        },
      });
      if (res.error || !res.data) {
        throw new Error(res.error?.message ?? 'Could not save the frame.');
      }
      const updatedUrl = res.data.saveFrameTransform.processedUrl ?? null;
      setFrames((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, processedUrl: updatedUrl ?? x.processedUrl } : x,
        ),
      );
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  async function flush() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (flushing.current) await flushing.current;
    const ids = [...dirty.current];
    dirty.current.clear();
    if (ids.length === 0) return;
    flushing.current = (async () => {
      for (const id of ids) await saveFrame(id);
    })();
    try {
      await flushing.current;
    } finally {
      flushing.current = null;
    }
    if (dirty.current.size) await flush();
  }

  function scheduleSave(id: string) {
    dirty.current.add(id);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flush();
    }, 800);
  }

  const flushRef = useRef(flush);
  useEffect(() => {
    framesRef.current = frames;
    activeIdRef.current = activeId;
    canvasRef.current = canvas;
    flushRef.current = flush;
  });
  useEffect(
    () => () => {
      void flushRef.current();
    },
    [],
  );

  const activeIndex = frames.findIndex((f) => f.id === activeId);
  const active = activeIndex >= 0 ? frames[activeIndex] : null;
  const onion = activeIndex > 0 ? frames[activeIndex - 1] : null;

  function handleTransform(t: Transform) {
    if (!activeId) return;
    setFrames((prev) => prev.map((f) => (f.id === activeId ? { ...f, ...t } : f)));
    scheduleSave(activeId);
  }

  function handleReset() {
    if (!activeId) return;
    setFrames((prev) =>
      prev.map((f) =>
        f.id === activeId
          ? { ...f, rotation: 0, scale: 1, offsetX: 0, offsetY: 0 }
          : f,
      ),
    );
    scheduleSave(activeId);
  }

  function selectFrame(id: string) {
    void flush();
    setActiveId(id);
  }

  async function handleReorder(orderedIds: string[]) {
    const byId = new Map(framesRef.current.map((f) => [f.id, f]));
    const next = orderedIds
      .map((id) => byId.get(id))
      .filter((f): f is EditorFrame => !!f);
    if (next.length !== framesRef.current.length) return;
    setFrames(next);
    await reorderMut({ timelapseId, orderedIds });
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this frame? This cannot be undone.')) return;
    const res = await deleteFrameMut({ id });
    if (res.error) return;
    const cur = framesRef.current;
    const idx = cur.findIndex((f) => f.id === id);
    const next = cur.filter((f) => f.id !== id);
    setFrames(next);
    if (activeIdRef.current === id) {
      setActiveId(next.length ? next[Math.min(idx, next.length - 1)].id : null);
    }
  }

  function handleUploaded(frame: EditorFrame) {
    const isFirst = framesRef.current.length === 0;
    setFrames((prev) => [...prev, frame]);
    setActiveId((prev) => prev ?? frame.id);
    // Match the output canvas to the first photo's aspect ratio.
    if (isFirst && frame.width && frame.height) {
      const s = Math.min(1, MAX_CANVAS_EDGE / Math.max(frame.width, frame.height));
      const w = Math.round(frame.width * s);
      const h = Math.round(frame.height * s);
      setCanvas({ w, h });
      void updateCanvasMut({ id: timelapseId, canvasWidth: w, canvasHeight: h });
    }
  }

  const { uploadFiles, openPicker, inputRef, busy, progress, error } =
    useUploader(timelapseId, handleUploaded);

  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleDelayChange(ms: number) {
    setGifDelayMs(ms);
    if (delayTimer.current) clearTimeout(delayTimer.current);
    delayTimer.current = setTimeout(() => {
      void updateGifDelay({ id: timelapseId, gifDelayMs: ms });
    }, 500);
  }

  const savedTitle = useRef(timelapse.title);
  function commitTitle() {
    const next = title.trim();
    if (!next || next === savedTitle.current) {
      if (!next) setTitle(savedTitle.current);
      return;
    }
    savedTitle.current = next;
    setTitle(next);
    void renameMut({ id: timelapseId, title: next });
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-zinc-50 dark:bg-black">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 text-sm dark:border-white/10">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="shrink-0 text-zinc-500 hover:underline">
            ← Dashboard
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            aria-label="Timelapse title"
            className="min-w-0 truncate rounded bg-transparent px-1 font-semibold outline-none hover:bg-black/5 focus:bg-black/5 dark:hover:bg-white/10 dark:focus:bg-white/10"
          />
          <span className="shrink-0 text-xs text-zinc-500">
            {frames.length} frame{frames.length === 1 ? '' : 's'}
          </span>
        </div>
        <span className="shrink-0 text-xs text-zinc-500">
          {saveStatus === 'saving'
            ? 'Saving…'
            : saveStatus === 'saved'
              ? 'All changes saved'
              : saveStatus === 'error'
                ? 'Save failed — will retry on next edit'
                : ''}
        </span>
      </header>

      {/* Main row: edit screen + right panel */}
      <div className="flex min-h-0 flex-1">
        <section className="relative min-w-0 flex-1 bg-zinc-100 dark:bg-zinc-900">
          <EditorCanvas
            canvasW={canvas.w}
            canvasH={canvas.h}
            active={active}
            onion={onion}
            onionOpacity={onionOpacity}
            onTransform={handleTransform}
          />
        </section>

        <aside className="flex w-[340px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-black/10 p-4 dark:border-white/10">
          <GifBar
            frames={frames}
            canvasW={canvas.w}
            canvasH={canvas.h}
            gifDelayMs={gifDelayMs}
            onDelayChange={handleDelayChange}
            fileName={title}
          />
          <TransformControls
            active={active}
            hasOnion={!!onion}
            onionOpacity={onionOpacity}
            onOnionOpacity={setOnionOpacity}
            onTransform={handleTransform}
            onReset={handleReset}
            onApply={() => void flush()}
            onDelete={() => active && handleDelete(active.id)}
            saveStatus={saveStatus}
          />
        </aside>
      </div>

      {/* Bottom: frames (drop target) */}
      <footer
        className="shrink-0 border-t border-black/10 p-3 dark:border-white/10"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) void uploadFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
          }}
        />
        <div className="h-24">
          <FrameStrip
            frames={frames}
            activeId={activeId}
            onSelect={selectFrame}
            onReorder={handleReorder}
            onDelete={handleDelete}
            onAdd={openPicker}
            busy={busy}
            progress={progress}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </footer>
    </div>
  );
}
