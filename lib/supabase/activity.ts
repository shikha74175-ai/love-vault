import { supabase } from "@/lib/client";

export type ActivityType =
  | "photo_uploaded"
  | "video_uploaded"
  | "folder_created"
  | "folder_deleted"
  | "favorite_added"
  | "favorite_removed"
  | "file_deleted"
  | "file_restored"
  | "file_locked"
  | "partner_joined"
  | "partner_left"
  | "memory_viewed"
  | "vault_opened"
  | "vault_locked"
  | "chat_message";

export interface CreateActivityInput {
  activityType: ActivityType;
  title: string;
  description?: string;
  icon?: string;
  referenceId?: string;
  referenceTable?: string;
}

export async function createActivity(
  input: CreateActivityInput
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("activity_logs")
    .insert({
      user_id: user.id,
      activity_type: input.activityType,
      title: input.title,
      description: input.description ?? null,
      icon: input.icon ?? null,
      reference_id: input.referenceId ?? null,
      reference_table: input.referenceTable ?? null,
    });

  if (error) throw error;
}

/* ===========================
   GET RECENT ACTIVITIES
=========================== */

export async function getRecentActivities() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  if (error) throw error;

  return data ?? [];
}

/* ===========================
   DELETE
=========================== */

export async function deleteActivity(id: string) {
  const { error } = await supabase
    .from("activity_logs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}