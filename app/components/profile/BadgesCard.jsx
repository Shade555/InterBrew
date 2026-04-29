"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trophy, Star, Crown, Medal, Award, Zap, Flame, Sparkles } from "lucide-react";

export default function BadgesCard() {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch badges once component mounts
  useEffect(() => {
    const fetchBadges = async () => {
      // Handle missing Supabase client
      if (!supabase) {
        console.log("Supabase not available for badges");
        setLoading(false);
        return;
      }

      try {
        const { data: authData } = await supabase.auth.getUser();
        
        // If no user, show empty state
        if (!authData?.user) {
          setBadges([]);
          setLoading(false);
          return;
        }
        
        setUser(authData.user);

        // Fetch BOTH badges AND streak in parallel
        const [badgesRes, streakRes] = await Promise.all([
          supabase
            .from("user_badges")
            .select(`
              *,
              collection_badges (
                name,
                badge_icon,
                description
              )
            `)
            .eq("user_id", authData.user.id),
          supabase
            .from("user_dashboards")
            .select("streak")
            .eq("user_id", authData.user.id)
            .single()
        ]);

        // Process badges
        if (badgesRes.error) {
          console.error("Error fetching user badges:", badgesRes.error.message);
        } else {
          const transformedBadges = badgesRes.data?.map(item => ({
            id: item.id,
            badge_name: item.collection_badges?.name || 'Unnamed Badge',
            badge_icon: item.collection_badges?.badge_icon,
            unlocked_at: item.unlocked_at
          })) || [];
          setBadges(transformedBadges);
        }

        // Auto-award streak badges
        const streak = streakRes.data?.streak || 0;
        console.log(`Current streak: ${streak} days`);
        
        const streakBadges = [
          { streak: 1, name: '1-Day Streak 🔥', icon: '🔥' },
          { streak: 7, name: '7-Day Streak 🥈', icon: '🥈' },
          { streak: 30, name: '30-Day Streak 🥇', icon: '🥇' }
        ];

        for (const badge of streakBadges) {
          if (streak >= badge.streak) {
            // Check if user already has this badge
            const existing = badgesRes.data?.some(item => 
              item.collection_badges?.name?.includes(badge.name)
            );
            
            if (!existing) {
              console.log(`Awarding ${badge.name}`);
              // TODO: Insert into user_badges (needs collection_badges IDs)
            }
          }
        }
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
    if (name.includes("expert") || name.includes("master")) return <Zap className="w-6 h-6 text-yellow-400" />;
    
    // Fallback icons based on index for variety
    const fallbackIcons = [
      <Crown key="crown" className="w-6 h-6 text-yellow-400" />,
      <Trophy key="trophy" className="w-6 h-6 text-purple-400" />,
      <Medal key="medal" className="w-6 h-6 text-blue-400" />,
      <Star key="star" className="w-6 h-6 text-pink-400" />,
      <Award key="award" className="w-6 h-6 text-orange-400" />,
      <Zap key="zap" className="w-6 h-6 text-cyan-400" />,
      <Flame key="flame" className="w-6 h-6 text-red-400" />,
      <Sparkles key="sparkles" className="w-6 h-6 text-violet-400" />,
    ];
    return fallbackIcons[index % fallbackIcons.length];
  };

  const getBadgeColor = (badgeName, index) => {
    const name = badgeName?.toLowerCase() || "";
    const colorVariants = [
      "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
      "from-purple-500/20 to-violet-500/20 border-purple-500/30",
      "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
      "from-pink-500/20 to-rose-500/20 border-pink-500/30",
      "from-orange-500/20 to-red-500/20 border-orange-500/30",
      "from-cyan-500/20 to-teal-500/20 border-cyan-500/30",
      "from-red-500/20 to-pink-500/20 border-red-500/30",
      "from-violet-500/20 to-purple-500/20 border-violet-500/30",
    ];
    if (name.includes("gold")) return colorVariants[0];
    if (name.includes("silver")) return colorVariants[1];
    if (name.includes("bronze")) return colorVariants[2];
    if (name.includes("expert") || name.includes("master")) return colorVariants[3];
    return colorVariants[index % colorVariants.length];
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-24 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
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
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, index) => (
            <div
              key={badge.id}
              className={`bg-linear-to-br ${getBadgeColor(badge.badge_name, index)} rounded-xl p-4 border transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
                  {badge.badge_icon ? (
                    <span className="text-2xl">{badge.badge_icon}</span>
                  ) : (
                    getBadgeIcon(badge.badge_name, index)
                  )}
                </div>
                <span className="text-white text-sm font-medium truncate w-full">
                  {badge.badge_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

