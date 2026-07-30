"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/client";

import PreviewHeader from "../components/PreviewHeader";
import PreviewContent from "../components/PreviewContent";
import PreviewActions from "../components/PreviewActions";

type PreviewItem = {
  id: string;
  file_name: string;
  file_type: "image" | "video" | "audio" | "document";
  favorite: boolean;
  visibility: "private" | "shared";
  folder: string | null;
  created_at: string;
  storage_path: string;
};

export default function PreviewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [item, setItem] = useState<PreviewItem | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadFile(id);
    }
  }, [id]);

  async function loadFile(fileId: string) {
    setLoading(true);

    const { data, error } = await supabase
      .from("vault_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (error || !data) {
      console.error(error);
      setLoading(false);
      return;
    }

    setItem(data);

    let bucket = "vault-documents";

    if (data.file_type === "image") {
      bucket = "vault-images";
    } else if (data.file_type === "video") {
      bucket = "vault-videos";
    } else if (data.file_type === "audio") {
      bucket = "vault-audio";
    }

    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.storage_path, 60 * 60);

    setUrl(signed?.signedUrl ?? "");

    setLoading(false);
  }

  async function toggleFavorite() {
    if (!item) return;

    const { error } = await supabase
      .from("vault_files")
      .update({
        favorite: !item.favorite,
      })
      .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    setItem({
      ...item,
      favorite: !item.favorite,
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Loading...
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500">
        File not found.
      </main>
    );
  }
async function deleteMemory() {
  if (!item) return;

  const ok = confirm(
    "Are you sure you want to move this memory to Trash?"
  );

  if (!ok) return;

  const { error } = await supabase
    .from("vault_files")
    .update({
      deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", item.id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("🗑 Memory moved to Trash");

  router.push("/vault");
}
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <PreviewHeader
        fileName={item.file_name}
        favorite={item.favorite}
        visibility={item.visibility}
      />

      <PreviewContent
        fileType={item.file_type}
        url={url}
        fileName={item.file_name}
      />

    <PreviewActions
  favorite={item.favorite}
  onFavorite={toggleFavorite}
  onDownload={() => {
    if (url) {
      window.open(url, "_blank");
    }
  }}
  onDelete={deleteMemory}
  onInfo={() => {
    alert(
      `📁 Folder: ${item.folder || "No Folder"}

🗓 Created: ${new Date(item.created_at).toLocaleString()}`
    );
  }}
/>

    </main>
  );
}