"use client";

import { Suspense } from "react";
import PreviewClient from "./PreviewClient";

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
        <p className="text-zinc-400">
          Loading Preview...
        </p>
      </div>
    </main>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PreviewClient />
    </Suspense>
  );
}