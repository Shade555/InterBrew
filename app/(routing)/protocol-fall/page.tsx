import ProtocolFall from "../../components/challenge/protocol-fall/page.jsx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Protocol Fall | OS Knowledge",
  description: "Catch the correct logic packets while answering OS kernel queries.",
};

export default function ProtocolFallPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <ProtocolFall />
    </main>
  );
}

