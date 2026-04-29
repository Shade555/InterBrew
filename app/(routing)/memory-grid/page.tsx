import MemoryGridChallenge from "../../components/challenge/memory-grid/page.jsx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Grid | Page Replacement",
  description: "Manage physical memory frames and minimize page faults.",
};

export default function MemoryGridPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <MemoryGridChallenge />
    </main>
  );
}