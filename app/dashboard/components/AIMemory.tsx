"use client";

import { Sparkles } from "lucide-react";

type Memory = {
  id: string;
  file_name: string;
  created_at: string;
};

type Props = {

  aiMemory: any;

};

export default function AIMemory({

  aiMemory,

}: Props) {
const memory =
  aiMemory?.memory;

  const formattedDate = memory
    ? new Date(memory.created_at).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : null;

  return (

    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

      {/* Header */}

      <div className="flex items-center gap-3">

        <Sparkles
          size={22}
          className="text-pink-400"
        />

        <h2 className="text-2xl font-bold">

          AI Memory of the Day

        </h2>

      </div>

      {!memory ? (

        <div className="mt-8 rounded-2xl bg-zinc-800 p-8 text-center">

          <div className="text-6xl">

            {aiMemory?.emoji ?? "🤖"}

          </div>

          <h3 className="mt-5 text-xl font-semibold">

            No Memories Yet

          </h3>

          <p className="mt-2 text-zinc-400">

            Upload your first memory to unlock
            daily AI memories ❤️

          </p>

        </div>

      ) : (

        <div
          className="
          mt-6
          rounded-3xl
          bg-gradient-to-r
          from-fuchsia-700
          via-purple-700
          to-violet-700
          p-7
          "
        >

          <div className="flex items-center gap-6">

            {/* Robot */}

            <div className="text-7xl">

              🤖

            </div>

            {/* Text */}

            <div>

              <h3 className="text-3xl font-bold text-white">

                {aiMemory?.title}

              </h3>

              <p className="mt-5 text-lg leading-8 text-pink-100">

                {aiMemory?.message}

              </p>

              <p className="mt-6 font-semibold text-white">

                📸 {memory.file_name}

              </p>

              <p className="mt-2 text-pink-100">

                {formattedDate}

              </p>

            </div>

          </div>

        </div>

      )}

    </section>

  );

}