"use client";

import {
  Heart,
  Lock,
  Users,
  FileText,
  Music,
  Play,
} from "lucide-react";

import { VaultItem } from "../types";

type Props = {
  items: VaultItem[];

  activeTab: string;

  onOpen: (item: VaultItem) => void;

  toggleFavorite: (
    item: VaultItem
  ) => void;

  deleteMemory: (
    item: VaultItem
  ) => void;

  restoreMemory: (
    item: VaultItem
  ) => void;

  deleteForeverMemory: (
    item: VaultItem
  ) => void;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function Placeholder({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className="
      flex
      h-full
      w-full
      items-center
      justify-center
      bg-zinc-800
      text-sm
      text-zinc-500
    "
    >
      {text}
    </div>
  );
}

function FilePreview({
  item,
}: {
  item: VaultItem;
}) {
  switch (item.file_type) {
    case "image":

      return item.signedUrl ? (
        <img
          src={item.signedUrl}
          alt={item.file_name}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />
      ) : (
        <Placeholder text="Image unavailable" />
      );

    case "video":

      return item.signedUrl ? (
        <>
          <video
            src={item.signedUrl}
            muted
            preload="metadata"
            className="
              h-full
              w-full
              object-cover
            "
          />

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                rounded-full
                bg-black/60
                p-3
                backdrop-blur
              "
            >
              <Play
                size={22}
                className="
                  fill-white
                  text-white
                "
              />
            </div>
          </div>
        </>
      ) : (
        <Placeholder text="Video unavailable" />
      );

    case "audio":

      return (
        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            bg-gradient-to-br
            from-pink-600
            to-fuchsia-700
          "
        >
          <Music size={48} />
        </div>
      );

    default:

      return (
        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            bg-gradient-to-br
            from-blue-600
            to-cyan-600
          "
        >
          <FileText size={48} />
        </div>
      );
  }
}

export default function VaultGrid({

  items,

  activeTab,

  onOpen,

  toggleFavorite,

  deleteMemory,

  restoreMemory,

  deleteForeverMemory,

}: Props) {

  if (!items.length) {

    return (

      <div
        className="
          py-24
          text-center
          text-zinc-500
        "
      >

        <div className="mb-5 text-6xl">
          ❤️
        </div>

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
        gap-4
        sm:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-6
      "
    >
            {items.map((item) => {

        const VisibilityIcon =
          item.visibility === "private"
            ? Lock
            : Users;

        return (

          <div
            key={item.id}
            className="
              group
              overflow-hidden
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900
              transition-all
              duration-300
              hover:border-pink-500/40
              hover:shadow-xl
              hover:shadow-pink-500/10
            "
          >

            {/* Card */}

            <button
              onClick={() => onOpen(item)}
              className="w-full text-left"
            >

              {/* Preview */}

              <div
                className="
                  relative
                  aspect-square
                  overflow-hidden
                "
              >

                <FilePreview item={item} />

                {/* Gradient */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/70
                    via-transparent
                    to-transparent
                  "
                />

                {/* Visibility */}

                <div
                  className="
                    absolute
                    left-3
                    top-3
                  "
                >

                  <div
                    className="
                      rounded-full
                      bg-black/60
                      p-2
                      backdrop-blur
                    "
                  >

                    <VisibilityIcon
                      size={15}
                    />

                  </div>

                </div>

                {/* Favorite */}

                {item.favorite && (

                  <div
                    className="
                      absolute
                      right-3
                      top-3
                    "
                  >

                    <div
                      className="
                        rounded-full
                        bg-pink-600
                        p-2
                      "
                    >

                      <Heart
                        size={15}
                        className="
                          fill-white
                          text-white
                        "
                      />

                    </div>

                  </div>

                )}

              </div>

              {/* Footer */}

              <div className="p-4">

                <h3
                  className="
                    truncate
                    font-semibold
                    text-white
                  "
                >

                  {item.file_name}

                </h3>

                <p
                  className="
                    mt-2
                    truncate
                    text-xs
                    text-zinc-400
                  "
                >

                  📁 {item.folder ?? "No Folder"}

                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-zinc-500
                  "
                >

                  {formatDate(
                    item.created_at
                  )}

                </p>

              </div>

            </button>

            {/* Actions */}

            <div
              className="
                flex
                border-t
                border-zinc-800
              "
            >
                            {/* Favorite */}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item);
                }}
                className="
                  flex-1
                  py-3
                  transition
                  hover:bg-pink-600
                "
              >
                <Heart
                  size={18}
                  className={
                    item.favorite
                      ? "mx-auto fill-white text-white"
                      : "mx-auto"
                  }
                />
              </button>

              {activeTab === "trash" ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreMemory(item);
                    }}
                    className="
                      flex-1
                      border-l
                      border-zinc-800
                      py-3
                      text-sm
                      transition
                      hover:bg-green-600
                    "
                  >
                    ♻ Restore
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteForeverMemory(item);
                    }}
                    className="
                      flex-1
                      border-l
                      border-zinc-800
                      py-3
                      text-sm
                      transition
                      hover:bg-red-600
                    "
                  >
                    ❌ Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMemory(item);
                  }}
                  className="
                    flex-1
                    border-l
                    border-zinc-800
                    py-3
                    text-sm
                    transition
                    hover:bg-red-600
                  "
                >
                  🗑 Delete
                </button>
              )}

            </div>

          </div>

        );

      })}

    </div>

  );

}