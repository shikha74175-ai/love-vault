"use client";

import {
  Heart,
  CalendarHeart,
  Cake,
  Images,
  FolderOpen,
} from "lucide-react";

import type { DashboardState } from "../hooks/useDashboard";

type HeroProps = {
  dashboard: DashboardState & {
    refreshDashboard: () => Promise<void>;
  };
};

export default function Hero({
  dashboard,
}: HeroProps) {

  const profile = dashboard.profile;

  const stats = dashboard.stats;

  const fullName =
    profile?.full_name ||
    profile?.username ||
    "Love";

  const relationshipSince =
    profile?.relationship_since
      ? new Date(
          profile.relationship_since
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "--";

  return (
    <section
      className="
      relative
      overflow-hidden
      rounded-[28px]
      bg-gradient-to-r
      from-rose-600
      via-fuchsia-600
      to-violet-700
      p-6
      lg:p-8
      shadow-2xl
      "
    >
      {/* Background */}

      <div className="absolute inset-0">

        <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-pink-400/10 blur-3xl" />

        <Heart
          size={80}
          className="absolute right-8 top-8 text-pink-200/10"
          fill="currentColor"
        />

      </div>

      <div className="relative z-10">

        <div className="grid gap-8 xl:grid-cols-12">

          {/* LEFT */}

          <div className="xl:col-span-7">

            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold text-white md:text-4xl xl:text-5xl">

                Welcome Back, {fullName}

              </h1>

              <Heart
                size={36}
                className="fill-red-500 text-red-500"
              />

            </div>

            <p className="mt-5 max-w-xl text-pink-100 leading-8">

              Every beautiful memory you save,
              every anniversary you celebrate,
              and every smile you capture stays
              together forever inside your
              private Love Vault.

            </p>

            {/* Relationship */}

            <div className="mt-8 grid gap-4 md:grid-cols-2">

              {/* Together */}

              <div
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                backdrop-blur-xl
                p-5
                "
              >

                <div className="flex items-center gap-3">

                  <CalendarHeart
                    className="text-pink-300"
                    size={24}
                  />

                  <span className="text-pink-100">

                    Together For

                  </span>

                </div>

                <h3 className="mt-4 text-2xl font-bold text-white">

                  {relationshipSince}

                </h3>

                <p className="mt-2 text-sm text-pink-100/80">

                  Growing stronger every day ❤️

                </p>

              </div>

              {/* Anniversary */}

              <div
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                backdrop-blur-xl
                p-5
                "
              >

                <div className="flex items-center gap-3">

                  <Cake
                    className="text-yellow-300"
                    size={24}
                  />

                  <span className="text-pink-100">

                    Next Anniversary

                  </span>

                </div>

                <h3 className="mt-4 text-2xl font-bold text-white">

                  Coming Soon

                </h3>

                <p className="mt-2 text-sm text-pink-100/80">

                  Countdown has started 🎉

                </p>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="xl:col-span-5">

            <div className="grid gap-4 md:grid-cols-3">
                            {/* Memories */}

              <div
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                backdrop-blur-xl
                p-5
                "
              >

                <Images
                  size={26}
                  className="text-pink-300"
                />

                <p className="mt-5 text-sm text-pink-100">

                  Memories

                </p>

                <h3 className="mt-3 text-4xl font-bold text-white">

                  {stats.photos}

                </h3>

                <p className="mt-2 text-xs text-pink-100/80">

                  Photos & Videos

                </p>

              </div>

              {/* Albums */}

              <div
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                backdrop-blur-xl
                p-5
                "
              >

                <FolderOpen
                  size={26}
                  className="text-cyan-300"
                />

                <p className="mt-5 text-sm text-pink-100">

                  Albums

                </p>

                <h3 className="mt-3 text-4xl font-bold text-white">

                  {stats.albums}

                </h3>

                <p className="mt-2 text-xs text-pink-100/80">

                  Shared Collections

                </p>

              </div>

              {/* Favorites */}

              <div
                className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                backdrop-blur-xl
                p-5
                "
              >

                <Heart
                  size={26}
                  className="fill-pink-400 text-pink-400"
                />

                <p className="mt-5 text-sm text-pink-100">

                  Favorites

                </p>

                <h3 className="mt-3 text-4xl font-bold text-white">

                  {stats.favorites}

                </h3>

                <p className="mt-2 text-xs text-pink-100/80">

                  Loved Moments

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  );

}