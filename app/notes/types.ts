export type Note = {
  id: string;
  user_id: string;

  title: string;
  content: string;

  is_pinned: boolean;

  created_at: string;
  updated_at: string;
};

export type CreateNoteData = {
  title?: string;
  content?: string;
  is_pinned?: boolean;
};

export type UpdateNoteData =
  Partial<CreateNoteData>;

export type NotesState = {
  notes: Note[];

  loading: boolean;

  saving: boolean;

  error: string | null;
};