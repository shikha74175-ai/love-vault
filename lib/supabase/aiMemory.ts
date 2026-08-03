import { supabase } from "@/lib/client";

export interface AIMemory {

  type:
    | "last_year"
    | "anniversary"
    | "relationship"
    | "favorite"
    | "random";

  title: string;

  message: string;

  emoji: string;

  date?: string;

  memory?: any;

}

export async function getAIMemory(): Promise<AIMemory> {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {

    throw new Error("User not authenticated");

  }

  // =============================
  // Profile
  // =============================

  const { data: profile } = await supabase

    .from("profiles")

    .select("relationship_since")

    .eq("id", user.id)

    .single();

  // =============================
  // Last Year Memory
  // =============================

  const today = new Date();

  const lastYear = new Date();

  lastYear.setFullYear(today.getFullYear() - 1);

  const start = new Date(lastYear);

  start.setHours(0, 0, 0, 0);

  const end = new Date(lastYear);

  end.setHours(23, 59, 59, 999);

  const { data: lastYearMemory } = await supabase

    .from("vault_files")

    .select("*")

    .eq("user_id", user.id)

    .gte("created_at", start.toISOString())

    .lte("created_at", end.toISOString())

    .limit(1)

    .maybeSingle();

  if (lastYearMemory) {

    return {

      type: "last_year",

      emoji: "📸",

      title: "One Year Ago Today",

      message:
        "Relive this beautiful memory together ❤️",

      date: lastYearMemory.created_at,

      memory: lastYearMemory,

    };

  }

  // =============================
  // Anniversary
  // =============================

  if (profile?.relationship_since) {

    const relation = new Date(
      profile.relationship_since
    );

    const anniversary = new Date();

    anniversary.setMonth(relation.getMonth());

    anniversary.setDate(relation.getDate());

    if (anniversary < today) {

      anniversary.setFullYear(
        anniversary.getFullYear() + 1
      );

    }

    const daysLeft = Math.ceil(

      (anniversary.getTime() -
        today.getTime()) /

        (1000 * 60 * 60 * 24)

    );

    if (daysLeft <= 30) {

      return {

        type: "anniversary",

        emoji: "💍",

        title: "Anniversary Countdown",

        message:

          `Only ${daysLeft} days left ❤️`,

      };

    }

  }

  // =============================
  // Relationship Counter
  // =============================

  if (profile?.relationship_since) {

    const relation = new Date(
      profile.relationship_since
    );

    const diff =
      today.getTime() -
      relation.getTime();

    const days = Math.floor(

      diff /

      (1000 * 60 * 60 * 24)

    );

    if (days >= 30) {

      const years =
        Math.floor(days / 365);

      const months =
        Math.floor((days % 365) / 30);

      return {

        type: "relationship",

        emoji: "💕",

        title: "Together Forever",

        message:

          `${years} Years ${months} Months Together ❤️`,

      };

    }

  }

  // =============================
  // Favorite Memory
  // =============================

  const { data: favorite } = await supabase

    .from("vault_files")

    .select("*")

    .eq("user_id", user.id)

    .eq("favorite", true)

    .limit(1)

    .maybeSingle();

  if (favorite) {

    return {

      type: "favorite",

      emoji: "❤️",

      title: "Favorite Memory",

      message:

        "One of your most loved memories ✨",

      date: favorite.created_at,

      memory: favorite,

    };

  }

  // =============================
  // Random Memory
  // =============================

  const { data: random } = await supabase

    .from("vault_files")

    .select("*")

    .eq("user_id", user.id)

    .limit(1)

    .maybeSingle();

  if (random) {

    return {

      type: "random",

      emoji: "📷",

      title: "Memory Of The Day",

      message:

        "Every memory deserves to be remembered ❤️",

      date: random.created_at,

      memory: random,

    };

  }

  // =============================
  // Empty
  // =============================

  return {

    type: "random",

    emoji: "🤖",

    title: "No Memories Yet",

    message:

      "Upload your first memory ❤️",

  };

}