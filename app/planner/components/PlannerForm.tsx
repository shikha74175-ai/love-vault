"use client";

import { useEffect, useState } from "react";
import {
  X,
  Save,
  Bell,
  Repeat2,
  CalendarDays,
} from "lucide-react";

import {
  PlannerEvent,
  PlannerEventCategory,
  RepeatType,
} from "../types";

type Props = {
  event?: PlannerEvent | null;

  saving?: boolean;

  onSave: (
    data: Omit<
      PlannerEvent,
      "id" | "user_id" | "created_at" | "updated_at"
    >
  ) => Promise<void>;

  onClose: () => void;
};

// =========================
// CATEGORIES
// =========================

const categories: {
  value: PlannerEventCategory;
  label: string;
}[] = [
  {
    value: "date",
    label: "💑 Date",
  },
  {
    value: "anniversary",
    label: "❤️ Anniversary",
  },
  {
    value: "birthday",
    label: "🎂 Birthday",
  },
  {
    value: "reminder",
    label: "🔔 Reminder",
  },
  {
    value: "meeting",
    label: "🤝 Meeting",
  },
  {
    value: "travel",
    label: "✈️ Travel",
  },
  {
    value: "other",
    label: "📝 Other",
  },
];

// =========================
// REMINDER OPTIONS
// =========================

const reminderOptions = [
  {
    value: 15,
    label: "15 minutes before",
  },
  {
    value: 30,
    label: "30 minutes before",
  },
  {
    value: 60,
    label: "1 hour before",
  },
  {
    value: 120,
    label: "2 hours before",
  },
  {
    value: 1440,
    label: "1 day before",
  },
];

// =========================
// REPEAT OPTIONS
// =========================

const repeatOptions: {
  value: RepeatType;
  label: string;
}[] = [
  {
    value: "none",
    label: "Doesn't repeat",
  },
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "yearly",
    label: "Yearly",
  },
];

export default function PlannerForm({
  event,
  saving = false,
  onSave,
  onClose,
}: Props) {
  // =========================
  // BASIC FIELDS
  // =========================

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [eventDate, setEventDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [category, setCategory] =
    useState<PlannerEventCategory>("other");

  const [isCompleted, setIsCompleted] =
    useState(false);

  // =========================
  // REMINDER
  // =========================

  const [reminderEnabled, setReminderEnabled] =
    useState(false);

  const [reminderMinutes, setReminderMinutes] =
    useState(30);

  // =========================
  // RECURRING EVENT
  // =========================

  const [repeatType, setRepeatType] =
    useState<RepeatType>("none");

  const [repeatUntil, setRepeatUntil] =
    useState("");

  // =========================
  // LOAD / RESET FORM
  // =========================

  useEffect(() => {
    if (!event) {
      setTitle("");
      setDescription("");
      setEventDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setCategory("other");
      setIsCompleted(false);

      setReminderEnabled(false);
      setReminderMinutes(30);

      setRepeatType("none");
      setRepeatUntil("");

      return;
    }

    setTitle(event.title ?? "");

    setDescription(
      event.description ?? ""
    );

    setEventDate(
      event.event_date ?? ""
    );

    setStartTime(
      event.start_time
        ? event.start_time.slice(0, 5)
        : ""
    );

    setEndTime(
      event.end_time
        ? event.end_time.slice(0, 5)
        : ""
    );

    setLocation(
      event.location ?? ""
    );

    setCategory(
      event.category ?? "other"
    );

    setIsCompleted(
      event.is_completed ?? false
    );

    setReminderEnabled(
      event.reminder_enabled ?? false
    );

    setReminderMinutes(
      event.reminder_minutes ?? 30
    );

    setRepeatType(
      event.repeat_type ?? "none"
    );

    setRepeatUntil(
      event.repeat_until ?? ""
    );
  }, [event]);

  // =========================
  // SUBMIT
  // =========================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    // -------------------------
    // TITLE VALIDATION
    // -------------------------

    if (!title.trim()) {
      alert(
        "Please enter an event title."
      );

      return;
    }

    // -------------------------
    // DATE VALIDATION
    // -------------------------

    if (!eventDate) {
      alert(
        "Please select an event date."
      );

      return;
    }

    // -------------------------
    // TIME VALIDATION
    // -------------------------

    if (
      startTime &&
      endTime &&
      endTime < startTime
    ) {
      alert(
        "End time cannot be earlier than start time."
      );

      return;
    }

    // -------------------------
    // REPEAT VALIDATION
    // -------------------------

    if (
      repeatType !== "none" &&
      !repeatUntil
    ) {
      alert(
        "Please select a repeat end date."
      );

      return;
    }

    if (
      repeatType !== "none" &&
      repeatUntil &&
      repeatUntil < eventDate
    ) {
      alert(
        "Repeat end date cannot be earlier than the event date."
      );

      return;
    }

    // -------------------------
    // SAVE
    // -------------------------

    await onSave({
      title: title.trim(),

      description:
        description.trim() || null,

      event_date: eventDate,

      start_time:
        startTime || null,

      end_time:
        endTime || null,

      location:
        location.trim() || null,

      category,

      is_completed: isCompleted,

      reminder_enabled:
        reminderEnabled,

      reminder_minutes:
        reminderEnabled
          ? reminderMinutes
          : null,

      repeat_type: repeatType,

      repeat_until:
        repeatType !== "none"
          ? repeatUntil || null
          : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="flex items-center justify-between border-b border-zinc-800 p-6">

          <div>
            <h2 className="text-2xl font-bold text-white">
              {event
                ? "Edit Event"
                : "Add Planner Event"}
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Plan your special moments together ❤️
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
          >
            <X size={22} />
          </button>

        </div>

        {/* =========================
            FORM
        ========================= */}

        <form
          onSubmit={handleSubmit}
          className="max-h-[80vh] space-y-5 overflow-y-auto p-6"
        >

          {/* =========================
              TITLE
          ========================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Event Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Our Anniversary"
              maxLength={150}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-pink-500"
            />
          </div>

          {/* =========================
              CATEGORY
          ========================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target
                    .value as PlannerEventCategory
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-pink-500"
            >
              {categories.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* =========================
              DATE
          ========================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Date *
            </label>

            <input
              type="date"
              value={eventDate}
              onChange={(e) =>
                setEventDate(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-pink-500"
            />
          </div>

          {/* =========================
              TIME
          ========================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Start Time
              </label>

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                End Time
              </label>

              <input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-pink-500"
              />
            </div>

          </div>

          {/* =========================
              REPEAT EVENT
          ========================= */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                <Repeat2 size={20} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  Repeat Event
                </p>

                <p className="text-sm text-zinc-500">
                  Automatically repeat this event.
                </p>
              </div>

            </div>

            {/* REPEAT SELECT */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Repeat
              </label>

              <select
                value={repeatType}
                onChange={(e) =>
                  setRepeatType(
                    e.target
                      .value as RepeatType
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-pink-500"
              >
                {repeatOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* REPEAT UNTIL */}

            {repeatType !== "none" && (
              <div className="mt-4">

                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">

                  <CalendarDays
                    size={16}
                    className="text-pink-400"
                  />

                  Repeat Until
                </label>

                <input
                  type="date"
                  value={repeatUntil}
                  min={
                    eventDate || undefined
                  }
                  onChange={(e) =>
                    setRepeatUntil(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-pink-500"
                />

                <p className="mt-2 text-xs text-zinc-500">
                  The event will repeat until this date.
                </p>

              </div>
            )}

          </div>

          {/* =========================
              LOCATION
          ========================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
              placeholder="e.g. Our favorite restaurant"
              maxLength={200}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-pink-500"
            />
          </div>

          {/* =========================
              DESCRIPTION
          ========================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Description
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Add some notes..."
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-pink-500"
            />
          </div>

          {/* =========================
              REMINDER
          ========================= */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">

            <label className="flex cursor-pointer items-center gap-3">

              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) =>
                  setReminderEnabled(
                    e.target.checked
                  )
                }
                className="h-5 w-5 accent-pink-600"
              />

              <div className="flex items-center gap-2">

                <Bell
                  size={18}
                  className={
                    reminderEnabled
                      ? "text-pink-400"
                      : "text-zinc-500"
                  }
                />

                <div>
                  <p className="font-medium text-white">
                    Event Reminder
                  </p>

                  <p className="text-sm text-zinc-500">
                    Get a reminder before this event.
                  </p>
                </div>

              </div>

            </label>

            {reminderEnabled && (
              <div className="mt-4">

                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Remind me
                </label>

                <select
                  value={reminderMinutes}
                  onChange={(e) =>
                    setReminderMinutes(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-pink-500"
                >
                  {reminderOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>

              </div>
            )}

          </div>

          {/* =========================
              COMPLETED
          ========================= */}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">

            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) =>
                setIsCompleted(
                  e.target.checked
                )
              }
              className="h-5 w-5 accent-pink-600"
            />

            <div>
              <p className="font-medium text-white">
                Mark as completed
              </p>

              <p className="text-sm text-zinc-500">
                Mark this planner event as done.
              </p>
            </div>

          </label>

          {/* =========================
              ACTION BUTTONS
          ========================= */}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : event
                ? "Update Event"
                : "Save Event"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}