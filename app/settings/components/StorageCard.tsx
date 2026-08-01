"use client";

type Props = {
  usedGB: number;
  totalGB: number;
};

export default function StorageCard({
  usedGB,
  totalGB,
}: Props) {

  const percentage = Math.min(
    (usedGB / totalGB) * 100,
    100
  );

  return (

    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

      <h2 className="mb-6 text-2xl font-bold">

        💾 Storage

      </h2>

      <div className="mb-5 flex justify-between">

        <span>Used</span>

        <span>

          {usedGB} GB / {totalGB} GB

        </span>

      </div>

      <div className="h-4 overflow-hidden rounded-full bg-zinc-800">

        <div
          className="h-full rounded-full bg-pink-500 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="rounded-xl bg-zinc-800 p-4">

          <p className="text-sm text-zinc-400">

            Used

          </p>

          <h3 className="mt-2 text-xl font-bold">

            {usedGB} GB

          </h3>

        </div>

        <div className="rounded-xl bg-zinc-800 p-4">

          <p className="text-sm text-zinc-400">

            Free

          </p>

          <h3 className="mt-2 text-xl font-bold">

            {(totalGB-usedGB).toFixed(2)} GB

          </h3>

        </div>

      </div>

    </div>

  );

}