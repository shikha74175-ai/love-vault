"use client";

import {
  Heart,
  User2,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { usePartner } from "../context/PartnerContext";

export default function RelationshipStatus() {

  const {
    loading,
    connected,
    partnerName,
    connectedSince,
  } = usePartner();

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-zinc-400">
          Loading Relationship...
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">

      <div className="flex items-center gap-3">

        <Heart
          className="fill-pink-500 text-pink-500"
          size={28}
        />

        <h2 className="text-2xl font-bold">
          Relationship Status
        </h2>

      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        {/* Status */}

        <div className="rounded-2xl bg-zinc-800 p-5">

          <div className="flex items-center gap-2">

            {connected ? (
              <CheckCircle2
                className="text-green-400"
                size={22}
              />
            ) : (
              <XCircle
                className="text-red-400"
                size={22}
              />
            )}

            <span className="font-semibold">
              {connected
                ? "Connected"
                : "Not Connected"}
            </span>

          </div>

          <p className="mt-2 text-sm text-zinc-400">

            {connected
              ? "Your shared vault is active."
              : "No partner connected yet."}

          </p>

        </div>

        {/* Partner */}

        <div className="rounded-2xl bg-zinc-800 p-5">

          <div className="flex items-center gap-2">

            <User2
              className="text-pink-500"
              size={20}
            />

            <span className="font-semibold">
              Partner
            </span>

          </div>

          <p className="mt-3 text-xl font-bold">
            {connected
              ? partnerName
              : "--"}
          </p>

        </div>

        {/* Shared Vault */}

        <div className="rounded-2xl bg-zinc-800 p-5">

          <div className="flex items-center gap-2">

            <ShieldCheck
              className="text-pink-500"
              size={20}
            />

            <span className="font-semibold">
              Shared Vault
            </span>

          </div>

          <p className="mt-3 text-xl font-bold">
            {connected
              ? "Enabled"
              : "Disabled"}
          </p>

        </div>

        {/* Connected Since */}

        <div className="rounded-2xl bg-zinc-800 p-5">

          <div className="flex items-center gap-2">

            <CalendarDays
              className="text-pink-500"
              size={20}
            />

            <span className="font-semibold">
              Together Since
            </span>

          </div>

          <p className="mt-3 text-xl font-bold">
            {connected
              ? connectedSince || "--"
              : "--"}
          </p>

        </div>

      </div>

    </section>
  );
}