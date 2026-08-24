import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f45aa4] via-[#cf35df] to-[#6948ed] text-white">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Soft center glow */}
        <div className="absolute left-1/2 top-[5%] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-pink-200/20 blur-[130px]" />

        {/* Bottom glow */}
        <div className="absolute bottom-[-180px] left-[15%] h-[400px] w-[600px] rounded-full bg-fuchsia-300/20 blur-[130px]" />

        <div className="absolute bottom-[-180px] right-[5%] h-[400px] w-[500px] rounded-full bg-indigo-300/20 blur-[130px]" />

        {/* Hearts */}

        <span className="absolute -left-2 top-2 text-6xl text-white/20 animate-pulse">
          ♡
        </span>

        <span className="absolute left-[5%] top-[27%] text-2xl text-white/25 animate-bounce">
          ♡
        </span>

        <span className="absolute left-[9%] top-[43%] text-5xl text-white/20 animate-pulse">
          ♡
        </span>

        <span className="absolute right-[2%] top-[18%] text-7xl text-white/20 animate-pulse">
          ♡
        </span>

        <span className="absolute right-[8%] bottom-[12%] text-3xl text-white/20 animate-bounce">
          ♡
        </span>

        {/* Stars */}

        <span className="absolute right-[19%] top-[9%] text-2xl text-white/40 animate-pulse">
          ✦
        </span>

        <span className="absolute left-[18%] bottom-[18%] text-lg text-white/25 animate-pulse">
          ✦
        </span>

        <span className="absolute right-[28%] bottom-[25%] text-sm text-white/20">
          ✦
        </span>

        <span className="absolute left-[3%] bottom-[13%] text-xl text-white/20">
          •
        </span>

      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center px-6 py-9 text-center">

        {/* ================= LOGO ================= */}

        <div className="flex items-center justify-center gap-3">

          <span className="text-6xl leading-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.30)] transition-transform duration-300 hover:scale-110">
            ❤️
          </span>

          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_5px_8px_rgba(0,0,0,0.25)] sm:text-6xl">
            Love Vault
          </h1>

          <span className="ml-1 text-3xl text-white drop-shadow-md animate-pulse">
            ✦
          </span>

        </div>

        {/* ================= DESCRIPTION ================= */}

        <p className="mt-4 max-w-2xl text-[14px] font-medium leading-6 tracking-wide text-white/95">
          A private and secure space for couples to save memories, chat,
          <br className="hidden sm:block" />
          manage important dates, notes, photos, videos, and much more.
        </p>

        {/* ================= BUTTONS ================= */}

        <div className="mt-7 flex items-center justify-center gap-4">

          {/* LOGIN */}

          <Link
            href="/login"
            className="group relative flex items-center gap-2 rounded-full bg-[#08080b] px-8 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.30)] transition-all duration-300 hover:-translate-y-1 hover:scale-105"
          >
            <span className="text-pink-500 transition-transform duration-300 group-hover:translate-x-1">
              ⇥
            </span>

            Login
          </Link>

          {/* SIGN UP */}

          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-full border border-white/90 bg-white/10 px-8 py-3 text-sm font-bold text-white shadow-[0_8px_25px_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-white/20"
          >
            Sign Up

            <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
              ›
            </span>
          </Link>

        </div>

        {/* ================= FEATURE CARDS ================= */}

        <div className="mt-11 grid w-full max-w-5xl gap-5 md:grid-cols-3">

          {/* ================= VAULT ================= */}

          <FeatureCard
            icon="🔒"
            iconBackground="bg-pink-100/75"
            iconGlow="shadow-[0_0_25px_rgba(236,72,153,0.25)]"
            title="Secure Vault"
            description={
              <>
                Store photos, videos, voice notes
                <br />
                and memories securely.
              </>
            }
          />

          {/* ================= CHAT ================= */}

          <FeatureCard
            icon="💬"
            iconBackground="bg-purple-100/75"
            iconGlow="shadow-[0_0_25px_rgba(168,85,247,0.25)]"
            title="Couple Chat"
            description={
              <>
                Real-time private messaging with
                <br />
                online status and last seen.
              </>
            }
          />

          {/* ================= AI ================= */}

          <FeatureCard
            icon="🗓️"
            iconBackground="bg-orange-100/75"
            iconGlow="shadow-[0_0_25px_rgba(251,146,60,0.25)]"
            title="AI Assistant"
            description={
              <>
                Get reminders, gift ideas, anniversary
                <br />
                planning and more.
              </>
            }
          />

        </div>

      </div>

    </main>
  );
}


/* ========================================================= */
/* FEATURE CARD                                               */
/* ========================================================= */

function FeatureCard({
  icon,
  iconBackground,
  iconGlow,
  title,
  description,
}: {
  icon: string;
  iconBackground: string;
  iconGlow: string;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[25px]
        border
        border-white/75
        bg-gradient-to-br
        from-white/65
        via-white/50
        to-white/40
        px-6
        py-7
        shadow-[0_18px_40px_rgba(50,10,80,0.20)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-white
        hover:bg-white/65
        hover:shadow-[0_25px_50px_rgba(50,10,80,0.30)]
      "
    >

      {/* Card glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-36
          w-36
          rounded-full
          bg-white/30
          blur-3xl
          transition-transform
          duration-500
          group-hover:scale-150
        "
      />

      {/* Bottom glow */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-16
          -left-10
          h-28
          w-28
          rounded-full
          bg-pink-300/20
          blur-3xl
        "
      />

      {/* Icon */}

      <div
        className={`
          relative
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          border
          border-white
          ${iconBackground}
          ${iconGlow}
          text-2xl
          shadow-sm
          transition-all
          duration-300
          group-hover:scale-110
          group-hover:-rotate-2
        `}
      >
        {icon}
      </div>

      {/* Title */}

      <h2 className="relative mt-5 text-xl font-extrabold tracking-tight text-[#181426]">
        {title}
      </h2>

      {/* Pink line */}

      <div className="mx-auto mt-3 h-[3px] w-8 rounded-full bg-[#ed218b] transition-all duration-300 group-hover:w-12" />

      {/* Description */}

      <p className="relative mt-4 text-[12px] font-medium leading-5 text-[#453c50]">
        {description}
      </p>

    </div>
  );
}