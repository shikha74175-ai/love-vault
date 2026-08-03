"use client";

function SkeletonCard({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`
      animate-pulse
      rounded-3xl
      bg-zinc-800
      ${className}
      `}
    />
  );
}

export default function DashboardSkeleton() {

  return (

    <div className="space-y-8">

      {/* Hero */}

      <SkeletonCard className="h-[320px] w-full" />

      {/* Stats */}

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">

        {[...Array(4)].map((_, index) => (

          <SkeletonCard
            key={index}
            className="h-32"
          />

        ))}

      </div>

      {/* Quick Access */}

      <div>

        <SkeletonCard className="mb-5 h-8 w-52" />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {[...Array(6)].map((_, index) => (

            <SkeletonCard
              key={index}
              className="h-44"
            />

          ))}

        </div>

      </div>

      {/* Bottom */}

      <div className="grid gap-6 xl:grid-cols-3">

        <SkeletonCard className="h-[420px]" />

        <SkeletonCard className="h-[420px]" />

        <SkeletonCard className="h-[420px]" />

      </div>

    </div>

  );

}