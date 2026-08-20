"use client";

import {
  Heart,
  Cake,
  CalendarHeart,
  Gift,
  Bell,
  Pin,
} from "lucide-react";

type Props = {
  category?: string | null;
};

const categoryConfig: Record<
  string,
  {
    label: string;
    icon: typeof Heart;
    className: string;
  }
> = {
  anniversary: {
    label: "Anniversary",
    icon: Heart,
    className:
      "bg-pink-500/10 text-pink-400 border-pink-500/20",
  },

  birthday: {
    label: "Birthday",
    icon: Cake,
    className:
      "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },

  date: {
    label: "Date",
    icon: CalendarHeart,
    className:
      "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },

  special_day: {
    label: "Special Day",
    icon: Gift,
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },

  reminder: {
    label: "Reminder",
    icon: Bell,
    className:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },

  other: {
    label: "Other",
    icon: Pin,
    className:
      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
};

export default function EventCategoryBadge({
  category,
}: Props) {
  if (!category) {
    return null;
  }

  const normalizedCategory =
    category.toLowerCase().trim();

  const config =
    categoryConfig[
      normalizedCategory
    ] ?? categoryConfig.other;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.className}`}
    >
      <Icon size={12} />

      {config.label}
    </span>
  );
}