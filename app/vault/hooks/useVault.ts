"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/client";
import { VaultItem } from "../types";

type UseVaultProps = {
  userId: string;
};

export default function useVault({
  userId,
}: UseVaultProps) {

  // ==========================
  // STATES
  // ==========================

  const [items, setItems] =
    useState<VaultItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [usedStorage, setUsedStorage] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("private");

  const [selectedFolder, setSelectedFolder] =
    useState<string | null>(null);

  // ==========================
  // HELPERS
  // ==========================

  function showError(error: unknown) {

    console.error(error);

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Something went wrong.");
    }

  }

  function getBucket(
    type: VaultItem["file_type"]
  ) {

    switch (type) {

      case "image":
        return "vault-images";

      case "video":
        return "vault-videos";

      case "audio":
        return "vault-audio";

      default:
        return "vault-documents";

    }

  }
    // ==========================
  // REFRESH
  // ==========================

  async function refreshVault() {
    await loadVault();
  }

  // ==========================
  // LOAD VAULT
  // ==========================

  async function loadVault() {

    try {

      setLoading(true);

      const { data, error } = await supabase
        .from("vault_files")
        .select(`
          *,
          vault_folders (
            id,
            name
          )
        `)
        .or(
          `user_id.eq.${userId},and(partner_id.eq.${userId},visibility.eq.shared)`
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      let totalBytes = 0;

      const result: VaultItem[] = [];

      for (const file of data ?? []) {

        totalBytes += file.file_size ?? 0;

        const bucket = getBucket(
          file.file_type
        );

        const { data: signed } =
          await supabase.storage
            .from(bucket)
            .createSignedUrl(
              file.storage_path,
              3600
            );

        result.push({

          id: file.id,

          file_name:
            file.file_name,

          file_type:
            file.file_type,

          favorite:
            file.favorite,

          visibility:
            file.visibility,

          folder_id:
            file.folder_id,

          folder:
            file.vault_folders?.name ??
            null,

          created_at:
            file.created_at,

          deleted:
            file.deleted,

          deleted_at:
            file.deleted_at,

          signedUrl:
            signed?.signedUrl ?? "",
          storage_path: file.storage_path,

        });

      }

      const usedGB =
        totalBytes /
        1024 /
        1024 /
        1024;

      setUsedStorage(
        Number(
          usedGB.toFixed(2)
        )
      );

      setItems(result);

    } catch (err) {

      showError(err);

    } finally {

      setLoading(false);

    }

  }
    // ==========================
  // TOGGLE FAVORITE
  // ==========================

  async function toggleFavorite(
    item: VaultItem
  ) {

    try {

      const { error } = await supabase
        .from("vault_files")
        .update({
          favorite: !item.favorite,
        })
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                favorite: !i.favorite,
              }
            : i
        )
      );

    } catch (err) {

      showError(err);

    }

  }

  // ==========================
  // MOVE MEMORY TO TRASH
  // ==========================

  async function deleteMemory(
    item: VaultItem
  ) {

    const ok = confirm(
      `Move "${item.file_name}" to Trash?`
    );

    if (!ok) return;

    try {

      const { error } = await supabase
        .from("vault_files")
        .update({

          deleted: true,

          deleted_at:
            new Date().toISOString(),

        })
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                deleted: true,
              }
            : i
        )
      );

      await refreshVault();

    } catch (err) {

      showError(err);

    }

  }

  // ==========================
  // RESTORE MEMORY
  // ==========================

  async function restoreMemory(
    item: VaultItem
  ) {

    const ok = confirm(
      `Restore "${item.file_name}"?`
    );

    if (!ok) return;

    try {

      const { error } = await supabase
        .from("vault_files")
        .update({

          deleted: false,

          deleted_at: null,

        })
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                deleted: false,
              }
            : i
        )
      );

      await refreshVault();

    } catch (err) {

      showError(err);

    }

  }
    // ==========================
  // DELETE MEMORY FOREVER
  // ==========================

  async function deleteForeverMemory(
    item: VaultItem
  ) {

    const ok = confirm(
      `Delete "${item.file_name}" forever?\n\nThis action cannot be undone.`
    );

    if (!ok) return;

    try {

      // Delete Storage

      const bucket = getBucket(
        item.file_type
      );

      const { error: storageError } =
        await supabase.storage
          .from(bucket)
          .remove([
            item.storage_path ??
            ""
          ]);

      if (storageError) {
        console.error(storageError);
      }

      // Delete Database

      const { error } =
        await supabase
          .from("vault_files")
          .delete()
          .eq("id", item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.filter(
          (i) => i.id !== item.id
        )
      );

      await refreshVault();

    } catch (err) {

      showError(err);

    }

  }

  // ==========================
  // FILTERED ITEMS
  // ==========================

  const filteredItems =
    useMemo(() => {

      return items

        // Folder

        .filter((item) => {

          if (!selectedFolder)
            return true;

          return (
            item.folder_id ===
            selectedFolder
          );

        })

        // Tab

        .filter((item) => {

          switch (activeTab) {

            case "private":
              return (
                item.visibility ===
                  "private" &&
                !item.deleted
              );

            case "shared":
              return (
                item.visibility ===
                  "shared" &&
                !item.deleted
              );

            case "favorites":
              return (
                item.favorite &&
                !item.deleted
              );

            case "photos":
              return (
                item.file_type ===
                  "image" &&
                !item.deleted
              );

            case "videos":
              return (
                item.file_type ===
                  "video" &&
                !item.deleted
              );

            case "trash":
              return item.deleted;

            default:
              return !item.deleted;

          }

        })

        // Search

        .filter((item) => {

          if (!search)
            return true;

          return (

            item.file_name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )

            ||

            (item.folder ?? "")
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )

          );

        });

    }, [

      items,

      search,

      activeTab,

      selectedFolder,

    ]);

  // ==========================
  // RETURN
  // ==========================

  return {

    loading,

    items,

    setItems,

    filteredItems,

    usedStorage,

    search,

    setSearch,

    activeTab,

    setActiveTab,

    selectedFolder,

    setSelectedFolder,

    refreshVault,

    loadVault,

    toggleFavorite,

    deleteMemory,

    restoreMemory,

    deleteForeverMemory,

  };

}

