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

        {/* Change Password */}

        <button
          type="button"
          onClick={onChangePassword}
          className="w-full rounded-xl bg-zinc-800 px-5 py-4 text-left transition hover:bg-zinc-700"
        >
          <div className="font-semibold text-white">
            🔑 Change Password
          </div>

          <div className="mt-1 text-sm text-zinc-400">
            Update your account password.
          </div>
        </button>

        {/* Logout All Devices */}

        <button
          type="button"
          onClick={onLogoutAllDevices}
          className="w-full rounded-xl bg-zinc-800 px-5 py-4 text-left transition hover:bg-zinc-700"
        >
          <div className="font-semibold text-white">
            📱 Logout From All Devices
          </div>

          <div className="mt-1 text-sm text-zinc-400">
            Sign out your account from all active sessions.
          </div>
        </button>

        {/* Security Information */}

        <div className="rounded-xl border border-zinc-700 bg-zinc-950/40 p-4">

          <h3 className="font-semibold">
            Account Security
          </h3>

          <p className="mt-2 text-sm leading-5 text-zinc-400">
            Your account is protected with Supabase
            Authentication. Keep your password private
            and use a strong password.
          </p>

        </div>

      </div>

    </div>
  );
}