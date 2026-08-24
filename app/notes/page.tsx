"use client";

import { useMemo, useState } from "react";

import NotesHeader from "./components/NotesHeader";
import NotesList from "./components/NotesList";
import NoteForm from "./components/NoteForm";

import useNotes from "./hooks/useNotes";
import {
  Note,
  CreateNoteData,
} from "./types";

export default function NotesPage() {
  const {
    notes,
    loading,
    saving,
    error,

    createNote,
    updateNote,
    deleteNote,
    togglePin,
  } = useNotes();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingNote, setEditingNote] =
    useState<Note | null>(null);

  // =========================
  // FILTER NOTES
  // =========================

  const filteredNotes = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) {
      return notes;
    }

    return notes.filter((note) => {
      return (
        note.title
          .toLowerCase()
          .includes(query) ||
        note.content
          .toLowerCase()
          .includes(query)
      );
    });
  }, [notes, searchQuery]);

  // =========================
  // ADD NOTE
  // =========================

  function handleAddNote() {
    setEditingNote(null);
    setFormOpen(true);
  }

  // =========================
  // EDIT NOTE
  // =========================

  function handleEdit(note: Note) {
    setEditingNote(note);
    setFormOpen(true);
  }

  // =========================
  // CLOSE FORM
  // =========================

  function handleCloseForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingNote(null);
  }

  // =========================
  // SAVE NOTE
  // =========================

  async function handleSave(
    data: CreateNoteData
  ) {
    if (editingNote) {
      await updateNote(
        editingNote.id,
        data
      );
    } else {
      await createNote(data);
    }

    setFormOpen(false);
    setEditingNote(null);
  }

  // =========================
  // DELETE NOTE
  // =========================

  async function handleDelete(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this note?"
      );

    if (!confirmed) {
      return;
    }

    await deleteNote(id);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <NotesHeader
          searchQuery={searchQuery}
          onSearchChange={
            setSearchQuery
          }
          onAddNote={
            handleAddNote
          }
        />

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Notes */}
        <NotesList
          notes={filteredNotes}
          loading={loading}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePin={togglePin}
        />

        {/* Note Form */}
        <NoteForm
          open={formOpen}
          note={editingNote}
          saving={saving}
          onClose={
            handleCloseForm
          }
          onSave={handleSave}
        />
      </div>
    </main>
  );
}
