export type VaultVisibility =
  | "private"
  | "shared";

export type VaultFileType =
  | "image"
  | "video"
  | "audio"
  | "document";

export type VaultTab =
  | "private"
  | "shared"
  | "favorites"
  | "photos"
  | "videos"
  | "trash";

export type VaultSort =
  | "newest"
  | "oldest"
  | "name"
  | "favorites";

export interface VaultFolder {
  id: string;

  user_id: string;

  partner_id: string | null;

  name: string;

  visibility: VaultVisibility;

  pinned: boolean;

  deleted: boolean;

  deleted_at: string | null;

  created_at: string;

  updated_at?: string | null;

  cover_url?: string | null;

  color?: string | null;

  emoji?: string | null;

  file_count?: number;
}

export interface VaultItem {
  id: string;

  file_name: string;

  file_type: VaultFileType;

  storage_path: string;

  signedUrl: string;

  file_size?: number;

  favorite: boolean;

  visibility: VaultVisibility;

  folder: string | null;

  folder_id: string | null;

  created_at: string;

  updated_at?: string | null;

  deleted: boolean;

  deleted_at?: string | null;
}

export interface StorageInfo {
  usedGB: number;

  totalGB: number;

  percent: number;
}

export interface VaultStats {
  privateCount: number;

  sharedCount: number;

  favoriteCount: number;

  photoCount: number;

  videoCount: number;

  trashCount: number;

  totalFiles: number;
}