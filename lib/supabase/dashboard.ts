import { supabase } from "@/lib/client";
import { getRecentActivities } from "@/lib/supabase/activity";
import { getAIMemory } from "@/lib/supabase/aiMemory";
import { getRelationshipInfo } from "@/lib/supabase/relationship";

export async function getDashboardData() {

  // =========================
  // Current User
  // =========================

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Session missing / auth error
  if (authError || !user) {
    console.warn(
      "Dashboard: No authenticated user/session."
    );

    return null;
  }

  // =========================
  // Profile
  // =========================

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  // =========================
  // Photos Count
  // =========================

  const {
    count: photos,
    error: photosError,
  } = await supabase
    .from("vault_files")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("file_type", "image")
    .eq("deleted", false);

  if (photosError) {
    throw photosError;
  }

  // =========================
  // Videos Count
  // =========================

  const {
    count: videos,
    error: videosError,
  } = await supabase
    .from("vault_files")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("file_type", "video")
    .eq("deleted", false);

  if (videosError) {
    throw videosError;
  }

  // =========================
  // Favorites Count
  // =========================

  const {
    count: favorites,
    error: favoritesError,
  } = await supabase
    .from("vault_files")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("favorite", true)
    .eq("deleted", false);

  if (favoritesError) {
    throw favoritesError;
  }

  // =========================
  // Albums Count
  // =========================

  const {
    count: albums,
    error: albumsError,
  } = await supabase
    .from("vault_folders")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("deleted", false);

  if (albumsError) {
    throw albumsError;
  }

  // =========================
  // Recent Memories
  // =========================

  const {
    data: recentMemories,
    error: memoriesError,
  } = await supabase
    .from("vault_files")
    .select("*")
    .eq("user_id", user.id)
    .eq("deleted", false)
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (memoriesError) {
    throw memoriesError;
  }

  // =========================
  // Recent Activities
  // =========================

  const activities =
    await getRecentActivities();

  // =========================
  // AI Memory
  // =========================

  const aiMemory =
    await getAIMemory();

  // =========================
  // Relationship
  // =========================

  const relationship =
    await getRelationshipInfo();

  // =========================
  // Return
  // =========================

  return {
    profile,

    stats: {
      photos: photos ?? 0,
      videos: videos ?? 0,
      albums: albums ?? 0,
      favorites: favorites ?? 0,
    },

    recentMemories:
      recentMemories ?? [],

    activities:
      activities ?? [],

    aiMemory,

    relationship,
  };
}