"use client";

type Props = {
  onChangePassword: () => void;
  onLogoutAllDevices: () => void;
};

export default function SecurityCard({
  onChangePassword,
  onLogoutAllDevices,
}: Props) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

      <h2 className="mb-6 text-2xl font-bold">
        🔐 Security
      </h2>

      <div className="space-y-4">

        <button
          onClick={onChangePassword}
          className="w-full rounded-xl bg-zinc-800 px-5 py-4 text-left transition hover:bg-zinc-700"
        >
          🔑 Change Password
        </button>

        <button
          onClick={onLogoutAllDevices}
          className="w-full rounded-xl bg-zinc-800 px-5 py-4 text-left transition hover:bg-zinc-700"
        >
          📱 Logout From All Devices
        </button>

        <div className="rounded-xl border border-zinc-700 p-4">

          <h3 className="font-semibold">
            Account Security
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Your account is protected with Supabase
            Authentication.
          </p>

        </div>

      </div>

    </div>
  );
}