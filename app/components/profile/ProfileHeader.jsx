"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Camera, Edit2, Mail, Calendar, LogOut, Upload } from "lucide-react";

export default function ProfileHeader() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      // Handle missing Supabase client
      if (!supabase) {
        console.log("Supabase not available for profile header");
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getUser();
        
        if (data?.user) {
          setUser(data.user);
          
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
            
          if (error) {
            // Profile might not exist yet, that's okay - don't show error
            console.log("Profile not found, will use defaults");
          } else {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error("Exception getting user:", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    // Update profile with avatar URL
    await supabase
      .from("profiles")
      .upsert({ id: user.id, avatar_url: publicUrl }, { onConflict: "id" });

    setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    setUploading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/signin';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-700"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
            <div className="h-3 w-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.name || profile?.full_name || "User";
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Generate gradient based on user id for variety
  const gradientOptions = [
    "from-emerald-500 to-cyan-500",
    "from-green-500 to-blue-500",
    "from-teal-500 to-blue-500",
    "from-green-400 to-cyan-400",
  ];
  const gradientIndex = user?.id ? user.id.charCodeAt(0) % gradientOptions.length : 0;
  const avatarGradient = gradientOptions[gradientIndex];

  return (
    <div className="h-full flex flex-col sm:flex-row items-center justify-between gap-4">
      
      <div className="flex items-center gap-5">
        {/* Avatar Section */}
        <div className="relative group">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/30 overflow-hidden`}>
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
          
          {/* Camera Overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {uploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Camera className="text-white w-6 h-6" />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* User Info */}
        <div>
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            {displayName}
            <button className="p-1 hover:bg-white/10 rounded transition-colors">
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </h2>
          
          <p className="text-gray-400 text-sm flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </p>
          
          <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
            <Calendar className="w-3 h-3" />
            Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
          </p>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

