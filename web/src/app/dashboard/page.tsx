import Link from "next/link";
import { serverExecute } from "@/lib/graphql/server-execute";
import { MyTimelapsesQuery } from "@/graphql/operations";
import { DeleteTimelapseButton } from "@/components/dashboard/DeleteTimelapseButton";

export default async function DashboardPage() {
  const data = await serverExecute(MyTimelapsesQuery);
  const timelapses = data.myTimelapses;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your timelapses</h1>
        <Link
          href="/dashboard/new"
          className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm text-background"
        >
          New timelapse
        </Link>
      </div>

      {timelapses.length === 0 ? (
        <p className="text-zinc-500">
          No timelapses yet. Create one to start uploading wound photos.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {timelapses.map((tl) => (
            <li key={tl.id} className="flex items-center justify-between py-3">
              <Link href={`/timelapses/${tl.id}`} className="flex flex-col">
                <span className="font-medium">{tl.title}</span>
                <span className="text-xs text-zinc-500">
                  {tl.canvasWidth}×{tl.canvasHeight}
                </span>
              </Link>
              <DeleteTimelapseButton id={tl.id} title={tl.title} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
