"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/client";

import PreviewHeader from "../components/PreviewHeader";
import PreviewContent from "../components/PreviewContent";
import PreviewActions from "../components/PreviewActions";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PreviewItem = {
  id: string;
  file_name: string;
  file_type: "image" | "video" | "audio" | "document";
  favorite: boolean;
  visibility: "private" | "shared";
  folder: string | null;
  created_at: string;
  storage_path: string;

  signedUrl?: string;
  deleted?: boolean;
};

export default function PreviewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [item, setItem] = useState<PreviewItem | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const tab = searchParams.get("tab") || "private";
  const [fade, setFade] = useState(false);
  const [showUI, setShowUI] = useState(true);

function toggleUI() {
  setShowUI((prev) => !prev);
}

useEffect(() => {
  if (id) {
    loadGallery();
  }
}, [id, tab]);
const loadGallery = useCallback(async () => {
  if (!id) return;

  setLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

const { data, error } = await supabase
  .from("vault_files")
  .select("*")
  .or(
    `user_id.eq.${user.id},and(partner_id.eq.${user.id},visibility.eq.shared)`
  )
  .order("created_at", {
    ascending: false,
  });

if (error || !data) {
  console.error(error);
  setLoading(false);
  return;
}

let gallery: PreviewItem[] = [];

for (const file of data) {
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
    .createSignedUrl(file.storage_path, 3600);

  gallery.push({
    ...file,
    // Agar file.folder column nahi hai to is line ko folder: null kar dena
    folder: (file as any).folder ?? null,
    signedUrl: signed?.signedUrl ?? "",
  });
}

// Tab filter
switch (tab) {
  case "private":
    gallery = gallery.filter(
      (i) => i.visibility === "private" && !i.deleted
    );
    break;

  case "shared":
    gallery = gallery.filter(
      (i) => i.visibility === "shared" && !i.deleted
    );
    break;

  case "favorites":
    gallery = gallery.filter(
      (i) => i.favorite && !i.deleted
    );
    break;

  case "photos":
    gallery = gallery.filter(
      (i) => i.file_type === "image" && !i.deleted
    );
    break;

  case "videos":
    gallery = gallery.filter(
      (i) => i.file_type === "video" && !i.deleted
    );
    break;

  case "trash":
    gallery = gallery.filter((i) => i.deleted);
    break;

  default:
    gallery = gallery.filter((i) => !i.deleted);
    break;
}
console.log("Gallery:", gallery);
console.log("URL id:", id);
console.log(
  "Found index:",
  gallery.findIndex((i) => i.id === id)
);

setItems(gallery);

const index = gallery.findIndex((i) => i.id === id);

if (index !== -1) {
  setCurrentIndex(index);
  setItem(gallery[index]);
  setUrl(gallery[index].signedUrl ?? "");
}

setLoading(false);
}, [id, tab]);
const changeImage = useCallback(
  (newIndex: number) => {
    if (newIndex < 0 || newIndex >= items.length) return;

    const next = items[newIndex];

   setFade(true);

setTimeout(() => {
  setCurrentIndex(newIndex);
  setItem(next);
  setUrl(next.signedUrl ?? "");

  setFade(false);
}, 120);

    router.replace(
      `/vault/preview?id=${next.id}&tab=${tab}`,
      {
        scroll: false,
      }
    );
  },
  [items, router, tab]
);
const nextImage = useCallback(() => {
  changeImage(currentIndex + 1);
}, [changeImage, currentIndex]);

const previousImage = useCallback(() => {
  changeImage(currentIndex - 1);
}, [changeImage, currentIndex]);
useEffect(() => {
  const next = items[currentIndex + 1];

  if (next?.signedUrl) {
    const img = new Image();
    img.src = next.signedUrl;
  }

  const prev = items[currentIndex - 1];

  if (prev?.signedUrl) {
    const img = new Image();
    img.src = prev.signedUrl;
  }
}, [currentIndex, items]);
useEffect(()=>{

const timer=setTimeout(()=>{

if (showUI) {
  setShowUI(false);
}

},2500);

return()=>clearTimeout(timer);

},[currentIndex]);
useEffect(() => {
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight") {
      nextImage();
    }

    if (e.key === "ArrowLeft") {
      previousImage();
    }
    if (e.key === "Escape") {
    router.push("/vault");
}
if (e.key === " ") {
    e.preventDefault();
    toggleUI();
}
  }

  window.addEventListener("keydown", onKeyDown);

  return () =>
    window.removeEventListener(
      "keydown",
      onKeyDown
    );
}, [nextImage, previousImage]);

const [touchStartX, setTouchStartX] =
  useState<number | null>(null);

const [touchEndX, setTouchEndX] =
  useState<number | null>(null);

  function handleTouchStart(
  e: React.TouchEvent
) {
  setTouchEndX(null);
  setTouchStartX(e.targetTouches[0].clientX);
}

function handleTouchMove(
  e: React.TouchEvent
) {
  setTouchEndX(e.targetTouches[0].clientX);
}

function handleTouchEnd() {
  if (
    touchStartX === null ||
    touchEndX === null
  )
    return;

  const distance =
    touchStartX - touchEndX;

  if (distance > 60) {
    nextImage();
  }

  if (distance < -60) {
    previousImage();
  }
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
        <div className="flex h-screen items-center justify-center">

<div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"/>

</div>
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

     <div
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    showUI
      ? "translate-y-0 opacity-100"
      : "-translate-y-full opacity-0"
  }`}
>
  <PreviewHeader
    fileName={item.file_name}
    favorite={item.favorite}
    visibility={item.visibility}
  />
</div>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40">
  <div className="rounded-full bg-black/60 px-4 py-1 text-sm backdrop-blur">
    {currentIndex + 1} / {items.length}
  </div>
</div>

  <div
  onClick={toggleUI}
  className={`pb-24 transition-opacity duration-200 ${
    fade ? "opacity-0" : "opacity-100"
  }`}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  <PreviewContent
    fileType={item.file_type}
    url={url}
    fileName={item.file_name}
  />
</div>
{/* Previous */}

<button
  onClick={previousImage}
  disabled={currentIndex === 0}
  className="
  hidden
  md:flex
  fixed
  left-6
  top-1/2
  -translate-y-1/2
  z-50
  h-14
  w-14
  rounded-full
 bg-zinc-900/70
backdrop-blur-xl
border
border-zinc-700
shadow-xl
hover:scale-110
transition
  backdrop-blur
  items-center
  justify-center
  hover:bg-black/80
  disabled:opacity-30
  disabled:cursor-not-allowed
"
>
  <ChevronLeft size={32} />
</button>

{/* Next */}

<button
  onClick={nextImage}
  disabled={currentIndex === items.length - 1}
  className="
  hidden
  md:flex
  fixed
  right-6
  top-1/2
  -translate-y-1/2
  z-50
  h-14
  w-14
  rounded-full
 bg-zinc-900/70
backdrop-blur-xl
border
border-zinc-700
shadow-xl
hover:scale-110
transition
  backdrop-blur
  items-center
  justify-center
  hover:bg-black/80
  disabled:opacity-30
  disabled:cursor-not-allowed
"
>
  <ChevronRight size={32} />
</button>

   <div
  className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
    showUI
      ? "translate-y-0 opacity-100"
      : "translate-y-full opacity-0"
  }`}
>
  <PreviewActions
    favorite={item.favorite}
    onFavorite={toggleFavorite}
    onDownload={() => {
      if (url) window.open(url, "_blank");
    }}
    onDelete={deleteMemory}
    onInfo={() => {
      alert(
`📁 Folder: ${item.folder || "No Folder"}

🗓 Created: ${new Date(
item.created_at
).toLocaleString()}`
      );
    }}
  />
</div>


    </main>
  );
}