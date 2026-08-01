"use client";

import { useState } from "react";

import { UserProfile } from "../types";
import VaultPinModal from "./VaultPinModal";

type Props = {
  profile: UserProfile;

  setProfile: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;

  saveVaultPin: (
    pin: string
  ) => Promise<void>;

  removeVaultPin: () => Promise<void>;
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked
          ? "bg-pink-600"
          : "bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
          checked
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  );
}

export default function PrivacyCard({
  profile,
  setProfile,
  saveVaultPin,
  removeVaultPin,
}: Props) {

  const [
    pinModalOpen,
    setPinModalOpen,
  ] = useState(false);

  function updateSetting(
    field:
      | "private_account"
      | "hide_last_seen"
      | "hide_online_status"
      | "vault_pin_enabled",
    value: boolean
  ) {

    setProfile((prev) => {

      if (!prev) return prev;

      return {

        ...prev,

        [field]: value,

      };

    });

  }

  return (
    <>
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

        <h2 className="mb-6 text-2xl font-bold">

          🔒 Privacy

        </h2>

        <div className="space-y-6">

          {/* Private Account */}

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold">

                Private Account

              </h3>

              <p className="text-sm text-zinc-400">

                Only your partner can see your data.

              </p>

            </div>

            <Toggle
              checked={profile.private_account}
              onChange={(checked) =>
                updateSetting(
                  "private_account",
                  checked
                )
              }
            />

          </div>

          {/* Last Seen */}

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold">

                Hide Last Seen

              </h3>

              <p className="text-sm text-zinc-400">

                Don't show your last active time.

              </p>

            </div>

            <Toggle
              checked={profile.hide_last_seen}
              onChange={(checked) =>
                updateSetting(
                  "hide_last_seen",
                  checked
                )
              }
            />

          </div>

          {/* Online Status */}

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold">

                Hide Online Status

              </h3>

              <p className="text-sm text-zinc-400">

                Show yourself as offline.

              </p>

            </div>

            <Toggle
              checked={profile.hide_online_status}
              onChange={(checked) =>
                updateSetting(
                  "hide_online_status",
                  checked
                )
              }
            />

          </div>

          {/* Vault PIN */}

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold">

                Vault PIN

              </h3>

              <p className="text-sm text-zinc-400">

                Require a PIN before opening your vault.

              </p>

            </div>

            <Toggle
              checked={profile.vault_pin_enabled}
              onChange={async (checked) => {

                if (checked) {

                  setPinModalOpen(true);

                  return;

                }

                await removeVaultPin();

                updateSetting(
                  "vault_pin_enabled",
                  false
                );

              }}
            />

          </div>

        </div>

      </div>

      <VaultPinModal
        open={pinModalOpen}
        enabled={profile.vault_pin_enabled}
        onClose={() =>
          setPinModalOpen(false)
        }
        onSave={async (pin) => {

          await saveVaultPin(pin);

          updateSetting(
            "vault_pin_enabled",
            true
          );

          setPinModalOpen(false);

        }}
        onRemove={async () => {

          await removeVaultPin();

          updateSetting(
            "vault_pin_enabled",
            false
          );

          setPinModalOpen(false);

        }}
      />
    </>
  );

}