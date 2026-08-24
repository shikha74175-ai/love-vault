"use client";

import {
  FileText,
  Loader2,
  Search,
} from "lucide-react";

import { Note } from "../types";
import NoteCard from "./NoteCard";

type Props = {
  notes: Note[];
  loading: boolean;
  searchQuery: string;

  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
};

export default function NotesList({
  notes,
  loading,
  searchQuery,
  onEdit,
  onDelete,
  onTogglePin,
}: Props) {
  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/40">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10">
            <Loader2
              size={24}
              className="animate-spin text-pink-500"
            />
          </div>

          <p className="text-sm text-zinc-500">
            Loading your notes...
          </p>
        </div>
      </div>
    );
  }

  if (
    notes.length === 0 &&
    searchQuery.trim()
  ) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/40 px-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-500">
          <Search size={27} />
        </div>

        <h3 className="text-lg font-semibold text-white">
          No matching notes
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          No notes match{" "}
          <span className="text-zinc-300">
            "{searchQuery}"
          </span>
          .
        </p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="relative flex min-h-[390px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 text-center">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
          <FileText size={34} />
        </div>

        <h3 className="relative text-xl font-semibold text-white">
          Your notes are waiting
        </h3>

        <p className="relative mt-2 max-w-md text-sm leading-6 text-zinc-500">
          Capture your thoughts, plans, little
          memories, and everything you want to
          remember together.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
}