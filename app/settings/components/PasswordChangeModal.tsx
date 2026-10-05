"use client";

import { useState } from "react";
import { updatePassword } from "@/services/auth";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PasswordChangeModal({
  open,
  onClose,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setSaving(true);

      const { error } =
        await updatePassword(password);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(
        "Password changed successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1200);

    } catch {
      setError(
        "Unable to change password. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;

    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">

        {/* Header */}

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold text-white">
              🔑 Change Password
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Create a new password for your account.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* New Password */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={saving}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 disabled:opacity-60"
            />
          </div>

          {/* Confirm Password */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={saving}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 disabled:opacity-60"
            />
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              ✓ {success}
            </div>
          )}

          {/* Buttons */}

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Changing..."
                : "Change Password"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}