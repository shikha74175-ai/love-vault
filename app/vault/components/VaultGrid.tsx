"use client";

import Image from "next/image";
import { Heart, Lock, Users, FileText, Video, Music } from "lucide-react";

export type VaultItem = {
  id: string;
  file_name: string;
  file_type: string;
  signedUrl: string;
  favorite: boolean;
  visibility: "private" | "shared";
  folder: string | null;
  created_at: string;
};

type Props = {
  items: VaultItem[];
  onOpen: (item: VaultItem) => void;
};

export default function VaultGrid({
  items,
  onOpen,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="py-24 text-center text-zinc-500">
        <div className="text-6xl mb-4">❤️</div>

        <h2 className="text-2xl font-bold">
          No memories yet
        </h2>

        <p className="mt-3">
          Upload your first memory.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
      grid
      grid-cols-2
      sm:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
      gap-4
      "
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onOpen(item)}
          className="
          relative
          overflow-hidden
          rounded-2xl
          bg-zinc-900
          border
          border-zinc-800
          hover:border-pink-500
          transition
          text-left
          "
        >
          {/* IMAGE */}

          {item.file_type === "image" && (
            <Image
              src={item.signedUrl}
              alt={item.file_name}
              width={500}
              height={500}
              className="
              w-full
              aspect-square
              object-cover
              "
              unoptimized
            />
          )}

          {/* VIDEO */}

          {item.file_type === "video" && (
            <div className="aspect-square flex items-center justify-center bg-zinc-800">
              <Video size={45} />
            </div>
          )}

          {/* AUDIO */}

          {item.file_type === "audio" && (
            <div className="aspect-square flex items-center justify-center bg-zinc-800">
              <Music size={45} />
            </div>
          )}

          {/* DOCUMENT */}

          {item.file_type === "document" && (
            <div className="aspect-square flex items-center justify-center bg-zinc-800">
              <FileText size={45} />
            </div>
          )}

          {/* BADGES */}

          <div className="absolute top-2 left-2 flex gap-2">

            {item.favorite && (
              <div className="bg-pink-600 rounded-full p-1">
                <Heart
                  size={14}
                  className="fill-white"
                />
              </div>
            )}

            {item.visibility === "private" ? (
              <div className="bg-black/60 rounded-full p-1">
                <Lock size={14} />
              </div>
            ) : (
              <div className="bg-black/60 rounded-full p-1">
                <Users size={14} />
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div className="p-3">

            <p className="font-medium truncate">
              {item.file_name}
            </p>

            <p className="text-xs text-zinc-400 mt-1">

              {item.folder || "No Folder"}

            </p>

            <p className="text-xs text-zinc-500 mt-1">

              {new Date(
                item.created_at
              ).toLocaleDateString()}

            </p>

          </div>

        </button>
      ))}
    </div>
  );
}