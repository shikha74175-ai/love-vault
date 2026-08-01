"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/client";

import useVault from "./hooks/useVault";
import useFolders from "./hooks/useFolders";

import {
  VaultFolder,
  VaultVisibility,
} from "./types";

import VaultHeader from "./components/VaultHeader";
import VaultTabs from "./components/VaultTabs";
import FolderSection from "./components/FolderSection";
import VaultGrid from "./components/VaultGrid";
import VaultLockScreen from "../settings/components/VaultLockScreen";
import useVaultLock from "../settings/hooks/useVaultLock";
import useSettings from "../settings/hooks/useSettings";

export default function VaultPage() {

  const router = useRouter();

  // ==========================
  // USER
  // ==========================

  const [userId, setUserId] =
    useState("");

  // ==========================
  // UI STATES
  // ==========================

  const [folderName, setFolderName] =
    useState("");

  const [
    folderVisibility,
    setFolderVisibility,
  ] =
    useState<VaultVisibility>(
      "private"
    );

  const [
    showFolderModal,
    setShowFolderModal,
  ] = useState(false);

  const [
    renameFolder,
    setRenameFolder,
  ] =
    useState<VaultFolder | null>(
      null
    );

  const [
    newFolderName,
    setNewFolderName,
  ] =
    useState("");
   

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState<string | null>(
      null
    );
 
const settings = useSettings({
  userId,
});

const {
  profile,
  loadProfile,
  verifyVaultPin,
} = settings;

const lock = useVaultLock({
  verifyVaultPin,
});

  // ==========================
  // USER
  // ==========================
useEffect(() => {

  if (!userId) return;

  Promise.all([

    loadVault(),

    loadFolders(),

    loadProfile(),

  ]);

}, [userId]);

  // ==========================
  // VAULT
  // ==========================

  const vault =
    useVault({

      userId,

    });

  const {

    loading,

    items,

    filteredItems,

    usedStorage,

    search,

    setSearch,

    activeTab,

    setActiveTab,

    selectedFolder,

    setSelectedFolder,

    loadVault,

    toggleFavorite,

    deleteMemory,

    restoreMemory,

    deleteForeverMemory,

  } = vault;

  // ==========================
  // FOLDERS
  // ==========================

  const folder =
    useFolders({

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

    });

  const {

    folders,

    loadFolders,

    createFolder,

    saveFolderName,

    pinFolder,

    deleteFolder,

    restoreFolder,

    permanentlyDeleteFolder,

  } = folder;

  // ==========================
  // LOAD
  // ==========================

  useEffect(() => {

    if (!userId) return;

    Promise.all([

      loadVault(),

      loadFolders(),

    ]);

  }, [userId]);

  // ==========================
  // DERIVED
  // ==========================

  const isTrash =
    activeTab === "trash";

  const visibleFolders =
    folders.filter((folder) => {

      if (isTrash)
        return folder.deleted;

      return (
        folder.visibility ===
          activeTab &&
        !folder.deleted
      );

    });

  const privateCount =
    items.filter(
      (i) =>
        i.visibility ===
          "private" &&
        !i.deleted
    ).length;

  const sharedCount =
    items.filter(
      (i) =>
        i.visibility ===
          "shared" &&
        !i.deleted
    ).length;

  const trashCount =
    items.filter(
      (i) => i.deleted
    ).length;
      // ==========================
  // UI
  // ==========================
if (

  profile?.vault_pin_enabled &&

  lock.locked

) {

  return (

    <VaultLockScreen
      pin={lock.pin}
      setPin={lock.setPin}
      loading={lock.loading}
      error={lock.error}
      onUnlock={lock.unlock}
    />

  );

}
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <VaultHeader
        usedStorage={usedStorage}
        totalStorage={5}
      />

      <VaultTabs
        active={activeTab}
        onChange={setActiveTab}
      />

      <section className="mx-auto max-w-7xl p-4 sm:p-6">

        <FolderSection
          visibleFolders={visibleFolders}
          folders={folders}
          filteredItems={filteredItems}

          activeTab={activeTab}
          isTrash={isTrash}

          privateCount={privateCount}
          sharedCount={sharedCount}
          trashCount={trashCount}

          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}

          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}

          setShowFolderModal={setShowFolderModal}

          pinFolder={pinFolder}
          deleteFolder={deleteFolder}
          restoreFolder={restoreFolder}
          permanentlyDeleteFolder={
            permanentlyDeleteFolder
          }

          setRenameFolder={
            setRenameFolder
          }

          setNewFolderName={
            setNewFolderName
          }

          search={search}
          setSearch={setSearch}

          onUpload={async () => {

            await loadVault();

            await loadFolders();

          }}
        />

        {loading ? (

          <div className="py-20 text-center text-zinc-400">

            Loading Vault...

          </div>

        ) : filteredItems.length === 0 ? (

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">

            <div className="mb-5 text-6xl">
              ❤️
            </div>

            <h2 className="text-3xl font-bold">
              Welcome to Love Vault
            </h2>

            <p className="mt-3 text-zinc-400">

              Store your private memories
              securely with your partner.

            </p>

          </div>

        ) : (
          

         <VaultGrid
         
  items={filteredItems}

  activeTab={activeTab}

  onOpen={(item) => {

    router.push(
      `/vault/preview?id=${item.id}&tab=${activeTab}`
    );

  }}

  toggleFavorite={toggleFavorite}

  deleteMemory={deleteMemory}

  restoreMemory={restoreMemory}

  deleteForeverMemory={deleteForeverMemory}
/>

        )}

      </section>

      {/* =======================
          CREATE FOLDER
      ======================== */}

      {showFolderModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

          <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6">

            <h2 className="mb-6 text-xl font-bold">

              Create Folder

            </h2>

            <input
              value={folderName}
              onChange={(e) =>
                setFolderName(
                  e.target.value
                )
              }
              placeholder="Folder Name"
              className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />

            <select
              value={folderVisibility}
              onChange={(e) =>
                setFolderVisibility(
                  e.target
                    .value as VaultVisibility
                )
              }
              className="mb-6 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
            >

              <option value="private">

                Private Folder

              </option>

              <option value="shared">

                Shared Folder

              </option>

            </select>

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowFolderModal(
                    false
                  )
                }
                className="rounded-xl bg-zinc-800 px-4 py-2"
              >

                Cancel

              </button>

              <button
                onClick={
                  createFolder
                }
                className="rounded-xl bg-pink-600 px-5 py-2"
              >

                Create

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =======================
          RENAME FOLDER
      ======================== */}

      {renameFolder && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

          <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6">

            <h2 className="mb-6 text-xl font-bold">

              Rename Folder

            </h2>

            <input
              value={newFolderName}
              onChange={(e) =>
                setNewFolderName(
                  e.target.value
                )
              }
              className="mb-6 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setRenameFolder(
                    null
                  )
                }
                className="rounded-xl bg-zinc-800 px-4 py-2"
              >

                Cancel

              </button>

              <button
                onClick={
                  saveFolderName
                }
                className="rounded-xl bg-pink-600 px-5 py-2"
              >

                Save

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );

}