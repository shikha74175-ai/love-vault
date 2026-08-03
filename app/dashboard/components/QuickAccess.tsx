"use client";

import Link from "next/link";

import {
  HeartHandshake,
  FolderOpen,
  MessageCircleHeart,
  CalendarHeart,
  NotebookPen,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const modules = [

  {
    title: "Partner",
    subtitle: "Relationship",
    href: "/partner",
    icon: HeartHandshake,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },

  {
    title: "Vault",
    subtitle: "Private Memories",
    href: "/vault",
    icon: FolderOpen,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },

  {
    title: "Chat",
    subtitle: "Private Chat",
    href: "/chat",
    icon: MessageCircleHeart,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },

  {
    title: "Planner",
    subtitle: "Dates & Events",
    href: "/planner",
    icon: CalendarHeart,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },

  {
    title: "Notes",
    subtitle: "Private Notes",
    href: "/notes",
    icon: NotebookPen,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },

  {
    title: "AI Assistant",
    subtitle: "Coming Soon",
    href: "/ai",
    icon: Sparkles,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
  },

];

type QuickAccessProps = {
  profile: any;
};

export default function QuickAccess({
  profile,
}: QuickAccessProps) {

  return (

    <section>

      {/* Header */}

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-white">

          Quick Access

        </h2>

        <p className="mt-1 text-zinc-400">

          Open your favorite Love Vault features.

        </p>

      </div>

      {/* Grid */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

        {modules.map((item) => {

          const Icon = item.icon;

          return (

            <Link
              key={item.title}
              href={item.href}
              className="
              group
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-900
              p-6
              transition-all
              duration-300
              hover:-translate-y-2
              hover:border-pink-500/30
              hover:shadow-xl
              "
            >

              <div className="flex items-start justify-between">

                <div
                  className={`
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  ${item.bg}
                  `}
                >

                  <Icon
                    size={28}
                    className={item.color}
                  />

                </div>

                <ArrowRight
                  size={18}
                  className="
                  text-zinc-500
                  transition-all
                  duration-300
                  group-hover:translate-x-2
                  group-hover:text-pink-400
                  "
                />

              </div>

              <h3 className="mt-6 text-xl font-bold text-white">

                {item.title}

              </h3>

              <p className="mt-2 text-sm text-zinc-400">

                {item.subtitle}

              </p>

            </Link>

          );

        })}

      </div>

    </section>

  );

}