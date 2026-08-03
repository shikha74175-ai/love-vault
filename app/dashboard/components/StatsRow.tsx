"use client";

import {
  Image,
  Video,
  FolderOpen,
  Heart,
} from "lucide-react";

import type { DashboardState } from "../hooks/useDashboard";

type StatsRowProps = {
  stats: DashboardState["stats"];
};

export default function StatsRow({
  stats,
}: StatsRowProps) {

  const cards = [

    {
      title: "Photos",
      value: stats.photos,
      icon: Image,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },

    {
      title: "Videos",
      value: stats.videos,
      icon: Video,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },

    {
      title: "Albums",
      value: stats.albums,
      icon: FolderOpen,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },

    {
      title: "Favorites",
      value: stats.favorites,
      icon: Heart,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },

  ];

  return (

    <section>

      <div className="mb-5">

        <h2 className="text-2xl font-bold">

          Quick Stats

        </h2>

        <p className="mt-1 text-zinc-400">

          Live overview of your Love Vault

        </p>

      </div>

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">

        {cards.map((card) => {

          const Icon = card.icon;

          return (

            <div
              key={card.title}
              className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900
              p-6
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-pink-500/30
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-zinc-400">

                    {card.title}

                  </p>

                  <h3 className="mt-3 text-3xl font-bold">

                    {card.value}

                  </h3>

                </div>

                <div
                  className={`
                  rounded-2xl
                  p-3
                  ${card.bg}
                  `}
                >

                  <Icon
                    size={28}
                    className={card.color}
                  />

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </section>

  );

}