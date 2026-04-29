import MemoryAllocationChallenge from "../../components/challenge/memory-allocation/page.jsx";

export const metadata = {
  title: "Memory Allocation | System Architect Challenge",
  description: "Master OS memory management strategies like First Fit, Best Fit, and Worst Fit.",
};

export default function MemoryAllocationPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <MemoryAllocationChallenge />
    </main>
  );
}