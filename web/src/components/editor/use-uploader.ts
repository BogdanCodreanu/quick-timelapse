'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from 'urql';
import {
  CreateFrameMutation,
  PresignUploadMutation,
} from '@/graphql/operations';
import { normalizeImage } from '@/lib/image/normalize';
import type { EditorFrame } from './types';

export function useUploader(
  timelapseId: string,
  onUploaded: (frame: EditorFrame) => void,
) {
  const [, presignUpload] = useMutation(PresignUploadMutation);
  const [, createFrame] = useMutation(CreateFrameMutation);

  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const onUploadedRef = useRef(onUploaded);
  useEffect(() => {
    onUploadedRef.current = onUploaded;
  });

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (busyRef.current) return;
      const files = Array.from(fileList).filter(
        (f) =>
          f.type.startsWith('image/') ||
          /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name),
      );
      if (files.length === 0) return;

      busyRef.current = true;
      setBusy(true);
      setError(null);
      setProgress({ done: 0, total: files.length });

      try {
        for (let i = 0; i < files.length; i++) {
          const norm = await normalizeImage(files[i]);
          const presigned = await presignUpload({
            input: {
              timelapseId,
              kind: 'ORIGINAL',
              contentType: norm.contentType,
            },
          });
          if (presigned.error || !presigned.data) {
            throw new Error(
              presigned.error?.message ?? 'Could not prepare the upload.',
            );
          }
          const { url, key } = presigned.data.presignUpload;
          const put = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': norm.contentType },
            body: norm.blob,
          });
          if (!put.ok) throw new Error('Upload to storage failed.');

          const created = await createFrame({
            input: {
              timelapseId,
              originalKey: key,
              width: norm.width,
              height: norm.height,
            },
          });
          if (created.error || !created.data) {
            throw new Error(created.error?.message ?? 'Could not save the frame.');
          }
          const c = created.data.createFrame;
          onUploadedRef.current({
            id: c.id,
            orderIndex: c.orderIndex,
            originalUrl: c.originalUrl,
            processedUrl: c.processedUrl ?? null,
            rotation: c.rotation,
            scale: c.scale,
            offsetX: c.offsetX,
            offsetY: c.offsetY,
            width: c.width ?? null,
            height: c.height ?? null,
          });
          setProgress({ done: i + 1, total: files.length });
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Upload failed.');
      } finally {
        busyRef.current = false;
        setBusy(false);
        setProgress(null);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [presignUpload, createFrame, timelapseId],
  );

  // Paste images anywhere on the page (Ctrl/Cmd+V).
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        void uploadFiles(files);
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [uploadFiles]);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  return { uploadFiles, openPicker, inputRef, busy, progress, error };
}
