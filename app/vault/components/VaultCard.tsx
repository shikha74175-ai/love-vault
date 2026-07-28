"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Lock, Users, Play } from "lucide-react";
import type { VaultItem } from "../types";

type Props = {
  item: VaultItem;
};

export default function VaultCard({ item }: Props) {
  const isImage = item.file_type.startsWith("image");
  const isVideo = item.file_type.startsWith("video");

  return (
    <Link
      href={`/vault/preview?id=${item.id}`}
      className="group block"
    >
      <div
        className="
        relative
        overflow-hidden
        rounded-3xl
        bg-zinc-900
        border border-zinc-800
        hover:border-pink-500/50
        transition-all
        duration-300
        hover:scale-[1.02]
      "
      >
        {/* Thumbnail */}

        <div className="relative aspect-square">

          {isImage && (
            <Image
              src={item.url}
              alt={item.file_name}
              fill
              unoptimized
              className="object-cover transition duration-500 group-hover:scale-110"
            />
          )}

          {isVideo && (
            <>
              <video
                src={item.url}
                className="w-full h-full object-cover"
                muted
              />

              <div className="absolute inset-0 flex items-center justify-center">

                <div className="rounded-full bg-black/60 p-4">

                  <Play
                    className="text-white"
                    fill="white"
                    size={28}
                  />

                </div>

              </div>
            </>
          )}

          {/* Gradient */}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Favorite */}

          {item.favorite && (
            <div className="absolute top-3 right-3">

              <Heart
                size={18}
                className="text-pink-500 fill-pink-500"
              />

            </div>
          )}

          {/* Visibility */}

          <div className="absolute top-3 left-3">

            {item.visibility === "shared" ? (
              <Users size={18} className="text-white" />
            ) : (
              <Lock size={18} className="text-white" />
            )}

          </div>

        </div>

        {/* Bottom */}

        <div className="p-4">

          <h3 className="truncate font-semibold">

            {item.file_name}

          </h3>

          <p className="text-xs text-zinc-400 mt-1">

            {new Date(item.created_at).toLocaleDateString()}

          </p>

        </div>
      </div>
    </Link>
  );
}