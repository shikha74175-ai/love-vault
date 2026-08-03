"use client";

import Hero from "./components/Hero";
import StatsRow from "./components/StatsRow";
import QuickAccess from "./components/QuickAccess";
import RecentMemories from "./components/RecentMemories";
import RecentActivity from "./components/RecentActivity";
import AIMemory from "./components/AIMemory";
import SidebarWidget from "./components/SidebarWidget";
import DashboardSkeleton from "./components/DashboardSkeleton";

import { useDashboard } from "./hooks/useDashboard";

export default function Dashboard() {
  const dashboard = useDashboard();

  // -------------------------
  // Loading
  // -------------------------

  if (dashboard.loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // -------------------------
  // Error
  // -------------------------

  if (dashboard.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="rounded-3xl border border-red-500/20 bg-zinc-900 p-8">

          <h2 className="text-2xl font-bold text-red-400">
            Dashboard Error
          </h2>

          <p className="mt-3 text-zinc-400">
            {dashboard.error}
          </p>

          <button
            onClick={dashboard.refreshDashboard}
            className="
              mt-6
              rounded-xl
              bg-pink-600
              px-5
              py-3
              font-semibold
              transition
              hover:bg-pink-700
            "
          >
            Retry
          </button>

        </div>
      </div>
    );
  }

  // -------------------------
  // Dashboard
  // -------------------------

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-6">

        {/* Hero */}

        <Hero
          profile={dashboard.profile}
          stats={dashboard.stats}
          relationship={dashboard.relationship}
        />

        {/* Stats */}

        <StatsRow
          stats={dashboard.stats}
        />

        {/* Main Content */}

        <div className="grid gap-8 xl:grid-cols-12">

          {/* Left */}

          <div className="space-y-8 xl:col-span-9">

            <QuickAccess
              profile={dashboard.profile}
            />

            <div className="grid gap-8 lg:grid-cols-2">

              <RecentMemories
                memories={dashboard.recentMemories}
              />

              <RecentActivity
                activities={dashboard.activities}
              />

            </div>

            <AIMemory
              aiMemory={dashboard.aiMemory}
            />

          </div>

          {/* Right Sidebar */}

          <div className="xl:col-span-3">

            <SidebarWidget
              relationship={dashboard.relationship}
            />

          </div>

        </div>

      </div>

    </div>
  );
}