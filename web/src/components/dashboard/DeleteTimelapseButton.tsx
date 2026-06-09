'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'urql';
import { DeleteTimelapseMutation } from '@/graphql/operations';

export function DeleteTimelapseButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, setPending] = useState(false);
  const [, deleteTimelapse] = useMutation(DeleteTimelapseMutation);
  const router = useRouter();

  async function onDelete() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setPending(true);
    await deleteTimelapse({ id });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
