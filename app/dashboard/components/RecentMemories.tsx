"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";

import { getVaultSignedUrl } from "@/lib/supabase/storage";

type Memory = {
  id: string;
  file_name: string;
  storage_path: string;
  thumbnail_path: string | null;
  file_type: string;
  created_at: string;
};

type Props = {
  memories: Memory[];
};

export default function RecentMemories({
  memories,
}: Props) {

  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {

    async function loadImages() {

      const imageMap: Record<string, string> = {};

      for (const memory of memories) {

        const url = await getVaultSignedUrl(
          memory.file_type,
          memory.thumbnail_path || memory.storage_path
        );

        if (url) {

          imageMap[memory.id] = url;

        }

      }

      setUrls(imageMap);

    }

    loadImages();

  }, [memories]);

  return (

    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="flex items-center gap-2 text-xl font-bold">

            <Images
              size={22}
              className="text-pink-400"
            />

            Recent Memories

          </h2>

          <p className="mt-1 text-sm text-zinc-400">

            Latest uploaded memories

          </p>

        </div>

        <Link
          href="/vault"
          className="flex items-center gap-2 text-pink-400 hover:text-pink-300"
        >

          View All

          <ArrowRight size={16} />

        </Link>

      </div>

      {/* Empty */}

      {memories.length === 0 && (

        <div className="rounded-2xl border border-dashed border-zinc-700 py-12 text-center">

          <Images
            className="mx-auto text-zinc-600"
            size={42}
          />

          <h3 className="mt-4 text-lg font-semibold">

            No Memories Yet

          </h3>

          <p className="mt-2 text-sm text-zinc-500">

            Upload your first memory ❤️

          </p>

        </div>

      )}

      {/* Grid */}

      {memories.length > 0 && (

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

          {memories.map((memory) => (

            <div
              key={memory.id}
              className="
              group
              relative
              aspect-square
              overflow-hidden
              rounded-2xl
              bg-zinc-800
              "
            >

              {urls[memory.id] ? (

                <Image
                  src={urls[memory.id]}
                  alt={memory.file_name}
                  fill
                  sizes="300px"
                  className="
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-110
                  "
                />

              ) : (

                <div className="flex h-full w-full animate-pulse items-center justify-center bg-zinc-800">

                  <Images
                    size={34}
                    className="text-zinc-600"
                  />

                </div>

              )}

              <div
                className="
                absolute
                inset-x-0
                bottom-0
                bg-gradient-to-t
                from-black/80
                to-transparent
                p-3
                opacity-0
                transition
                group-hover:opacity-100
                "
              >

                <p className="truncate text-sm text-white">

                  {memory.file_name}

                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>

  );

}