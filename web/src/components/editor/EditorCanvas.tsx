'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as RPointerEvent,
} from 'react';
import { loadImage } from '@/lib/image/load-image';
import { baseScale, type Transform } from '@/lib/image/composite';
import type { EditorFrame } from './types';

const PADDING = 24;

function useLoadedImage(url: string | null) {
  const [state, setState] = useState<{
    url: string | null;
    img: HTMLImageElement | null;
  }>({ url: null, img: null });
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    loadImage(url)
      .then((img) => {
        if (!cancelled) setState({ url, img });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);
  return state.url === url ? state.img : null;
}

function frameStyle(
  img: HTMLImageElement,
  t: Transform,
  canvasW: number,
  canvasH: number,
  opacity: number,
): CSSProperties {
  const eff = baseScale(img.naturalWidth, img.naturalHeight, canvasW, canvasH) * t.scale;
  const cx = canvasW / 2 + t.offsetX;
  const cy = canvasH / 2 + t.offsetY;
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    width: img.naturalWidth,
    height: img.naturalHeight,
    transformOrigin: 'center center',
    transform: `translate(${cx - img.naturalWidth / 2}px, ${cy - img.naturalHeight / 2}px) rotate(${t.rotation}deg) scale(${eff})`,
    opacity,
    pointerEvents: 'none',
    userSelect: 'none',
  };
}

type Props = {
  canvasW: number;
  canvasH: number;
  active: EditorFrame | null;
  onion: EditorFrame | null;
  onionOpacity: number;
  onTransform: (t: Transform) => void;
};

export function EditorCanvas({
  canvasW,
  canvasH,
  active,
  onion,
  onionOpacity,
  onTransform,
}: Props) {
  const activeImg = useLoadedImage(active?.originalUrl ?? null);
  const onionImg = useLoadedImage(onion?.originalUrl ?? null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Fit the canvas (contain) into the available edit area, responsively.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const availW = Math.max(0, box.w - PADDING * 2);
  const availH = Math.max(0, box.h - PADDING * 2);
  const displayScale =
    availW > 0 && availH > 0 ? Math.min(availW / canvasW, availH / canvasH) : 0;
  const displayW = canvasW * displayScale;
  const displayH = canvasH * displayScale;

  // Native non-passive wheel listener (zoom) on the always-mounted wrapper.
  const activeRef = useRef(active);
  const onTransformRef = useRef(onTransform);
  useEffect(() => {
    activeRef.current = active;
    onTransformRef.current = onTransform;
  });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      const a = activeRef.current;
      if (!a) return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.05 : 0.95;
      const scale = Math.min(20, Math.max(0.05, a.scale * factor));
      onTransformRef.current({
        rotation: a.rotation,
        scale,
        offsetX: a.offsetX,
        offsetY: a.offsetY,
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  function onPointerDown(e: RPointerEvent) {
    if (!active) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: active.offsetX,
      oy: active.offsetY,
    };
  }
  function onPointerMove(e: RPointerEvent) {
    const d = dragRef.current;
    const a = active;
    if (!d || !a || displayScale === 0) return;
    const dx = (e.clientX - d.x) / displayScale;
    const dy = (e.clientY - d.y) / displayScale;
    onTransform({
      rotation: a.rotation,
      scale: a.scale,
      offsetX: d.ox + dx,
      offsetY: d.oy + dy,
    });
  }
  function endDrag() {
    dragRef.current = null;
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full touch-none select-none"
      style={{ cursor: active ? 'grab' : 'default' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {displayScale > 0 && (
        <div
          className="absolute overflow-hidden rounded-md bg-black shadow-lg ring-1 ring-white/10"
          style={{
            left: (box.w - displayW) / 2,
            top: (box.h - displayH) / 2,
            width: displayW,
            height: displayH,
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: canvasW,
              height: canvasH,
              transform: `scale(${displayScale})`,
            }}
          >
            {onionImg && onion && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={onion.originalUrl}
                alt=""
                draggable={false}
                style={frameStyle(onionImg, onion, canvasW, canvasH, onionOpacity)}
              />
            )}
            {activeImg && active && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.originalUrl}
                alt=""
                draggable={false}
                style={frameStyle(activeImg, active, canvasW, canvasH, 1)}
              />
            )}
          </div>
        </div>
      )}
      {!active && (
        <div className="absolute inset-0 grid place-items-center text-sm text-zinc-500">
          Select a frame below, or add photos with ＋
        </div>
      )}
    </div>
  );
}
