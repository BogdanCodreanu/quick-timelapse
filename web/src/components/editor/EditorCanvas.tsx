"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as RPointerEvent,
} from "react";
import { loadImage } from "@/lib/image/load-image";
import { baseScale, type Transform } from "@/lib/image/composite";
import type { EditorFrame } from "./types";

const PADDING = 24;
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

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
  const eff =
    baseScale(img.naturalWidth, img.naturalHeight, canvasW, canvasH) * t.scale;
  const cx = canvasW / 2 + t.offsetX;
  const cy = canvasH / 2 + t.offsetY;
  return {
    position: "absolute",
    left: 0,
    top: 0,
    width: img.naturalWidth,
    height: img.naturalHeight,
    transformOrigin: "center center",
    transform: `translate(${cx - img.naturalWidth / 2}px, ${cy - img.naturalHeight / 2}px) rotate(${t.rotation}deg) scale(${eff})`,
    opacity,
    pointerEvents: "none",
    userSelect: "none",
  };
}

type DragState =
  | { mode: "pan"; x: number; y: number; ox: number; oy: number }
  | {
      mode: "rotate";
      cx: number;
      cy: number;
      startAngle: number;
      startRotation: number;
    };

type Props = {
  canvasW: number;
  canvasH: number;
  active: EditorFrame | null;
  onion: EditorFrame | null;
  onionOpacity: number;
  onTransform: (t: Transform) => void;
  onOnionOpacity: (v: number) => void;
};

export function EditorCanvas({
  canvasW,
  canvasH,
  active,
  onion,
  onionOpacity,
  onTransform,
  onOnionOpacity,
}: Props) {
  const activeImg = useLoadedImage(active?.originalUrl ?? null);
  const onionImg = useLoadedImage(onion?.originalUrl ?? null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

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

  // Latest values for the native (non-passive) wheel listener.
  const activeRef = useRef(active);
  const onTransformRef = useRef(onTransform);
  const onionOpacityRef = useRef(onionOpacity);
  const onOnionOpacityRef = useRef(onOnionOpacity);
  useEffect(() => {
    activeRef.current = active;
    onTransformRef.current = onTransform;
    onionOpacityRef.current = onionOpacity;
    onOnionOpacityRef.current = onOnionOpacity;
  });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      // Ctrl/Cmd + scroll → adjust onion-skin transparency.
      if (e.ctrlKey || e.metaKey) {
        const next = clamp(
          onionOpacityRef.current + (e.deltaY < 0 ? 0.03 : -0.03) * 6,
          0,
          1,
        );
        onOnionOpacityRef.current(next);
        return;
      }
      // Plain scroll → zoom the active frame.
      const a = activeRef.current;
      if (!a || a.locked) return;
      const factor = e.deltaY < 0 ? 1.05 : 0.95;
      const scale = clamp(a.scale * factor, 0.05, 20);
      onTransformRef.current({
        rotation: a.rotation,
        scale,
        offsetX: a.offsetX,
        offsetY: a.offsetY,
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  function onPointerDown(e: RPointerEvent) {
    if (!active || active.locked) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    if ((e.ctrlKey || e.metaKey) && wrapRef.current) {
      // Ctrl/Cmd + drag → rotate around the frame's center.
      const rect = wrapRef.current.getBoundingClientRect();
      const cx =
        rect.left +
        (box.w - displayW) / 2 +
        (canvasW / 2 + active.offsetX) * displayScale;
      const cy =
        rect.top +
        (box.h - displayH) / 2 +
        (canvasH / 2 + active.offsetY) * displayScale;
      dragRef.current = {
        mode: "rotate",
        cx,
        cy,
        startAngle: Math.atan2(e.clientY - cy, e.clientX - cx),
        startRotation: active.rotation,
      };
    } else {
      dragRef.current = {
        mode: "pan",
        x: e.clientX,
        y: e.clientY,
        ox: active.offsetX,
        oy: active.offsetY,
      };
    }
  }
  function onPointerMove(e: RPointerEvent) {
    const d = dragRef.current;
    const a = active;
    if (!d || !a) return;
    if (d.mode === "rotate") {
      const angle = Math.atan2(e.clientY - d.cy, e.clientX - d.cx);
      const rotation =
        d.startRotation + ((angle - d.startAngle) * 180) / Math.PI;
      onTransform({
        rotation,
        scale: a.scale,
        offsetX: a.offsetX,
        offsetY: a.offsetY,
      });
    } else {
      if (displayScale === 0) return;
      const dx = (e.clientX - d.x) / displayScale;
      const dy = (e.clientY - d.y) / displayScale;
      onTransform({
        rotation: a.rotation,
        scale: a.scale,
        offsetX: d.ox + dx,
        offsetY: d.oy + dy,
      });
    }
  }
  function endDrag() {
    dragRef.current = null;
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full touch-none select-none"
      style={{
        cursor: active ? (active.locked ? "not-allowed" : "grab") : "default",
      }}
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
            {/* Active frame underneath (fully opaque)… */}
            {activeImg && active && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.originalUrl}
                alt=""
                draggable={false}
                style={frameStyle(activeImg, active, canvasW, canvasH, 1)}
              />
            )}
            {/* …previous frame (onion-skin) rendered ON TOP at the chosen
                transparency so you can align the active frame to it. */}
            {onionImg && onion && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={onion.originalUrl}
                alt=""
                draggable={false}
                style={frameStyle(
                  onionImg,
                  onion,
                  canvasW,
                  canvasH,
                  onionOpacity,
                )}
              />
            )}
          </div>
        </div>
      )}
      {active?.locked && (
        <div className="pointer-events-none absolute left-3 top-3 rounded bg-amber-500/90 px-2 py-1 text-xs font-medium text-black shadow">
          🔒 Locked
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
