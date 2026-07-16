"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

import {
  User,
  Heart,
  MessageCircle,
  ImageIcon,
  NotebookPen,
  CalendarDays,
  Bot,
  Settings,
  LogOut,
} from "lucide-react";

const cards = [
  {
    title: "Partner",
    desc: "Connect with your special person.",
    icon: Heart,
    color: "text-pink-500",
    href: "/partner",
  },
  {
    title: "Chat",
    desc: "Private real-time conversations.",
    icon: MessageCircle,
    color: "text-blue-500",
    href: "/chat",
  },
  {
    title: "Vault",
    desc: "Store memories securely.",
    icon: ImageIcon,
    color: "text-yellow-500",
    href: "/vault",
  },
  {
    title: "Notes",
    desc: "Remember every little thing.",
    icon: NotebookPen,
    color: "text-green-500",
    href: "/notes",
  },
  {
    title: "Planner",
    desc: "Dates, reminders & anniversaries.",
    icon: CalendarDays,
    color: "text-purple-500",
    href: "/planner",
  },
  {
    title: "AI Assistant",
    desc: "Smart relationship companion.",
    icon: Bot,
    color: "text-cyan-500",
    href: "/assistant",
  },
];

export default function Dashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      // Check profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      // Create profile only once
      if (!profile) {
        const inviteCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        await supabase.from("profiles").upsert(
          {
            id: user.id,
            username: user.email?.split("@")[0] ?? "",
            invite_code: inviteCode,
            is_online: true,
            last_seen: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );
      }

      // Update online status
      await supabase
        .from("profiles")
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq("id", user.id);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function logout() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <header className="border-b border-zinc-800 px-8 py-5 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-pink-500">
          ❤️ Love Vault
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl">
            <User className="w-5 h-5 text-pink-500" />
            <span>{email}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="flex">

        <aside className="hidden md:flex w-64 flex-col bg-zinc-900 border-r border-zinc-800 p-6 gap-4">
          <SidebarItem icon={Heart} text="Partner" href="/partner" />
          <SidebarItem icon={MessageCircle} text="Chat" href="/chat" />
          <SidebarItem icon={ImageIcon} text="Vault" href="/vault" />
          <SidebarItem icon={NotebookPen} text="Notes" href="/notes" />
          <SidebarItem icon={CalendarDays} text="Planner" href="/planner" />
          <SidebarItem icon={Bot} text="AI Assistant" href="/assistant" />
          <SidebarItem icon={Settings} text="Settings" href="/settings" />
        </aside>

        <main className="flex-1 p-8">

          <div className="rounded-3xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 p-8 shadow-xl">
            <h2 className="text-4xl font-bold">
              Welcome Back ❤️
            </h2>

            <p className="mt-3 text-white/80">
              {email}
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {cards.map((card) => (
              <Link key={card.title} href={card.href}>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-pink-500 hover:scale-[1.02] transition cursor-pointer">

                  <card.icon className={`w-10 h-10 ${card.color}`} />

                  <h3 className="mt-4 text-2xl font-semibold">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-zinc-400">
                    {card.desc}
                  </p>

                </div>
              </Link>
            ))}

          </div>

        </main>

      </div>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  text,
  href,
}: {
  icon: any;
  text: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-zinc-800 transition">
        <Icon className="w-5 h-5 text-pink-500" />
        <span>{text}</span>
      </div>
    </Link>
  );
}