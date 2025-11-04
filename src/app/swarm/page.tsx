import SwarmGameAdvanced from "@/components/SwarmGameAdvanced";

export const metadata = { title: "Swarm" };

export default function SwarmPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-6">Swarm Robotics Playground</h1>
      <p className="text-center mb-8 text-gray-600">
        Experience professional-grade swarm robotics with heterogeneous robots, fog of war exploration,
        and research-backed algorithms. Guide the swarm to explore the map efficiently!
      </p>
      <SwarmGameAdvanced />
    </div>
  );
}

