"use client";

import { CalendarDays, Plus } from "lucide-react";

type Props = {
  onAddEvent: () => void;
};

export default function EmptyPlanner({
  onAddEvent,
}: Props) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/50 p-8">

      <div className="max-w-md text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-pink-500/10 text-pink-400">
          <CalendarDays size={40} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white">
          Your planner is empty
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          No special moments are planned yet.
          Start adding dates, anniversaries,
          date plans and other memories you
          want to remember together. ❤️
        </p>

        {/* Button */}
        <button
          type="button"
          onClick={onAddEvent}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
        >
          <Plus size={20} />

          Add Your First Event
        </button>

      </div>

    </div>
  );
}