import SwarmDefenderCanvas from "@/components/SwarmDefenderCanvas";

export const metadata = { title: "Swarm Performance Test" };

export default function SwarmTestPage() {
  return (
    <div className="container mx-auto py-10">
      <SwarmDefenderCanvas />
    </div>
  );
}