"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/client";

import useSettings from "./hooks/useSettings";

import SettingsHeader from "./components/SettingsHeader";
import ProfileCard from "./components/ProfileCard";
import PartnerCard from "./components/PartnerCard";
import PrivacyCard from "./components/PrivacyCard";
import SecurityCard from "./components/SecurityCard";
import StorageCard from "./components/StorageCard";
import DangerZone from "./components/DangerZone";

export default function SettingsPage() {

  const router = useRouter();

  // ==========================
  // USER
  // ==========================

  const [userId, setUserId] =
    useState("");

  useEffect(() => {

    async function loadUser() {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }

    }

    loadUser();

  }, []);

  // ==========================
  // SETTINGS HOOK
  // ==========================

  const {

  loading,
  saving,

  profile,
  setProfile,

  partner,
  storage,

  uploadAvatar,

  loadProfile,
  saveProfile,
  saveVaultPin,
removeVaultPin,

} = useSettings({
  userId,
});

  // ==========================
  // LOAD PROFILE
  // ==========================

  useEffect(() => {

    if (!userId) return;

    loadProfile();

  }, [userId]);

  // ==========================
  // PRIVACY (Temporary UI State)
  // ==========================

  const [
    privateAccount,
    setPrivateAccount,
  ] = useState(false);

  const [
    hideLastSeen,
    setHideLastSeen,
  ] = useState(false);

  const [
    hideOnlineStatus,
    setHideOnlineStatus,
  ] = useState(false);

  // ==========================
  // SECURITY
  // ==========================

  async function logout() {

    await supabase.auth.signOut();

    router.replace("/login");

  }

  function changePassword() {

    alert(
      "Password change feature coming soon."
    );

  }

  function logoutAllDevices() {

    alert(
      "Logout all devices will be added soon."
    );

  }

  function deleteAccount() {

    const ok = confirm(
      "Delete your account?\n\nThis action cannot be undone."
    );

    if (!ok) return;

    alert(
      "Delete account feature will be connected later."
    );

  }
    // ==========================
  // LOADING
  // ==========================

  if (loading || !profile) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">

        <div className="text-center">

          <div className="mb-4 text-5xl">
            ⚙️
          </div>

          <p className="text-zinc-400">

            Loading Settings...

          </p>

        </div>

      </main>

    );

  }

  // ==========================
  // UI
  // ==========================

  return (

    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}

      <SettingsHeader

        name={profile.name}

        username={profile.username}

        avatar={profile.avatar_url}

        usedGB={storage.usedGB}

        totalGB={storage.totalGB}

      />

      {/* Content */}

      <section className="mx-auto max-w-7xl p-4 sm:p-6">

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Profile */}

         <ProfileCard
  profile={profile}
  saving={saving}
  setProfile={setProfile}
  onSave={saveProfile}
  uploadAvatar={uploadAvatar}
/>
          {/* Partner */}

          <PartnerCard

            partner={partner}

          />

          {/* Privacy */}

       <PrivacyCard
  profile={profile}
  setProfile={setProfile}
  saveVaultPin={saveVaultPin}
  removeVaultPin={removeVaultPin}
/>
                    {/* Security */}

          <SecurityCard
            onChangePassword={
              changePassword
            }
            onLogoutAllDevices={
              logoutAllDevices
            }
          />

          {/* Storage */}

          <StorageCard
            usedGB={storage.usedGB}
            totalGB={storage.totalGB}
          />

          {/* Danger Zone */}

          <DangerZone
            onLogout={logout}
            onDeleteAccount={
              deleteAccount
            }
          />

        </div>

      </section>

    </main>

  );

}