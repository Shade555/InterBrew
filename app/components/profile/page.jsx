"use client";

import ProfileHeader from "./ProfileHeader";
import PersonalInfo from "./PersonalInfo";
import SettingsCard from "./SettingsCard";
import BadgesCard from "./BadgesCard";
import Certification from "./Certification";

export default function Home() {
  return (
    <section className="relative min-h-screen bg-black/30 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
        
        {/* Page Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            User Profile
          </h1>
          <p className="text-gray-400 text-sm">Manage your account and track your progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Profile Header - Full Width */}
          <div className="md:col-span-4 bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
            <ProfileHeader />
          </div>

          {/* Personal Info - 3 columns on desktop */}
          <div className="md:col-span-3 bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
            <PersonalInfo />
          </div>

          {/* Certifications - 1 column on desktop */}
          <div className="md:col-span-1 bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
            <Certification />
          </div>

          {/* Badges - 3 columns on desktop */}
          <div className="md:col-span-3 bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
            <BadgesCard />
          </div>

          {/* Settings - 1 column on desktop */}
          <div className="md:col-span-1 bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
            <SettingsCard />
          </div>

        </div>
      </div>
    </section>
  );
}

