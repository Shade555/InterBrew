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
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError.message);
          setBadges([]);
          setLoading(false);
          return;
        }
        
        // If no user, show empty state
        if (!authData?.user) {
          setBadges([]);
          setLoading(false);
          return;
        }
        
        setUser(authData.user);

        // Fetch badges from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("badges")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile badges:", profileError.message);
          setBadges([]);
        } else {
          // Get badges array from profile
          const userBadges = profileData?.badges || [];
          
          // Ensure it's an array and has the expected structure
          const transformedBadges = Array.isArray(userBadges) 
            ? userBadges.map((badge, idx) => ({
                id: badge.id || `badge-${idx}`,
                badge_name: badge.badge_name || badge.name || 'Unnamed Badge',
                badge_icon: badge.badge_icon || badge.icon,
                unlocked_at: badge.unlocked_at
              }))
            : [];
          
          setBadges(transformedBadges);
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
        <div className="grid grid-cols-8 gap-1">
          {badges.map((badge, index) => (
            <div
              key={badge.id}
              className="bg-black/40 rounded-sm p-0.5 border border-white/10 transition-all hover:scale-125 hover:shadow-lg hover:shadow-white/10 aspect-square flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center text-center gap-0 w-full h-full justify-center">
                <div className="w-15 h-15 rounded-full bg-black/60 flex items-center justify-center overflow-hidden">
                  {badge.badge_icon && (badge.badge_icon.includes('/') || badge.badge_icon.includes('.')) ? (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

