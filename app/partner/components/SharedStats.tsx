"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import {
  Image,
  Video,
  Music,
  FileText,
  Heart,
  Folder,
} from "lucide-react";

import { usePartner } from "../context/PartnerContext";

type Stats = {
  photos: number;
  videos: number;
  audio: number;
  documents: number;
  favorites: number;
  folders: number;
};

export default function SharedStats() {

  const { connected } = usePartner();

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState<Stats>({
      photos: 0,
      videos: 0,
      audio: 0,
      documents: 0,
      favorites: 0,
      folders: 0,
    });

  useEffect(() => {

    if (connected) {

      loadStats();

    } else {

      setLoading(false);

    }

  }, [connected]);

  async function loadStats() {

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {

      setLoading(false);

      return;

    }

    // Shared Files

    const { data: files } =
      await supabase
        .from("vault_files")
        .select(
          "file_type,favorite"
        )
        .eq(
          "visibility",
          "shared"
        )
        .or(
          `owner_id.eq.${user.id},partner_id.eq.${user.id}`
        )
        .eq(
          "deleted",
          false
        );

    // Shared Folders

    const { data: folders } =
      await supabase
        .from("vault_folders")
        .select("id")
        .eq(
          "visibility",
          "shared"
        )
        .or(
          `user_id.eq.${user.id},partner_id.eq.${user.id}`
        )
        .eq(
          "deleted",
          false
        );

    const result = {

      photos: 0,

      videos: 0,

      audio: 0,

      documents: 0,

      favorites: 0,

      folders:
        folders?.length ?? 0,

    };

    files?.forEach((file) => {

      if (
        file.file_type === "image"
      )
        result.photos++;

      if (
        file.file_type === "video"
      )
        result.videos++;

      if (
        file.file_type === "audio"
      )
        result.audio++;

      if (
        file.file_type ===
        "document"
      )
        result.documents++;

      if (file.favorite)
        result.favorites++;

    });

    setStats(result);

    setLoading(false);

  }

  if (!connected) {

    return (

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

        <h2 className="text-2xl font-bold">

          Shared Stats

        </h2>

        <p className="mt-4 text-zinc-400">

          Connect your partner to
          view shared statistics.

        </p>

      </section>

    );

  }

  const cards = [

    {
      label: "Photos",
      value: stats.photos,
      icon: Image,
    },

    {
      label: "Videos",
      value: stats.videos,
      icon: Video,
    },

    {
      label: "Audio",
      value: stats.audio,
      icon: Music,
    },

    {
      label: "Documents",
      value: stats.documents,
      icon: FileText,
    },

    {
      label: "Favorites",
      value: stats.favorites,
      icon: Heart,
    },

    {
      label: "Folders",
      value: stats.folders,
      icon: Folder,
    },

  ];

  return (

    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <h2 className="text-2xl font-bold">

        Shared Statistics

      </h2>

      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3">

        {cards.map((card) => {

          const Icon =
            card.icon;

          return (

            <div
              key={card.label}
              className="
              rounded-2xl
              bg-zinc-800
              p-6
              "
            >

              <Icon
                className="text-pink-500"
                size={28}
              />

              <p className="mt-5 text-3xl font-bold">

                {loading
                  ? "--"
                  : card.value}

              </p>

              <p className="mt-2 text-zinc-400">

                {card.label}

              </p>

            </div>

          );

        })}

      </div>

    </section>

  );

}