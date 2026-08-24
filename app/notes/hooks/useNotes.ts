"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/client";

import {
  Note,
  CreateNoteData,
  UpdateNoteData,
} from "../types";

export default function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // LOAD NOTES
  // =========================

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("User not authenticated.");
      }

      const {
        data,
        error: notesError,
      } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("is_pinned", {
          ascending: false,
        })
        .order("updated_at", {
          ascending: false,
        });

      if (notesError) {
        throw notesError;
      }

      setNotes((data ?? []) as Note[]);
    } catch (err: any) {
  console.error(
    "Notes load error:",
    JSON.stringify(err, null, 2)
  );

  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "Unable to load notes.";

  setError(message);
} finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // CREATE NOTE
  // =========================

  const createNote = useCallback(
    async (noteData: CreateNoteData) => {
      try {
        setSaving(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error("User not authenticated.");
        }

        const title = noteData.title?.trim() ?? "";
        const content = noteData.content ?? "";

        if (!title && !content.trim()) {
          throw new Error(
            "Please add a title or note content."
          );
        }

        const {
          data,
          error: insertError,
        } = await supabase
          .from("notes")
          .insert({
            user_id: user.id,
            title,
            content,
            is_pinned:
              noteData.is_pinned ?? false,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        if (data) {
          setNotes((prev) => [
            data as Note,
            ...prev,
          ]);
        }

        return data as Note;
      } catch (err: any) {
        console.error("Notes create error:", err);

        setError(
          err?.message ?? "Unable to create note."
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // =========================
  // UPDATE NOTE
  // =========================

  const updateNote = useCallback(
    async (
      id: string,
      noteData: UpdateNoteData
    ) => {
      try {
        setSaving(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error("User not authenticated.");
        }

        const updateData: Record<
          string,
          unknown
        > = {};

        if (noteData.title !== undefined) {
          updateData.title =
            noteData.title.trim();
        }

        if (noteData.content !== undefined) {
          updateData.content =
            noteData.content;
        }

        if (noteData.is_pinned !== undefined) {
          updateData.is_pinned =
            noteData.is_pinned;
        }

        updateData.updated_at =
          new Date().toISOString();

        const {
          data,
          error: updateError,
        } = await supabase
          .from("notes")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        if (data) {
          setNotes((prev) =>
            prev
              .map((note) =>
                note.id === id
                  ? (data as Note)
                  : note
              )
              .sort((a, b) => {
                if (
                  a.is_pinned !==
                  b.is_pinned
                ) {
                  return a.is_pinned
                    ? -1
                    : 1;
                }

                return (
                  b.updated_at.localeCompare(
                    a.updated_at
                  )
                );
              })
          );
        }

        return data as Note;
      } catch (err: any) {
        console.error("Notes update error:", err);

        setError(
          err?.message ?? "Unable to update note."
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // =========================
  // DELETE NOTE
  // =========================

  const deleteNote = useCallback(
    async (id: string) => {
      try {
        setSaving(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error("User not authenticated.");
        }

        const {
          error: deleteError,
        } = await supabase
          .from("notes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) {
          throw deleteError;
        }

        setNotes((prev) =>
          prev.filter(
            (note) => note.id !== id
          )
        );
      } catch (err: any) {
        console.error("Notes delete error:", err);

        setError(
          err?.message ?? "Unable to delete note."
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // =========================
  // TOGGLE PIN
  // =========================

  const togglePin = useCallback(
    async (note: Note) => {
      await updateNote(note.id, {
        is_pinned: !note.is_pinned,
      });
    },
    [updateNote]
  );

  // =========================
  // REFRESH
  // =========================

  const refreshNotes = useCallback(
    async () => {
      await loadNotes();
    },
    [loadNotes]
  );

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // =========================
  // RETURN
  // =========================

  return {
    notes,
    loading,
    saving,
    error,

    loadNotes,
    refreshNotes,

    createNote,
    updateNote,
    deleteNote,
    togglePin,
  };
}