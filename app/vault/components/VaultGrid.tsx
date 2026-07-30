"use client";

import {
  Heart,
  Lock,
  Users,
  FileText,
  Music,
  Play,
} from "lucide-react";

export type VaultItem = {
  id: string;
  file_name: string;
  file_type: "image" | "video" | "audio" | "document";
  signedUrl: string;
  favorite: boolean;
  visibility: "private" | "shared";
  folder: string | null;
  folder_id: string | null;
  created_at: string;
  deleted: boolean;
 deleted_at?: string | null;
};
type Props = {
  items: VaultItem[];
  onOpen: (item: VaultItem) => void;
};

export default function VaultGrid({
  items,
  onOpen,
}: Props) {
  if (!items.length) {
    return (
      <div className="py-20 sm:py-28 text-center text-zinc-500">
        <div className="text-5xl sm:text-6xl mb-4">
          ❤️
        </div>

        <h2 className="text-xl sm:text-2xl font-bold">
          No memories yet
        </h2>

        <p className="mt-3 text-sm sm:text-base">
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
      md:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-6
      gap-3
      sm:gap-4
      lg:gap-5
      "
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onOpen(item)}
          className="
          group
          overflow-hidden
          rounded-2xl
          sm:rounded-3xl
          bg-zinc-900
          border
          border-zinc-800
          transition-all
          duration-300
          text-left
          active:scale-95
          md:hover:border-pink-500/50
          md:hover:shadow-xl
          md:hover:shadow-pink-500/20
          "
        >
          {/* Preview */}

          <div className="relative aspect-square overflow-hidden">

            {item.file_type === "image" && (
              <img
                src={item.signedUrl}
                alt={item.file_name}
                loading="lazy"
                className="
                w-full
                h-full
                object-cover
                md:group-hover:scale-110
                transition-transform
                duration-500
                "
              />
            )}

            {item.file_type === "video" && (
              <>
                <video
                  src={item.signedUrl}
                  muted
                  preload="metadata"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="rounded-full bg-black/60 backdrop-blur p-2 sm:p-3">

                    <Play
                      className="fill-white text-white"
                      size={22}
                    />

                  </div>

                </div>
              </>
            )}

            {item.file_type === "audio" && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-600 to-fuchsia-700">

                <Music
                  size={42}
                  className="sm:w-14 sm:h-14"
                />

              </div>
            )}

            {item.file_type === "document" && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600">

                <FileText
                  size={42}
                  className="sm:w-14 sm:h-14"
                />

              </div>
            )}

            {/* Overlay */}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Left Badge */}

            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">

              <div className="rounded-full bg-black/60 backdrop-blur p-1.5 sm:p-2">

                {item.visibility === "private" ? (
                  <Lock size={14} />
                ) : (
                  <Users size={14} />
                )}

              </div>

            </div>

            {/* Favorite */}

            {item.favorite && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">

                <div className="rounded-full bg-pink-600 p-1.5 sm:p-2">

                  <Heart
                    size={14}
                    className="fill-white text-white"
                  />

                </div>

              </div>
            )}
          </div>

          {/* Footer */}

          <div className="p-3 sm:p-4">

            <h3 className="truncate text-sm sm:text-base font-semibold text-white">
              {item.file_name}
            </h3>

            <p className="text-[11px] sm:text-xs text-zinc-400 mt-2 truncate">
              📁 {item.folder || "No Folder"}
            </p>

            <p className="text-[11px] sm:text-xs text-zinc-500 mt-1">
              {new Date(item.created_at).toLocaleDateString()}
            </p>

          </div>

        </button>
      ))}
    </div>
  );
}