"use client";

import { usePathname } from "next/navigation";
import MobileBottomNav from "@/app/components/MobileBottomNav";

export default function LayoutClient() {
  const pathname = usePathname();

  // Chat page par navbar hide
  if (pathname.startsWith("/chat")) {
    return null;
  }

  return <MobileBottomNav />;
}