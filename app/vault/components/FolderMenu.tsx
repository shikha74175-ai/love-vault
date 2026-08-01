"use client";

type Props = {
  folder: any;
  isTrash: boolean;

  pinFolder: (folder: any) => void;
  deleteFolder: (folder: any) => void;
  restoreFolder: (folder: any) => void;
  permanentlyDeleteFolder: (folder: any) => void;

  setRenameFolder: (folder: any) => void;
  setNewFolderName: (name: string) => void;
  setMenuOpen: (id: string | null) => void;
};

export default function FolderMenu({
  folder,
  isTrash,
  pinFolder,
  deleteFolder,
  restoreFolder,
  permanentlyDeleteFolder,
  setRenameFolder,
  setNewFolderName,
  setMenuOpen,
}: Props) {
  return (
    <div className="absolute right-2 top-12 z-50 w-56 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">

     {isTrash ? (
  <>
    <button
      onClick={() => restoreFolder(folder)}
      className="w-full px-4 py-3 text-left hover:bg-green-600 transition"
    >
      ♻️ Restore
    </button>

    <button
      onClick={() => permanentlyDeleteFolder(folder)}
      className="w-full px-4 py-3 text-left hover:bg-red-600 transition"
    >
      🗑 Delete Forever
    </button>
  </>
) : (
  <>
    <button
      onClick={() => pinFolder(folder)}
      className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition"
    >
      {folder.pinned ? "📍 Unpin Folder" : "📌 Pin Folder"}
    </button>

    <button
      onClick={() => {
        setRenameFolder(folder);
        setNewFolderName(folder.name);
        setMenuOpen(null);
      }}
      className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition"
    >
      ✏️ Rename
    </button>

    <button
      onClick={() => deleteFolder(folder)}
      className="w-full px-4 py-3 text-left hover:bg-red-600 transition"
    >
      🗑 Move to Trash
    </button>
  </>
)}
    </div>
  );
}