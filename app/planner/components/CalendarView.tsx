"use client";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

import { PlannerEvent } from "../types";

type Props = {
  events: PlannerEvent[];

  selectedDate: string | null;

  onSelectDate: (
    date: string
  ) => void;
};

function formatDate(
  year: number,
  month: number,
  day: number
) {
  const date = new Date(
    year,
    month,
    day
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export default function CalendarView({
  events,
  selectedDate,
  onSelectDate,
}: Props) {

  const today = new Date();

  const [year, month] = selectedDate
    ? selectedDate
        .split("-")
        .slice(0, 2)
        .map(Number)
    : [
        today.getFullYear(),
        today.getMonth() + 1,
      ];

  const currentMonth = month - 1;

  const firstDay = new Date(
    year,
    currentMonth,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    currentMonth + 1,
    0
  ).getDate();

  const previousMonth = () => {
    const date = new Date(
      year,
      currentMonth - 1,
      1
    );

    onSelectDate(
      formatDate(
        date.getFullYear(),
        date.getMonth(),
        1
      )
    );
  };

  const nextMonth = () => {
    const date = new Date(
      year,
      currentMonth + 1,
      1
    );

    onSelectDate(
      formatDate(
        date.getFullYear(),
        date.getMonth(),
        1
      )
    );
  };

  const monthName = new Date(
    year,
    currentMonth,
    1
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const todayString = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const calendarDays = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
    calendarDays.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push(day);
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
            <CalendarDays size={20} />
          </div>

          <div>

            <h2 className="text-lg font-bold text-white">
              {monthName}
            </h2>

            <p className="text-xs text-zinc-500">
              Select a date to view events
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={previousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-pink-500 hover:text-pink-400"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-pink-500 hover:text-pink-400"
          >
            <ChevronRight size={18} />
          </button>

        </div>

      </div>

      {/* =========================
          WEEK DAYS
      ========================= */}

      <div className="mb-2 grid grid-cols-7">

        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map((day) => (

          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-zinc-500"
          >
            {day}
          </div>

        ))}

      </div>

      {/* =========================
          CALENDAR
      ========================= */}

      <div className="grid grid-cols-7 gap-1 sm:gap-2">

        {calendarDays.map(
          (day, index) => {

            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[58px] rounded-xl sm:min-h-[72px]"
                />
              );
            }

            const dateString =
              formatDate(
                year,
                currentMonth,
                day
              );

            const dayEvents =
              events.filter(
                (event) =>
                  event.event_date ===
                  dateString
              );

            const isToday =
              dateString ===
              todayString;

            const isSelected =
              dateString ===
              selectedDate;

            return (
              <button
                key={dateString}
                type="button"
                onClick={() =>
                  onSelectDate(
                    dateString
                  )
                }
                className={`relative min-h-[58px] rounded-xl border p-2 text-left transition sm:min-h-[72px] ${
                  isSelected
                    ? "border-pink-500 bg-pink-500/10"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                }`}
              >

                {/* DAY */}

                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                    isToday
                      ? "bg-pink-600 text-white"
                      : "text-zinc-300"
                  }`}
                >
                  {day}
                </span>

                {/* EVENTS */}

                {dayEvents.length > 0 && (

                  <div className="mt-1 flex items-center gap-1">

                    <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />

                    <span className="hidden truncate text-[10px] text-pink-400 sm:block">
                      {dayEvents.length}{" "}
                      {dayEvents.length === 1
                        ? "event"
                        : "events"}
                    </span>

                  </div>

                )}

              </button>
            );
          }
        )}

      </div>

    </div>
  );
}