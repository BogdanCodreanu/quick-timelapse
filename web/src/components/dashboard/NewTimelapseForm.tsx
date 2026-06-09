'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'urql';
import { CreateTimelapseMutation } from '@/graphql/operations';

export function NewTimelapseForm() {
  const [title, setTitle] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, createTimelapse] = useMutation(CreateTimelapseMutation);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await createTimelapse({ input: { title: title.trim() || 'Untitled' } });
    const id = res.data?.createTimelapse?.id;
    if (res.error || !id) {
      setPending(false);
      setError(res.error?.message ?? 'Failed to create timelapse');
      return;
    }
    router.push(`/timelapses/${id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Left forearm"
          autoFocus
          className="rounded-md border border-black/15 px-3 py-2 text-base dark:border-white/20 dark:bg-transparent"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-background disabled:opacity-50"
      >
        {pending ? 'Creating…' : 'Create timelapse'}
      </button>
    </form>
  );
}
