"use client";

import { useState } from "react";
import { signIn, resetPassword } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [forgotMode, setForgotMode] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await signIn(
        email,
        password
      );

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.message ??
          "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await resetPassword(
          email.trim()
        );

      if (error) {
        setError(error.message);
        return;
      }

      setMessage(
        "Password reset link has been sent to your email."
      );
    } catch (err: any) {
      setError(
        err?.message ??
          "Unable to send reset link."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">

        {/* Header */}
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold">
            {forgotMode
              ? "Forgot Password"
              : "Login"}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {forgotMode
              ? "Enter your email to receive a password reset link."
              : "Welcome back to CoupleNest ❤️"}
          </p>
        </div>

        {/* =========================
            FORGOT PASSWORD
        ========================= */}

        {forgotMode ? (
          <form
            onSubmit={
              handleForgotPassword
            }
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>

              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
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
              className="w-full rounded-xl bg-pink-600 p-3 font-semibold transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setError(null);
                setMessage(null);
              }}
              className="w-full text-sm text-zinc-500 transition hover:text-white"
            >
              ← Back to Login
            </button>
          </form>
        ) : (
          /* =========================
             LOGIN
          ========================= */

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-pink-500"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-pink-500"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setForgotMode(true);
                  setError(null);
                  setMessage(null);
                }}
                className="text-sm text-pink-400 transition hover:text-pink-300"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pink-600 p-3 font-semibold transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}