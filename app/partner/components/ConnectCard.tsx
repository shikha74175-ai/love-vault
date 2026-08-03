"use client";

import { useState } from "react";
import {
  Link2,
  Loader2,
  HeartHandshake,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import { usePartner } from "../context/PartnerContext";

export default function ConnectCard() {

  const {
    connectPartner,
    connected,
  } = usePartner();

  const [partnerCode, setPartnerCode] =
    useState("");

  const [relationshipDate, setRelationshipDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleConnect() {

    if (!partnerCode.trim()) {

      alert("Please enter an Invite Code.");

      return;

    }

    if (!relationshipDate) {

      alert("Please select your relationship start date.");

      return;

    }

    setLoading(true);

    const ok = await connectPartner(
      partnerCode,
      relationshipDate
    );

    setLoading(false);

    if (ok) {

      alert(
        "❤️ Partner Connected Successfully!"
      );

      setPartnerCode("");

      setRelationshipDate("");

    }

  }

  if (connected) {

    return (

      <section
        className="
        rounded-3xl
        border
        border-green-500/30
        bg-green-500/10
        p-6
        "
      >

        <div className="flex items-center gap-3">

          <HeartHandshake
            size={28}
            className="text-green-400"
          />

          <div>

            <h2 className="text-2xl font-bold">

              Partner Connected

            </h2>

            <p className="mt-2 text-zinc-300">

              Your Love Vault is already connected.

            </p>

          </div>

        </div>

      </section>

    );

  }

  return (

    <section
      className="
      rounded-3xl
      border
      border-zinc-800
      bg-zinc-900
      p-6
      shadow-lg
      "
    >

      <div className="flex items-center gap-3">

        <HeartHandshake
          className="text-pink-500"
          size={28}
        />

        <div>

          <h2 className="text-2xl font-bold">

            Connect Partner

          </h2>

          <p className="text-sm text-zinc-400">

            Enter your partner's Invite Code.

          </p>

        </div>

      </div>

      {/* Invite Code */}

      <input
        value={partnerCode}
        onChange={(e) =>
          setPartnerCode(
            e.target.value.toUpperCase()
          )
        }
        placeholder="LOVE-XXXX"
        className="
        mt-8
        w-full
        rounded-2xl
        border
        border-zinc-700
        bg-zinc-950
        p-4
        text-lg
        uppercase
        outline-none
        transition
        focus:border-pink-500
        "
      />

      {/* Relationship Date */}

      <div className="mt-6">

        <label className="mb-2 flex items-center gap-2 text-sm text-zinc-400">

          <CalendarDays size={16} />

          Relationship Started On

        </label>

        <input
          type="date"
          value={relationshipDate}
          onChange={(e) =>
            setRelationshipDate(
              e.target.value
            )
          }
          className="
          w-full
          rounded-2xl
          border
          border-zinc-700
          bg-zinc-950
          p-4
          outline-none
          transition
          focus:border-pink-500
          "
        />

      </div>

      {/* Button */}

      <button
        disabled={
          loading ||
          !partnerCode ||
          !relationshipDate
        }
        onClick={handleConnect}
        className="
        mt-6
        flex
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        bg-pink-600
        py-4
        font-semibold
        transition
        hover:bg-pink-700
        disabled:cursor-not-allowed
        disabled:opacity-50
        "
      >

        {loading ? (

          <>

            <Loader2
              size={20}
              className="animate-spin"
            />

            Connecting...

          </>

        ) : (

          <>

            <Link2 size={20} />

            Connect Partner

          </>

        )}

      </button>

      <div
        className="
        mt-6
        rounded-2xl
        bg-zinc-950
        p-4
        text-sm
        text-zinc-400
        "
      >

        <div className="flex items-center gap-2">

          <CheckCircle2
            className="text-green-500"
            size={18}
          />

          Invite Codes are unique for every user.

        </div>

      </div>

    </section>

  );

}