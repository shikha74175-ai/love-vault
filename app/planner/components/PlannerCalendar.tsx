"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/client";

import { PlannerEvent } from "../types";

type CreateEventData = Omit<
  PlannerEvent,
  "id" |
    "user_id" |
    "created_at" |
    "updated_at"
>;

// ========================================
// ERROR HELPER
// ========================================

function getErrorMessage(
  error: any,
  fallback: string
): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error.message ||
    error.details ||
    error.hint ||
    fallback
  );
}

function logPlannerError(
  action: string,
  error: any
) {
  console.error(
    `Planner ${action} error:`,
    {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      status: error?.status,
      name: error?.name,
      raw: error,
    }
  );
}

// ========================================
// HOOK
// ========================================

export default function usePlanner() {
  const [events, setEvents] =
    useState<PlannerEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ========================================
  // LOAD EVENTS
  // ========================================

  const loadEvents = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        // -----------------------------
        // AUTH
        // -----------------------------

        const {
          data: {
            user,
          },
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "User not authenticated."
          );
        }

        console.log(
          "Planner user:",
          user.id
        );

        // -----------------------------
        // LOAD EVENTS
        // -----------------------------

        const {
          data,
          error: eventsError,
        } =
          await supabase
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

        console.log(
          "Planner events:",
          data
        );

        setEvents(
          (data ?? []) as PlannerEvent[]
        );
      } catch (err: any) {
        logPlannerError(
          "load",
          err
        );

        setEvents([]);

        setError(
          getErrorMessage(
            err,
            "Unable to load planner events."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ========================================
  // CREATE EVENT
  // ========================================

  const createEvent = useCallback(
    async (
      eventData: CreateEventData
    ) => {
      try {
        setSaving(true);
        setError(null);

        // -----------------------------
        // AUTH
        // -----------------------------

        const {
          data: {
            user,
          },
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "User not authenticated."
          );
        }

        // -----------------------------
        // INSERT DATA
        // -----------------------------

        const insertData = {
          user_id: user.id,

          title:
            eventData.title?.trim(),

          description:
            eventData.description?.trim() ||
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
            eventData.location?.trim() ||
            null,

          category:
            eventData.category,

          is_completed:
            eventData.is_completed ??
            false,
        };

        console.log(
          "Planner insert data:",
          insertData
        );

        // -----------------------------
        // INSERT
        // -----------------------------

        const {
          data,
          error: insertError,
        } =
          await supabase
            .from("planner_events")
            .insert(insertData)
            .select("*")
            .single();

        if (insertError) {
          throw insertError;
        }

        if (!data) {
          throw new Error(
            "Event was created but no data was returned."
          );
        }

        // -----------------------------
        // UPDATE LOCAL STATE
        // -----------------------------

        setEvents((prev) =>
          [
            ...prev,
            data as PlannerEvent,
          ].sort((a, b) => {
            const dateCompare =
              a.event_date.localeCompare(
                b.event_date
              );

            if (dateCompare !== 0) {
              return dateCompare;
            }

            return (
              (a.start_time ?? "")
                .localeCompare(
                  b.start_time ?? ""
                )
            );
          })
        );

        return data as PlannerEvent;
      } catch (err: any) {
        logPlannerError(
          "create",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to create event."
          )
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // ========================================
  // UPDATE EVENT
  // ========================================

  const updateEvent = useCallback(
    async (
      id: string,
      eventData: Partial<CreateEventData>
    ) => {
      try {
        setSaving(true);
        setError(null);

        // -----------------------------
        // AUTH
        // -----------------------------

        const {
          data: {
            user,
          },
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "User not authenticated."
          );
        }

        // -----------------------------
        // UPDATE DATA
        // -----------------------------

        const updateData: Record<
          string,
          unknown
        > = {};

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
            eventData.description?.trim() ||
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
            eventData.location?.trim() ||
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

        // -----------------------------
        // UPDATE
        // -----------------------------

        const {
          data,
          error: updateError,
        } =
          await supabase
            .from("planner_events")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", user.id)
            .select("*")
            .single();

        if (updateError) {
          throw updateError;
        }

        if (!data) {
          throw new Error(
            "Event update returned no data."
          );
        }

        // -----------------------------
        // UPDATE LOCAL STATE
        // -----------------------------

        setEvents((prev) =>
          prev.map((event) =>
            event.id === id
              ? (data as PlannerEvent)
              : event
          )
        );

        return data as PlannerEvent;
      } catch (err: any) {
        logPlannerError(
          "update",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to update event."
          )
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // ========================================
  // DELETE EVENT
  // ========================================

  const deleteEvent = useCallback(
    async (id: string) => {
      try {
        setSaving(true);
        setError(null);

        // -----------------------------
        // AUTH
        // -----------------------------

        const {
          data: {
            user,
          },
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "User not authenticated."
          );
        }

        // -----------------------------
        // DELETE
        // -----------------------------

        const {
          error: deleteError,
        } =
          await supabase
            .from("planner_events")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (deleteError) {
          throw deleteError;
        }

        // -----------------------------
        // UPDATE LOCAL STATE
        // -----------------------------

        setEvents((prev) =>
          prev.filter(
            (event) =>
              event.id !== id
          )
        );
      } catch (err: any) {
        logPlannerError(
          "delete",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to delete event."
          )
        );

        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // ========================================
  // TOGGLE COMPLETE
  // ========================================

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

  // ========================================
  // REFRESH
  // ========================================

  const refreshPlanner =
    useCallback(async () => {
      await loadEvents();
    }, [loadEvents]);

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // ========================================
  // RETURN
  // ========================================

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