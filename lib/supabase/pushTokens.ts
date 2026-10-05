import { supabase } from "@/lib/client";

export type PushTokenPlatform = "web";

export async function savePushToken(
  userId: string,
  token: string,
  platform: PushTokenPlatform = "web"
) {
  if (!userId || !token) {
    throw new Error("User ID and push token are required.");
  }

  const { data, error } = await supabase
    .from("push_tokens")
    .upsert(
      {
        user_id: userId,
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "token" }
    )
    .select("id, user_id, token, platform, created_at, updated_at")
    .single();

  if (error) throw error;
  return data;
}

export async function removePushToken(token: string) {
  if (!token) return;

  const { error } = await supabase
    .from("push_tokens")
    .delete()
    .eq("token", token);

  if (error) throw error;
}
