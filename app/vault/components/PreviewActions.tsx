"use client";

import {
  Heart,
  Download,
  Trash2,
  Info,
} from "lucide-react";

type Props = {
  favorite: boolean;
  onFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onInfo: () => void;
};

export default function PreviewActions({
  favorite,
  onFavorite,
  onDownload,
  onDelete,
  onInfo,
}: Props) {
  return (
    <div
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-zinc-800
        bg-zinc-950/90
        backdrop-blur-xl
        px-4
        py-3
        pb-[calc(env(safe-area-inset-bottom)+12px)]
      "
    >
      <div className="mx-auto flex max-w-3xl gap-3">

        {/* Favorite */}
        <button
          onClick={onFavorite}
          className="
            flex-1
            h-12
            rounded-xl
            bg-zinc-900
            hover:bg-pink-600
            transition
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <Heart
            size={20}
            className={
              favorite
                ? "fill-pink-500 text-pink-500"
                : ""
            }
          />

          <span className="hidden sm:inline">
            Favorite
          </span>
        </button>

        {/* Download */}
        <button
          onClick={onDownload}
          className="
            flex-1
            h-12
            rounded-xl
            bg-zinc-900
            hover:bg-blue-600
            transition
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <Download size={20} />

          <span className="hidden sm:inline">
            Download
          </span>
        </button>

        {/* Details */}
        <button
          onClick={onInfo}
          className="
            flex-1
            h-12
            rounded-xl
            bg-zinc-900
            hover:bg-zinc-700
            transition
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <Info size={20} />

          <span className="hidden sm:inline">
            Details
          </span>
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="
            flex-1
            h-12
            rounded-xl
            bg-red-600
            hover:bg-red-700
            transition
            flex
            items-center
            justify-center
            gap-2
            text-white
          "
        >
          <Trash2 size={20} />

          <span className="hidden sm:inline">
            Delete
          </span>
        </button>

      </div>
    </div>
  );
}