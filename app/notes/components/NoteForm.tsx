"use client";

import { useEffect, useState } from "react";
import {
  Pin,
  Save,
  X,
} from "lucide-react";

import {
  Note,
  CreateNoteData,
} from "../types";

type Props = {
  open: boolean;
  note?: Note | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (
    data: CreateNoteData
  ) => Promise<void>;
};

export default function NoteForm({
  open,
  note,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] =
    useState(false);

  const [localError, setLocalError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setIsPinned(note?.is_pinned ?? false);
    setLocalError(null);
  }, [open, note]);

  function handleClose() {
    if (saving) return;
    onClose();
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setLocalError(null);

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle && !cleanContent) {
      setLocalError(
        "Please add a title or write something in your note."
      );
      return;
    }

    try {
      await onSave({
        title: cleanTitle,
        content,
        is_pinned: isPinned,
      });
    } catch (error: any) {
      setLocalError(
        error?.message ??
          "Unable to save note."
      );
    }
  }

  if (!open) return null;

  const editing = Boolean(note);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Pin size={18} />
              </div>

              <div>
                <h2
                  id="note-form-title"
                  className="text-lg font-semibold text-white"
                >
                  {editing
                    ? "Edit Note"
                    : "New Note"}
                </h2>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Keep your thoughts private ❤️
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >
          {/* Title */}
          <div className="mb-5">
            <label
              htmlFor="note-title"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Title
            </label>

            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Give your note a title..."
              maxLength={200}
              autoFocus
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-zinc-700 focus:border-pink-500/40 focus:bg-zinc-900 focus:ring-1 focus:ring-pink-500/10"
            />
          </div>

          {/* Content */}
          <div className="mb-5">
            <label
              htmlFor="note-content"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Note
            </label>

            <textarea
              id="note-content"
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Write something..."
              rows={9}
              className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 hover:border-zinc-700 focus:border-pink-500/40 focus:bg-zinc-900 focus:ring-1 focus:ring-pink-500/10"
            />

            <div className="mt-2 flex justify-end">
              <span className="text-xs text-zinc-600">
                {content.length} characters
              </span>
            </div>
          </div>

          {/* Pin */}
          <button
            type="button"
            onClick={() =>
              setIsPinned(
                (current) => !current
              )
            }
            className={`mb-5 flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
              isPinned
                ? "border-pink-500/30 bg-pink-500/[0.06]"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isPinned
                  ? "bg-pink-500/10 text-pink-400"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              <Pin size={17} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Pin this note
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                Keep it at the top of your notes.
              </p>
            </div>

            <div
              className={`h-5 w-9 rounded-full p-0.5 transition ${
                isPinned
                  ? "bg-pink-600"
                  : "bg-zinc-700"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                  isPinned
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {/* Error */}
          {localError && (
            <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-400">
              {localError}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-950/20 transition hover:bg-pink-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {saving
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}