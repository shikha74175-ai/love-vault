"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import VaultHeader from "./components/VaultHeader";
import VaultTabs from "./components/VaultTabs";
import UploadButton from "./components/UploadButton";
import VaultGrid, { VaultItem } from "./components/VaultGrid";
import SearchBar from "./components/SearchBar";



export default function VaultPage() {

  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState("");
  const [usedStorage, setUsedStorage] = useState(0);


 const filteredItems = items
  .filter((item) => {
    switch (activeTab) {
      case "photos":
        return item.file_type === "image";

      case "videos":
        return item.file_type === "video";

      case "favorites":
        return item.favorite;

      case "shared":
        return item.visibility === "shared";

      default:
        return true;
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
  loadVault();
}, []);

async function loadVault() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("PAGE USER:", user);

  if (!user) return;

  const { data, error } = await supabase
    .from("vault_files")
    .select("*")
    .or(
      `owner_id.eq.${user.id},and(partner_id.eq.${user.id},visibility.eq.shared)`
    )
    .eq("deleted", false)
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
      favorite: file.favorite,
      visibility: file.visibility,
      folder: file.folder,
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
 <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">

  <SearchBar
    value={search}
    onChange={setSearch}
  />

  <UploadButton
    onUpload={loadVault}
    folders={[]}
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
              Store your private memories securely.<br></br>
Everything shared here stays between you and your partner.
</p>

</div>

) : (

<VaultGrid
  items={filteredItems}
  onOpen={(item) => {
    router.push(`/vault/preview?id=${item.id}`);
  }}
/>
)}

    {/* Gallery */}
    
  </div>

</section>
    </main>
  );
}