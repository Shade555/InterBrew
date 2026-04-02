"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Settings, User, Globe, Save, LogOut, Trash2, Check, AlertCircle, X, Pencil, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsCard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [domain, setDomain] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  // Get logged-in user and fetch profile
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        
        if (data?.user) {
          setUser(data.user);
          
          if (data.user.user_metadata?.name) {
            setFullName(data.user.user_metadata.name);
          }
          
          // Fetch profile data
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("role, domain, full_name")
            .eq("id", data.user.id)
            .single();

          // Only log if there's a real error (not RLS denial which returns empty error)
          if (error && Object.keys(error).length > 0) {
            console.log("Profile fetch note:", error.message || "Profile not found");
          }

          if (profileData) {
            setRole(profileData.role || "");
            setDomain(profileData.domain || "");
            if (profileData.full_name) setFullName(profileData.full_name);
          }
        }
      } catch (err) {
        console.error("Error getting user:", err);
      } finally {
        setUserLoading(false);
      }
    };

    getUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus(null);
    
    // Get fresh user data
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      alert("No user logged in. Please sign in again.");
      setLoading(false);
      return;
    }

    console.log("Saving profile for user:", currentUser.id);

    try {
      // Use upsert to handle both insert and update
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          role,
          domain,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        setSaveStatus('error');
        alert('Save error: ' + upsertError.message);
        setLoading(false);
        return;
      }

      // If we get here, save was successful
      setSaveStatus('success');
      alert('Profile saved successfully!');
      setShowEditModal(false);
      
      // Update user metadata if name changed
      if (fullName !== currentUser.user_metadata?.name) {
        await supabase.auth.updateUser({
          data: { name: fullName }
        });
      }
      
      // Refresh the page to show updated profile
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error('Save error:', err);
      alert('Error: ' + err.message);
      setSaveStatus('error');
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        alert("No user logged in.");
        setDeleteLoading(false);
        return;
      }

      // Delete from profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", currentUser.id);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
        alert("Failed to delete profile: " + profileError.message);
        setDeleteLoading(false);
        return;
      }

      // Sign out the user
      await supabase.auth.signOut();
      
      // Redirect to sign in page
      router.push('/auth/signin');
      
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Error: ' + err.message);
    }

    setDeleteLoading(false);
  };

  const roleOptions = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "Other"
  ];

  const domainOptions = [
    "Web Development",
    "Mobile Development",
    "Machine Learning",
    "Cloud Computing",
    "Cybersecurity",
    "Blockchain",
    "Game Development",
    "Other"
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-400" />
          Settings
        </h2>
      </div>

      {/* Small Edit Profile and Delete Profile buttons */}
      <div className="space-y-1.5 flex-1">
        <button
          onClick={() => setShowEditModal(true)}
          className="w-full flex items-center justify-center gap-2 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 rounded-lg border border-amber-500/30 hover:border-amber-400/50 transition-all text-sm"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Profile
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all text-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Profile
        </button>
      </div>

      {/* Sign Out at bottom */}
      <div className="mt-auto pt-2 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-1.5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 text-emerald-300 rounded-lg border border-emerald-500/20 hover:border-emerald-400/40 transition-all text-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5 w-full max-w-md mx-4 shadow-2xl shadow-yellow-500/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-green-400" />
                Edit Profile
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-gray-400 text-xs mb-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Full Name</span>
                </label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              {/* Role */}
              <div>
                <label className="flex items-center gap-2 text-gray-400 text-xs mb-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Role</span>
                </label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all text-sm appearance-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="" className="bg-gray-800">Select a role</option>
                  {roleOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-gray-800">{opt}</option>
                  ))}
                </select>
              </div>

              {/* Domain */}
              <div>
                <label className="flex items-center gap-2 text-gray-400 text-xs mb-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Domain</span>
                </label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all text-sm appearance-none cursor-pointer"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                >
                  <option value="" className="bg-gray-800">Select a domain</option>
                  {domainOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-gray-800">{opt}</option>
                  ))}
                </select>
              </div>

              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Failed to save. Please try again.
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm mt-2 cursor-pointer ${
                  loading 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : saveStatus === 'success'
                      ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                      : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-lg shadow-yellow-500/20 cursor-pointer'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : saveStatus === 'success' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/30 rounded-xl p-5 w-full max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Delete Profile?</h3>
              <p className="text-gray-400 text-sm mb-4">This action cannot be undone. Your account will be permanently deleted.</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

