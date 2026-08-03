"use client";

import {
  Heart,
  Sparkles,
} from "lucide-react";

import { usePartner } from "../context/PartnerContext";

export default function PartnerHeader() {

  const {
    connected,
    connectedSince,
    relationshipText,
    nextAnniversary,
  } = usePartner();

  return (

    <section
      className="
      relative
      overflow-hidden
      rounded-3xl
      border
      border-pink-500/20
      bg-gradient-to-br
      from-pink-600/20
      via-fuchsia-600/10
      to-zinc-900
      p-6
      lg:p-8
      "
    >

      {/* Background Glow */}

      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />

      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative z-10">

        {/* Header */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          {/* Left */}

          <div>

            <div className="flex items-center gap-3">

              <div
                className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-pink-500
                to-rose-600
                shadow-xl
                shadow-pink-500/40
                "
              >

                <Heart
                  size={34}
                  className="fill-white text-white"
                />

              </div>

              <div>

                <h1 className="text-3xl font-bold">

                  ❤️ Partner Hub

                </h1>

                <p className="mt-1 text-sm text-zinc-400">

                  Love Vault Relationship Center

                </p>

              </div>

            </div>

            <p className="mt-5 max-w-3xl text-zinc-300 leading-7">

              Every memory you save together,
              every milestone you celebrate,
              and every moment you protect —
              all in one private place.

            </p>

          </div>

          {/* Right */}

          <div
            className={`
            flex
            items-center
            gap-3
            rounded-full
            border
            px-5
            py-3
            backdrop-blur-xl
            ${
              connected
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
            }
            `}
          >

            <div
              className={`
              h-3
              w-3
              rounded-full
              ${
                connected
                  ? "animate-pulse bg-green-400"
                  : "bg-red-500"
              }
              `}
            />

            <span
              className={`font-semibold ${
                connected
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >

              {connected
                ? "Connected"
                : "Not Connected"}

            </span>

            <Sparkles
              size={18}
              className="text-yellow-400"
            />

          </div>

        </div>

        {/* Stats Section */}

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Together Since */}

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 backdrop-blur-xl">

            <p className="text-sm text-zinc-400">

              ❤️ Together Since

            </p>

            <p className="mt-3 text-xl font-bold text-white">

              {connected
                ? connectedSince
                : "--"}

            </p>

          </div>

          {/* Together For */}

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 backdrop-blur-xl">

            <p className="text-sm text-zinc-400">

              💕 Together For

            </p>

            <p className="mt-3 text-xl font-bold text-pink-400">

              {connected
                ? relationshipText
                : "--"}

            </p>

          </div>

          {/* Next Anniversary */}

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 backdrop-blur-xl">

            <p className="text-sm text-zinc-400">

              🎉 Next Anniversary

            </p>

            <p className="mt-3 text-xl font-bold text-yellow-400">

              {connected
                ? nextAnniversary
                : "--"}

            </p>

          </div>

          {/* Shared Memories */}

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 backdrop-blur-xl">

            <p className="text-sm text-zinc-400">

              📸 Shared Memories

            </p>

            <p className="mt-3 text-xl font-bold text-cyan-400">

              Coming Soon

            </p>

          </div>

        </div>

        {/* Bottom Badges */}
                {/* Bottom Badges */}

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-6">

          <span
            className="
            inline-flex
            items-center
            rounded-full
            border
            border-pink-500/20
            bg-pink-500/10
            px-4
            py-2
            text-sm
            font-medium
            text-pink-300
            "
          >
            ❤️ Couple Space
          </span>

          <span
            className="
            inline-flex
            items-center
            rounded-full
            border
            border-green-500/20
            bg-green-500/10
            px-4
            py-2
            text-sm
            font-medium
            text-green-300
            "
          >
            🔒 End-to-End Secure
          </span>

          <span
            className="
            inline-flex
            items-center
            rounded-full
            border
            border-blue-500/20
            bg-blue-500/10
            px-4
            py-2
            text-sm
            font-medium
            text-blue-300
            "
          >
            ☁️ Real-time Sync
          </span>

        </div>

      </div>

    </section>

  );

}