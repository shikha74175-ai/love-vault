"use client";

import { PlannerEvent } from "../types";
import { showPlannerNotification } from "./reminders";

// =========================
// REMINDER TIMERS
// =========================

const reminderTimers = new Map<
  string,
  ReturnType<typeof setTimeout>
>();

// =========================
// CLEAR REMINDER
// =========================

export function clearReminder(
  eventId: string
) {
  const timer =
    reminderTimers.get(eventId);

  if (timer) {
    clearTimeout(timer);
    reminderTimers.delete(eventId);
  }
}

// =========================
// SCHEDULE EVENT REMINDER
// =========================

export function scheduleEventReminder(
  event: PlannerEvent
) {
  // Clear existing timer first
  clearReminder(event.id);

  // Reminder disabled
  if (!event.reminder_enabled) {
    return;
  }

  // No reminder time
  if (
    event.reminder_minutes === null ||
    event.reminder_minutes === undefined
  ) {
    return;
  }

  // Event must have a start time
  if (!event.start_time) {
    return;
  }

  // Build event date/time
  const eventDateTime = new Date(
    `${event.event_date}T${event.start_time}`
  );

  if (
    Number.isNaN(
      eventDateTime.getTime()
    )
  ) {
    console.error(
      "Invalid planner event date/time:",
      event
    );

    return;
  }

  // Calculate reminder time
  const reminderTime =
    eventDateTime.getTime() -
    event.reminder_minutes * 60 * 1000;

  const delay =
    reminderTime - Date.now();

  // Reminder is already in the past
  if (delay <= 0) {
    return;
  }

  // Browser setTimeout maximum
  // is approximately 24.8 days.
  // For longer delays, don't schedule
  // yet; scheduleAllReminders() will
  // re-check when Planner loads again.

  const MAX_TIMEOUT =
    2147483647;

  if (delay > MAX_TIMEOUT) {
    return;
  }

  const timer = setTimeout(() => {
    try {
  showPlannerNotification(
    event.title
  );
} catch (error) {
      console.error(
        "Planner notification error:",
        error
      );
    }

    reminderTimers.delete(
      event.id
    );
  }, delay);

  reminderTimers.set(
    event.id,
    timer
  );
}

// =========================
// SCHEDULE ALL REMINDERS
// =========================

export function scheduleAllReminders(
  events: PlannerEvent[]
) {
  events.forEach((event) => {
    scheduleEventReminder(event);
  });
}

// =========================
// CLEAR ALL REMINDERS
// =========================

export function clearAllReminders() {
  reminderTimers.forEach(
    (timer) => {
      clearTimeout(timer);
    }
  );

  reminderTimers.clear();
}