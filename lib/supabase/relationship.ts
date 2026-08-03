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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("relationship_since")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  if (!profile?.relationship_since) {
    return null;
  }

  const since = new Date(profile.relationship_since);

  const today = new Date();

  // -------------------------
  // Years / Months / Days
  // -------------------------

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

  // -------------------------
  // Total Days
  // -------------------------

  const totalDays = Math.floor(

    (today.getTime() - since.getTime()) /

    (1000 * 60 * 60 * 24)

  );

  // -------------------------
  // Next Anniversary
  // -------------------------

  const anniversary = new Date(
    today.getFullYear(),
    since.getMonth(),
    since.getDate()
  );

  if (anniversary < today) {

    anniversary.setFullYear(
      anniversary.getFullYear() + 1
    );

  }

  const anniversaryLeft = Math.ceil(

    (anniversary.getTime() -
      today.getTime()) /

      (1000 * 60 * 60 * 24)

  );

  // -------------------------
  // Next Milestone
  // -------------------------

  const nextMilestone =
    Math.ceil(totalDays / 100) * 100;

  const milestoneLeft =
    nextMilestone - totalDays;

  return {

    since:
      profile.relationship_since,

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