"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { GraduationCap, Calendar, ExternalLink, Award, Zap, Star, Shield, Rocket } from "lucide-react";

export default function CertificationsCard() {
  const [user, setUser] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch certifications once component mounts
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        
        // If no user, show empty state
        if (!authData?.user) {
          setCertifications([]);
          setLoading(false);
          return;
        }
        
        setUser(authData.user);

        // Fetch certifications from Supabase
        const { data, error } = await supabase
          .from("certifications")
          .select("*")
          .eq("user_id", authData.user.id)
          .order("issue_date", { ascending: false });

        if (error) {
          console.error("Error fetching certifications:", error.message);
        }

        setCertifications(data || []);
      } catch (err) {
        console.error("Exception fetching certifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  // Color variants for certifications
  const getCertColor = (index) => {
    const colors = [
      { icon: <Zap className="w-8 h-8 text-purple-400" />, border: "hover:border-purple-500/30", text: "group-hover:text-purple-300", bg: "from-purple-500/10" },
      { icon: <Star className="w-8 h-8 text-blue-400" />, border: "hover:border-blue-500/30", text: "group-hover:text-blue-300", bg: "from-blue-500/10" },
      { icon: <Shield className="w-8 h-8 text-pink-400" />, border: "hover:border-pink-500/30", text: "group-hover:text-pink-300", bg: "from-pink-500/10" },
      { icon: <Rocket className="w-8 h-8 text-orange-400" />, border: "hover:border-orange-500/30", text: "group-hover:text-orange-300", bg: "from-orange-500/10" },
      { icon: <Zap className="w-8 h-8 text-cyan-400" />, border: "hover:border-cyan-500/30", text: "group-hover:text-cyan-300", bg: "from-cyan-500/10" },
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-32 bg-gray-700 rounded"></div>
          <div className="space-y-2 mt-4">
            <div className="h-16 bg-gray-700 rounded-lg"></div>
            <div className="h-16 bg-gray-700 rounded-lg"></div>
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
          <GraduationCap className="w-5 h-5 text-blue-400" />
          Certifications
        </h2>
        <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
          {certifications.length}
        </span>
      </div>

      {certifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <Award className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">No certifications added yet</p>
          <p className="text-gray-500 text-xs mt-1">Add your certifications to showcase your skills</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[200px] pr-1">
          {certifications.map((cert, index) => {
            const colorVariant = getCertColor(index);
            return (
              <div 
                key={cert.id} 
                className={`bg-gradient-to-r ${colorVariant.bg} to-transparent rounded-lg p-3 border border-white/10 ${colorVariant.border} transition-all group`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {colorVariant.icon}
                      <h3 className={`text-white font-medium text-sm truncate ${colorVariant.text} transition-colors`}>
                        {cert.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-400 text-xs mt-1 truncate">
                      {cert.issuer}
                    </p>

                    {cert.issue_date && (
                      <div className="flex items-center gap-1 mt-1.5 text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">
                          {new Date(cert.issue_date).toLocaleDateString("en-US", { 
                            month: "short", 
                            year: "numeric" 
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white/5 hover:bg-purple-500/20 rounded-lg text-gray-400 hover:text-purple-400 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

