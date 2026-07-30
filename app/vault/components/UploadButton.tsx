"use client";

import {
  Upload,
  ImageIcon,
  Video,
  FileAudio,
  FileText,
  Star,
  X,
  Plus,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/client";

type Folder = {
  id: string;
  name: string;
  visibility: "private" | "shared";
};

type Props = {
  folders: Folder[];
  onUpload: () => Promise<void>;
};

export default function UploadButton({
  folders,
  onUpload,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [folderId, setFolderId] = useState("");

  const [favorite, setFavorite] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [showNewFolder, setShowNewFolder] =
    useState(false);

  const [newFolder, setNewFolder] = useState("");

  const [newFolderVisibility, setNewFolderVisibility] =
    useState<"private" | "shared">("private");

  const [folderList, setFolderList] =
    useState<Folder[]>(folders);

  useEffect(() => {
    setFolderList(folders);
  }, [folders]);

  function chooseFile() {
    fileInput.current?.click();
  }

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
  }

  async function createFolder() {
  if (!newFolder.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("partner_id")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("vault_folders")
    .insert({
      user_id: user.id,

      partner_id:
        newFolderVisibility === "shared"
          ? profile?.partner_id
          : null,

      name: newFolder.trim(),

      visibility: newFolderVisibility,
    })
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  setFolderList((prev) => [...prev, data]);
  setFolderId(data.id);
  setNewFolder("");
  setNewFolderVisibility("private");
  setShowNewFolder(false);
}
  function fileIcon() {
  if (!selectedFile) {
    return (
      <Upload className="w-10 h-10 text-pink-500" />
    );
  }

  if (selectedFile.type.startsWith("image")) {
    return (
      <ImageIcon className="w-10 h-10 text-pink-500" />
    );
  }

  if (selectedFile.type.startsWith("video")) {
    return (
      <Video className="w-10 h-10 text-pink-500" />
    );
  }

  if (selectedFile.type.startsWith("audio")) {
    return (
      <FileAudio className="w-10 h-10 text-pink-500" />
    );
  }

  return (
    <FileText className="w-10 h-10 text-pink-500" />
  );
}

async function submit() {
  if (!selectedFile) return;

  if (!folderId) {
    alert("Please select a folder");
    return;
  }

  const folder = folderList.find(
    (f) => f.id === folderId
  );

  if (!folder) {
    alert("Folder not found");
    return;
  }

  const visibility = folder.visibility;

  try {
    setUploading(true);

    // -------------------------
    // Detect Bucket
    // -------------------------

    let bucket = "vault-documents";

    if (selectedFile.type.startsWith("image")) {
      bucket = "vault-images";
    } else if (selectedFile.type.startsWith("video")) {
      bucket = "vault-videos";
    } else if (selectedFile.type.startsWith("audio")) {
      bucket = "vault-audio";
    }

    // -------------------------
    // Generate File Name
    // -------------------------

    const ext = selectedFile.name.split(".").pop();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${ext}`;

    // -------------------------
    // Upload Storage
    // -------------------------

    const { error: uploadError } =
      await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    // -------------------------
    // Current User
    // -------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not found");
      return;
    }

    // -------------------------
    // Profile
    // -------------------------

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
      // -------------------------
      // File Type
      // -------------------------
// -------------------------
// File Type
// -------------------------

let fileType:
  | "image"
  | "video"
  | "audio"
  | "document" = "document";

if (selectedFile.type.startsWith("image")) {
  fileType = "image";
} else if (selectedFile.type.startsWith("video")) {
  fileType = "video";
} else if (selectedFile.type.startsWith("audio")) {
  fileType = "audio";
}

// -------------------------
// Insert Database
// -------------------------
// -------------------------
// Insert Database
// -------------------------

console.log("Visibility:", visibility);
console.log("Partner:", profile?.partner_id);

const { error: dbError } = await supabase
  .from("vault_files")
  .insert({
    user_id: user.id,

    partner_id:
      visibility === "shared"
        ? profile?.partner_id
        : null,

    visibility,

    folder_id: folder.id,

    favorite,

    file_name: selectedFile.name,

    storage_path: fileName,

    file_size: selectedFile.size,

    file_type: fileType,

    deleted: false,
  });

if (dbError) {
  alert(dbError.message);
  return;
}

      // -------------------------
      // Reset Form
      // -------------------------

          // -------------------------
      // Reset Form
      // -------------------------

      setSelectedFile(null);

      setFolderId("");

      setFavorite(false);

      setOpen(false);

      await onUpload();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 transition flex items-center gap-2"
      >
        <Upload size={20} />
        Upload
      </button>

      <input
        hidden
        ref={fileInput}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleFile}
      />

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Upload Memory ❤️
              </h2>

              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            {/* File Picker */}
            <div
              onClick={chooseFile}
              className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-500 transition"
            >
              <div className="flex justify-center mb-4">
                {fileIcon()}
              </div>

              {uploading && (
                <div className="mb-5">
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full w-full bg-pink-500 animate-pulse" />
                  </div>

                  <p className="text-xs text-zinc-400 mt-2">
                    Uploading...
                  </p>
                </div>
              )}

              {selectedFile ? (
                <>
                  <p className="font-medium break-all">
                    {selectedFile.name}
                  </p>

                  <p className="text-zinc-400 text-sm mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <p>Select a file</p>

                  <p className="text-sm text-zinc-500 mt-2">
                    Images, Videos, Audio, PDF, DOCX
                  </p>
                </>
              )}
            </div>
           {/* Folder */}
<div className="mt-5">
  <label className="block mb-2 font-medium">
    Folder
  </label>

  <div className="flex gap-2">
    <select
      value={folderId}
      onChange={(e) => setFolderId(e.target.value)}
      className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 p-3"
    >
      <option value="">
        Select Folder
      </option>

      {folderList.map((folder) => (
        <option
          key={folder.id}
          value={folder.id}
        >
          {folder.visibility === "shared"
            ? "❤️ "
            : "🔒 "}
          {folder.name}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={() => setShowNewFolder(true)}
      className="px-4 rounded-xl bg-pink-600 hover:bg-pink-500"
    >
      <Plus size={20} />
    </button>
  </div>
</div>

{/* Create Folder */}
{showNewFolder && (
  <div className="mt-5 space-y-3">
    <input
      value={newFolder}
      onChange={(e) => setNewFolder(e.target.value)}
      placeholder="Folder name"
      className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-3"
    />

    <div className="flex gap-3">
      <button
        type="button"
        onClick={() =>
          setNewFolderVisibility("private")
        }
        className={`flex-1 rounded-xl p-3 ${
          newFolderVisibility === "private"
            ? "bg-pink-600"
            : "bg-zinc-800"
        }`}
      >
        🔒 Private
      </button>

      <button
        type="button"
        onClick={() =>
          setNewFolderVisibility("shared")
        }
        className={`flex-1 rounded-xl p-3 ${
          newFolderVisibility === "shared"
            ? "bg-pink-600"
            : "bg-zinc-800"
        }`}
      >
        ❤️ Shared
      </button>
    </div>

    <button
      type="button"
      onClick={createFolder}
      className="w-full rounded-xl bg-green-600 py-3 hover:bg-green-500"
    >
      Create Folder
    </button>
  </div>
)}

{/* Favorite */}
<div className="mt-5 flex justify-between items-center">
  <span>Favorite</span>

  <button
    onClick={() => setFavorite(!favorite)}
    className="text-yellow-400"
  >
    <Star
      size={24}
      fill={favorite ? "currentColor" : "none"}
    />
  </button>
</div>

{/* Buttons */}
<div className="flex gap-3 mt-8">
  <button
    onClick={() => setOpen(false)}
    className="flex-1 rounded-xl bg-zinc-800 py-3"
  >
    Cancel
  </button>

  <button
    disabled={!selectedFile || uploading}
    onClick={submit}
    className="flex-1 rounded-xl bg-pink-600 disabled:opacity-50 py-3"
  >
    {uploading ? "Uploading..." : "Upload"}
  </button>
</div>

</div>
</div>
)}
</>
);
}