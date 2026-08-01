"use client";

import { useState } from "react";
import { supabase } from "@/lib/client";


import {
  UserProfile,
  PartnerProfile,
  StorageInfo,
} from "../types";

type Props = {
  userId: string;
};

export default function useSettings({
  userId,
}: Props) {

  // ==========================
  // STATES
  // ==========================

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [partner, setPartner] =
    useState<PartnerProfile | null>(null);

  const [storage, setStorage] =
    useState<StorageInfo>({
      usedGB: 0,
      totalGB: 5,
      percentage: 0,
    });

  // ==========================
  // ERROR
  // ==========================

  function showError(error: unknown) {

    console.error(error);

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Something went wrong.");
    }

  }
    // ==========================
  // LOAD PROFILE
  // ==========================
async function loadProfile() {

  if (!userId) return;

  try {

    setLoading(true);

    const { data, error } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;

    let avatarUrl: string | null = null;

    if (data.avatar_url) {

      const { data: signed } =
        await supabase.storage
          .from("avatars")
          .createSignedUrl(
            data.avatar_url,
            60 * 60
          );

      avatarUrl =
        signed?.signedUrl ?? null;

    }

    setProfile({

      id: data.id,

      name:
        data.full_name ?? "",

      username:
        data.username,

      email: "",

      avatar_url:
        avatarUrl,

      bio:
        data.bio,

      gender:
        data.gender,

      birth_date:
        data.birth_date,

      partner_id:
        data.partner_id,

      anniversary:
        null,

      created_at:
        data.created_at,
        private_account:
  data.private_account ?? false,

hide_last_seen:
  data.hide_last_seen ?? false,

hide_online_status:
  data.hide_online_status ?? false,

vault_pin_enabled:
  data.vault_pin_enabled ?? false,
  vault_pin:
  data.vault_pin,

    });

    if (data.partner_id) {

      await loadPartner(
        data.partner_id
      );

    }

    await calculateStorage();

  } catch (err) {

    showError(err);

  } finally {

    setLoading(false);

  }

}

  // ==========================
  // LOAD PARTNER
  // ==========================

  async function loadPartner(
  partnerId: string
) {

  try {

    const { data, error } =
      await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          username,
          avatar_url
        `)
        .eq("id", partnerId)
        .single();

    if (error) throw error;

    let avatarUrl: string | null =
      null;

    if (data.avatar_url) {

      const { data: signed } =
        await supabase.storage
          .from("avatars")
          .createSignedUrl(
            data.avatar_url,
            60 * 60
          );

      avatarUrl =
        signed?.signedUrl ?? null;

    }

    setPartner({

      id: data.id,

      name:
        data.full_name ??
        data.username ??
        "Partner",

      avatar_url:
        avatarUrl,

      email: "",

    });

  } catch (err) {

    console.error(err);

  }

}

  // ==========================
  // STORAGE
  // ==========================

  async function calculateStorage() {

    try {

      const { data, error } =
        await supabase
          .from("vault_files")
          .select("file_size")
          .or(
            `user_id.eq.${userId},partner_id.eq.${userId}`
          );

      if (error) throw error;

      let bytes = 0;

      for (const file of data ?? []) {

        bytes +=
          file.file_size ?? 0;

      }

      const usedGB =
        bytes /
        1024 /
        1024 /
        1024;

      const totalGB = 5;

      const percentage =
        (usedGB / totalGB) * 100;

      setStorage({

        usedGB:
          Number(
            usedGB.toFixed(2)
          ),

        totalGB,

        percentage:
          Number(
            percentage.toFixed(0)
          ),

      });

    } catch (err) {

      console.error(err);

    }

  }
  // ==========================
// UPLOAD AVATAR
// ==========================

async function uploadAvatar(
  file: File
) {

  if (!userId) return;

  try {

    setSaving(true);

    const extension =
      file.name
        .split(".")
        .pop();

    const path =
      `${userId}/avatar.${extension}`;

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: true,
        });

    if (uploadError)
      throw uploadError;

    const {
      error: profileError,
    } =
      await supabase
        .from("profiles")
        .update({

          avatar_url: path,

        })
        .eq("id", userId);

    if (profileError)
      throw profileError;

    await loadProfile();

  } catch (err) {

    showError(err);

  } finally {

    setSaving(false);

  }

}
// ==========================
// USERNAME VALIDATION
// ==========================

async function validateUsername(
  username: string
) {

  const value = username
    .trim()
    .toLowerCase();

  if (value.length < 3) {

    throw new Error(
      "Username must be at least 3 characters."
    );

  }

  if (value.length > 20) {

    throw new Error(
      "Username cannot exceed 20 characters."
    );

  }

  const regex =
    /^[a-z0-9_.]+$/;

  if (!regex.test(value)) {

    throw new Error(
      "Only lowercase letters, numbers, '_' and '.' are allowed."
    );

  }

  const { data, error } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("username", value)
      .neq("id", userId)
      .maybeSingle();

  if (error) throw error;

  if (data) {

    throw new Error(
      "Username already taken."
    );

  }

  return value;

}
    // ==========================
  // SAVE PROFILE
  // ==========================

 async function saveProfile() {

  if (!profile) return;

  try {

    setSaving(true);

    const username =
      await validateUsername(
        profile.username ?? ""
      );

    const { error } =
      await supabase
        .from("profiles")
        .update({

          full_name:
            profile.name,

          username,

          bio:
            profile.bio,

          gender:
            profile.gender,

          birth_date:
            profile.birth_date,

          private_account:
            profile.private_account,

          hide_last_seen:
            profile.hide_last_seen,

          hide_online_status:
            profile.hide_online_status,

          vault_pin_enabled:
            profile.vault_pin_enabled,

        })
        .eq("id", userId);

    if (error) throw error;

    await loadProfile();

    alert(
      "✅ Profile updated successfully."
    );

  } catch (err) {

    showError(err);

  } finally {

    setSaving(false);

  }

}
async function saveVaultPin(
  pin: string
) {

  if (!userId)
    return;

  if (!/^\d{4}$/.test(pin)) {

    throw new Error(
      "PIN must be exactly 4 digits."
    );

  }

  const { error } =
    await supabase
      .from("profiles")
      .update({

        vault_pin: pin,

        vault_pin_enabled: true,

      })
      .eq("id", userId);

  if (error)
    throw error;

  await loadProfile();

}
async function removeVaultPin() {

  if (!userId)
    return;

  const { error } =
    await supabase
      .from("profiles")
      .update({

        vault_pin: null,

        vault_pin_enabled: false,

      })
      .eq("id", userId);

  if (error)
    throw error;

  await loadProfile();

}
async function verifyVaultPin(
  pin: string
) {

  if (!profile)
    return false;

  return (
    profile.vault_pin === pin
  );

}

  // ==========================
  // REFRESH
  // ==========================

 async function refreshSettings() {

  await loadProfile();

}

  // ==========================
  // RETURN
  // ==========================

 return {

  loading,
  saving,

  profile,
  setProfile,

  partner,

  storage,

  loadProfile,
  loadPartner,

  calculateStorage,

  uploadAvatar,

  saveProfile,

  refreshSettings,
  validateUsername,
  saveVaultPin,

removeVaultPin,

verifyVaultPin,

};}