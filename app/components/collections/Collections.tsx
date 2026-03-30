"use client";

import React, { useState } from "react";
import Link from "next/link";
import MockPanel from "./MockPanel";
import MockInterviewPanel from "../mock_int/mock_int";

import { supabase } from "../../../lib/supabaseClient";

type CollectionRow = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  section?: string | null;
  order?: number | null;
};


function SmallCollectionCard({ title, onMock, progress = 0 }: { title: string; onMock: (t: string) => void; progress?: number }) {
  const desc = `${title} — A focused collection to practice and learn.`;
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="group shrink-0 rounded-xl p-3.5 min-w-[24rem] sm:min-w-104 text-white bg-[rgb(20,20,20)] border border-transparent hover:bg-[#1a1a1a] transition-all duration-200 relative overflow-hidden" style={{ minHeight: 180 }}>
      {/* Main card content (visible) - hide on hover */}
      <div className="flex flex-col h-full transition-opacity duration-200 opacity-100 group-hover:opacity-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-lg font-medium text-white truncate">{title}</p>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border text-gray-300 border-white/10 bg-white/5">Collection</span>
        </div>

        <p className="text-sm text-gray-300 truncate mb-4">{desc}</p>

        <div className="mt-auto flex items-center gap-3">
          <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
            <div className={`h-1 rounded-full transition-all duration-500 ${Math.round(progress) >= 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
          </div>
          <span className="text-[11px] text-gray-400">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Hover overlay (actions) */}
      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none group-hover:pointer-events-auto">
        <div className="text-xl font-semibold">{title}</div>
        <div className="text-sm opacity-80 text-center">{desc}</div>
        <div className="flex gap-3 mt-2">
          <Link href={`/collections/${slug}`} className="px-4 py-2 rounded-md border border-white/30 bg-white/6 hover:bg-white/10">Learn</Link>
          <button onClick={() => onMock(title)} className="px-4 py-2 rounded-md border border-white/30 bg-white/6 hover:bg-white/10">Mock</button>
        </div>
      </div>
    </div>
  );
}

// MockPanel is provided by app/components/collections/MockPanel.tsx (extracted)

export default function Collections({ className = "" }: { className?: string }) {
  const [mockTopic, setMockTopic] = useState<string | null>(null);
  const [mockDifficulty, setMockDifficulty] = useState<string | null>(null);
  const [sections, setSections] = useState<Array<{ title: string; items: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = React.useState<Record<string, number>>({});
  const placeholderProgress: Record<string, number> = {
    Frontend: 40,
    Backend: 100,
    'Data Science': 20,
    Database: 65,
    Algorithms: 12,
    "System Programming": 78,
  };

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      // avoid specifying incorrect generics for supabase.from() in this JS-configured client
      const res = await supabase.from('collections').select('*').order('section', { ascending: true }).order('order', { ascending: true });
      const data = res.data as CollectionRow[] | null;
      const error = res.error;
      if (error) {
        console.error('Error loading collections', error);
        setLoading(false);
        return;
      }

      const grouped: Record<string, string[]> = {};
      (data || []).forEach((r) => {
        const section = r.section || 'General';
        if (!grouped[section]) grouped[section] = [];
        grouped[section].push(r.title);
      });

      const mapped = Object.keys(grouped).map((k) => ({ title: k, items: grouped[k] }));
      if (mounted) {
        setSections(mapped);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch user's dashboard row to compute per-collection progress if available
  React.useEffect(() => {
    let mounted = true;
    async function loadProgress() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) return;

        const { data, error } = await supabase.from('user_dashboards').select('*').eq('user_id', userId).single();
        if (error || !data) return;

        // Build a map of title -> progress
        const allTitles = sections.flatMap((s) => s.items || []);
        const map: Record<string, number> = {};

        if (data.readiness_score && typeof data.readiness_score === 'object') {
          const rs = data.readiness_score;
          for (const t of allTitles) {
            const choices = [t, t.toLowerCase(), t.replace(/\W+/g, '').toUpperCase()];
            let matched = false;
            let foundVal = undefined;
            for (const k of choices) {
              if (Object.prototype.hasOwnProperty.call(rs, k) && typeof rs[k] === 'number') {
                matched = true;
                foundVal = rs[k];
                break;
              }
            }
            if (matched) map[t] = foundVal as number;
          }
        } else if (data.graph_data) {
          const gd = data.graph_data;
          if (gd.subject && typeof gd.subject === 'object') {
            for (const t of allTitles) {
              const choices = [t, t.toLowerCase(), t.replace(/\W+/g, '').toUpperCase()];
              let matched = false;
              let foundVal = undefined;
              for (const k of choices) {
                if (Object.prototype.hasOwnProperty.call(gd.subject, k)) {
                  const arr = gd.subject[k];
                  if (Array.isArray(arr)) foundVal = arr[arr.length - 1] ?? 0;
                  else if (typeof arr === 'number') foundVal = arr;
                  matched = true;
                  break;
                }
              }
              if (matched) map[t] = foundVal as number;
            }
          }
        }

        if (mounted) setProgressMap(map);
      } catch (e) {
        // ignore
      }
    }

    if (sections.length > 0) loadProgress();
    return () => {
      mounted = false;
    };
  }, [sections]);
  const [interviewTopic, setInterviewTopic] = useState<string | null>(null);

  return (
    <section className={className}>
      <h1 className="mb-6 text-3xl font-semibold">Collections</h1>

      <div className="space-y-6">
        {loading ? (
          <div className="opacity-60">Loading collections…</div>
        ) : (
          sections.map((s) => (
            <div key={s.title}>
              <h2 className="mb-3 text-lg font-semibold">{s.title}</h2>

              <div className="rounded-2xl overflow-hidden">
                <div className="flex gap-4 overflow-x-auto pl-0 pr-2 py-2 scrollbar-hide">
                  {s.items.map((it) => (
                    <SmallCollectionCard key={it} title={it} onMock={(t) => setMockTopic(t)} progress={progressMap[it] ?? placeholderProgress[it] ?? 0} />
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {mockTopic && (
        <MockPanel
          topic={mockTopic}
          onClose={() => setMockTopic(null)}
          onStart={(difficulty: string) => {
            console.log("Mock start requested:", difficulty);
            // Keep the chosen topic so we can pass it into the interview panel
            setInterviewTopic(mockTopic);
            setMockTopic(null);
            setMockDifficulty(difficulty);
          }}
        />
      )}

      {mockDifficulty && (
        <MockInterviewPanel
          difficulty={mockDifficulty}
          topic={interviewTopic || undefined}
          onClose={() => {
            setMockDifficulty(null);
            setInterviewTopic(null);
          }}
        />
      )}
    </section>
  );
}
