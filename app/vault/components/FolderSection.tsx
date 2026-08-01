"use client";

import {
  Folder,
  FolderPlus,
} from "lucide-react";

import {
  VaultFolder,
  VaultItem,
} from "../types";

import SearchBar from "./SearchBar";
import UploadButton from "./UploadButton";
import FolderCard from "./FolderCard";

type Props = {
  visibleFolders: VaultFolder[];
  folders: VaultFolder[];
  filteredItems: VaultItem[];

  activeTab: string;
  isTrash: boolean;

  privateCount: number;
  sharedCount: number;
  trashCount: number;

  selectedFolder: string | null;
  setSelectedFolder: (id: string | null) => void;

  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;

  setShowFolderModal: (v: boolean) => void;

  pinFolder: (folder: VaultFolder) => void;
  deleteFolder: (folder: VaultFolder) => void;
  restoreFolder: (folder: VaultFolder) => void;
  permanentlyDeleteFolder: (
    folder: VaultFolder
  ) => void;

  setRenameFolder: (
    folder: VaultFolder
  ) => void;

  setNewFolderName: (
    name: string
  ) => void;

  search: string;
  setSearch: (v: string) => void;

  onUpload: () => void;
};

export default function FolderSection({
  visibleFolders,
  folders,
  filteredItems,
  activeTab,
  isTrash,

  privateCount,
  sharedCount,
  trashCount,

  selectedFolder,
  setSelectedFolder,

  menuOpen,
  setMenuOpen,

  setShowFolderModal,

  pinFolder,
  deleteFolder,
  restoreFolder,
  permanentlyDeleteFolder,

  setRenameFolder,
  setNewFolderName,

  search,
  setSearch,

  onUpload,
}: Props) {
  return (
    <div className="mb-8">

      {/* Top */}

            <div className="mb-5 flex items-center justify-between">

        <h2 className="text-xl font-bold">
          📁 Albums
        </h2>

        <button
          onClick={() =>
            setShowFolderModal(true)
          }
          className="flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 transition hover:bg-pink-700"
        >
          <FolderPlus size={18} />
          New Folder
        </button>

      </div>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">

        <div className="rounded-xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            🔒 Private
          </p>

          <p className="text-2xl font-bold">
            {privateCount}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            ❤️ Shared
          </p>

          <p className="text-2xl font-bold">
            {sharedCount}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            🗑 Trash
          </p>

          <p className="text-2xl font-bold">
            {trashCount}
          </p>
        </div>

      </div>
      {/* Search */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row">

        <SearchBar
          value={search}
          onChange={setSearch}
        />

        <UploadButton
          folders={folders}
          onUpload={onUpload}
        />

      </div>

      {/* Folder Grid */}

           <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">

        {/* All */}

               <button
          onClick={() =>
            setSelectedFolder(null)
          }
          className={`rounded-2xl border p-5 transition ${
            selectedFolder === null
              ? "border-pink-500 bg-pink-500/20"
              : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <Folder
            size={40}
            className="mx-auto mb-3 text-yellow-400"
          />

          <p className="font-semibold">
            {activeTab === "shared"
              ? "All Shared"
              : activeTab === "trash"
              ? "Trash"
              : "All Private"}
          </p>

          <p className="text-sm text-zinc-400">
            {filteredItems.length} Files
          </p>

        </button>

        {/* Folder Cards */}
       {/* Folder Cards */}

{visibleFolders.map((folder) => (

  <FolderCard
    key={folder.id}

    folder={folder}

    selectedFolder={selectedFolder}
    setSelectedFolder={setSelectedFolder}

    menuOpen={menuOpen}
    setMenuOpen={setMenuOpen}

    isTrash={isTrash}

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
  />

))}
      </div>

    </div>
  );
}