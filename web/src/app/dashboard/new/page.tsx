import Link from "next/link";
import { NewTimelapseForm } from "@/components/dashboard/NewTimelapseForm";

export default function NewTimelapsePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold">New timelapse</h1>
      </div>
      <NewTimelapseForm />
    </main>
  );
}
