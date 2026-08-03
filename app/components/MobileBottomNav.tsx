"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Heart,
  User,
  Settings,
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
      href: "/profile",
      icon: User,
      label: "Profile",
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl md:hidden">
      <div className="grid h-16 grid-cols-4">
        {nav.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-colors ${
                active
                  ? "text-pink-500"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Icon size={22} />

              <span className="mt-1 text-[11px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}