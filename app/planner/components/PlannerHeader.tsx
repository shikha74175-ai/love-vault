"use client";

import {
  CalendarDays,
  Plus,
  Heart,
} from "lucide-react";

type Props = {
  onAddEvent: () => void;
};

export default function PlannerHeader({
  onAddEvent,
}: Props) {
  return (
    <header className="mb-8">

      <div className="flex flex-col gap-5 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="flex items-center gap-4">

          {/* Icon */}

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 ring-1 ring-pink-500/20">

            <CalendarDays
              size={28}
              strokeWidth={2}
            />

          </div>

          {/* Title */}

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Planner
              </h1>

              <Heart
                size={17}
                className="fill-pink-500 text-pink-500"
              />

            </div>

            <p className="mt-1 text-sm text-zinc-400">
              Plan your special moments
              together ❤️
            </p>

          </div>

        </div>

        {/* =========================
            ADD EVENT
        ========================= */}

        <button
          type="button"
          onClick={onAddEvent}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white shadow-lg shadow-pink-600/10 transition-all duration-200 hover:bg-pink-700 hover:shadow-pink-600/20 active:scale-[0.98] sm:w-auto"
        >

          <Plus
            size={20}
            className="transition-transform duration-200 group-hover:rotate-90"
          />

          <span>
            Add Event
          </span>

        </button>

      </div>

    </header>
  );
}