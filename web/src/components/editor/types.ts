import type { Transform } from '@/lib/image/composite';

export type EditorFrame = Transform & {
  id: string;
  orderIndex: number;
  originalUrl: string;
  processedUrl: string | null;
  width: number | null;
  height: number | null;
  locked: boolean;
};

export type EditorTimelapse = {
  id: string;
  title: string;
  canvasWidth: number;
  canvasHeight: number;
  gifDelayMs: number;
  frames: EditorFrame[];
};
