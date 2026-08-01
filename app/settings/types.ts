export type Visibility = "private" | "shared";

export interface UserProfile {
  id: string;

  name: string;

  username: string | null;

  email: string;

  avatar_url: string | null;

  bio: string | null;

  partner_id: string | null;

  anniversary: string | null;

  created_at: string;
  gender: string | null;
  birth_date: string | null;
  private_account: boolean;

hide_last_seen: boolean;

hide_online_status: boolean;

vault_pin_enabled: boolean;
vault_pin: string | null;
}

export interface PartnerProfile {
  id: string;

  name: string;

  avatar_url: string | null;

  email: string;
}

export interface PrivacySettings {
  private_account: boolean;

  hide_last_seen: boolean;

  hide_online_status: boolean;

  vault_pin_enabled: boolean;
}

export interface StorageInfo {
  usedGB: number;

  totalGB: number;

  percentage: number;
}