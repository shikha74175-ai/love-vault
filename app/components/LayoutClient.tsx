"use client";

import { usePathname } from "next/navigation";
import MobileBottomNav from "@/app/components/MobileBottomNav";

export default function LayoutClient() {
  const pathname = usePathname();

  // Chat aur Preview page par navbar hide
  if (
    pathname.startsWith("/chat") ||
    pathname.startsWith("/vault/preview")
  ) {
    return null;
  }

  return <MobileBottomNav />;
}