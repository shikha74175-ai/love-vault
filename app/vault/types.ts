export type VaultType =
  | "shared"
  | "private"
  | "photo"
  | "video"
  | "audio"
  | "document"
  | "note"
  | "favorite"
  | "trash";

export interface VaultItem {
  id: string;

  owner_id: string;

  partner_id: string | null;

  type: "photo" | "video" | "audio" | "document" | "note";

  title: string;

  description?: string;

  file_url: string | null;

  thumbnail_url?: string | null;

  is_private: boolean;

  is_favorite: boolean;

  deleted: boolean;

  created_at: string;

  updated_at?: string;
}