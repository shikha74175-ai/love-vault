"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FolderPlus, Folder } from "lucide-react";
import { supabase } from "@/lib/client";
import VaultHeader from "./components/VaultHeader";
import VaultTabs from "./components/VaultTabs";
import UploadButton from "./components/UploadButton";
import VaultGrid, { VaultItem } from "./components/VaultGrid";
import SearchBar from "./components/SearchBar";
type VaultFolder = {
  id: string;
  name: string;
  cover_image: string | null;
  created_at: string;
  visibility: "private" | "shared";
  user_id: string;
  partner_id?: string | null;
  file_count?: number;
};


export default function VaultPage() {

  const router = useRouter();

  const [activeTab, setActiveTab] = useState("private");
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState("");
  const [usedStorage, setUsedStorage] = useState(0);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");

  const [folderVisibility, setFolderVisibility] =
  useState<"private" | "shared">("private");

const privateCount = items.filter(
  (i) => i.visibility === "private"
).length;
const trashCount = items.filter(
  i => i.deleted
).length;

const sharedCount = items.filter(
  (i) => i.visibility === "shared"
).length;

const filteredItems = items
  .filter((item) => {
    if (selectedFolder) {
      return item.folder_id === selectedFolder;
    }
    return true;
  })
  .filter((item) => {
    switch (activeTab) {
      case "private":
        return item.visibility === "private" && !item.deleted;
      case "shared":
        return item.visibility === "shared" && !item.deleted;
      case "favorites":
        return item.favorite && !item.deleted;
      case "photos":
        return item.file_type === "image" && !item.deleted;
      case "videos":
        return item.file_type === "video" && !item.deleted;
      case "trash":
        return item.deleted;
      default:
        return !item.deleted;
    }
  })
  .filter((item) => {
    if (!search) return true;

    return (
      item.file_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      (item.folder ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

useEffect(() => {
  loadFolders();
  loadVault();
}, []);

async function loadFolders() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("vault_folders")
    .select("*")
    .or(
      `user_id.eq.${user.id},and(partner_id.eq.${user.id},visibility.eq.shared)`
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error("Load folders error:", error);
    alert(error.message);
    return;
  }

  const foldersWithCount = await Promise.all(
    (data ?? []).map(async (folder) => {
      const { count } = await supabase
        .from("vault_files")
        .select("*", {
          head: true,
          count: "exact",
        })
        .eq("folder_id", folder.id)
        .eq("deleted", false);

      return {
        ...folder,
        file_count: count ?? 0,
      };
    })
  );

  setFolders(foldersWithCount);
}
const visibleFolders = folders.filter((folder) => {
  // Trash me koi folders nahi dikhane
  if (activeTab === "trash") {
    return false;
  }

  if (activeTab === "shared") {
    return folder.visibility === "shared";
  }

  // All, Photos, Videos, Favorites aur Private me
  // sirf private folders dikhane hain
  return folder.visibility === "private";
});

async function createFolder() {
  if (!folderName.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("partner_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("vault_folders")
    .insert({
      user_id: user.id,

      partner_id:
        folderVisibility === "shared"
          ? profile?.partner_id
          : null,

      name: folderName.trim(),

      visibility: folderVisibility,
    });

  if (error) {
    alert(error.message);
    return;
  }

  setFolderName("");
  setFolderVisibility("private");
  setShowFolderModal(false);

  await loadFolders();
}

async function loadVault() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("PAGE USER:", user);

  if (!user) return;

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
    `user_id.eq.${user.id},and(partner_id.eq.${user.id},visibility.eq.shared)`
  )
  .order("created_at", {
    ascending: false,
  });
  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  // ===========================
  // Calculate Used Storage
  // ===========================

  let totalBytes = 0;

  const result: VaultItem[] = [];

  for (const file of data ?? []) {

    totalBytes += file.file_size ?? 0;

    let bucket = "vault-documents";

    if (file.file_type === "image") {
      bucket = "vault-images";
    } else if (file.file_type === "video") {
      bucket = "vault-videos";
    } else if (file.file_type === "audio") {
      bucket = "vault-audio";
    }

    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(file.storage_path, 60 * 60);

    result.push({
  id: file.id,
  file_name: file.file_name,
  file_type: file.file_type,
  deleted: file.deleted,

  favorite: file.favorite,
  visibility: file.visibility,

  folder_id: file.folder_id,
  folder: file.vault_folders?.name ?? null,

  created_at: file.created_at,

  signedUrl: signed?.signedUrl ?? "",
});
  }

  // ===========================
  // Update Storage
  // ===========================

  const usedGB = totalBytes / 1024 / 1024 / 1024;

  setUsedStorage(Number(usedGB.toFixed(2)));

  // ===========================
  // Update Gallery
  // ===========================

  setItems(result);
}

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white flex flex-col">

      {/* Header */}
      <VaultHeader
  usedStorage={usedStorage}
  totalStorage={5}
/>
      <VaultTabs
  active={activeTab}
  onChange={setActiveTab}
/>

      {/* Body */}
      <section className="flex-1 p-4 sm:p-6">

  <div className="mx-auto max-w-7xl">

    {/* Upload Button */}
    <div className="mb-8">

  <div className="flex items-center justify-between mb-4">

    <h2 className="text-xl font-bold">
      📁 Albums
    </h2>
    <div className="flex gap-4 mt-3 mb-5">

  <div className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 p-4">

    <p className="text-zinc-400 text-sm">
      🔒 Private
    </p>

    <p className="text-3xl font-bold">
      {privateCount}
    </p>

  </div>

  <div className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 p-4">

    <p className="text-zinc-400 text-sm">
      ❤️ Shared
    </p>

    <p className="text-3xl font-bold">
      {sharedCount}
    </p>

  </div>

</div>

    <button
      onClick={() => setShowFolderModal(true)}
      className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl transition"
    >
      <FolderPlus size={18} />
      New Folder
    </button>

  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">

    <button
      onClick={() => setSelectedFolder(null)}
      className={`rounded-2xl p-5 border transition ${
        selectedFolder === null
          ? "border-pink-500 bg-pink-500/20"
          : "border-zinc-800 bg-zinc-900 hover:border-pink-500"
      }`}
    >
      <Folder
  className="mx-auto mb-3 text-yellow-400"
  size={40}
/>

      <p className="font-semibold">
        {activeTab === "shared"
    ? "All Shared"
    : "All Private"}
      </p>

      <p className="text-sm text-zinc-400">
        {
filteredItems.length
} Files
      </p>

    </button>

   {visibleFolders.map((folder) => (

<button
  key={folder.id}
  onClick={() => setSelectedFolder(folder.id)}
  className={`rounded-2xl p-5 border transition ${
    selectedFolder === folder.id
      ? "border-pink-500 bg-pink-500/20"
      : "border-zinc-800 bg-zinc-900 hover:border-pink-500"
  }`}
>

<div className="text-4xl mb-3">

{folder.visibility === "shared"
  ? "❤️"
  : "🔒"}

</div>

<p className="font-semibold truncate">
{folder.name}
</p>

<p className="text-sm text-zinc-400 mt-1">

{folder.visibility === "shared"
  ? "Shared Folder"
  : "Private Folder"}

</p>

<p className="text-xs text-zinc-500 mt-2">

{folder.file_count} Files

</p>

</button>

))}

  </div>

</div>
 <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
  <SearchBar
    value={search}
    onChange={setSearch}
  />

  <UploadButton
    onUpload={async () => {
      await loadVault();
      await loadFolders();
    }}
    folders={folders}
  />
</div>

{/* Welcome Card */}
{filteredItems.length === 0 ? (

  <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-10 text-center">
    <div className="text-6xl mb-6">
      ❤️
    </div>

    <h2 className="text-3xl font-bold">
      Welcome to Love Vault
    </h2>

    <p className="text-zinc-400 mt-3">
      Store your private memories securely.
      <br />
      Everything shared here stays between you and your partner.
    </p>
  </div>

) : (

  <>
    {/* PRIVATE MEMORIES */}
    {filteredItems.filter(i => i.visibility === "private").length > 0 && (
      <>
        <h2 className="text-2xl font-bold mb-5">
          🔒 Private Memories
        </h2>
        {activeTab === "trash" && (
  <>
    <h2 className="text-2xl font-bold mb-5">
      🗑 Trash
      <p className="text-red-500">
  Active Tab: {activeTab}
</p>
    </h2>

    <VaultGrid
      items={filteredItems.filter(i => i.deleted)}
      onOpen={(item) => {
        router.push(`/vault/preview?id=${item.id}`);
      }}
    />
  </>
)}

        <VaultGrid
          items={filteredItems.filter(
            i => i.visibility === "private"
          )}
          onOpen={(item) => {
            router.push(`/vault/preview?id=${item.id}`);
          }}
        />
      </>
    )}

    {/* SHARED MEMORIES */}
    {filteredItems.filter(i => i.visibility === "shared").length > 0 && (
      <>
        <h2 className="text-2xl font-bold mt-12 mb-5">
          ❤️ Shared Memories
        </h2>

        <VaultGrid
          items={filteredItems.filter(
            i => i.visibility === "shared"
          )}
          onOpen={(item) => {
            router.push(`/vault/preview?id=${item.id}`);
          }}
        />
      </>
    )}
  </>

)}
    {/* Gallery */}
    
  </div>

</section>
{showFolderModal && (

<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

<div className="bg-zinc-900 rounded-2xl p-6 w-[400px]">

<h2 className="text-2xl font-bold mb-5">
Create Folder
</h2>

<input
value={folderName}
onChange={(e)=>setFolderName(e.target.value)}
placeholder="Folder Name..."
className="w-full bg-zinc-800 rounded-xl p-3 outline-none mb-5"
/>
<div className="mb-6">

  <p className="text-sm text-zinc-400 mb-3">
    Folder Visibility
  </p>

  <div className="grid grid-cols-2 gap-3">

    <button
      type="button"
      onClick={() => setFolderVisibility("private")}
      className={`rounded-xl border p-4 transition ${
        folderVisibility === "private"
          ? "border-pink-500 bg-pink-600/20"
          : "border-zinc-700 bg-zinc-800"
      }`}
    >
      <div className="text-2xl mb-2">
        🔒
      </div>

      <div className="font-semibold">
        Private
      </div>

      <div className="text-xs text-zinc-400 mt-1">
        Only you can see this folder
      </div>

    </button>

    <button
      type="button"
      onClick={() => setFolderVisibility("shared")}
      className={`rounded-xl border p-4 transition ${
        folderVisibility === "shared"
          ? "border-pink-500 bg-pink-600/20"
          : "border-zinc-700 bg-zinc-800"
      }`}
    >
      <div className="text-2xl mb-2">
        ❤️
      </div>

      <div className="font-semibold">
        Shared
      </div>

      <div className="text-xs text-zinc-400 mt-1">
        Visible to both partners
      </div>

    </button>

  </div>

</div>

<div className="flex justify-end gap-3">

<button
onClick={()=>setShowFolderModal(false)}
className="px-5 py-2 rounded-xl bg-zinc-700"
>
Cancel
</button>

<button
onClick={createFolder}
className={`px-5 py-2 rounded-xl transition ${
folderVisibility==="shared"
?"bg-pink-600"
:"bg-blue-600"
}`}
>

Create Folder

</button>

</div>

</div>

</div>

)}
    </main>
  );
}