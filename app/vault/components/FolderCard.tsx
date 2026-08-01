"use client";

import { MoreVertical } from "lucide-react";
import { VaultFolder } from "../types";
import FolderMenu from "./FolderMenu";

type Props = {
  folder: VaultFolder;

  selectedFolder: string | null;

  setSelectedFolder: (id: string | null) => void;

  menuOpen: string |null;

  setMenuOpen: (id: string | null) => void;

  isTrash: boolean;

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
};

export default function FolderCard({

  folder,

  selectedFolder,

  setSelectedFolder,

  menuOpen,

  setMenuOpen,

  isTrash,

  pinFolder,

  deleteFolder,

  restoreFolder,

  permanentlyDeleteFolder,

  setRenameFolder,

  setNewFolderName,

}: Props) {

  return (

    <div className="relative">

      {/* Card */}

      <div

        role="button"

        tabIndex={0}

        onClick={() =>
          setSelectedFolder(folder.id)
        }

        onKeyDown={(e) => {

          if (
            e.key === "Enter" ||
            e.key === " "
          ) {

            e.preventDefault();

            setSelectedFolder(
              folder.id
            );

          }

        }}

        className={`

cursor-pointer

rounded-2xl

border

p-5

transition

${
selectedFolder === folder.id

? "border-pink-500 bg-pink-500/20"

: "border-zinc-800 bg-zinc-900 hover:border-pink-500"

}

`}

      >

        <div className="flex justify-between">

          <div>

            <div className="mb-3 text-4xl">

              {folder.pinned
                ? "📌"
                : folder.visibility ===
                  "shared"
                ? "❤️"
                : "🔒"}

            </div>

            <p className="truncate font-semibold">

              {folder.name}

            </p>

            <p className="mt-2 text-xs text-zinc-500">

              {folder.file_count} Files

            </p>

          </div>

          {/* Menu Button */}

          <button

            type="button"

            onClick={(e) => {

              e.stopPropagation();

              setMenuOpen(

                menuOpen === folder.id
                  ? null
                  : folder.id

              );

            }}

            className="rounded-lg p-2 transition hover:bg-zinc-800"

          >

            <MoreVertical size={18} />

          </button>

        </div>

      </div>

      {/* Menu */}

      {menuOpen === folder.id && (

        <FolderMenu

          folder={folder}

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

          setMenuOpen={
            setMenuOpen
          }

        />

      )}

    </div>

  );

}