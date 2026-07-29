"use client";

type Props = {
  active: string;
  onChange: (tab: string) => void;
};

const tabs = [
  { id: "all", label: "📁 All" },
  { id: "photos", label: "📷 Photos" },
  { id: "videos", label: "🎥 Videos" },
  { id: "favorites", label: "❤️ Favorites" },
  { id: "shared", label: "👥 Shared" },
  { id: "trash", label: "🗑 Trash" },
];

export default function VaultTabs({
  active,
  onChange,
}: Props) {
  return (
    <div className="overflow-x-auto scrollbar-hide px-4 py-3">
      <div className="flex gap-3 min-w-max">

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-5 py-2 rounded-full transition font-medium whitespace-nowrap
            ${
              active === tab.id
                ? "bg-pink-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        ))}

      </div>
    </div>
  );
}