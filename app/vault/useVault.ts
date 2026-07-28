"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import type { VaultItem } from "./types";

export function useVault() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadVault() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("partner_id")
      .eq("id", user.id)
      .single();

    const partnerId = profile?.partner_id;

    const { data, error } = await supabase
      .from("vault")
      .select("*")
      .or(
        `owner_id.eq.${user.id},partner_id.eq.${user.id}`
      )
      .eq("deleted", false)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setItems([]);
      setLoading(false);
      return;
    }

    const finalItems: VaultItem[] = [];

    for (const item of data ?? []) {

      let url = "";

      let bucket = "vault-images";

if (item.file_type.startsWith("video")) {
  bucket = "vault-videos";
} else if (item.file_type.startsWith("audio")) {
  bucket = "vault-audio";
} else if (
  item.file_type.includes("pdf") ||
  item.file_type.includes("word") ||
  item.file_type.includes("document") ||
  item.file_type.includes("text")
) {
  bucket = "vault-documents";
}

const { data: signed } = await supabase.storage
  .from(bucket)
  .createSignedUrl(item.storage_path, 60 * 60);

      if (signed?.signedUrl) {
        url = signed.signedUrl;
      }

      finalItems.push({
        ...item,
        storage_path: url,
      });
    }

    setItems(finalItems);
    setLoading(false);
  }

  useEffect(() => {
    loadVault();
  }, []);

  return {
    items,
    loading,
    refresh: loadVault,
  };
}