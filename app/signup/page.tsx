"use client";

import { useState } from "react";
import { signUp } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await signUp(email, password);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Signup successful! Please verify your email.");
    router.push("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          />

          <button
            className="w-full rounded-lg bg-pink-600 p-3 font-semibold hover:bg-pink-700"
          >
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}