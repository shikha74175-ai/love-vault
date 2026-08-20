"use client";

import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";

import {
  isNotificationSupported,
  requestNotificationPermission,
} from "../utils/reminders";

type PermissionState =
  | NotificationPermission
  | "unsupported"
  | "loading";

export default function NotificationPermission() {
  const [permission, setPermission] =
    useState<PermissionState>("loading");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // CHECK PERMISSION
  // =========================

  useEffect(() => {
    if (!isNotificationSupported()) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);
  }, []);

  // =========================
  // ENABLE NOTIFICATIONS
  // =========================

  async function handleEnable() {
    try {
      setLoading(true);

      const result =
        await requestNotificationPermission();

      setPermission(result);
    } catch (error) {
      console.error(
        "Notification permission error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (permission === "loading") {
    return (
      <div className="flex min-h-[76px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-pink-500" />
      </div>
    );
  }

  // =========================
  // NOT SUPPORTED
  // =========================

  if (permission === "unsupported") {
    return null;
  }

  // =========================
  // GRANTED
  // =========================

  if (permission === "granted") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
            <Check size={20} />
          </div>

          <div>
            <p className="font-semibold text-green-400">
              Notifications Enabled
            </p>

            <p className="text-sm text-zinc-500">
              You'll receive your planner reminders.
            </p>
          </div>

        </div>

       

      </div>
    );
  }

  // =========================
  // DENIED
  // =========================

  if (permission === "denied") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <X size={20} />
        </div>

        <div>
          <p className="font-semibold text-red-400">
            Notifications Blocked
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Notifications are blocked in your
            browser. Enable them from your
            browser site settings.
          </p>
        </div>

      </div>
    );
  }

  // =========================
  // DEFAULT / NOT ASKED
  // =========================

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
          <Bell size={20} />
        </div>

        <div>
          <p className="font-semibold text-white">
            Planner Notifications
          </p>

          <p className="text-sm text-zinc-500">
            Enable notifications for event reminders.
          </p>
        </div>

      </div>

      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        className="rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Enabling..."
          : "Enable Notifications"}
      </button>

    </div>
  );
}