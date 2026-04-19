"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PvP() {
  const router = useRouter();
  const [stage, setStage] = useState('select');
  const [subject, setSubject] = useState('os');
  const [lobbyCode, setLobbyCode] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [lobby, setLobby] = useState(null);
  const [creating, setCreating] = useState(false);
  const matchmakingTimeout = useRef(null);
  const userId = 'demo-user-123';

  useEffect(() => {}, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleHostMatch = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/pvp/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, userId: 'demo-user-123' })
      });
      const { lobby: newLobby } = await response.json();
      setLobby(newLobby);
      setStage('searching');
      setCreating(false);

      // 10s bot timeout
      matchmakingTimeout.current = setTimeout(() => {
        router.push(`/pvp/${newLobby.id}`);
      }, 10000);
    } catch (e) {
      console.error(e);
      setCreating(false);
    }
  };

  const handleJoinMatch = async () => {
    if (!lobbyCode.trim()) return;
    try {
      const response = await fetch(`/api/pvp/join/${lobbyCode.trim().toUpperCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user-123' })
      });
      const { lobby: joinedLobby } = await response.json();
      router.push(`/pvp/${joinedLobby.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const clearTimeoutSafe = () => {
    if (matchmakingTimeout.current) {
      clearTimeout(matchmakingTimeout.current);
      matchmakingTimeout.current = null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-900/20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative z-10 max-w-6xl mx-auto p-16 space-y-20">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-[5rem] md:text-[7rem] font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl mb-8">
            ⚔️ INTERBREW ARENA
          </h1>
          <p className="text-2xl md:text-3xl text-emerald-200/90 font-medium max-w-2xl mx-auto">
            Live Voice Battles • Real-time PvP • Bot Fallback
          </p>
        </div>

        {/* Main Controls */}
        {stage === 'select' && (
          <div className="bg-white/5 backdrop-blur-3xl border border-emerald-500/20 rounded-[3rem] p-20 text-center shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-4xl font-black mb-12 text-white tracking-tight">
              Enter the Arena
            </h2>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Host Panel */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-emerald-400">👑 CREATE BATTLE</h3>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-6 bg-black/30 border-2 border-emerald-500/50 rounded-3xl text-2xl font-bold text-emerald-300 focus:ring-4 focus:ring-emerald-500/30"
                >
                  <option value="os">🖥️ OS Fundamentals</option>
                  <option value="db">🗄️ Database</option>
                  <option value="net">🌐 Networks</option>
                </select>
                <button
                  onClick={handleHostMatch}
                  disabled={creating}
                  className="w-full p-8 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-600/20 border-2 border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-500/30 shadow-xl font-black text-2xl text-emerald-400 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'CREATE LOBBY'}
                </button>
              </div>

              {/* Join Panel */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-purple-400">👥 JOIN BATTLE</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="LOBBY1234"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                    className="w-full p-6 pr-20 bg-black/30 border-2 border-purple-500/50 rounded-3xl text-2xl font-mono text-purple-300 focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400"
                  />
                  <button
                    onClick={handleJoinMatch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-black font-black rounded-2xl text-sm shadow-lg transition-all"
                  >
                    JOIN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hosting Screen */}
        {stage === 'searching' && lobby && (
          <div className="text-center max-w-2xl mx-auto space-y-12">
            <h2 className="text-5xl font-black text-emerald-400 mb-8 tracking-tight">
              YOUR BATTLE CODE
            </h2>
            <div className="bg-gradient-to-r from-emerald-500/30 to-teal-500/30 backdrop-blur-xl border-4 border-emerald-500/50 rounded-3xl p-16 shadow-2xl">
              <div className="text-6xl font-black text-white tracking-widest uppercase mb-8">
                {lobby.lobby_code}
              </div>
              <p className="text-2xl text-emerald-200 mb-12">Share with opponent (10s until bot)</p>
              <div className="text-7xl font-black text-white mb-4">
                {countdown}
              </div>
              <div className="text-3xl text-emerald-300 font-bold uppercase tracking-wider">
                Seconds Remaining
              </div>
              <button
                onClick={() => router.push(`/pvp/${lobby.id}`)}
                className="mt-12 px-16 py-8 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-3xl text-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all"
              >
                Enter Battlefield →
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {['creating', 'joining'].includes(stage) && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="w-32 h-32 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
            <h2 className="text-4xl font-black text-emerald-400">{stage === 'creating' ? 'Creating Lobby...' : 'Joining Battle...'}</h2>
            <p className="text-xl text-emerald-300">Please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
}
