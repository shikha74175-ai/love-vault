"use client";

import {
  Lock,
  Eye,
  EyeOff,
  Heart,
} from "lucide-react";
import { useState } from "react";

type Props = {
  pin: string;

  setPin: (
    value: string
  ) => void;

  loading: boolean;

  error: string;

  onUnlock: () => void;
};

export default function VaultLockScreen({

  pin,

  setPin,

  loading,

  error,

  onUnlock,

}: Props) {

  const [showPin, setShowPin] =
    useState(false);

  return (

    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-950">

      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">

        {/* Logo */}

        <div className="mb-8 flex flex-col items-center">

          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-600">

            <Heart
              size={40}
              className="fill-white text-white"
            />

          </div>

          <h1 className="text-3xl font-bold">

            Love Vault

          </h1>

          <p className="mt-2 text-center text-zinc-400">

            Enter your Vault PIN
            to continue

          </p>

        </div>

        {/* PIN */}

        <div className="relative mb-6">

          <Lock
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type={
              showPin
                ? "text"
                : "password"
            }
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) =>
              setPin(
                e.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
            placeholder="••••"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-4 pl-12 pr-12 text-center text-3xl tracking-[12px] outline-none transition focus:border-pink-500"
          />

          <button
            type="button"
            onClick={() =>
              setShowPin(
                !showPin
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
          >

            {showPin ? (

              <EyeOff size={20} />

            ) : (

              <Eye size={20} />

            )}

          </button>

        </div>

        {/* Error */}

        {error && (

          <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-center text-sm text-red-400">

            {error}

          </div>

        )}

        {/* Unlock */}

        <button
          type="button"
          disabled={
            loading ||
            pin.length !== 4
          }
          onClick={onUnlock}
          className="w-full rounded-xl bg-pink-600 py-4 font-semibold transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {loading
            ? "Unlocking..."
            : "🔓 Unlock Vault"}

        </button>

        <p className="mt-6 text-center text-xs text-zinc-500">

          Your memories are protected
          with end-to-end privacy.

        </p>

      </div>

    </div>

  );

}