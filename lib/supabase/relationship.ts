import { supabase } from "@/lib/client";

export interface RelationshipInfo {
  since: string;

  years: number;

  months: number;

  days: number;

  totalDays: number;

  anniversaryDate: string;

  anniversaryLeft: number;

  nextMilestone: number;

  milestoneLeft: number;
}

export async function getRelationshipInfo(): Promise<RelationshipInfo | null> {
  // =========================
  // Current User
  // =========================

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  // =========================
  // Get Relationship Date
  // =========================

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(
        "relationship_since, connected_at"
      )
      .eq("id", user.id)
      .single();

  if (profileError) {
    throw profileError;
  }

  // =========================
  // Relationship Start
  // =========================

  // Prefer relationship_since.
  // If it is NULL, use connected_at.
  const relationshipDate =
    profile?.relationship_since ??
    profile?.connected_at;

  if (!relationshipDate) {
    return null;
  }

  const since = new Date(
    relationshipDate
  );

  if (Number.isNaN(since.getTime())) {
    throw new Error(
      "Invalid relationship start date."
    );
  }

  const today = new Date();

  // =========================
  // Years / Months / Days
  // =========================

  let years =
    today.getFullYear() -
    since.getFullYear();

  let months =
    today.getMonth() -
    since.getMonth();

  let days =
    today.getDate() -
    since.getDate();

  if (days < 0) {
    months--;

    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;

    months += 12;
  }

  // =========================
  // Total Days
  // =========================

  const totalDays = Math.floor(
    (
      today.getTime() -
      since.getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );

  // =========================
  // Next Anniversary
  // =========================

  let anniversary = new Date(
    today.getFullYear(),
    since.getMonth(),
    since.getDate()
  );

  // If this year's anniversary
  // has already passed, use next year.
  if (anniversary < today) {
    anniversary = new Date(
      today.getFullYear() + 1,
      since.getMonth(),
      since.getDate()
    );
  }

  const anniversaryLeft = Math.max(
    0,
    Math.ceil(
      (
        anniversary.getTime() -
        today.getTime()
      ) /
        (1000 * 60 * 60 * 24)
    )
  );

  // =========================
  // Next Milestone
  // =========================

  let nextMilestone =
    Math.ceil(
      totalDays / 100
    ) * 100;

  // If already exactly on a milestone,
  // show the next milestone.
  if (
    nextMilestone <= totalDays
  ) {
    nextMilestone += 100;
  }

  const milestoneLeft =
    nextMilestone -
    totalDays;

  // =========================
  // Return
  // =========================

  return {
    since:
      relationshipDate,

    years,

    months,

    days,

    totalDays,

    anniversaryDate:
      anniversary.toISOString(),

    anniversaryLeft,

    nextMilestone,

    milestoneLeft,
  };
}