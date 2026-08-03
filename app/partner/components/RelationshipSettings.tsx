"use client";

import {
  HeartHandshake,
  Download,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useState } from "react";

import { usePartner } from "../context/PartnerContext";

export default function RelationshipSettings() {

  const {
  connected,
  disconnectPartner,
} = usePartner();

const [loading, setLoading] =
  useState(false);

 async function handleDisconnect() {

  const ok = confirm(
    "Are you sure?\n\nThis will disconnect both partners."
  );

  if (!ok) return;

  setLoading(true);

  const success =
    await disconnectPartner();

  setLoading(false);

  if (success) {

    alert(
      "❤️ Partner disconnected successfully."
    );

  }

}

  return (

    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <h2 className="text-2xl font-bold">

        Relationship Settings

      </h2>

      <div className="mt-8 space-y-4">

       <button
  disabled={!connected || loading}
  onClick={handleDisconnect}
  className="flex w-full items-center justify-between rounded-2xl bg-red-600 p-5 transition hover:bg-red-700 disabled:opacity-40"
>

          <div className="flex items-center gap-3">

            <Download className="text-pink-500" />

            Export Shared Memories

          </div>

          <span className="text-zinc-500">

            Coming Soon

          </span>

        </button>

        <button
          disabled={!connected}
          className="flex w-full items-center justify-between rounded-2xl bg-zinc-800 p-5 transition hover:bg-zinc-700 disabled:opacity-40"
        >

          <div className="flex items-center gap-3">

            <HeartHandshake className="text-pink-500" />

            Transfer Ownership

          </div>

          <span className="text-zinc-500">

            Coming Soon

          </span>

        </button>

        <button
          disabled={!connected}
          onClick={handleDisconnect}
          className="flex w-full items-center justify-between rounded-2xl bg-red-600 p-5 transition hover:bg-red-700 disabled:opacity-40"
        >

          <div className="flex items-center gap-3">

  {loading ? (

    <Loader2
      size={20}
      className="animate-spin"
    />

  ) : (

    <ShieldAlert />

  )}

  {loading
    ? "Disconnecting..."
    : "Disconnect Partner"}

</div>

        </button>

      </div>

    </section>

  );

}