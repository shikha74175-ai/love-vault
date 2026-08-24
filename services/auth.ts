import { supabase } from "@/lib/client";

export function generateInviteCode() {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

export async function signUp(
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
    });

  return { data, error };
}

export async function signIn(
  email: string,
  password: string
) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// =========================
// FORGOT PASSWORD
// =========================

export async function resetPassword(
  email: string
) {
  const { data, error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          `${window.location.origin}/reset-password`,
      }
    );

  return { data, error };
}

// =========================
// UPDATE PASSWORD
// =========================

export async function updatePassword(
  password: string
) {
  const { data, error } =
    await supabase.auth.updateUser({
      password,
    });

  return { data, error };
}

export async function signOut() {
  return await supabase.auth.signOut();
}