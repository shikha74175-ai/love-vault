"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  QrCode,
  Heart,
} from "lucide-react";

import { usePartner } from "../context/PartnerContext";

export default function InviteCard() {

  const {
    loading,
    inviteCode,
  } = usePartner();

  const [copied, setCopied] =
    useState(false);

  async function copyCode() {

    if (!inviteCode) return;

    await navigator.clipboard.writeText(
      inviteCode
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);

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

        <Heart
          className="fill-pink-500 text-pink-500"
          size={26}
        />

        <div>

          <h2 className="text-2xl font-bold">
            Your Invite
          </h2>

          <p className="text-sm text-zinc-400">
            Share this code with your partner.
          </p>

        </div>

      </div>

      <div
        className="
        mt-8
        rounded-2xl
        border
        border-pink-500/20
        bg-zinc-950
        p-5
        "
      >

        {loading ? (

          <div className="h-8 w-40 animate-pulse rounded bg-zinc-800" />

        ) : (

          <div className="flex items-center justify-between">

            <span
              className="
              text-2xl
              font-bold
              tracking-[6px]
              text-pink-400
              "
            >

              {inviteCode || "--------"}

            </span>

            <button
              onClick={copyCode}
              className="
              rounded-xl
              bg-pink-600
              p-3
              transition
              hover:bg-pink-700
              active:scale-95
              "
            >

              {copied ? (

                <Check
                  size={20}
                  className="text-white"
                />

              ) : (

                <Copy
                  size={20}
                  className="text-white"
                />

              )}

            </button>

          </div>

        )}

      </div>

      {/* QR Placeholder */}

      <div
        className="
        mt-6
        flex
        flex-col
        items-center
        rounded-2xl
        border
        border-dashed
        border-zinc-700
        bg-zinc-950
        py-8
        "
      >

        <QrCode
          size={70}
          className="text-zinc-500"
        />

        <p className="mt-4 text-center text-sm text-zinc-500">

          QR Invite
          <br />

          Coming Soon

        </p>

      </div>

      <div
        className="
        mt-6
        rounded-2xl
        bg-pink-600/10
        p-4
        text-sm
        text-zinc-300
        "
      >

        💡 Your partner can enter this
        invite code to instantly connect
        with your private Love Vault.

      </div>

    </section>

  );

}