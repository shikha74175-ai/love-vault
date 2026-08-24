"use client";

import {
  FileText,
  Plus,
  Search,
  X,
} from "lucide-react";

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddNote: () => void;
};

export default function NotesHeader({
  searchQuery,
  onSearchChange,
  onAddNote,
}: Props) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <FileText size={27} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Notes
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Your private thoughts, together ❤️
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddNote}
          className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-950/20 transition hover:bg-pink-700 active:scale-[0.98]"
        >
          <Plus size={19} />
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={19}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Search your notes..."
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 py-3.5 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-zinc-700 focus:border-pink-500/40 focus:bg-zinc-900 focus:ring-1 focus:ring-pink-500/10"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={17} />
          </button>
        )}
      </div>
    </div>
  );
}