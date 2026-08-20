"use client";

import {
  CalendarClock,
  Clock,
  MapPin,
} from "lucide-react";

import { PlannerEvent } from "../types";
import EventCategoryBadge from "./EventCategoryBadge";

type Props = {
  events: PlannerEvent[];

  onEditEvent: (
    event: PlannerEvent
  ) => void;

  onDeleteEvent: (
    id: string
  ) => void;

  onToggleComplete: (
    event: PlannerEvent
  ) => void;

  saving: boolean;
};

function getTodayDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

function formatDate(
  dateString: string
) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  );
}

export default function UpcomingEvents({
  events,
  onEditEvent,
  onDeleteEvent,
  onToggleComplete,
  saving,
}: Props) {

  const today = getTodayDate();

  const upcomingEvents = events
    .filter(
      (event) =>
        event.event_date >= today &&
        !event.is_completed
    )
    .sort((a, b) => {

      const dateCompare =
        a.event_date.localeCompare(
          b.event_date
        );

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (
        (a.start_time ?? "").localeCompare(
          b.start_time ?? ""
        )
      );
    })
    .slice(0, 5);

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
          <CalendarClock size={22} />
        </div>

        <div>

          <h2 className="text-lg font-bold text-white">
            Upcoming Events
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Your next special moments ❤️
          </p>

        </div>

      </div>

      {/* =========================
          EMPTY STATE
      ========================= */}

      {upcomingEvents.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 p-8 text-center">

          <div className="mb-3 text-4xl">
            🌸
          </div>

          <h3 className="font-semibold text-zinc-200">
            Nothing coming up
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Your upcoming special moments
            will appear here.
          </p>

        </div>

      ) : (

        /* =========================
           EVENTS
        ========================= */

        <div className="space-y-3">

          {upcomingEvents.map(
            (event) => (

              <div
                key={event.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  {/* INFO */}

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="truncate font-semibold text-white">
                        {event.title}
                      </h3>

                      <EventCategoryBadge
  category={event.category}
/>
                    </div>

                    {/* DATE */}

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">

                      <span className="flex items-center gap-1.5">
                        📅
                        {formatDate(
                          event.event_date
                        )}
                      </span>

                      {/* TIME */}

                      {(event.start_time ||
                        event.end_time) && (

                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />

                          {event.start_time ??
                            ""}

                          {event.end_time
                            ? ` - ${event.end_time}`
                            : ""}
                        </span>

                      )}

                    </div>

                    {/* LOCATION */}

                    {event.location && (

                      <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">

                        <MapPin size={14} />

                        <span className="truncate">
                          {event.location}
                        </span>

                      </div>

                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="flex shrink-0 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        onToggleComplete(
                          event
                        )
                      }
                      disabled={saving}
                      className="rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-green-500/10 hover:text-green-400 disabled:opacity-50"
                    >
                      ✓ Done
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onEditEvent(event)
                      }
                      disabled={saving}
                      className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-pink-500 hover:text-pink-400 disabled:opacity-50"
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDeleteEvent(
                          event.id
                        )
                      }
                      disabled={saving}
                      className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      🗑️
                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </section>
  );
}