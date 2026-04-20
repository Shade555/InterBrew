"use client";

import { useState } from "react";
import Scenarios from "../../components/scenario/scenarios";
import LessonView from "../../components/scenario/lesson";

export default function TrainingPage() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [activeModule, setActiveModule] = useState(null);

  if (practiceMode) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[#0c0c0c] p-5">
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-8 h-full overflow-hidden flex flex-col">
          {/* Simplified - use scenario-practice logic here if needed */}
          <div>Training practice view (extend with modules)</div>
          <button onClick={() => setPracticeMode(false)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[#0c0c0c] p-5 grid grid-cols-[1fr_420px] gap-4">
      <div className="bg-[#141414] border border-white/8 rounded-2xl p-5">
        Training content area
      </div>
      <div className="bg-[#141414] border border-white/8 rounded-2xl p-5">
        <Scenarios onSelect={setSelectedScenario} selected={selectedScenario} />
      </div>
    </div>
  );
}
