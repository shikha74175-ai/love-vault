"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { Copy, Heart, Link2 } from "lucide-react";

export default function PartnerPage() {
  const [loading, setLoading] = useState(true);

  const [myId, setMyId] = useState("");

  const [inviteCode, setInviteCode] = useState("");

  const [partnerCode, setPartnerCode] = useState("");

  const [partnerName, setPartnerName] = useState("");

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setMyId(user.id);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setInviteCode(data.invite_code);

      if (data.partner_id) {
        setConnected(true);

        const { data: partner } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.partner_id)
          .single();

        if (partner) {
          setPartnerName(partner.username || "Partner");
        }
      }
    }

    setLoading(false);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode);
    alert("Invite Code Copied ❤️");
  }

  async function connectPartner() {
    if (!partnerCode) {
      alert("Enter Invite Code");
      return;
    }

    if (partnerCode === inviteCode) {
      alert("You can't connect with yourself.");
      return;
    }

    // Find partner profile
    // Find partner profile
const { data: partner, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("invite_code", partnerCode.trim())
  .maybeSingle();

console.log("Partner:", partner);
console.log("Error:", error);

if (error || !partner) {
  alert("Invalid Invite Code");
  return;
}

    if (partner.partner_id) {
      alert("This user is already connected.");
      return;
    }

    // Update current user
    const { error: err1 } = await supabase
      .from("profiles")
      .update({
        partner_id: partner.id,
      })
      .eq("id", myId);

    if (err1) {
      alert(err1.message);
      return;
    }

    // Update partner
    const { error: err2 } = await supabase
      .from("profiles")
      .update({
        partner_id: myId,
      })
      .eq("id", partner.id);

    if (err2) {
      alert(err2.message);
      return;
    }

    alert("❤️ Partner Connected Successfully");

    setPartnerCode("");

    loadProfile();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <Heart className="text-pink-500" />
          Partner Connection
        </h1>

        {loading ? (
          <div className="text-center py-20 text-zinc-400">
            Loading...
          </div>
        ) : (
          <>
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">

              <h2 className="text-2xl font-bold">
                Your Invite Code
              </h2>

              <div className="mt-6 flex gap-4">

                <input
                  value={inviteCode}
                  readOnly
                  className="flex-1 rounded-xl bg-zinc-800 p-4 outline-none"
                />

                <button
                  onClick={copyCode}
                  className="rounded-xl bg-pink-600 px-6 hover:bg-pink-700 transition"
                >
                  <Copy />
                </button>

              </div>

            </div>

            {!connected && (
              <div className="mt-8 rounded-3xl bg-zinc-900 border border-zinc-800 p-8">

                <h2 className="text-2xl font-bold">
                  Connect Partner
                </h2>

                <input
                  value={partnerCode}
                  onChange={(e) =>
                    setPartnerCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter Partner Invite Code"
                  className="mt-6 w-full rounded-xl bg-zinc-800 p-4 outline-none"
                />

                <button
                  onClick={connectPartner}
                  className="mt-6 w-full rounded-xl bg-pink-600 p-4 font-semibold hover:bg-pink-700 transition flex justify-center items-center gap-3"
                >
                  <Link2 size={20} />
                  Connect Partner
                </button>

              </div>
            )}

            {connected && (
              <div className="mt-8 rounded-3xl bg-green-600/20 border border-green-500 p-6">

                <h2 className="text-2xl font-bold">
                  ❤️ Connected
                </h2>

                <p className="mt-3 text-lg">
                  {partnerName}
                </p>

              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}