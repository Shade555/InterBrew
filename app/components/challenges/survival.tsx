"use client";

import { useRouter } from "next/navigation";

export default function SurvivalGame() {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111214] p-6 text-zinc-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Survival Mode</h2>
        <span className="text-xs text-zinc-400">Game Draft</span>
      </div>

      <p className="mt-2 text-sm text-zinc-400">
        Survive as long as possible by answering consecutive challenges.
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
        <button
          type="button"
          onClick={() => router.push("/challenge/survival")}
          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors"
        >
          Start Survival Game
        </button>
      </div>
    </section>
  );
}
