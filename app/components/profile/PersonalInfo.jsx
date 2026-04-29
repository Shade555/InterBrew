"use client";

import { useEffect, useState } from "react";
import { Briefcase, Code, Target, CheckCircle, TrendingUp, Award, Zap, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PersonalInfo() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // Handle missing Supabase client
      if (!supabase) {
        console.log("Supabase not available, using demo data");
        setLoading(false);
        return;
      }

      try {
        // Retry logic for auth session (handles OAuth redirect delay)
        let user = null;
        let retries = 0;
        const maxRetries = 5;

        while (!user && retries < maxRetries) {
          const { data: authData, error: authError } = await supabase.auth.getUser();

          if (authError) {
            console.warn(`Auth attempt ${retries + 1}/${maxRetries} failed:`, authError.message);
            retries++;
            if (retries < maxRetries) {
              // Wait 500ms before retrying
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            continue;
          }

          user = authData?.user;
          if (!user && retries < maxRetries - 1) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (!user) {
          console.error("Could not establish auth session after retries");
          setLoading(false);
          return;
        }

        if (!user) {
          setLoading(false);
          return;
        }

        // Try fetching profile
        let { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile - Full error:", error);
          console.error("Error fetching profile details:", {
            message: error?.message || "No message",
            code: error?.code || "No code",
            details: error?.details || "No details",
            hint: error?.hint || "No hint",
            toString: error?.toString?.(),
          });
        }

        // If profile does not exist, just use fallback data
        if (!profileData) {
          // Extract email username (part before @) as fallback
          const emailUsername = user.email?.split('@')[0] || "";
          const displayName = user.user_metadata?.full_name || user.user_metadata?.name || emailUsername || "";
          
          // Profile should have been created by trigger on signup
          // Use fallback if it doesn't exist yet
          profileData = { 
            id: user.id, 
            email: user.email, 
            full_name: displayName,
            avatar_url: user.user_metadata?.avatar_url || ""
          };
          console.log("Profile not found - using fallback data:", profileData);
        }

        setUserData(profileData);
      } catch (err) {
        console.error("Exception fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-gray-700 rounded"></div>
          <div className="h-4 w-60 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="h-20 bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const accuracy = userData?.accuracy || 0;
  const getAccuracyColor = () => {
    if (accuracy >= 80) return "from-emerald-400 to-teal-500";
    if (accuracy >= 60) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-pink-500";
  };

  const getAccuracyText = () => {
    if (accuracy >= 80) return "Excellent";
    if (accuracy >= 60) return "Good";
    if (accuracy >= 40) return "Fair";
    return "Needs Work";
  };

  // Color variants for icons based on index
  const iconColorVariants = [
    { bg: "bg-purple-500/20", color: "text-purple-400", border: "hover:border-purple-500/30" },
    { bg: "bg-blue-500/20", color: "text-blue-400", border: "hover:border-blue-500/30" },
    { bg: "bg-pink-500/20", color: "text-pink-400", border: "hover:border-pink-500/30" },
    { bg: "bg-orange-500/20", color: "text-orange-400", border: "hover:border-orange-500/30" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-green-400" />
          Personal Information
        </h2>
        <p className="text-gray-400 text-sm ml-7">
          Your interview performance and profile details
        </p>
      </div>

      {/* Role + Domain */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`bg-linear-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-colors group`}>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Briefcase size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span>Role</span>
          </div>
          <div className="text-white font-medium truncate">
            {userData?.role || "Not set"}
          </div>
        </div>

        <div className={`bg-linear-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-colors group`}>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Code size={16} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
            <span>Domain</span>
          </div>
          <div className="text-white font-medium truncate">
            {userData?.domain || "Not set"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard 
          icon={<Target size={20} />} 
          iconBg="bg-purple-500/20"
          iconColor="text-purple-400"
          label="Interviews" 
          value={userData?.interviews_taken || 0} 
          trend={userData?.interviews_taken > 0 ? "+" : ""}
        />
        <StatCard 
          icon={<CheckCircle size={20} />} 
          iconBg="bg-blue-500/20"
          iconColor="text-blue-400"
          label="Completed" 
          value={userData?.completed || 0} 
          trend={userData?.completed > 0 ? "+" : ""}
        />
        <StatCard 
          icon={<TrendingUp size={20} />} 
          iconBg="bg-orange-500/20"
          iconColor="text-orange-400"
          label="Streak" 
          value={`${userData?.user_dashboards?.streak || 0}`} 
        />
      </div>

      {/* Progress Section */}
      <div className="mt-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accuracy >= 60 ? 'text-yellow-400' : 'text-gray-500'}`} />
            <span className="text-gray-400 text-sm">Overall Progress</span>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            accuracy >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
            accuracy >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {getAccuracyText()}
          </span>
        </div>

        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 bg-linear-to-r ${getAccuracyColor()} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${accuracy}%` }}
          />
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 2s infinite;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, iconBg, iconColor, label, value, trend }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5 group">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center mx-auto mb-2 ${iconColor} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="text-white text-center font-bold text-lg">
        <span>{trend}</span>{value}
      </div>
      <div className="text-gray-500 text-center text-xs">
        {label}
      </div>
    </div>
  );
}

