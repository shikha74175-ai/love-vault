"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";

import VaultHeader from "./components/VaultHeader";
import VaultTabs from "./components/VaultTabs";
import UploadButton from "./components/UploadButton";
import VaultGrid, { VaultItem } from "./components/VaultGrid";



export default function VaultPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState<VaultItem[]>([]);

useEffect(() => {
  loadVault();
}, []);
  async function loadVault() {

  const {
  data: { user },
} = await supabase.auth.getUser();

console.log("PAGE USER:", user);

  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("partner_id")
    .eq("id", user.id)
    .single();

  const partnerId = profile?.partner_id;

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
  console.log("SUPABASE ERROR:");
  console.log(error);
  alert(error.message);

  return;
}

  const result: VaultItem[] = [];

  for (const file of data ?? []) {

    let bucket = "vault-documents";

    if (file.file_type === "image")
      bucket = "vault-images";

    else if (file.file_type === "video")
      bucket = "vault-videos";

    else if (file.file_type === "audio")
      bucket = "vault-audio";

    const { data: signed } =
      await supabase.storage
        .from(bucket)
        .createSignedUrl(
          file.storage_path,
          60 * 60
        );

    result.push({

      id: file.id,

      file_name: file.file_name,

      file_type: file.file_type,

      favorite: file.favorite,

      visibility: file.visibility,

      folder: file.folder,

      created_at: file.created_at,

      signedUrl:
        signed?.signedUrl ?? "",

    });

  }

  setItems(result);

}

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white flex flex-col">

      {/* Header */}
      <VaultHeader
        usedStorage={0}
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
    <div className="flex justify-end mb-6">
      <UploadButton onUpload={loadVault} folders={[]} />
    </div>

    {/* Welcome Card */}
   {items.length === 0 ? (

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
items={items}
onOpen={(item)=>console.log(item)}
/>

)}

    {/* Gallery */}
    
  </div>

</section>
    </main>
  );
}