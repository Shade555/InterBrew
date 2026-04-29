"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trophy, Star, Crown, Medal, Award, Zap, Flame, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function BadgesCard() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!supabase) { setLoading(false); return; }
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) { setBadges([]); setLoading(false); return; }

        const userId = authData.user.id;

        // Fetch streak and profile badges in parallel
        const [dashboardRes, profileRes] = await Promise.all([
          supabase.from("user_dashboards").select("streak").eq("user_id", userId).single(),
          supabase.from("profiles").select("badges").eq("id", userId).maybeSingle(),
        ]);

        const streak = dashboardRes.data?.streak ?? 0;
        let currentBadges = Array.isArray(profileRes.data?.badges) ? profileRes.data.badges : [];

        const hasStreakBadge = currentBadges.some((b) => b.badge_name === "First Streak");
        const hasConsistencyBadge = currentBadges.some((b) => b.badge_name === "Consistency");

        if (streak >= 1 && !hasStreakBadge) {
          // Award the badge
          const streakBadge = {
            id: `streak_first_${userId}`,
            badge_name: "First Streak",
            badge_icon: "/TopPanel/fire.png",
            unlocked_at: new Date().toISOString(),
          };
          currentBadges = [...currentBadges, streakBadge];
          await supabase.from("profiles").update({ badges: currentBadges }).eq("id", userId);
        } else if (streak < 1 && hasStreakBadge) {
          // Remove the badge if streak dropped to 0
          currentBadges = currentBadges.filter((b) => b.badge_name !== "First Streak");
          await supabase.from("profiles").update({ badges: currentBadges }).eq("id", userId);
        }

        if (streak >= 15 && !hasConsistencyBadge) {
          // Award the consistency badge
          const consistencyBadge = {
            id: `streak_consistency_${userId}`,
            badge_name: "Consistency",
            badge_icon: "/images/Consistency.png",
            unlocked_at: new Date().toISOString(),
          };
          currentBadges = [...currentBadges, consistencyBadge];
          await supabase.from("profiles").update({ badges: currentBadges }).eq("id", userId);
        } else if (streak < 15 && hasConsistencyBadge) {
          // Revoke if streak drops below 15
          currentBadges = currentBadges.filter((b) => b.badge_name !== "Consistency");
          await supabase.from("profiles").update({ badges: currentBadges }).eq("id", userId);
        }

        const transformed = currentBadges.map((badge, idx) => ({
          id: badge.id || `badge-${idx}`,
          badge_name: badge.badge_name || badge.name || "Unnamed Badge",
          badge_icon: badge.badge_icon || badge.icon,
          unlocked_at: badge.unlocked_at,
        }));
        setBadges(transformed);
      } catch (err) {
        console.error("Exception fetching badges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const getBadgeIcon = (badgeName, index) => {
    const name = badgeName?.toLowerCase() || "";
    if (name.includes("gold") || name.includes("crown")) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (name.includes("silver") || name.includes("trophy")) return <Trophy className="w-6 h-6 text-purple-400" />;
    if (name.includes("bronze") || name.includes("medal")) return <Medal className="w-6 h-6 text-blue-400" />;
    if (name.includes("star")) return <Star className="w-6 h-6 text-pink-400" />;
    if (name.includes("first") || name.includes("beginner")) return <Award className="w-6 h-6 text-orange-400" />;
    if (name.includes("consistency")) return <Sparkles className="w-6 h-6 text-emerald-400" />;
    if (name.includes("expert") || name.includes("master")) return <Zap className="w-6 h-6 text-yellow-400" />;
    const fallbacks = [
      <Crown key="crown" className="w-6 h-6 text-yellow-400" />,
      <Trophy key="trophy" className="w-6 h-6 text-purple-400" />,
      <Medal key="medal" className="w-6 h-6 text-blue-400" />,
      <Star key="star" className="w-6 h-6 text-pink-400" />,
      <Award key="award" className="w-6 h-6 text-orange-400" />,
      <Zap key="zap" className="w-6 h-6 text-cyan-400" />,
      <Flame key="flame" className="w-6 h-6 text-red-400" />,
      <Sparkles key="sparkles" className="w-6 h-6 text-violet-400" />,
    ];
    return fallbacks[index % fallbacks.length];
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-24 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-700 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-400" />
          Badges
        </h2>
        <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
          {badges.length} earned
        </span>
      </div>

      {badges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Award className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm mb-1">No badges earned yet</p>
          <p className="text-gray-500 text-xs">Complete interviews to earn badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-8 gap-1">
          {badges.map((badge, index) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div className="bg-black/40 rounded-sm p-0.5 border border-white/10 transition-all hover:scale-125 hover:shadow-lg hover:shadow-white/10 aspect-square flex items-center justify-center cursor-default">
                  <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full bg-black/60">
                    {badge.badge_icon && (badge.badge_icon.includes("/") || badge.badge_icon.includes(".")) ? (
                      <img
                        src={badge.badge_icon}
                        alt={badge.badge_name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      getBadgeIcon(badge.badge_name, index)
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{badge.badge_name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
}
