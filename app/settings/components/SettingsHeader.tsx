"use client";

type Props = {
  name: string;
  username: string | null;

  avatar: string | null;

  usedGB: number;
  totalGB: number;
};

export default function SettingsHeader({
  name,
  username,
  avatar,
  usedGB,
  totalGB,
}: Props) {

  const percent =
    Math.min(
      (usedGB / totalGB) * 100,
      100
    );

  return (

    <header className="border-b border-zinc-800 bg-zinc-950">

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">

        {/* Left */}

        <div className="flex items-center gap-5">

          {avatar ? (

            <img
              src={avatar}
              alt={name}
              className="h-20 w-20 rounded-full object-cover border-2 border-pink-500"
            />

          ) : (

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-600 text-3xl font-bold">

              {name
                ?.charAt(0)
                .toUpperCase()}

            </div>

          )}

          <div>

            <p className="text-sm text-zinc-400">

              ⚙️ Settings

            </p>

            <h1 className="mt-1 text-3xl font-bold">

              {name}

            </h1>

            <p className="mt-2 text-zinc-500">

              @{username || "user"}

            </p>

          </div>

        </div>

        {/* Right */}

        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

          <div className="mb-3 flex items-center justify-between">

            <p className="font-medium">

              Vault Storage

            </p>

            <p className="text-sm text-zinc-400">

              {usedGB} GB / {totalGB} GB

            </p>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">

            <div
              className="h-full rounded-full bg-pink-500 transition-all"
              style={{
                width: `${percent}%`,
              }}
            />

          </div>

        </div>

      </div>

    </header>

  );

}