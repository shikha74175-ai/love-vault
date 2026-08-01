"use client";

import {
  ArrowLeft,
  Heart,
  Lock,
  Users,
} from "lucide-react";

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

    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-zinc-800
        bg-zinc-950/90
        backdrop-blur-xl
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
          px-4
          py-4
          sm:px-6
        "
      >

        {/* Left */}

        <div className="flex items-center gap-4 min-w-0">

          <button
            onClick={() => router.back()}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-zinc-900
              transition
              hover:bg-zinc-800
              active:scale-95
            "
          >

            <ArrowLeft size={20} />

          </button>

          <div className="min-w-0">

            <h1
              className="
                truncate
                text-base
                font-semibold
                sm:text-lg
              "
            >
              {fileName}
            </h1>

            <div className="mt-2 flex items-center gap-2">

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-zinc-800
                  px-3
                  py-1
                  text-xs
                  text-zinc-300
                "
              >

                {visibility === "private" ? (
                  <>
                    <Lock size={12} />
                    Private
                  </>
                ) : (
                  <>
                    <Users size={12} />
                    Shared
                  </>
                )}

              </span>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">

          {favorite && (

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-pink-600/20
                ring-1
                ring-pink-500/30
              "
            >

              <Heart
                size={20}
                className="
                  fill-pink-500
                  text-pink-500
                "
              />

            </div>

          )}

        </div>

      </div>

    </header>

  );

}