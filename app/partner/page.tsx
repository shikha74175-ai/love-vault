"use client";

import { PartnerProvider } from "./context/PartnerContext";

import PartnerHeader from "./components/PartnerHeader";
import RelationshipStatus from "./components/RelationshipStatus";
import InviteCard from "./components/InviteCard";
import ConnectCard from "./components/ConnectCard";
import PartnerCard from "./components/PartnerCard";
import SharedStats from "./components/SharedStats";
import ActivityTimeline from "./components/ActivityTimeline";
import RelationshipSettings from "./components/RelationshipSettings";

function PartnerContent() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <PartnerHeader />

        <div className="mt-8 grid gap-6">

          <RelationshipStatus />

          <div className="grid gap-6 lg:grid-cols-2">
            <InviteCard />
            <ConnectCard />
          </div>

          <PartnerCard />

          <SharedStats />

          <ActivityTimeline />

          <RelationshipSettings />

        </div>

      </div>
    </main>
  );
}

export default function PartnerPage() {
  return (
    <PartnerProvider>
      <PartnerContent />
    </PartnerProvider>
  );
}