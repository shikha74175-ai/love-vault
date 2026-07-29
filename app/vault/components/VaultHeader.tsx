"use client";

import { Heart, Search, HardDrive } from "lucide-react";

type Props = {
  usedStorage?: number;
  totalStorage?: number;
  onSearch?: () => void;
};

export default function VaultHeader({
  usedStorage = 0,
  totalStorage = 5,
  onSearch,
}: Props) {
  const percent = Math.min((usedStorage / totalStorage) * 100, 100);

  return (
    <header
      className="
      sticky top-0 z-40
      bg-zinc-950/90
      backdrop-blur-xl
      border-b border-zinc-800
      safe-top
      "
    >
      <div
        className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        py-3
        "
      >
        {/* Top Row */}
        <div className="flex items-center justify-between gap-3">

          {/* Left */}

          <div className="flex items-center gap-3 min-w-0">

            <div
              className="
              w-11 h-11
              sm:w-12 sm:h-12
              rounded-2xl
              bg-pink-600
              flex items-center justify-center
              shrink-0
              "
            >
              <Heart
                className="text-white fill-white"
                size={22}
              />
            </div>

            <div className="min-w-0">

              <h1
                className="
                text-lg
                sm:text-xl
                font-bold
                truncate
                "
              >
                Love Vault
              </h1>

              <p
                className="
                text-[11px]
                sm:text-xs
                text-zinc-400
                truncate
                "
              >
                Private memories together ❤️
              </p>

            </div>

          </div>

          {/* Search */}

          <button
            onClick={onSearch}
            className="
            w-10 h-10
            sm:w-11 sm:h-11
            rounded-xl
            bg-zinc-900
            hover:bg-zinc-800
            flex items-center justify-center
            shrink-0
            "
          >
            <Search size={20} />
          </button>

        </div>

        {/* Storage */}

        <div
          className="
          mt-4
          rounded-2xl
          bg-zinc-900
          border border-zinc-800
          p-4
          "
        >
          <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-2">

              <HardDrive
                size={16}
                className="text-zinc-400"
              />

              <span className="text-sm font-medium">
                Storage
              </span>

            </div>

            <span
              className="
              text-[11px]
              sm:text-sm
              text-zinc-400
              "
            >
              {usedStorage.toFixed(2)} GB / {totalStorage} GB
            </span>

          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">

            <div
              className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-pink-500
              to-fuchsia-500
              transition-all
              duration-500
              "
              style={{
                width: `${percent}%`,
              }}
            />

          </div>

        </div>
      </div>
    </header>
  );
}