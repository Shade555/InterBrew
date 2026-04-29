"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Check } from "lucide-react";
import "./modules.css";

export default function Modules({
  onSelect,
  selectedModule,
  selectedScenario,
}) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());
  const [userId, setUserId] = useState(null);
  const [debugging, setDebugging] = useState(new Set());

  useEffect(() => {
    async function fetchModulesAndProgress() {
      if (!supabase) {
        console.warn("Supabase client not configured");
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) setUserId(user.id);

        // Fetch modules
        let query = supabase
          .from("modules")
          .select("*")
          .order("order_number", { ascending: true });

        if (selectedScenario?.id) {
          query = query.eq("scenario_id", selectedScenario.id);
        }

        const { data: modulesData, error: modulesError } = await query;

        if (modulesError) {
          console.error("Error fetching modules:", modulesError);
        } else if (modulesData) {
          setModules(modulesData);
        }

        // Fetch user's completed modules
        if (user) {
          const { data: progressData } = await supabase
            .from("user_module_progress")
            .select("module_id")
            .eq("user_id", user.id)
            .eq("completed", true);

          setCompletedModuleIds(
            new Set((progressData || []).map((p) => p.module_id))
          );
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchModulesAndProgress();

    const interval = setInterval(fetchModulesAndProgress, 2000);
    return () => clearInterval(interval);
  }, [selectedScenario?.id]);

  const debugComplete = async (e, mod) => {
    e.stopPropagation();
    if (!userId || !supabase) return;
    setDebugging((prev) => new Set(prev).add(mod.id));
    try {
      await supabase.from("user_module_progress").upsert(
        {
          user_id: userId,
          module_id: mod.id,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,module_id" }
      );
      setCompletedModuleIds((prev) => new Set(prev).add(mod.id));
    } catch (err) {
      console.error("Debug complete failed:", err);
    } finally {
      setDebugging((prev) => {
        const s = new Set(prev);
        s.delete(mod.id);
        return s;
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Modules</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track your learning path
          </p>
        </div>
        {!loading && modules.length > 0 && (
          <span className="text-xs text-gray-500">
            {modules.length} modules
          </span>
        )}
      </div>

      <div className="modules-scroll flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1 min-h-0 pb-2">
        {!selectedScenario ? (
          <p className="text-xs text-gray-500 text-center mt-4">
            Select a scenario to view its modules
          </p>
        ) : loading ? (
          <p className="text-xs text-gray-500 text-center mt-4">
            Loading modules...
          </p>
        ) : modules.length === 0 ? (
          <p className="text-xs text-gray-500 text-center mt-4">
            No modules found in this scenario.
          </p>
        ) : (
          modules.map((mod) => {
            const isCompleted = completedModuleIds.has(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => onSelect?.(mod)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedModule?.id === mod.id
                    ? "bg-white/8 border-white/20"
                    : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                      isCompleted
                        ? "bg-emerald-500/20 border border-emerald-500/40"
                        : "bg-white/5 border border-white/10 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      mod.order_number
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {mod.title}
                    </p>
                    {mod.description && (
                      <p className="text-[11px] text-gray-500 truncate">
                        {mod.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => debugComplete(e, mod)}
                    disabled={debugging.has(mod.id)}
                    className="px-2.5 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-medium hover:bg-amber-500/20 transition-all duration-200 shrink-0 disabled:opacity-50"
                  >
                    {debugging.has(mod.id) ? "..." : "Debug"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
