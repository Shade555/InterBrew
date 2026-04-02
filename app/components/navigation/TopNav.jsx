"use client"

import React from "react";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 backdrop-blur-md bg-white/5 dark:bg-black/20">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-semibold text-[#50C878]">InterBrew</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-transparent mr-6 hover:bg-[#19332C]/50 dark:hover:bg-[#19332C]/40 transition-colors">
          <img src="/TopPanel/fire.png" alt="activity" className="w-8 h-8 object-contain" />
          <div className="text-base font-medium">10</div>
        </div>

        <button className="p-2 rounded hover:bg-[#19332C]/50 dark:hover:bg-[#19332C]/40 transition-colors">
          <img src="/TopPanel/help.png" alt="help" className="w-8 h-8 object-contain" />
        </button>
        <button className="p-2 rounded hover:bg-[#19332C]/50 dark:hover:bg-[#19332C]/40 transition-colors">
          <img src="/TopPanel/feedback.png" alt="messages" className="w-8 h-8 object-contain" />
        </button>
        <button className="p-2 rounded hover:bg-[#19332C]/50 dark:hover:bg-[#19332C]/40 transition-colors">
          <img src="/TopPanel/about.png" alt="about" className="w-8 h-8 object-contain" />
        </button>
        <button 
          onClick={handleProfileClick}
          className="p-2 rounded hover:bg-[#19332C]/50 dark:hover:bg-[#19332C]/40 transition-colors"
        >
          <img src="/TopPanel/profile.png" alt="profile" className="w-8 h-8 object-contain rounded-full" />
        </button>
      </div>
    </header>
  );
}

