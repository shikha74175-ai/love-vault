"use client";

import { useState } from "react";

import PlannerHeader from "./components/PlannerHeader";
import PlannerForm from "./components/PlannerForm";
import EmptyPlanner from "./components/EmptyPlanner";
import CalendarView from "./components/CalendarView";
import NotificationPermission from "./components/NotificationPermission";

import usePlanner from "./hooks/usePlanner";

import { PlannerEvent } from "./types";
import UpcomingEvents from "./components/UpcomingEvents";
import EventCategoryBadge from "./components/EventCategoryBadge";
export default function PlannerPage() {
  // =========================
  // PLANNER HOOK
  // =========================

  const {
    events,
    loading,
    saving,
    error,

    createEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,

    refreshPlanner,
  } = usePlanner();

  // =========================
  // FORM STATE
  // =========================

  const [showForm, setShowForm] =
    useState(false);

  const [editingEvent, setEditingEvent] =
    useState<PlannerEvent | null>(null);
    const [selectedDate, setSelectedDate] =
  useState<string | null>(null);

  // =========================
  // ADD EVENT
  // =========================

  function handleAddEvent() {
    setEditingEvent(null);
    setShowForm(true);
  }

  // =========================
  // EDIT EVENT
  // =========================

  function handleEditEvent(
    event: PlannerEvent
  ) {
    setEditingEvent(event);
    setShowForm(true);
  }

  // =========================
  // CLOSE FORM
  // =========================

  function handleCloseForm() {
    setShowForm(false);
    setEditingEvent(null);
  }

  // =========================
  // SAVE EVENT
  // =========================

  async function handleSaveEvent(
    data: Omit<
      PlannerEvent,
      | "id"
      | "user_id"
      | "created_at"
      | "updated_at"
    >
  ) {
    try {
      if (editingEvent) {
        await updateEvent(
          editingEvent.id,
          data
        );
      } else {
        await createEvent(data);
      }

      setShowForm(false);
      setEditingEvent(null);
    } catch (err) {
      console.error(
        "Planner save error:",
        err
      );
    }
  }

  // =========================
  // DELETE EVENT
  // =========================

  async function handleDeleteEvent(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this event?"
      );

    if (!confirmed) return;

    try {
      await deleteEvent(id);
    } catch (err) {
      console.error(
        "Planner delete error:",
        err
      );
    }
  }

  // =========================
  // TOGGLE COMPLETE
  // =========================

  async function handleToggleComplete(
    event: PlannerEvent
  ) {
    try {
      await toggleComplete(event);
    } catch (err) {
      console.error(
        "Planner complete error:",
        err
      );
    }
  }
  // =========================
// SELECTED DATE EVENTS
// =========================

const selectedDateEvents =
  selectedDate
    ? events.filter(
        (event) =>
          event.event_date ===
          selectedDate
      )
    : [];

  // =========================
  // RENDER
  // =========================

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================= */}

        <PlannerHeader
          onAddEvent={handleAddEvent}
        />
        <NotificationPermission />

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={refreshPlanner}
              disabled={loading}
              className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium transition hover:bg-red-500/10 disabled:opacity-50"
            >
              Retry
            </button>

          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (

          <div className="flex min-h-[400px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-pink-500" />

              <p className="text-sm text-zinc-400">
                Loading planner...
              </p>

            </div>

          </div>

        ) : (

          <div className="space-y-6">

            {/* =========================
                SUMMARY
            ========================= */}

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    Your Planner
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">

                    {events.length}{" "}

                    {events.length === 1
                      ? "event"
                      : "events"}{" "}

                    planned ❤️

                  </p>

                </div>

                <button
                  type="button"
                  onClick={refreshPlanner}
                  disabled={saving || loading}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-pink-500 hover:text-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🔄 Refresh
                </button>

              </div>

            </div>
            {/* =========================
    CALENDAR
========================= */}

<CalendarView
  events={events}
  selectedDate={selectedDate}
  onSelectDate={setSelectedDate}
/>
{/* =========================
    UPCOMING EVENTS
========================= */}

<UpcomingEvents
  events={events}
  onEditEvent={handleEditEvent}
  onDeleteEvent={handleDeleteEvent}
  onToggleComplete={handleToggleComplete}
  saving={saving}
/>
{/* =========================
    SELECTED DATE EVENTS
========================= */}

{selectedDate && (

  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

    {/* HEADER */}

    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

      <div>

        <h2 className="text-lg font-bold text-white">
          Events for {selectedDate}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {selectedDateEvents.length === 0
            ? "Nothing planned for this day."
            : `${selectedDateEvents.length} ${
                selectedDateEvents.length === 1
                  ? "event"
                  : "events"
              } planned for this day ❤️`}
        </p>

      </div>

      {selectedDateEvents.length > 0 && (

        <span className="w-fit rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
          {selectedDateEvents.length}{" "}
          {selectedDateEvents.length === 1
            ? "Event"
            : "Events"}
        </span>

      )}

    </div>

    {/* =========================
        NO EVENTS
    ========================= */}

    {selectedDateEvents.length === 0 ? (

      <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 p-8 text-center">

        <div className="mb-3 text-4xl">
          🗓️
        </div>

        <h3 className="font-semibold text-zinc-200">
          No events on this date
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Nothing is planned for this day yet.
        </p>

        <button
          type="button"
          onClick={handleAddEvent}
          className="mt-5 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
        >
          ➕ Add Event
        </button>

      </div>

    ) : (

      /* =========================
         DATE EVENTS
      ========================= */

      <div className="grid gap-3">

        {selectedDateEvents.map(
          (event) => (

            <div
              key={event.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
            >

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                {/* EVENT INFO */}

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3
                      className={`font-semibold ${
                        event.is_completed
                          ? "text-zinc-500 line-through"
                          : "text-white"
                      }`}
                    >
                      {event.title}
                    </h3>

                    <EventCategoryBadge
  category={event.category}
/>

                  </div>

                  {/* TIME */}

                  {(event.start_time ||
                    event.end_time) && (

                    <p className="mt-2 text-sm text-zinc-400">
                      🕐{" "}
                      {event.start_time ?? ""}

                      {event.end_time
                        ? ` - ${event.end_time}`
                        : ""}
                    </p>

                  )}

                  {/* LOCATION */}

                  {event.location && (

                    <p className="mt-1 text-sm text-zinc-500">
                      📍 {event.location}
                    </p>

                  )}

                  {/* DESCRIPTION */}

                  {event.description && (

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-500">
                      {event.description}
                    </p>

                  )}

                </div>

                {/* ACTIONS */}

                <div className="flex shrink-0 flex-wrap gap-2">

                  {/* COMPLETE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleComplete(
                        event
                      )
                    }
                    disabled={saving}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      event.is_completed
                        ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        : "bg-zinc-800 text-zinc-300 hover:bg-pink-500/10 hover:text-pink-400"
                    }`}
                  >
                    {event.is_completed
                      ? "✓ Done"
                      : "Complete"}
                  </button>

                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      handleEditEvent(
                        event
                      )
                    }
                    disabled={saving}
                    className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-pink-500 hover:text-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ✏️ Edit
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteEvent(
                        event.id
                      )
                    }
                    disabled={saving}
                    className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    )}

  </div>

)}

            {/* =========================
                EMPTY STATE
            ========================= */}

            {events.length === 0 ? (

              <EmptyPlanner
                onAddEvent={handleAddEvent}
              />

            ) : (

              /* =========================
                 EVENTS
              ========================= */

              <div className="grid gap-4">

                {events.map((event) => (

                  <div
                    key={event.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700"
                  >

                    {/* =========================
                        EVENT TOP
                    ========================= */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      {/* EVENT INFO */}

                      <div className="min-w-0">

                        {/* TITLE + CATEGORY */}

                        <div className="flex flex-wrap items-center gap-2">

                          <h3
                            className={`text-lg font-bold ${
                              event.is_completed
                                ? "text-zinc-500 line-through"
                                : "text-white"
                            }`}
                          >
                            {event.title}
                          </h3>

                          {event.category && (
                            <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium capitalize text-pink-400">
                              {event.category}
                            </span>
                          )}

                        </div>

                        {/* DATE */}

                        <p className="mt-2 text-sm text-zinc-400">
                          📅 {event.event_date}
                        </p>

                        {/* TIME */}

                        {(event.start_time ||
                          event.end_time) && (

                          <p className="mt-1 text-sm text-zinc-500">

                            🕐{" "}

                            {event.start_time ??
                              ""}

                            {event.end_time
                              ? ` - ${event.end_time}`
                              : ""}

                          </p>

                        )}

                        {/* LOCATION */}

                        {event.location && (

                          <p className="mt-1 text-sm text-zinc-500">
                            📍 {event.location}
                          </p>

                        )}

                        {/* DESCRIPTION */}

                        {event.description && (

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                            {event.description}
                          </p>

                        )}

                      </div>

                      {/* =========================
                          COMPLETE BUTTON
                      ========================= */}

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleComplete(
                            event
                          )
                        }
                        disabled={saving}
                        className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          event.is_completed
                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            : "bg-zinc-800 text-zinc-300 hover:bg-pink-500/10 hover:text-pink-400"
                        }`}
                      >

                        {event.is_completed
                          ? "✓ Completed"
                          : "Mark Complete"}

                      </button>

                    </div>

                    {/* =========================
                        ACTIONS
                    ========================= */}

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleEditEvent(
                            event
                          )
                        }
                        disabled={saving}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-pink-500 hover:text-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ✏️ Edit
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteEvent(
                            event.id
                          )
                        }
                        disabled={saving}
                        className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        )}

      </div>

      {/* =========================
          PLANNER FORM
      ========================= */}

      {showForm && (

        <PlannerForm
          event={editingEvent}
          saving={saving}
          onSave={handleSaveEvent}
          onClose={handleCloseForm}
        />

      )}

    </main>
  );
}