import DeadlockRescueChallenge from "../../components/challenge/deadlock-rescue/page.jsx";
export const metadata = {
  title: "Deadlock Rescue | System Architect",
  description: "Identify circular waits and resolve system freezes.",
};

export default function DeadlockRescuePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <DeadlockRescueChallenge />
    </main>
  );
}