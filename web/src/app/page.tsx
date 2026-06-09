import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Quick Timelapse
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Upload photos of a wound over time, line them up with an onion-skin
          overlay, and export a healing timelapse as a GIF.
        </p>
        {userId ? (
          <Link
            href="/dashboard"
            className="flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-background"
          >
            Go to dashboard
          </Link>
        ) : (
          <SignInButton mode="modal">
            <button className="flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-background">
              Get started
            </button>
          </SignInButton>
        )}
      </main>
    </div>
  );
}
