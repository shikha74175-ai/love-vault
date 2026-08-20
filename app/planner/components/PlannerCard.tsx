"use client";

import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { PlannerEvent } from "../types";

type Props = {
  event: PlannerEvent;

  onEdit: (
    event: PlannerEvent
  ) => void;

  onDelete: (
    id: string
  ) => Promise<void>;

  onToggleComplete: (
    event: PlannerEvent
  ) => Promise<void>;

  saving?: boolean;
};

// =========================
// CATEGORY CONFIG
// =========================

const categoryConfig: Record<
  string,
  {
    icon: string;
    label: string;
  }
> = {
  date: {
    icon: "❤️",
    label: "Date",
  },

  anniversary: {
    icon: "💍",
    label: "Anniversary",
  },

  birthday: {
    icon: "🎂",
    label: "Birthday",
  },

  reminder: {
    icon: "🔔",
    label: "Reminder",
  },

  meeting: {
    icon: "📅",
    label: "Meeting",
  },

  travel: {
    icon: "✈️",
    label: "Travel",
  },

  other: {
    icon: "📝",
    label: "Other",
  },
};

// =========================
// FORMAT DATE
// =========================

function formatDate(
  date: string
) {
  if (!date) return "";

  const parsed =
    new Date(
      `${date}T00:00:00`
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

// =========================
// FORMAT TIME
// =========================

function formatTime(
  time: string | null
) {
  if (!time) return null;

  const [hour, minute] =
    time.split(":");

  const h =
    Number(hour);

  const m =
    Number(minute);

  if (
    Number.isNaN(h) ||
    Number.isNaN(m)
  ) {
    return time;
  }

  const period =
    h >= 12
      ? "PM"
      : "AM";

  const displayHour =
    h % 12 || 12;

  return `${displayHour}:${String(
    m
  ).padStart(2, "0")} ${period}`;
}

// =========================
// COMPONENT
// =========================

export default function PlannerCard({
  event,
  onEdit,
  onDelete,
  onToggleComplete,
  saving = false,
}: Props) {

  const category =
    categoryConfig[
      event.category
    ] ??
    categoryConfig.other;

  async function handleDelete() {

    const confirmed =
      window.confirm(
        `Delete "${event.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await onDelete(
        event.id
      );

    } catch (error) {

      console.error(
        "Delete planner event error:",
        error
      );

    }
  }

  async function handleToggle() {

    try {

      await onToggleComplete(
        event
      );

    } catch (error) {

      console.error(
        "Toggle planner event error:",
        error
      );

    }
  }

  const startTime =
    formatTime(
      event.start_time
    );

  const endTime =
    formatTime(
      event.end_time
    );

  return (
    <div
      className={`
        group relative rounded-2xl border
        p-5 transition-all duration-200
        ${
          event.is_completed
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-zinc-800 bg-zinc-900"
        }
        hover:border-pink-500/40
      `}
    >

      {/* =========================
          TOP
      ========================= */}

      <div className="flex items-start justify-between gap-4">

        {/* Left */}

        <div className="flex min-w-0 items-start gap-3">

          {/* Category */}

          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              bg-zinc-800
              text-xl
            "
          >
            {category.icon}
          </div>

          {/* Title */}

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h3
                className={`
                  break-words
                  text-lg font-semibold
                  ${
                    event.is_completed
                      ? "text-zinc-500 line-through"
                      : "text-white"
                  }
                `}
              >
                {event.title}
              </h3>

              {/* Category */}

              <span
                className="
                  rounded-full
                  border border-zinc-700
                  bg-zinc-950
                  px-2.5 py-1
                  text-xs
                  text-zinc-400
                "
              >
                {category.label}
              </span>

            </div>

            {/* Description */}

            {event.description && (
              <p
                className={`
                  mt-1
                  text-sm
                  ${
                    event.is_completed
                      ? "text-zinc-600"
                      : "text-zinc-400"
                  }
                `}
              >
                {event.description}
              </p>
            )}

          </div>

        </div>

        {/* Completed Badge */}

        {event.is_completed && (
          <span
            className="
              shrink-0
              rounded-full
              border border-emerald-500/30
              bg-emerald-500/10
              px-3 py-1
              text-xs font-medium
              text-emerald-400
            "
          >
            Completed
          </span>
        )}

      </div>

      {/* =========================
          EVENT INFO
      ========================= */}

      <div
        className="
          mt-5
          flex flex-col gap-2
          text-sm text-zinc-400
          sm:flex-row sm:flex-wrap
        "
      >

        {/* Date */}

        <div className="flex items-center gap-2">

          <CalendarDays
            size={16}
            className="text-pink-400"
          />

          <span>
            {formatDate(
              event.event_date
            )}
          </span>

        </div>

        {/* Time */}

        {(startTime ||
          endTime) && (
          <div className="flex items-center gap-2">

            <Clock
              size={16}
              className="text-purple-400"
            />

            <span>

              {startTime &&
                startTime}

              {startTime &&
                endTime &&
                " - "}

              {endTime &&
                endTime}

            </span>

          </div>
        )}

        {/* Location */}

        {event.location && (
          <div className="flex items-center gap-2">

            <MapPin
              size={16}
              className="text-blue-400"
            />

            <span className="break-words">
              {event.location}
            </span>

          </div>
        )}

      </div>

      {/* =========================
          ACTIONS
      ========================= */}

      <div
        className="
          mt-5
          flex flex-wrap
          items-center gap-2
          border-t border-zinc-800
          pt-4
        "
      >

        {/* Complete */}

        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={`
            inline-flex
            items-center gap-2
            rounded-xl
            px-3 py-2
            text-sm font-medium
            transition
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${
              event.is_completed
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }
          `}
        >

          {event.is_completed ? (
            <>
              <X size={15} />
              Mark Pending
            </>
          ) : (
            <>
              <Check size={15} />
              Complete
            </>
          )}

        </button>

        {/* Edit */}

        <button
          type="button"
          onClick={() =>
            onEdit(event)
          }
          disabled={saving}
          className="
            inline-flex
            items-center gap-2
            rounded-xl
            bg-zinc-800
            px-3 py-2
            text-sm font-medium
            text-zinc-300
            transition
            hover:bg-zinc-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          <Pencil size={15} />

          Edit

        </button>

        {/* Delete */}

        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="
            inline-flex
            items-center gap-2
            rounded-xl
            bg-red-500/10
            px-3 py-2
            text-sm font-medium
            text-red-400
            transition
            hover:bg-red-500/20
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          <Trash2 size={15} />

          Delete

        </button>

      </div>

      {/* =========================
          SAVING OVERLAY
      ========================= */}

      {saving && (
        <div
          className="
            absolute inset-0
            flex items-center
            justify-center
            rounded-2xl
            bg-black/30
            backdrop-blur-[1px]
          "
        >
          <div
            className="
              rounded-xl
              border border-zinc-700
              bg-zinc-900
              px-4 py-2
              text-sm text-zinc-300
              shadow-lg
            "
          >
            Saving...
          </div>
        </div>
      )}

    </div>
  );
}