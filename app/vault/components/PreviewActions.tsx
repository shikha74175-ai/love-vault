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
    <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">

      <div className="flex justify-center gap-4 p-5 flex-wrap">

        {/* Favorite */}

        <button
          onClick={onFavorite}
          className="
          flex items-center gap-2
          rounded-xl
          bg-zinc-900
          hover:bg-pink-600
          transition
          px-5
          py-3
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

          Favorite
        </button>

        {/* Download */}

        <button
          onClick={onDownload}
          className="
          flex items-center gap-2
          rounded-xl
          bg-zinc-900
          hover:bg-blue-600
          transition
          px-5
          py-3
          "
        >
          <Download size={20} />

          Download
        </button>

        {/* Info */}

        <button
          onClick={onInfo}
          className="
          flex items-center gap-2
          rounded-xl
          bg-zinc-900
          hover:bg-zinc-700
          transition
          px-5
          py-3
          "
        >
          <Info size={20} />

          Details
        </button>

        {/* Delete */}

        <button
          onClick={onDelete}
          className="
          flex items-center gap-2
          rounded-xl
          bg-red-600
          hover:bg-red-500
          transition
          px-5
          py-3
          "
        >
          <Trash2 size={20} />

          Delete
        </button>

      </div>

    </div>
  );
}