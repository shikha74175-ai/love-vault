"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getDashboardData } from "@/lib/supabase/dashboard";

export type DashboardStats = {
  photos: number;
  videos: number;
  albums: number;
  favorites: number;
};

export type DashboardActivity = {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type DashboardState = {
  loading: boolean;
  error: string | null;

  profile: any | null;

  stats: DashboardStats;

  recentMemories: any[];

  activities: DashboardActivity[];

  aiMemory: any | null;

  relationship: any | null;
};

const initialState: DashboardState = {
  loading: true,

  error: null,

  profile: null,

  stats: {
    photos: 0,
    videos: 0,
    albums: 0,
    favorites: 0,
  },

  recentMemories: [],

  activities: [],

  aiMemory: null,

  relationship: null,
};

export function useDashboard() {
  const [state, setState] =
    useState<DashboardState>(
      initialState
    );

  const refreshDashboard =
    useCallback(async () => {

      try {

        setState((prev) => ({
          ...prev,

          loading: true,

          error: null,
        }));

        const data =
          await getDashboardData();

        // =========================
        // Authentication Missing
        // =========================

        if (!data) {

          setState((prev) => ({

            ...prev,

            loading: false,

            error:
              "Your session has expired. Please login again.",

            profile: null,

            stats: {
              photos: 0,
              videos: 0,
              albums: 0,
              favorites: 0,
            },

            recentMemories: [],

            activities: [],

            aiMemory: null,

            relationship: null,

          }));

          return;
        }

        // =========================
        // Dashboard Data
        // =========================

        setState({

          loading: false,

          error: null,

          profile:
            data.profile ?? null,

          stats: {

            photos:
              data.stats?.photos ?? 0,

            videos:
              data.stats?.videos ?? 0,

            albums:
              data.stats?.albums ?? 0,

            favorites:
              data.stats?.favorites ?? 0,

          },

          recentMemories:
            data.recentMemories ?? [],

          activities:
            data.activities ?? [],

          aiMemory:
            data.aiMemory ?? null,

          relationship:
            data.relationship ?? null,

        });

      } catch (err: unknown) {

        console.error(
          "Dashboard Error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load dashboard.";

        setState((prev) => ({

          ...prev,

          loading: false,

          error: message,

        }));

      }

    }, []);

  // =========================
  // Initial Load
  // =========================

  useEffect(() => {

    refreshDashboard();

  }, [refreshDashboard]);

  // =========================
  // Return
  // =========================

  return {

    ...state,

    refreshDashboard,

  };
}