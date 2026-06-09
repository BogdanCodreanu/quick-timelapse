import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quick Timelapse",
  description: "Create wound-healing timelapses from your photos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Providers>
            <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
              <Link href="/" className="font-semibold">
                Quick Timelapse
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium">
                {userId ? (
                  <>
                    <Link href="/dashboard">Dashboard</Link>
                    <UserButton />
                  </>
                ) : (
                  <>
                    <SignInButton mode="modal" />
                    <SignUpButton mode="modal" />
                  </>
                )}
              </nav>
            </header>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
