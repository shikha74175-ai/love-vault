"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { UserProfile } from "../types";

type Props = {
  profile: UserProfile;

  saving: boolean;

  setProfile: React.Dispatch<
    React.SetStateAction<UserProfile | null>
  >;

  onSave: () => void;

  uploadAvatar: (
    file: File
  ) => Promise<void>;
};
export default function ProfileCard({

  profile,

  saving,

  setProfile,

  onSave,

  uploadAvatar,

}: Props) {

  const inputRef =
    useRef<HTMLInputElement>(null);
  

  function updateField(
    field: keyof UserProfile,
    value: any
  ) {

    setProfile((prev) => {

      if (!prev) return prev;

      return {

        ...prev,

        [field]: value,

      };

    });

  }
  function sanitizeUsername(
  value: string
) {

  return value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_.]/g, "");

}

  async function handleAvatarChange(

    e: React.ChangeEvent<HTMLInputElement>

  ) {

    const file =
      e.target.files?.[0];

    if (!file) return;

    await uploadAvatar(file);

  }

  return (

    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

      <h2 className="mb-6 text-2xl font-bold">

        👤 Profile

      </h2>

      {/* Avatar */}

      <div className="mb-8 flex items-center gap-5">

        <div className="relative">
                    {profile.avatar_url ? (

            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="h-24 w-24 rounded-full border-2 border-pink-500 object-cover"
            />

          ) : (

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-600 text-4xl font-bold">

              {profile.name
                ?.charAt(0)
                .toUpperCase()}

            </div>

          )}

          {/* Camera Button */}

          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            className="absolute -bottom-1 -right-1 rounded-full bg-pink-600 p-2 shadow-lg transition hover:bg-pink-700"
          >

            <Camera size={16} />

          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />

        </div>

        <div>

          <p className="font-semibold">

            Profile Photo

          </p>

          <p className="text-sm text-zinc-400">

            Click the camera icon to
            upload a new avatar.

          </p>

        </div>

      </div>

      {/* Full Name */}

      <div className="mb-5">

        <label className="mb-2 block text-sm text-zinc-400">

          Full Name

        </label>

        <input
  value={profile.name}
  onChange={(e) =>
    updateField(
      "name",
      e.target.value
    )
  }
  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-pink-500"
/>

      </div>

      {/* Username */}

      <div className="mb-5">

        <label className="mb-2 block text-sm text-zinc-400">

          Username

        </label>
<input
  value={profile.username ?? ""}
  onChange={(e) =>
    updateField(
      "username",
      sanitizeUsername(
        e.target.value
      )
    )
  }
  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-pink-500"
/>

      </div>

      {/* Bio */}

      <div className="mb-5">

        <label className="mb-2 block text-sm text-zinc-400">

          Bio

        </label>

       <textarea
  rows={4}
  value={profile.bio ?? ""}
  onChange={(e) =>
    updateField(
      "bio",
      e.target.value
    )
  }
  className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-pink-500"
/>

</div>

{/* Gender */}

<div className="mb-5">

        <label className="mb-2 block text-sm text-zinc-400">

          Gender

        </label>

        <select
          value={profile.gender ?? ""}
          onChange={(e) =>
            updateField(
              "gender",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-pink-500"
        >

          <option value="">
            Select Gender
          </option>

          <option value="male">
            Male
          </option>

          <option value="female">
            Female
          </option>

          <option value="other">
            Other
          </option>

        </select>

      </div>

      {/* Birth Date */}

      <div className="mb-8">

        <label className="mb-2 block text-sm text-zinc-400">

          Birth Date

        </label>

        <input
          type="date"
          value={profile.birth_date ?? ""}
          onChange={(e) =>
            updateField(
              "birth_date",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-pink-500"
        />

      </div>

      {/* Save Button */}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex w-full items-center justify-center rounded-xl bg-pink-600 px-5 py-3 font-semibold transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >

        {saving ? (

          <>
            ⏳ Saving...
          </>

        ) : (

          <>
            💾 Save Changes
          </>

        )}

      </button>

    </div>

  );

}