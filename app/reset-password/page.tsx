"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updatePassword } from "@/services/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [checkingLink, setCheckingLink] =
    useState(true);

  const [linkError, setLinkError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const errorCode =
      searchParams.get("error_code");

    const errorDescription =
      searchParams.get("error_description");

    if (
      errorCode === "otp_expired" ||
      errorDescription
        ?.toLowerCase()
        .includes("expired") ||
      errorDescription
        ?.toLowerCase()
        .includes("invalid")
    ) {
      setLinkError(
        "This password reset link has expired or is invalid."
      );
    }

    setCheckingLink(false);
  }, [searchParams]);

  async function handleReset(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await updatePassword(password);

      if (error) {
        setError(error.message);
        return;
      }

      setMessage(
        "Password updated successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(
        err?.message ??
          "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // CHECKING RESET LINK
  // =========================

  if (checkingLink) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-pink-500" />

          <p className="text-sm text-zinc-500">
            Checking reset link...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // INVALID / EXPIRED LINK
  // =========================

  if (linkError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center shadow-2xl sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            🔗
          </div>

          <h1 className="text-2xl font-bold">
            Reset Link Expired
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            This password reset link is no longer
            valid. Please request a new reset link
            from the login page.
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 w-full rounded-xl bg-pink-600 p-3 font-semibold text-white transition hover:bg-pink-700"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // RESET PASSWORD FORM
  // =========================

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-xl">
            🔐
          </div>

          <h1 className="text-3xl font-bold">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Create a new password for your account.
          </p>
        </div>

        <form
          onSubmit={handleReset}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              New Password
            </label>

            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter new password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-pink-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Confirm Password
            </label>

            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-pink-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-pink-600 p-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>

      </div>
    </main>
  );
}