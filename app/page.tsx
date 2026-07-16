export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-6 text-6xl font-extrabold">
          ❤️ Love Vault
        </h1>

        <p className="mb-8 max-w-2xl text-lg text-pink-100">
          A private and secure space for couples to save memories, chat,
          manage important dates, notes, photos, videos, and much more.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="rounded-xl bg-white px-8 py-3 font-semibold text-pink-600 shadow-lg transition hover:scale-105">
            Login
          </button>

          <button className="rounded-xl border border-white px-8 py-3 font-semibold transition hover:bg-white hover:text-pink-600">
            Sign Up
          </button>
        </div>

        <div className="mt-16 grid w-full max-w-5xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <h2 className="mb-3 text-2xl font-bold">🔒 Secure Vault</h2>
            <p className="text-pink-100">
              Store photos, videos, voice notes and memories securely.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <h2 className="mb-3 text-2xl font-bold">💬 Couple Chat</h2>
            <p className="text-pink-100">
              Real-time private messaging with online status and last seen.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
            <h2 className="mb-3 text-2xl font-bold">🤖 AI Assistant</h2>
            <p className="text-pink-100">
              Get reminders, gift ideas, anniversary planning and more.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}