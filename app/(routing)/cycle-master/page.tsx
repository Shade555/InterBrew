import CycleMasterChallenge from "../../components/challenge/cycle-master/page.jsx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cycle Master | CPU Scheduler",
  description: "Optimize CPU throughput using advanced scheduling algorithms like SJF and FCFS.",
};

export default function CycleMasterPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      {/* This renders your main game component */}
      <CycleMasterChallenge />
    </main>
  );
}