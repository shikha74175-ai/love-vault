"use client";

import { Suspense } from "react";
import PreviewClient from "./PreviewClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
          Loading...
        </main>
      }
    >
      <PreviewClient />
    </Suspense>
  );
}