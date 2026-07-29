"use client";

import { ArrowLeft, Heart, Lock, Users } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  fileName: string;
  favorite: boolean;
  visibility: "private" | "shared";
};

export default function PreviewHeader({
  fileName,
  favorite,
  visibility,
}: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">

      <div className="flex items-center justify-between px-5 py-4">

        {/* Left */}

        <div className="flex items-center gap-4">

          <button
            onClick={() => router.back()}
            className="rounded-xl bg-zinc-900 p-2 hover:bg-zinc-800 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div>

            <h1 className="font-semibold truncate max-w-[220px] sm:max-w-md">
              {fileName}
            </h1>

            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">

              {visibility === "private" ? (
                <div className="flex items-center gap-1">
                  <Lock size={14} />
                  Private
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  Shared
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Right */}

        {favorite && (
          <Heart
            size={22}
            className="text-pink-500 fill-pink-500"
          />
        )}

      </div>

    </header>
  );
}