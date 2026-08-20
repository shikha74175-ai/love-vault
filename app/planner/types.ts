export type PlannerEventCategory =
  | "date"
  | "anniversary"
  | "birthday"
  | "reminder"
  | "meeting"
  | "travel"
  | "other";

// =========================
// REPEAT TYPE
// =========================

export type RepeatType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

// =========================
// PLANNER EVENT
// =========================

export type PlannerEvent = {
  id: string;
  user_id: string;

  title: string;
  description: string | null;

  event_date: string;

  start_time: string | null;
  end_time: string | null;

  location: string | null;

  category: PlannerEventCategory;

  is_completed: boolean;

  created_at: string;
  updated_at: string;

  // =========================
  // REMINDER
  // =========================

  reminder_enabled: boolean;
  reminder_minutes: number | null;

  // =========================
  // RECURRING EVENT
  // =========================

  repeat_type: RepeatType;
  repeat_until: string | null;
};

// =========================
// CREATE EVENT
// =========================

export type CreatePlannerEvent = {
  title: string;
  description?: string | null;

  event_date: string;

  start_time?: string | null;
  end_time?: string | null;

  location?: string | null;

  category?: PlannerEventCategory;

  is_completed?: boolean;

  // =========================
  // REMINDER
  // =========================

  reminder_enabled?: boolean;
  reminder_minutes?: number | null;

  // =========================
  // RECURRING EVENT
  // =========================

  repeat_type?: RepeatType;
  repeat_until?: string | null;
};

// =========================
// UPDATE EVENT
// =========================

export type UpdatePlannerEvent =
  Partial<CreatePlannerEvent>;

// =========================
// PLANNER STATE
// =========================

export type PlannerState = {
  events: PlannerEvent[];

  loading: boolean;

  saving: boolean;

  error: string | null;
};