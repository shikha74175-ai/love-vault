"use client";

import { useState } from "react";
import { supabase } from "@/lib/client";
import { VaultFolder } from "../types";

type UseFoldersProps = {
  userId: string;

  loadVault: () => Promise<void>;

  folderName: string;
  setFolderName: (v: string) => void;

  folderVisibility: "private" | "shared";
  setFolderVisibility: (
    v: "private" | "shared"
  ) => void;

  setShowFolderModal: (
    v: boolean
  ) => void;

  renameFolder: VaultFolder | null;

  newFolderName: string;

  setRenameFolder: (
    folder: VaultFolder | null
  ) => void;

  setNewFolderName: (
    name: string
  ) => void;

  setMenuOpen: (
    id: string | null
  ) => void;

  setSelectedFolder: (
    id: string | null
  ) => void;
};

export default function useFolders({

  userId,

  loadVault,

  folderName,
  setFolderName,

  folderVisibility,
  setFolderVisibility,

  setShowFolderModal,

  renameFolder,
  newFolderName,
  setRenameFolder,
  setNewFolderName,

  setMenuOpen,
  setSelectedFolder,

}: UseFoldersProps) {

  // ==========================
  // STATES
  // ==========================

  const [folders, setFolders] =
    useState<VaultFolder[]>([]);

  const [loading, setLoading] =
    useState(false);

  // ==========================
  // HELPERS
  // ==========================

  async function refresh() {

    await loadFolders();

    await loadVault();

  }

  function showError(error: any) {

    console.error(error);

    alert(error.message);

  }

  // ==========================
  // LOAD FOLDERS
  // ==========================

  async function loadFolders() {

    try {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("vault_folders")
          .select("*")
          .or(
            `user_id.eq.${userId},partner_id.eq.${userId}`
          );

      if (error) throw error;

      const foldersWithCount =
        await Promise.all(

          (data ?? []).map(
            async (folder) => {

              const { count } =
                await supabase
                  .from("vault_files")
                  .select("*", {
                    count: "exact",
                    head: true,
                  })
                  .eq(
                    "folder_id",
                    folder.id
                  );

              return {

                ...folder,

                file_count:
                  count ?? 0,

              };

            }
          )
        );

      foldersWithCount.sort((a, b) => {

        if (a.pinned && !b.pinned)
          return -1;

        if (!a.pinned && b.pinned)
          return 1;

        return (
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
        );

      });

      setFolders(foldersWithCount);

    } catch (err: any) {

      showError(err);

    } finally {

      setLoading(false);

    }

  }
    // ==========================
  // CREATE FOLDER
  // ==========================

  async function createFolder() {

    const name = folderName.trim();

    if (!name) {
      alert("Folder name is required.");
      return;
    }

    try {

      // Duplicate check
      const exists = folders.find(
        (f) =>
          f.name.toLowerCase() ===
            name.toLowerCase() &&
          f.visibility === folderVisibility &&
          !f.deleted
      );

      if (exists) {
        alert("Folder already exists.");
        return;
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("partner_id")
          .eq("id", userId)
          .single();

      const { error } =
        await supabase
          .from("vault_folders")
          .insert({

            user_id: userId,

            partner_id:
              folderVisibility === "shared"
                ? profile?.partner_id
                : null,

            name,

            visibility:
              folderVisibility,

            pinned: false,

            deleted: false,

          });

      if (error) throw error;

      setFolderName("");

      setFolderVisibility("private");

      setShowFolderModal(false);

      await refresh();

    } catch (err: any) {

      showError(err);

    }

  }

  // ==========================
  // SAVE FOLDER NAME
  // ==========================

  async function saveFolderName() {

    if (!renameFolder) return;

    const name =
      newFolderName.trim();

    if (!name) {
      alert("Folder name is required.");
      return;
    }

    try {

      // Duplicate check
      const exists = folders.find(
        (f) =>
          f.id !== renameFolder.id &&
          f.name.toLowerCase() ===
            name.toLowerCase() &&
          !f.deleted
      );

      if (exists) {
        alert(
          "Folder name already exists."
        );
        return;
      }

      const { error } =
        await supabase
          .from("vault_folders")
          .update({

            name,

          })
          .eq(
            "id",
            renameFolder.id
          );

      if (error) throw error;

      setRenameFolder(null);

      setNewFolderName("");

      await refresh();

    } catch (err: any) {

      showError(err);

    }

  }
    // ==========================
  // PIN / UNPIN FOLDER
  // ==========================

  async function pinFolder(
    folder: VaultFolder
  ) {

    try {

      const { error } =
        await supabase
          .from("vault_folders")
          .update({

            pinned: !folder.pinned,

          })
          .eq("id", folder.id);

      if (error) throw error;

      await refresh();

    } catch (err: any) {

      showError(err);

    }

  }

  // ==========================
  // MOVE TO TRASH
  // ==========================

  async function deleteFolder(
    folder: VaultFolder
  ) {

    const ok = confirm(
      `Move "${folder.name}" to Trash?`
    );

    if (!ok) return;

    try {

      // Trash Folder

      const { error } =
        await supabase
          .from("vault_folders")
          .update({

            deleted: true,

            deleted_at:
              new Date().toISOString(),

          })
          .eq("id", folder.id);

      if (error) throw error;

      // Trash All Files

      const { error: fileError } =
        await supabase
          .from("vault_files")
          .update({

            deleted: true,

            deleted_at:
              new Date().toISOString(),

          })
          .eq(
            "folder_id",
            folder.id
          );

      if (fileError)
        throw fileError;

      setMenuOpen(null);

      setSelectedFolder(null);

      await refresh();

    } catch (err: any) {

      showError(err);

    }

  }

  // ==========================
  // RESTORE FOLDER
  // ==========================

  async function restoreFolder(
    folder: VaultFolder
  ) {

    const ok = confirm(
      `Restore "${folder.name}"?`
    );

    if (!ok) return;

    try {

      // Restore Folder

      const { error } =
        await supabase
          .from("vault_folders")
          .update({

            deleted: false,

            deleted_at: null,

          })
          .eq("id", folder.id);

      if (error) throw error;

      // Restore Files

      const { error: fileError } =
        await supabase
          .from("vault_files")
          .update({

            deleted: false,

            deleted_at: null,

          })
          .eq(
            "folder_id",
            folder.id
          );

      if (fileError)
        throw fileError;

      setMenuOpen(null);

      setSelectedFolder(null);

      await refresh();

    } catch (err: any) {

      showError(err);

    }

  }
    // ==========================
  // DELETE FOREVER
  // ==========================

  async function permanentlyDeleteFolder(
    folder: VaultFolder
  ) {

    const ok = confirm(
      `Delete "${folder.name}" forever?\n\nThis action cannot be undone.`
    );

    if (!ok) return;

    try {

      // -------------------------
      // Get All Files
      // -------------------------

      const {
        data: files,
        error,
      } = await supabase
        .from("vault_files")
        .select("*")
        .eq("folder_id", folder.id);

      if (error) throw error;

      // -------------------------
      // Delete Storage Files
      // -------------------------

      for (const file of files ?? []) {

        let bucket =
          "vault-documents";

        switch (file.file_type) {

          case "image":
            bucket =
              "vault-images";
            break;

          case "video":
            bucket =
              "vault-videos";
            break;

          case "audio":
            bucket =
              "vault-audio";
            break;

        }

        const {
          error: storageError,
        } = await supabase.storage
          .from(bucket)
          .remove([
            file.storage_path,
          ]);

        if (storageError) {

          console.error(
            storageError
          );

        }

      }

      // -------------------------
      // Delete Files
      // -------------------------

      const {
        error: fileDeleteError,
      } = await supabase
        .from("vault_files")
        .delete()
        .eq(
          "folder_id",
          folder.id
        );

      if (fileDeleteError)
        throw fileDeleteError;

      // -------------------------
      // Delete Folder
      // -------------------------

      const {
        error: folderDeleteError,
      } = await supabase
        .from("vault_folders")
        .delete()
        .eq(
          "id",
          folder.id
        );

      if (folderDeleteError)
        throw folderDeleteError;

      setMenuOpen(null);

      setSelectedFolder(null);

      await refresh();

    } catch (err: any) {

      showError(err);

    }

  }

  // ==========================
  // RETURN
  // ==========================

  return {

    loading,

    folders,

    setFolders,

    refresh,

    loadFolders,

    createFolder,

    saveFolderName,

    pinFolder,

    deleteFolder,

    restoreFolder,

    permanentlyDeleteFolder,

  };

}