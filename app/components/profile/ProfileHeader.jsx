"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Camera, Edit2, Check, X, Mail, Calendar, LogOut } from "lucide-react";

export default function ProfileHeader() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) { setLoading(false); return; }
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          if (profileData) setProfile(profileData);
        }
      } catch (err) {
        console.error("Exception getting user:", err);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  // Focus input when edit mode opens
  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const startEditing = () => {
    setNameInput(displayName);
    setEditingName(true);
  };

  const cancelEditing = () => {
    setEditingName(false);
    setNameInput("");
  };

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || !user) { cancelEditing(); return; }
    if (trimmed === displayName) { cancelEditing(); return; }

    setSavingName(true);
    try {
      await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: trimmed }, { onConflict: "id" });
      setProfile((prev) => ({ ...prev, full_name: trimmed }));
    } catch (err) {
      console.error("Failed to save name:", err);
    } finally {
      setSavingName(false);
      setEditingName(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);
    if (uploadError) { console.error('Upload error:', uploadError); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(filePath);
    await supabase.from("profiles").upsert({ id: user.id, avatar_url: publicUrl }, { onConflict: "id" });
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

  const displayName = profile?.full_name || user?.user_metadata?.name || "User";
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const gradientOptions = ["from-emerald-500 to-cyan-500", "from-green-500 to-blue-500", "from-teal-500 to-blue-500", "from-green-400 to-cyan-400"];
  const gradientIndex = user?.id ? user.id.charCodeAt(0) % gradientOptions.length : 0;
  const avatarGradient = gradientOptions[gradientIndex];

  return (
    <div className="h-full flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative group">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/30 overflow-hidden`}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials || "U"
            )}
          </div>
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
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </div>

        {/* User Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            {editingName ? (
              <>
                <input
                  ref={nameInputRef}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") cancelEditing();
                  }}
                  className="bg-white/10 border border-white/20 rounded-md px-2 py-0.5 text-white text-xl font-semibold outline-none focus:border-emerald-500/60 w-48"
                  disabled={savingName}
                />
                <button
                  onClick={saveName}
                  disabled={savingName}
                  className="p-1 hover:bg-emerald-500/20 rounded transition-colors text-emerald-400"
                  aria-label="Save name"
                >
                  {savingName ? (
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={cancelEditing}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors text-gray-400 hover:text-red-400"
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <h2 className="text-white text-xl font-semibold">{displayName}</h2>
                <button
                  onClick={startEditing}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label="Edit name"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>

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

      {/* Sign Out */}
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

