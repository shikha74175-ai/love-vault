"use client";

import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative mb-6">

      <Search
        size={20}
        className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-zinc-500
        "
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search memories..."
        className="
        w-full
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        py-3
        pl-12
        pr-12
        outline-none
        text-white
        placeholder:text-zinc-500
        focus:border-pink-500
        transition
        "
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-zinc-500
          hover:text-white
          "
        >
          <X size={18} />
        </button>
      )}

    </div>
  );
}