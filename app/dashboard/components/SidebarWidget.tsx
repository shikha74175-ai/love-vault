"use client";

import {
  Heart,
  ShieldCheck,
} from "lucide-react";

type Props = {
  relationship: {
    since: string;
    years: number;
    months: number;
    days: number;
    totalDays: number;
    anniversaryLeft: number;
    nextMilestone: number;
    milestoneLeft: number;
  } | null;
};

export default function SidebarWidget({
  relationship,
}: Props) {

  const since = relationship
    ? new Date(
        relationship.since
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "--";

  return (

    <div className="space-y-6">

      {/* Relationship */}

      <div
        className="
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-pink-600/20
            "
          >

            <Heart
              size={28}
              className="fill-pink-500 text-pink-500"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold">

              Relationship

            </h2>

            <p className="text-sm text-zinc-400">

              Your Journey

            </p>

          </div>

        </div>

        <div className="mt-8 space-y-7">

          <div>

            <p className="text-sm text-zinc-500">

              Together Since

            </p>

            <h3 className="mt-2 text-2xl font-bold">

              {since}

            </h3>

          </div>

          <div>

            <p className="text-sm text-zinc-500">

              Together For

            </p>

            <h3 className="mt-2 text-3xl font-bold text-pink-500">

              {relationship
                ? `${relationship.years} Years • ${relationship.months} Months`
                : "--"}

            </h3>

          </div>

          <div>

            <p className="text-sm text-zinc-500">

              Next Anniversary

            </p>

            <h3 className="mt-2 text-3xl font-bold text-yellow-400">

              {relationship
                ? `${relationship.anniversaryLeft} Days Left ❤️`
                : "--"}

            </h3>

          </div>

          <div>

            <p className="text-sm text-zinc-500">

              Current Streak

            </p>

            <h3 className="mt-2 text-xl font-bold text-green-400">

              {relationship
                ? `${relationship.totalDays} Days Together`
                : "--"}

            </h3>

          </div>

          <div>

            <p className="text-sm text-zinc-500">

              Next Milestone

            </p>

            <h3 className="mt-2 text-xl font-bold text-cyan-400">

              {relationship
                ? `${relationship.nextMilestone} Days (${relationship.milestoneLeft} Left)`
                : "--"}

            </h3>

          </div>

        </div>

      </div>

      {/* Privacy */}

      <div
        className="
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-emerald-500/20
            "
          >

            <ShieldCheck
              size={28}
              className="text-emerald-400"
            />

          </div>

          <div>

            <h2 className="text-xl font-bold">

              Privacy

            </h2>

            <p className="text-sm text-zinc-400">

              Your Security

            </p>

          </div>

        </div>

        <div className="mt-8 space-y-5">

          <div className="flex items-center justify-between">

            <span className="text-zinc-400">

              End-to-End Secure

            </span>

            <span className="font-semibold text-green-400">

              Enabled

            </span>

          </div>

          <div className="flex items-center justify-between">

            <span className="text-zinc-400">

              Realtime Sync

            </span>

            <span className="font-semibold text-cyan-400">

              Active

            </span>

          </div>

          <div className="flex items-center justify-between">

            <span className="text-zinc-400">

              Cloud Backup

            </span>

            <span className="font-semibold text-pink-400">

              Ready

            </span>

          </div>

          <div className="flex items-center justify-between">

            <span className="text-zinc-400">

              Vault Lock

            </span>

            <span className="font-semibold text-yellow-400">

              Protected

            </span>

          </div>

        </div>

      </div>

    </div>

  );

}