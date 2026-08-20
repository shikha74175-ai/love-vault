"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/client";

import { PlannerEvent } from "../types";

import {
  scheduleEventReminder,
  scheduleAllReminders,
} from "../utils/reminderScheduler";

type CreateEventData = Omit<
  PlannerEvent,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export default function usePlanner() {
  const [events, setEvents] =
    useState<PlannerEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =========================
  // SORT EVENTS
  // =========================

  const sortEvents = (
    eventList: PlannerEvent[]
  ) => {
    return [...eventList].sort(
      (a, b) => {
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
      }
    );
  };

  // =========================
  // LOAD EVENTS
  // =========================

  const loadEvents = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "User not authenticated."
          );
        }

        const {
          data,
          error: eventsError,
        } = await supabase
          .from("planner_events")
          .select("*")
          .eq("user_id", user.id)
          .order("event_date", {
            ascending: true,
          })
          .order("start_time", {
            ascending: true,
            nullsFirst: false,
          });

        if (eventsError) {
          throw eventsError;
        }

        const loadedEvents =
          (data ?? []) as PlannerEvent[];

        setEvents(
          sortEvents(loadedEvents)
        );

        // Schedule existing reminders
        scheduleAllReminders(
          loadedEvents
        );
      } catch (err: any) {
        console.error(
          "Planner load error:",
          err
        );

        setError(
          err?.message ??
            "Unable to load planner events."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =========================
  // CREATE EVENT
  // =========================

  const createEvent = useCallback(
    async (
      eventData: CreateEventData
    ) => {
      try {
        setSaving(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "User not authenticated."
          );
        }

        const {
          data,
          error: insertError,
        } = await supabase
          .from("planner_events")
          .insert({
            user_id: user.id,

            title:
              eventData.title.trim(),

            description:
              eventData.description ||
              null,

            event_date:
              eventData.event_date,

            start_time:
              eventData.start_time ||
              null,

            end_time:
              eventData.end_time ||
              null,

            location:
              eventData.location ||
              null,

            category:
              eventData.category,

            is_completed:
              eventData.is_completed ??
              false,

            // =========================
            // REMINDER
            // =========================

            reminder_enabled:
              eventData.reminder_enabled ??
              false,

            reminder_minutes:
              eventData.reminder_minutes ??
              null,

            // =========================
            // RECURRING EVENT
            // =========================

            repeat_type:
              eventData.repeat_type ??
              "none",

            repeat_until:
              eventData.repeat_until ??
              null,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        if (data) {
          const newEvent =
            data as PlannerEvent;

          setEvents((prev) =>
            sortEvents([
              ...prev,
              newEvent,
            ])
          );

          // Schedule reminder
          scheduleEventReminder(
            newEvent
          );
        }

        return data as PlannerEvent;
      } catch (err: any) {
        console.error(
          "Planner create error:",
          err
        );

        setError(
          err?.message ??
            "Unable to create event."
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // =========================
  // UPDATE EVENT
  // =========================

  const updateEvent = useCallback(
    async (
      id: string,
      eventData: Partial<CreateEventData>
    ) => {
      try {
        setSaving(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "User not authenticated."
          );
        }

        const updateData: Record<
          string,
          unknown
        > = {};

        // =========================
        // BASIC FIELDS
        // =========================

        if (
          eventData.title !==
          undefined
        ) {
          updateData.title =
            eventData.title.trim();
        }

        if (
          eventData.description !==
          undefined
        ) {
          updateData.description =
            eventData.description ||
            null;
        }

        if (
          eventData.event_date !==
          undefined
        ) {
          updateData.event_date =
            eventData.event_date;
        }

        if (
          eventData.start_time !==
          undefined
        ) {
          updateData.start_time =
            eventData.start_time ||
            null;
        }

        if (
          eventData.end_time !==
          undefined
        ) {
          updateData.end_time =
            eventData.end_time ||
            null;
        }

        if (
          eventData.location !==
          undefined
        ) {
          updateData.location =
            eventData.location ||
            null;
        }

        if (
          eventData.category !==
          undefined
        ) {
          updateData.category =
            eventData.category;
        }

        if (
          eventData.is_completed !==
          undefined
        ) {
          updateData.is_completed =
            eventData.is_completed;
        }

        // =========================
        // REMINDER
        // =========================

        if (
          eventData.reminder_enabled !==
          undefined
        ) {
          updateData.reminder_enabled =
            eventData.reminder_enabled;
        }

        if (
          eventData.reminder_minutes !==
          undefined
        ) {
          updateData.reminder_minutes =
            eventData.reminder_minutes;
        }

        // =========================
        // RECURRING EVENT
        // =========================

        if (
          eventData.repeat_type !==
          undefined
        ) {
          updateData.repeat_type =
            eventData.repeat_type;
        }

        if (
          eventData.repeat_until !==
          undefined
        ) {
          updateData.repeat_until =
            eventData.repeat_until;
        }

        // =========================
        // UPDATE DATABASE
        // =========================

        const {
          data,
          error: updateError,
        } = await supabase
          .from("planner_events")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        if (data) {
          const updatedEvent =
            data as PlannerEvent;

          setEvents((prev) =>
            sortEvents(
              prev.map((event) =>
                event.id === id
                  ? updatedEvent
                  : event
              )
            )
          );

          // Schedule updated reminder
          scheduleEventReminder(
            updatedEvent
          );
        }

        return data as PlannerEvent;
      } catch (err: any) {
        console.error(
          "Planner update error:",
          err
        );

        setError(
          err?.message ??
            "Unable to update event."
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // =========================
  // DELETE EVENT
  // =========================

  const deleteEvent = useCallback(
    async (id: string) => {
      try {
        setSaving(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "User not authenticated."
          );
        }

        const {
          error: deleteError,
        } = await supabase
          .from("planner_events")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) {
          throw deleteError;
        }

        setEvents((prev) =>
          prev.filter(
            (event) =>
              event.id !== id
          )
        );
      } catch (err: any) {
        console.error(
          "Planner delete error:",
          err
        );

        setError(
          err?.message ??
            "Unable to delete event."
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // =========================
  // TOGGLE COMPLETE
  // =========================

  const toggleComplete =
    useCallback(
      async (
        event: PlannerEvent
      ) => {
        await updateEvent(
          event.id,
          {
            is_completed:
              !event.is_completed,
          }
        );
      },
      [updateEvent]
    );

  // =========================
  // REFRESH
  // =========================

  const refreshPlanner =
    useCallback(async () => {
      await loadEvents();
    }, [loadEvents]);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // =========================
  // RETURN
  // =========================

  return {
    events,

    loading,

    saving,

    error,

    loadEvents,

    createEvent,

    updateEvent,

    deleteEvent,

    toggleComplete,

    refreshPlanner,
  };
}