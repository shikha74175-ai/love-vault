"use client";

import {
  Pin,
  PinOff,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";

import { Note } from "../types";

type Props = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
};

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: Props) {
  const preview =
    note.content.trim() ||
    "No content yet...";

  const updatedDate = new Date(
    note.updated_at
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border p-5 transition-all duration-200 ${
        note.is_pinned
          ? "border-pink-500/30 bg-pink-500/[0.04] shadow-lg shadow-pink-950/10"
          : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900"
      }`}
    >
      {/* Pinned indicator */}
      {note.is_pinned && (
        <div className="absolute right-0 top-0 rounded-bl-2xl bg-pink-500/10 px-3 py-1.5 text-xs font-medium text-pink-400">
          Pinned
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              note.is_pinned
                ? "bg-pink-500/10 text-pink-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            <FileText size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate pr-12 font-semibold text-white">
              {note.title || "Untitled Note"}
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              Updated {updatedDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onTogglePin(note)
          }
          aria-label={
            note.is_pinned
              ? "Unpin note"
              : "Pin note"
          }
          title={
            note.is_pinned
              ? "Unpin note"
              : "Pin note"
          }
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
            note.is_pinned
              ? "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
              : "text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
          }`}
        >
          {note.is_pinned ? (
            <Pin size={17} />
          ) : (
            <PinOff size={17} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="mb-5 min-h-[100px]">
        <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
          {preview}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-zinc-800/80 pt-4">
        <button
          type="button"
          onClick={() => onEdit(note)}
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-3.5 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(note.id)
          }
          className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </article>
  );
}