"use client";

import {
  Heart,
  Download,
  Trash2,
  Info,
  RotateCcw,
} from "lucide-react";

type Props = {
  favorite: boolean;

  onFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onInfo: () => void;

  onRestore?: () => void;

  deleteLabel?: string;
};

type ButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
};

function ActionButton({
  icon,
  label,
  onClick,
  className = "",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        h-12
        min-w-[110px]
        flex-1
        items-center
        justify-center
        gap-2
        rounded-xl
        transition-all
        duration-200
        active:scale-95
        ${className}
      `}
    >
      {icon}

      <span className="hidden sm:inline">
        {label}
      </span>
    </button>
  );
}

export default function PreviewActions({
  favorite,
  onFavorite,
  onDownload,
  onDelete,
  onInfo,
  onRestore,
  deleteLabel,
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
      <div
        className="
          mx-auto
          flex
          max-w-5xl
          flex-wrap
          gap-3
        "
      >
        {/* Favorite */}

        <ActionButton
          onClick={onFavorite}
          label="Favorite"
          className={
            favorite
              ? "bg-pink-600 text-white hover:bg-pink-500"
              : "bg-zinc-900 hover:bg-pink-600"
          }
          icon={
            <Heart
              size={20}
              className={
                favorite
                  ? "fill-white"
                  : ""
              }
            />
          }
        />

        {/* Download */}

        <ActionButton
          onClick={onDownload}
          label="Download"
          className="
            bg-zinc-900
            hover:bg-blue-600
          "
          icon={<Download size={20} />}
        />

        {/* Details */}

        <ActionButton
          onClick={onInfo}
          label="Details"
          className="
            bg-zinc-900
            hover:bg-zinc-700
          "
          icon={<Info size={20} />}
        />

        {/* Restore */}

        {onRestore && (
          <ActionButton
            onClick={onRestore}
            label="Restore"
            className="
              bg-green-600
              text-white
              hover:bg-green-500
            "
            icon={<RotateCcw size={20} />}
          />
        )}

        {/* Delete */}

        <ActionButton
          onClick={onDelete}
          label={
            deleteLabel ??
            "Delete"
          }
          className="
            bg-red-600
            text-white
            hover:bg-red-500
          "
          icon={<Trash2 size={20} />}
        />
      </div>
    </div>
  );
}