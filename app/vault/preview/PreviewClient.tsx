"use client";

import { useEffect } from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import usePreview from "../hooks/usePreview";

import PreviewHeader from "../components/PreviewHeader";
import PreviewContent from "../components/PreviewContent";
import PreviewActions from "../components/PreviewActions";

export default function PreviewClient() {

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const id =
    searchParams.get("id");

  const tab =
    searchParams.get("tab") ??
    "private";

  const {

    loading,

    item,

    items,

    url,

    fade,

    showUI,

    isTrash,

    currentIndex,

    loadGallery,

    preloadImages,

    startHideTimer,

    handleKeyDown,

    handleTouchStart,

    handleTouchMove,

    handleTouchEnd,

    toggleUI,

    nextImage,

    previousImage,

    toggleFavorite,

    deleteMemory,

    restoreMemory,

    deleteForeverMemory,

  } =
    usePreview({

      id,

      tab,

    });

  // ==========================
  // EFFECTS
  // ==========================

  useEffect(() => {

    loadGallery();

  }, [

    loadGallery,

  ]);

  useEffect(() => {

    preloadImages();

  }, [

    currentIndex,

    items,

  ]);

  useEffect(() => {

    startHideTimer();

  }, [

    currentIndex,

  ]);

  useEffect(() => {

    window.addEventListener(

      "keydown",

      handleKeyDown

    );

    return () =>

      window.removeEventListener(

        "keydown",

        handleKeyDown

      );

  }, [

    handleKeyDown,

  ]);

  // ==========================
  // LOADING
  // ==========================

  if (loading) {

    return (

      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-zinc-950
          text-white
        "
      >

        <div
          className="
            h-16
            w-16
            animate-spin
            rounded-full
            border-4
            border-pink-500
            border-t-transparent
          "
        />

      </main>

    );

  }

  // ==========================
  // NOT FOUND
  // ==========================

  if (!item) {

    return (

      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-zinc-950
          text-red-500
        "
      >

        File not found.

      </main>

    );

  }

  // ==========================
  // UI
  // ==========================

  return (

    <main
      className="
        min-h-screen
        bg-zinc-950
        text-white
      "
    >
            {/* ==========================
          HEADER
      ========================== */}

      <div
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
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

      {/* Counter */}

      <div className="absolute left-1/2 top-20 z-40 -translate-x-1/2">

        <div className="rounded-full bg-black/60 px-4 py-1 text-sm backdrop-blur">

          {currentIndex + 1} / {items.length}

        </div>

      </div>

      {/* ==========================
          CONTENT
      ========================== */}

      <div
        onClick={toggleUI}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`pb-24 transition-opacity duration-200 ${
          fade
            ? "opacity-0"
            : "opacity-100"
        }`}
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
          fixed
          left-6
          top-1/2
          z-50
          hidden
          h-14
          w-14
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-zinc-700
          bg-zinc-900/70
          backdrop-blur-xl
          transition
          hover:scale-110
          hover:bg-black/80
          disabled:cursor-not-allowed
          disabled:opacity-30
          md:flex
        "
      >

        <ChevronLeft size={32} />

      </button>

      {/* Next */}

      <button
        onClick={nextImage}
        disabled={
          currentIndex ===
          items.length - 1
        }
        className="
          fixed
          right-6
          top-1/2
          z-50
          hidden
          h-14
          w-14
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-zinc-700
          bg-zinc-900/70
          backdrop-blur-xl
          transition
          hover:scale-110
          hover:bg-black/80
          disabled:cursor-not-allowed
          disabled:opacity-30
          md:flex
        "
      >

        <ChevronRight size={32} />

      </button>

      {/* ==========================
          ACTIONS
      ========================== */}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
          showUI
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >

        <PreviewActions
          favorite={item.favorite}

          onFavorite={
            toggleFavorite
          }

          onDownload={() => {

            if (url) {

              window.open(
                url,
                "_blank"
              );

            }

          }}

          onDelete={
            isTrash
              ? deleteForeverMemory
              : deleteMemory
          }

          onRestore={
            isTrash
              ? restoreMemory
              : undefined
          }

          deleteLabel={
            isTrash
              ? "Delete Forever"
              : "Delete"
          }

          onInfo={() => {

            alert(
`📁 Folder: ${item.folder || "No Folder"}

🗓 Created:
${new Date(
  item.created_at
).toLocaleString()}`
            );

          }}

        />

      </div>

    </main>

  );

}