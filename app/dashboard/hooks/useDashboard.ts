"use client";

import { useCallback, useEffect, useState } from "react";
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
    useState<DashboardState>(initialState);

  const refreshDashboard = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const data = await getDashboardData();

      setState({
        loading: false,

        error: null,

        profile: data.profile,

        stats: data.stats,

        recentMemories:
          data.recentMemories ?? [],

        activities:
          data.activities ?? [],

        aiMemory:
          data.aiMemory ?? null,

        relationship:
          data.relationship ?? null,
      });

    } catch (err: any) {

      console.error("Dashboard Error:", err);

      setState((prev) => ({
        ...prev,

        loading: false,

        error:
          err?.message ??
          "Unable to load dashboard.",
      }));
    }

  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    ...state,
    refreshDashboard,
  };
}