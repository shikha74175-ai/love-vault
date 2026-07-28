export type VaultType =
  | "image"
  | "video"
  | "audio"
  | "document";

export interface VaultItem {
  id: string;

  file_name: string;

  file_type: "image" | "video" | "audio" | "document";

  favorite: boolean;

  visibility: "private" | "shared";

  folder: string | null;

  created_at: string;

  signedUrl: string;
}