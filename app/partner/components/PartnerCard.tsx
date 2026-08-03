"use client";

import {
  User,
  Heart,
  CalendarDays,
  ShieldCheck,
  Unplug,
} from "lucide-react";

import { usePartner } from "../context/PartnerContext";

export default function PartnerCard() {

  const {
    connected,
    partnerName,
    partnerId,
    connectedSince,
    disconnectPartner,
  } = usePartner();

  async function handleDisconnect() {

    const ok = confirm(
      "Are you sure you want to disconnect your partner?"
    );

    if (!ok) return;

    const success =
      await disconnectPartner();

    if (success) {

      alert(
        "Partner disconnected successfully."
      );

    }

  }

  if (!connected) {

    return (

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

        <div className="text-center">

          <User
            size={60}
            className="mx-auto text-zinc-600"
          />

          <h2 className="mt-4 text-2xl font-bold">

            No Partner Connected

          </h2>

          <p className="mt-2 text-zinc-400">

            Connect your partner to unlock
            shared memories.

          </p>

        </div>

      </section>

    );

  }

  return (

    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div className="flex items-center gap-5">

          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-600">

            <Heart
              size={42}
              className="fill-white text-white"
            />

          </div>

          <div>

            <h2 className="text-3xl font-bold">

              {partnerName}

            </h2>

            <div className="mt-3 flex items-center gap-2 text-green-400">

              <ShieldCheck size={18} />

              Connected

            </div>

          </div>

        </div>

        {/* Disconnect */}

        <button
          onClick={handleDisconnect}
          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-red-600
          px-6
          py-3
          font-semibold
          transition
          hover:bg-red-700
          "
        >

          <Unplug size={20} />

          Disconnect

        </button>

      </div>

      {/* Info */}

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <div className="rounded-2xl bg-zinc-800 p-5">

          <div className="flex items-center gap-2">

            <CalendarDays
              size={18}
              className="text-pink-500"
            />

            <span className="font-semibold">

              Together Since

            </span>

          </div>

          <p className="mt-3 text-xl font-bold">

            {connectedSince || "--"}

          </p>

        </div>

        <div className="rounded-2xl bg-zinc-800 p-5">

          <div className="flex items-center gap-2">

            <User
              size={18}
              className="text-pink-500"
            />

            <span className="font-semibold">

              Partner ID

            </span>

          </div>

          <p className="mt-3 break-all text-sm text-zinc-400">

            {partnerId}

          </p>

        </div>

      </div>

    </section>

  );

}