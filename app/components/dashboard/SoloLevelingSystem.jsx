"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SoloLevelingSystem() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setUser(userData.user);

          // Fetch profile data
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }

          // Fetch user stats
          const { data: statsData } = await supabase
            .from("user_dashboard")
            .select("*")
            .eq("user_id", userData.user.id)
            .single();

          if (statsData) {
            setUserStats(statsData);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111214] px-6 py-6 flex flex-col h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10"></div>
          <div className="w-full space-y-2">
            <div className="h-3 w-24 bg-white/10 rounded mx-auto"></div>
            <div className="h-2 w-20 bg-white/10 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.name || profile?.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate gradient based on user id
  const gradientOptions = [
    "from-emerald-500 to-cyan-500",
    "from-green-500 to-blue-500",
    "from-teal-500 to-blue-500",
    "from-green-400 to-cyan-400",
  ];
  const gradientIndex = user?.id
    ? user.id.charCodeAt(0) % gradientOptions.length
    : 0;
  const avatarGradient = gradientOptions[gradientIndex];

  const xp = userStats?.total_xp || 0;
  const role = profile?.role || "Learner";
  const domain = profile?.domain || "General";
  const interviewsDone = userStats?.interviews_completed || 0;
  const communicationSkills = userStats?.communication_score || 0;

  // Calculate level based on XP (e.g., every 1000 XP = 1 level)
  const level = Math.floor(xp / 1000) + 1;
  const xpInLevel = xp % 1000;
  const xpProgressPercent = Math.round((xpInLevel / 1000) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Section: Avatar (Left) and Stats (Right) */}
      <div className="flex items-start gap-8">
        {/* Left: Large Avatar and Name */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-emerald-500/50 overflow-hidden border-4 border-emerald-500/30`}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              initials || "U"
            )}
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-zinc-100">
              {displayName}
            </h3>
            <p className="text-xs text-gray-500">Level {level}</p>
          </div>
        </div>

        {/* Right: Stats List */}
        <div className="flex-1 space-y-3 pt-2">
          {/* Role */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">◆</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                {role}
              </p>
              <p className="text-sm text-zinc-100 font-semibold">{role}</p>
            </div>
          </div>

          {/* Domain */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">≡</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                Domain
              </p>
              <p className="text-sm text-zinc-100 font-semibold">{domain}</p>
            </div>
          </div>

          {/* Interviews Done */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">⬡</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                Interviews
              </p>
              <p className="text-sm text-emerald-400 font-semibold">
                {interviewsDone}
              </p>
            </div>
          </div>

          {/* Communication Skills */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">❋</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                Communication
              </p>
              <p className="text-sm text-emerald-400 font-semibold">
                {communicationSkills}/10
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress Bar - Full Width Below */}
      <div className="w-full">
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">◈</span>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
              Experience
            </p>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/8">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{xpInLevel}/1000 XP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
