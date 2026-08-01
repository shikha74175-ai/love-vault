"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  X,
} from "lucide-react";

type Props = {
  open: boolean;

  enabled: boolean;

  loading?: boolean;

  onClose: () => void;

  onSave: (
    pin: string
  ) => Promise<void>;

  onRemove: () => Promise<void>;
};

export default function VaultPinModal({

  open,

  enabled,

  loading = false,

  onClose,

  onSave,

  onRemove,

}: Props) {

  const [pin, setPin] =
    useState("");

  const [confirmPin, setConfirmPin] =
    useState("");

  const [show, setShow] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {

    if (!open) {

      setPin("");

      setConfirmPin("");

      setError("");

    }

  }, [open]);

  if (!open) return null;

  async function handleSave() {

    setError("");

    if (!/^\d{4}$/.test(pin)) {

      setError(
        "PIN must contain exactly 4 digits."
      );

      return;

    }

    if (pin !== confirmPin) {

      setError(
        "PIN does not match."
      );

      return;

    }

    await onSave(pin);

    onClose();

  }
    return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">

        {/* Header */}

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Lock className="text-pink-500" />

            <h2 className="text-xl font-bold">

              Vault PIN

            </h2>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-zinc-800"
          >

            <X size={20} />

          </button>

        </div>

        {/* PIN */}

        <label className="mb-2 block text-sm text-zinc-400">

          Enter 4 Digit PIN

        </label>

        <div className="relative mb-5">

          <input
            type={show ? "text" : "password"}
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) =>
              setPin(
                e.target.value.replace(/\D/g, "")
              )
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-center text-2xl tracking-[10px] outline-none focus:border-pink-500"
          />

          <button
            type="button"
            onClick={() =>
              setShow(!show)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >

            {show ? (

              <EyeOff size={20} />

            ) : (

              <Eye size={20} />

            )}

          </button>

        </div>

        {/* Confirm */}

        <label className="mb-2 block text-sm text-zinc-400">

          Confirm PIN

        </label>

        <input
          type={show ? "text" : "password"}
          inputMode="numeric"
          maxLength={4}
          value={confirmPin}
          onChange={(e) =>
            setConfirmPin(
              e.target.value.replace(/\D/g, "")
            )
          }
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-2xl tracking-[10px] outline-none focus:border-pink-500"
        />

        {/* Error */}

        {error && (

          <p className="mb-4 text-sm text-red-400">

            {error}

          </p>

        )}

        {/* Buttons */}

        <div className="flex gap-3">

          {enabled && (

            <button
              type="button"
              disabled={loading}
              onClick={async () => {

                await onRemove();

                onClose();

              }}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-700 disabled:opacity-50"
            >

              Remove PIN

            </button>

          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="flex-1 rounded-xl bg-pink-600 px-4 py-3 font-semibold transition hover:bg-pink-700 disabled:opacity-50"
          >

            {loading
              ? "Saving..."
              : "Save PIN"}

          </button>

        </div>

      </div>

    </div>

  );

}