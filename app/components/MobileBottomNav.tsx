"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Heart,
  Upload,
  User,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const nav = [
    {
      href: "/dashboard",
      icon: House,
      label: "Home",
    },
    {
      href: "/vault",
      icon: Heart,
      label: "Vault",
    },
    {
      href: "/upload",
      icon: Upload,
      label: "Upload",
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 h-16">
        {nav.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition ${
                active
                  ? "text-pink-500"
                  : "text-zinc-400"
              }`}
            >
              <Icon size={22} />

              <span className="text-[11px] mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}