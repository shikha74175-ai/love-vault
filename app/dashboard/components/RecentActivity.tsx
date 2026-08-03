"use client";

import {
  Image,
  Video,
  FolderOpen,
  Heart,
  Lock,
  MessageCircle,
} from "lucide-react";

type Activity = {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
};

type Props = {
  activities: Activity[];
};

function getIcon(type: string) {
  switch (type) {
    case "photo_uploaded":
      return <Image size={18} className="text-pink-400" />;

    case "video_uploaded":
      return <Video size={18} className="text-violet-400" />;

    case "folder_created":
      return <FolderOpen size={18} className="text-cyan-400" />;

    case "favorite_added":
      return (
        <Heart
          size={18}
          className="fill-red-400 text-red-400"
        />
      );

    case "vault_locked":
      return <Lock size={18} className="text-yellow-400" />;

    case "chat_message":
      return (
        <MessageCircle
          size={18}
          className="text-green-400"
        />
      );

    default:
      return <FolderOpen size={18} />;
  }
}

export default function RecentActivity({
  activities,
}: Props) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

      <h2 className="text-xl font-bold">
        Recent Activity
      </h2>

      <p className="mt-1 text-sm text-zinc-400">
        Latest actions in your Love Vault
      </p>

      {activities.length === 0 ? (
        <div className="mt-10 text-center text-zinc-500">
          No Activity Yet ❤️
        </div>
      ) : (
        <div className="mt-6 space-y-4">

          {activities.map((activity) => (

            <div
              key={activity.id}
              className="
              flex
              items-start
              gap-4
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              p-4
              "
            >

              <div
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-zinc-800
                "
              >
                {getIcon(activity.activity_type)}
              </div>

              <div className="flex-1">

                <h3 className="font-semibold">
                  {activity.title}
                </h3>

                {activity.description && (
                  <p className="mt-1 text-sm text-zinc-400">
                    {activity.description}
                  </p>
                )}

                <p className="mt-2 text-xs text-zinc-500">
                  {new Date(
                    activity.created_at
                  ).toLocaleString()}
                </p>

              </div>

            </div>

          ))}

        </div>
      )}

    </section>
  );
}