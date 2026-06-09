import { notFound } from "next/navigation";
import { serverExecute } from "@/lib/graphql/server-execute";
import { TimelapseQuery } from "@/graphql/operations";
import { TimelapseEditor } from "@/components/editor/TimelapseEditor";
import type { EditorTimelapse } from "@/components/editor/types";

export default async function TimelapsePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await serverExecute(TimelapseQuery, { id });
  const tl = data.timelapse;
  if (!tl) notFound();

  const timelapse: EditorTimelapse = {
    id: tl.id,
    title: tl.title,
    canvasWidth: tl.canvasWidth,
    canvasHeight: tl.canvasHeight,
    gifDelayMs: tl.gifDelayMs,
    frames: tl.frames.map((f) => ({
      id: f.id,
      orderIndex: f.orderIndex,
      originalUrl: f.originalUrl,
      processedUrl: f.processedUrl ?? null,
      rotation: f.rotation,
      scale: f.scale,
      offsetX: f.offsetX,
      offsetY: f.offsetY,
      width: f.width ?? null,
      height: f.height ?? null,
      locked: f.locked,
    })),
  };

  return <TimelapseEditor timelapse={timelapse} />;
}
