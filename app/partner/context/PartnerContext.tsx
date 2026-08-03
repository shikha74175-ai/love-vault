"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { supabase } from "@/lib/client";

export type PartnerProfile = {
  id: string;
  username: string | null;
  invite_code: string | null;
  partner_id: string | null;
  connected_at: string | null;
};

type PartnerContextType = {
  loading: boolean;

  connected: boolean;

  profile: PartnerProfile | null;

  partner: PartnerProfile | null;

  inviteCode: string;

  partnerName: string;

  partnerId: string | null;

  connectedSince: string;

  relationshipDays: number;

  relationshipText: string;

  nextAnniversary: string;

  refreshPartner: () => Promise<void>;

  connectPartner: (
    inviteCode: string,
    relationshipDate: string
  ) => Promise<boolean>;

  disconnectPartner: () => Promise<boolean>;
};

const PartnerContext =
  createContext<PartnerContextType | null>(
    null
  );

type Props = {
  children: ReactNode;
};

export function PartnerProvider({
  children,
}: Props) {

  const [loading, setLoading] =
    useState(true);

  const [profile, setProfile] =
    useState<PartnerProfile | null>(null);

  const [partner, setPartner] =
    useState<PartnerProfile | null>(null);

  const [connected, setConnected] =
    useState(false);

  const [inviteCode, setInviteCode] =
    useState("");

  const [partnerName, setPartnerName] =
    useState("");

  const [partnerId, setPartnerId] =
    useState<string | null>(null);

  const [connectedSince, setConnectedSince] =
    useState("");

  // ❤️ New States

  const [relationshipDays, setRelationshipDays] =
    useState(0);

  const [relationshipText, setRelationshipText] =
    useState("");

  const [nextAnniversary, setNextAnniversary] =
    useState("");

  useEffect(() => {
    refreshPartner();
  }, []);

 async function refreshPartner() {

  try {

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {

      setProfile(null);
      setPartner(null);

      setConnected(false);

      setInviteCode("");

      setPartnerName("");

      setPartnerId(null);

      setConnectedSince("");

      setRelationshipDays(0);

      setRelationshipText("");

      setNextAnniversary("");

      return;

    }

    // ==========================
    // Load My Profile
    // ==========================

    const {
      data: myProfile,
      error,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !myProfile) {

      console.error(error);

      return;

    }

    setProfile(myProfile);

    setInviteCode(
      myProfile.invite_code ?? ""
    );

    // ==========================
    // No Partner
    // ==========================

    if (!myProfile.partner_id) {

      setConnected(false);

      setPartner(null);

      setPartnerName("");

      setPartnerId(null);

      setConnectedSince("");

      setRelationshipDays(0);

      setRelationshipText("");

      setNextAnniversary("");

      return;

    }

    // ==========================
    // Partner Profile
    // ==========================

    const {
      data: partnerProfile,
      error: partnerError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq(
        "id",
        myProfile.partner_id
      )
      .maybeSingle();

    if (
      partnerError ||
      !partnerProfile
    ) {

      console.error(partnerError);

      setConnected(false);

      return;

    }

    // ==========================
    // Update States
    // ==========================

    setPartner(partnerProfile);

    setPartnerName(
      partnerProfile.username ??
        "Partner"
    );

    setPartnerId(
      partnerProfile.id
    );

    setConnected(true);

    if (myProfile.connected_at) {

      const start =
        new Date(
          myProfile.connected_at
        );

      const today =
        new Date();

      // Together Since

      setConnectedSince(

        start.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )

      );

      // ==========================
      // Total Days
      // ==========================

      const diff =
        today.getTime() -
        start.getTime();

      const totalDays =
        Math.floor(
          diff /
            (
              1000 *
              60 *
              60 *
              24
            )
        );

      setRelationshipDays(
        totalDays
      );

      // ==========================
      // Years Months Days
      // ==========================

      let years =
        today.getFullYear() -
        start.getFullYear();

      let months =
        today.getMonth() -
        start.getMonth();

      let days =
        today.getDate() -
        start.getDate();

      if (days < 0) {

        months--;

        const prevMonth =
          new Date(
            today.getFullYear(),
            today.getMonth(),
            0
          ).getDate();

        days += prevMonth;

      }

      if (months < 0) {

        years--;

        months += 12;

      }

      setRelationshipText(
        `${years} Years ${months} Months ${days} Days`
      );

      // ==========================
      // Next Anniversary
      // ==========================

      const next =
        new Date(start);

      next.setFullYear(
        today.getFullYear()
      );

      if (next < today) {

        next.setFullYear(
          today.getFullYear() + 1
        );

      }

      const daysLeft =
        Math.ceil(
          (
            next.getTime() -
            today.getTime()
          ) /
            (
              1000 *
              60 *
              60 *
              24
            )
        );

      setNextAnniversary(
        `${daysLeft} Days Left`
      );

    } else {

      setConnectedSince("");

      setRelationshipDays(0);

      setRelationshipText("");

      setNextAnniversary("");

    }

  } catch (err) {

    console.error(err);

  } finally {

    setLoading(false);

  }

}
 // ==========================
// CONNECT PARTNER
// ==========================

async function connectPartner(
  code: string,
  relationshipDate: string
): Promise<boolean> {

  try {

    const invite =
      code.trim().toUpperCase();

    if (!invite) {

      alert("Please enter an Invite Code.");

      return false;

    }

    if (!relationshipDate) {

      alert(
        "Please select your relationship start date."
      );

      return false;

    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {

      alert("User not found.");

      return false;

    }

    // My Profile

    const {
      data: me,
      error: meError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (meError || !me) {

      alert("Profile not found.");

      return false;

    }

    // Self Check

    if (
      me.invite_code === invite
    ) {

      alert(
        "You can't connect with yourself."
      );

      return false;

    }

    // Find Partner

    const {
      data: partnerProfile,
      error: partnerError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq(
        "invite_code",
        invite
      )
      .maybeSingle();

    if (
      partnerError ||
      !partnerProfile
    ) {

      alert(
        "Invalid Invite Code."
      );

      return false;

    }

    if (
      partnerProfile.partner_id
    ) {

      alert(
        "This user is already connected."
      );

      return false;

    }

    // Connect RPC

    const { error } =
      await supabase.rpc(
        "connect_partners",
        {

          my_user: user.id,

          partner_user:
            partnerProfile.id,

          relationship_date:
            relationshipDate,

        }
      );

    if (error) {

      console.error(error);

      alert(
        error.message
      );

      return false;

    }

    await refreshPartner();

    return true;

  } catch (err: any) {

    console.error(err);

    alert(
      err?.message ??
        "Something went wrong."
    );

    return false;

  }

}

// ==========================
// DISCONNECT PARTNER
// ==========================

async function disconnectPartner(): Promise<boolean> {

  try {

    if (
      !profile ||
      !profile.partner_id
    ) {

      return false;

    }

    setLoading(true);

    const { error } =
      await supabase.rpc(
        "disconnect_partners",
        {

          my_user: profile.id,

          partner_user:
            profile.partner_id,

        }
      );

    if (error) {

      console.error(error);

      alert(
        error.message ??
          "Disconnect failed."
      );

      return false;

    }

    // Refresh Partner Context
    await refreshPartner();

    return true;

  } catch (err: any) {

    console.error("Disconnect Exception:", err);

    alert(
      err?.message || "Unable to disconnect partner."
    );

    return false;

  } finally {

    setLoading(false);

  }

}

  return (
    <PartnerContext.Provider
     value={{

  loading,

  connected,

  profile,

  partner,

  inviteCode,

  partnerName,

  partnerId,

  connectedSince,

  relationshipDays,

  relationshipText,

  nextAnniversary,

  refreshPartner,

  connectPartner,

  disconnectPartner,

}}
    >
      {children}
    </PartnerContext.Provider>
  );

}
export function usePartner() {

  const context =
    useContext(PartnerContext);

  if (!context) {

    throw new Error(
      "usePartner must be used inside PartnerProvider"
    );

  }

  return context;

}