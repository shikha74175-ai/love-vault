"use client";

import { useRef, useState } from "react";
import {
Upload,
ImageIcon,
Video,
FileAudio,
FileText,
Star,
X,
Loader2,
} from "lucide-react";

import { supabase } from "@/lib/client";

type Props = {
  folders: string[];
  onUpload: (
    file: File,
    folder: string,
    visibility: "private" | "shared",
    favorite: boolean
  ) => Promise<void>;
};

export default function UploadButton({
  folders,
  onUpload,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [folder, setFolder] = useState("");

  const [visibility, setVisibility] =
    useState<"private" | "shared">("private");

  const [favorite, setFavorite] = useState(false);
  const [uploading, setUploading] = useState(false);

  function chooseFile() {
    fileInput.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
  }

 async function submit() {
  if (!selectedFile) return;

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
    // Upload to Storage
    // -------------------------
  const { data: uploadData, error: uploadError } =
  await supabase.storage
    .from(bucket)
    .upload(fileName, selectedFile);

console.log("UPLOAD DATA:", uploadData);
console.log("UPLOAD ERROR:", uploadError);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }
    console.log("STORAGE UPLOAD SUCCESS");
console.log("Bucket:", bucket);
console.log("File:", fileName);

    // -------------------------
    // Get Logged User
    // -------------------------
const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

console.log("USER:", user);
console.log("USER ERROR:", userError);

const { data: session } = await supabase.auth.getSession();
console.log("SESSION:", session);


if (!user) {
  alert("User not found.");
  return;
}
    

    // -------------------------
    // Get Partner
    // -------------------------
    const profileRes = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

console.log("PROFILE RESPONSE:", profileRes);

const profile = profileRes.data;
      

    // -------------------------
    // Detect File Type
    // -------------------------
    let fileType = "document";

    if (selectedFile.type.startsWith("image")) {
      fileType = "image";
    } else if (selectedFile.type.startsWith("video")) {
      fileType = "video";
    } else if (selectedFile.type.startsWith("audio")) {
      fileType = "audio";
    }


    // -------------------------
    // Insert into Vault Table
    // -------------------------
    const { error: dbError } = await supabase
      .from("vault_files")
      .insert({
        owner_id: user.id,

        partner_id:
          visibility === "shared"
            ? profile?.partner_id
            : null,

        visibility,

        folder,

        favorite,

        file_name: selectedFile.name,

        storage_path: fileName,

        file_size: selectedFile.size,

        file_type: fileType,

        deleted: false,
      });

   if (dbError) {
  console.error("INSERT ERROR:", dbError);
  console.log(JSON.stringify(dbError, null, 2));
  alert(dbError.message);
  return;
}

    // -------------------------
    // Reset Form
    // -------------------------
    setSelectedFile(null);
    setFolder("");
    setFavorite(false);
    setVisibility("private");

    setOpen(false);

    // -------------------------
    // Refresh Gallery
    // -------------------------
    await onUpload(
  selectedFile,
  folder,
  visibility,
  favorite
);

setSelectedFile(null);
setFolder("");
setFavorite(false);
setVisibility("private");
setOpen(false);

  } catch (err) {
    console.error(err);
    alert("Upload failed.");
  } finally {
    setUploading(false);
  }
}
  function fileIcon() {
    if (!selectedFile)
      return <Upload className="w-10 h-10 text-pink-500" />;

    if (selectedFile.type.startsWith("image"))
      return <ImageIcon className="w-10 h-10 text-pink-500" />;

    if (selectedFile.type.startsWith("video"))
      return <Video className="w-10 h-10 text-pink-500" />;

    if (selectedFile.type.startsWith("audio"))
      return <FileAudio className="w-10 h-10 text-pink-500" />;

    return <FileText className="w-10 h-10 text-pink-500" />;
  }

  return (
    <>
    <button
onClick={() => setOpen(true)}
className="
px-6
py-3
rounded-xl
bg-pink-600
hover:bg-pink-500
transition
flex
items-center
gap-2
"
>
<Upload size={20}/>
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

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-bold">
                Upload Memory ❤️
              </h2>

              <button
                onClick={() => setOpen(false)}
              >
                <X />
              </button>

            </div>

            <div
              onClick={chooseFile}
              className="
              border-2
              border-dashed
              border-zinc-700
              rounded-2xl
              p-8
              text-center
              cursor-pointer
              hover:border-pink-500
              transition
              "
            >

              <div className="flex justify-center mb-4">
                {fileIcon()}
              </div>
              {uploading && (
<div className="mb-5">

<div className="h-2 rounded-full bg-zinc-800 overflow-hidden">

<div className="h-full w-full bg-pink-500 animate-pulse"/>

</div>

<p className="text-xs text-zinc-400 mt-2">

Uploading file...

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
                    Image, Video, Audio, PDF, DOCX
                  </p>
                </>
              )}

            </div>

            <div className="mt-5">

              <label className="text-sm text-zinc-400">

                Folder

              </label>

              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="mt-2 w-full rounded-xl bg-zinc-800 p-3 outline-none"
              >
                <option value="">No Folder</option>

                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}

              </select>

            </div>

            <div className="mt-5 flex justify-between items-center">

              <span>Visibility</span>

              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(
                    e.target.value as "private" | "shared"
                  )
                }
                className="rounded-xl bg-zinc-800 p-2"
              >
                <option value="private">
                  🔒 Private
                </option>

                <option value="shared">
                  ❤️ Shared
                </option>

              </select>

            </div>

            <div className="mt-5 flex justify-between items-center">

              <span>Favorite</span>

              <button
                onClick={() =>
                  setFavorite(!favorite)
                }
                className="text-yellow-400"
              >
                <Star
                  size={24}
                  fill={favorite ? "currentColor" : "none"}
                />
              </button>

            </div>

            <div className="flex gap-3 mt-8">

              <button
                onClick={() => setOpen(false)}
                className="
                flex-1
                rounded-xl
                bg-zinc-800
                py-3
                "
              >
                Cancel
              </button>

              <button
                disabled={!selectedFile}
                onClick={submit}
                className="
                flex-1
                rounded-xl
                bg-pink-600
                disabled:opacity-50
                py-3
                "
              >
                Upload
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}