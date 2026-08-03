"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { Clock3, Image, Video, Music, FileText } from "lucide-react";
import { usePartner } from "../context/PartnerContext";

type Activity = {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
};

export default function ActivityTimeline() {
  const { connected } = usePartner();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected) {
      loadTimeline();
    } else {
      setLoading(false);
    }
  }, [connected]);

  async function loadTimeline() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("vault_files")
      .select("id,file_name,file_type,created_at")
      .eq("visibility", "shared")
      .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`)
      .eq("deleted", false)
      .order("created_at", { ascending: false })
      .limit(10);

    setActivities(data ?? []);

    setLoading(false);
  }

  function icon(type: string) {
    switch (type) {
      case "image":
        return <Image size={20} className="text-pink-500" />;
      case "video":
        return <Video size={20} className="text-pink-500" />;
      case "audio":
        return <Music size={20} className="text-pink-500" />;
      default:
        return <FileText size={20} className="text-pink-500" />;
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <h2 className="text-2xl font-bold">
        Recent Activity
      </h2>

      {!connected ? (
        <p className="mt-5 text-zinc-400">
          Connect your partner to view activity.
        </p>
      ) : loading ? (
        <p className="mt-5 text-zinc-400">
          Loading...
        </p>
      ) : activities.length === 0 ? (
        <p className="mt-5 text-zinc-400">
          No shared activity yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">

          {activities.map((item) => (

            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl bg-zinc-800 p-4"
            >

              {icon(item.file_type)}

              <div className="flex-1">

                <p className="font-semibold">
                  {item.file_name}
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  {new Date(item.created_at).toLocaleString()}
                </p>

              </div>

              <Clock3
                size={18}
                className="text-zinc-500"
              />

            </div>

          ))}

        </div>
      )}

    </section>
  );
}