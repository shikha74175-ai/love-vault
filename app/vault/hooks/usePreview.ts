"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/client";

import { VaultItem } from "../types";

type Props = {

  id: string | null;

  tab: string;

};

export default function usePreview({

  id,

  tab,

}: Props) {

  const router = useRouter();

  // ==========================
  // STATES
  // ==========================

  const [items, setItems] =
    useState<VaultItem[]>([]);

  const [item, setItem] =
    useState<VaultItem | null>(null);

  const [url, setUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [fade, setFade] =
    useState(false);

  const [showUI, setShowUI] =
    useState(true);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const isTrash =
    tab === "trash";

  // ==========================
  // HELPERS
  // ==========================

  function toggleUI() {

    setShowUI((prev) => !prev);

  }

  function getBucket(
    type: VaultItem["file_type"]
  ) {

    switch (type) {

      case "image":
        return "vault-images";

      case "video":
        return "vault-videos";

      case "audio":
        return "vault-audio";

      default:
        return "vault-documents";

    }

  }

  // ==========================
  // LOAD GALLERY
  // ==========================

  const loadGallery =
    useCallback(async () => {

      if (!id) return;

      setLoading(true);

      const {

        data: { user },

      } =
        await supabase.auth.getUser();

      if (!user) {

        setLoading(false);

        return;

      }

      const {

        data,

        error,

      } =
        await supabase
          .from("vault_files")
          .select("*")
          .or(
            `user_id.eq.${user.id},and(partner_id.eq.${user.id},visibility.eq.shared)`
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error || !data) {

        console.error(error);

        setLoading(false);

        return;

      }

      let gallery: VaultItem[] = [];

      for (const file of data) {

        const bucket =
          getBucket(
            file.file_type
          );

        const {
          data: signed,
        } =
          await supabase.storage
            .from(bucket)
            .createSignedUrl(
              file.storage_path,
              3600
            );

        gallery.push({

          ...file,

          folder:
            (file as any)
              .folder ?? null,

          signedUrl:
            signed?.signedUrl ??
            "",

        });

      }

      switch (tab) {

        case "private":

          gallery =
            gallery.filter(
              (i) =>
                i.visibility ===
                  "private" &&
                !i.deleted
            );

          break;

        case "shared":

          gallery =
            gallery.filter(
              (i) =>
                i.visibility ===
                  "shared" &&
                !i.deleted
            );

          break;

        case "favorites":

          gallery =
            gallery.filter(
              (i) =>
                i.favorite &&
                !i.deleted
            );

          break;

        case "photos":

          gallery =
            gallery.filter(
              (i) =>
                i.file_type ===
                  "image" &&
                !i.deleted
            );

          break;

        case "videos":

          gallery =
            gallery.filter(
              (i) =>
                i.file_type ===
                  "video" &&
                !i.deleted
            );

          break;

        case "trash":

          gallery =
            gallery.filter(
              (i) => i.deleted
            );

          break;

        default:

          gallery =
            gallery.filter(
              (i) =>
                !i.deleted
            );

      }

      setItems(gallery);

      const index =
        gallery.findIndex(
          (i) => i.id === id
        );

      if (index !== -1) {

        setCurrentIndex(index);

        setItem(
          gallery[index]
        );

        setUrl(
          gallery[index]
            .signedUrl ?? ""
        );

      }

      setLoading(false);

    }, [

      id,

      tab,

    ]);
      // ==========================
  // CHANGE IMAGE
  // ==========================

  const changeImage =
    useCallback(

      (newIndex: number) => {

        if (
          newIndex < 0 ||
          newIndex >= items.length
        )
          return;

        const next =
          items[newIndex];

        setFade(true);

        setTimeout(() => {

          setCurrentIndex(
            newIndex
          );

          setItem(next);

          setUrl(
            next.signedUrl ?? ""
          );

          setFade(false);

        }, 120);

        router.replace(

          `/vault/preview?id=${next.id}&tab=${tab}`,

          {

            scroll: false,

          }

        );

      },

      [

        items,

        router,

        tab,

      ]

    );

  // ==========================
  // NEXT
  // ==========================

  const nextImage =
    useCallback(() => {

      changeImage(
        currentIndex + 1
      );

    }, [

      changeImage,

      currentIndex,

    ]);

  // ==========================
  // PREVIOUS
  // ==========================

  const previousImage =
    useCallback(() => {

      changeImage(
        currentIndex - 1
      );

    }, [

      changeImage,

      currentIndex,

    ]);

  // ==========================
  // PRELOAD
  // ==========================

  function preloadImages() {

    const next =
      items[currentIndex + 1];

    if (next?.signedUrl) {

      const img =
        new Image();

      img.src =
        next.signedUrl;

    }

    const prev =
      items[currentIndex - 1];

    if (prev?.signedUrl) {

      const img =
        new Image();

      img.src =
        prev.signedUrl;

    }

  }

  // ==========================
  // KEYBOARD
  // ==========================

  function handleKeyDown(
    e: KeyboardEvent
  ) {

    if (
      e.key ===
      "ArrowRight"
    ) {

      nextImage();

    }

    if (
      e.key ===
      "ArrowLeft"
    ) {

      previousImage();

    }

    if (
      e.key ===
      "Escape"
    ) {

      router.push(
        "/vault"
      );

    }

    if (
      e.key === " "
    ) {

      e.preventDefault();

      toggleUI();

    }

  }

  // ==========================
  // SWIPE
  // ==========================

  const [
    touchStartX,

    setTouchStartX,

  ] =
    useState<number | null>(
      null
    );

  const [
    touchEndX,

    setTouchEndX,

  ] =
    useState<number | null>(
      null
    );

  function handleTouchStart(
    e: React.TouchEvent
  ) {

    setTouchEndX(
      null
    );

    setTouchStartX(

      e.targetTouches[0]
        .clientX

    );

  }

  function handleTouchMove(
    e: React.TouchEvent
  ) {

    setTouchEndX(

      e.targetTouches[0]
        .clientX

    );

  }

  function handleTouchEnd() {

    if (

      touchStartX ===
        null ||

      touchEndX ===
        null

    )
      return;

    const distance =

      touchStartX -

      touchEndX;

    if (
      distance > 60
    ) {

      nextImage();

    }

    if (
      distance < -60
    ) {

      previousImage();

    }

  }

  // ==========================
  // AUTO HIDE UI
  // ==========================

  function startHideTimer() {

    setTimeout(() => {

      if (
        showUI
      ) {

        setShowUI(
          false
        );

      }

    }, 2500);

  }
    // ==========================
  // FAVORITE
  // ==========================

  async function toggleFavorite() {

    if (!item) return;

    const { error } =
      await supabase
        .from("vault_files")
        .update({

          favorite:
            !item.favorite,

        })
        .eq("id", item.id);

    if (error) {

      alert(error.message);

      return;

    }

    setItem({

      ...item,

      favorite:
        !item.favorite,

    });

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              favorite:
                !i.favorite,
            }
          : i
      )
    );

  }

  // ==========================
  // DELETE
  // ==========================

  async function deleteMemory() {

    if (!item) return;

    const ok = confirm(
      "Move this memory to Trash?"
    );

    if (!ok) return;

    const { error } =
      await supabase
        .from("vault_files")
        .update({

          deleted: true,

          deleted_at:
            new Date().toISOString(),

        })
        .eq("id", item.id);

    if (error) {

      alert(error.message);

      return;

    }

    router.push("/vault");

  }

  // ==========================
  // RESTORE
  // ==========================

  async function restoreMemory() {

    if (!item) return;

    const { error } =
      await supabase
        .from("vault_files")
        .update({

          deleted: false,

          deleted_at: null,

        })
        .eq("id", item.id);

    if (error) {

      alert(error.message);

      return;

    }

    router.push("/vault");

  }

  // ==========================
  // DELETE FOREVER
  // ==========================

  async function deleteForeverMemory() {

    if (!item) return;

    const ok = confirm(

      "Delete forever?\n\nThis action cannot be undone."

    );

    if (!ok) return;

    const bucket =
      getBucket(
        item.file_type
      );

    await supabase.storage

      .from(bucket)

      .remove([
        item.storage_path,
      ]);

    const { error } =
      await supabase
        .from("vault_files")
        .delete()
        .eq("id", item.id);

    if (error) {

      alert(error.message);

      return;

    }

    router.push(
      "/vault?tab=trash"
    );

  }

  // ==========================
  // RETURN
  // ==========================

  return {

    loading,

    item,

    items,

    url,

    fade,

    showUI,

    isTrash,

    currentIndex,

    setShowUI,

    loadGallery,

    toggleUI,

    changeImage,

    nextImage,

    previousImage,

    preloadImages,

    handleKeyDown,

    handleTouchStart,

    handleTouchMove,

    handleTouchEnd,

    startHideTimer,

    toggleFavorite,

    deleteMemory,

    restoreMemory,

    deleteForeverMemory,

  };

}