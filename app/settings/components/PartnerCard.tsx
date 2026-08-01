"use client";

import { PartnerProfile } from "../types";

type Props = {
  partner: PartnerProfile | null;
};

export default function PartnerCard({
  partner,
}: Props) {

  if (!partner) {

    return (

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

        <h2 className="mb-5 text-2xl font-bold">

          ❤️ Partner

        </h2>

        <div className="rounded-2xl border border-dashed border-zinc-700 p-10 text-center">

          <div className="mb-4 text-5xl">
            💕
          </div>

          <h3 className="text-xl font-semibold">

            No Partner Connected

          </h3>

          <p className="mt-3 text-zinc-400">

            Invite your partner to start
            sharing memories together.

          </p>

          <button
            className="mt-6 rounded-xl bg-pink-600 px-6 py-3 font-semibold transition hover:bg-pink-700"
          >
            Invite Partner
          </button>

        </div>

      </div>

    );

  }

  return (

    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

      <h2 className="mb-6 text-2xl font-bold">

        ❤️ Your Partner

      </h2>

      <div className="flex flex-col items-center text-center">

        {partner.avatar_url ? (

          <img
            src={partner.avatar_url}
            alt={partner.name}
            className="mb-5 h-28 w-28 rounded-full border-2 border-pink-500 object-cover"
          />

        ) : (

          <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-pink-600 text-5xl font-bold">

            {partner.name
              .charAt(0)
              .toUpperCase()}

          </div>

        )}

        <h3 className="text-2xl font-bold">

          {partner.name}

        </h3>

        <p className="mt-2 text-zinc-400">

          @{partner.email || "partner"}

        </p>

        <div className="mt-8 grid w-full grid-cols-2 gap-4">

          <div className="rounded-xl bg-zinc-800 p-4">

            <p className="text-sm text-zinc-400">

              Status

            </p>

            <p className="mt-2 font-semibold text-green-400">

              Connected

            </p>

          </div>

          <div className="rounded-xl bg-zinc-800 p-4">

            <p className="text-sm text-zinc-400">

              Memories

            </p>

            <p className="mt-2 font-semibold">

              Shared ❤️

            </p>

          </div>

        </div>

        <button
          className="mt-8 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
        >
          Disconnect Partner
        </button>

      </div>

    </div>

  );

}