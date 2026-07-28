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
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">

      <div className="px-4 py-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center shadow-lg shadow-pink-600/30">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              Love Vault
            </h1>

            <p className="text-xs text-zinc-400">
              Private memories together ❤️
            </p>
          </div>

        </div>

        <button
          onClick={onSearch}
          className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition flex items-center justify-center"
        >
          <Search className="w-5 h-5" />
        </button>

      </div>

      <div className="px-4 pb-4">

        <div className="rounded-2xl bg-zinc-900 p-4">

          <div className="flex justify-between text-sm mb-2">

            <div className="flex items-center gap-2 text-zinc-300">
              <HardDrive size={16} />
              Storage
            </div>

            <span className="text-zinc-400">
              {usedStorage.toFixed(2)} GB / {totalStorage} GB
            </span>

          </div>

          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">

            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />

          </div>

        </div>

      </div>

    </header>
  );
}