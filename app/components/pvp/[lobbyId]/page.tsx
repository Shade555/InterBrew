"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Lobby {
  id?: string;
  status?: string;
  lobby_code?: string;
}

interface PostgresChangePayload {
  new: Lobby | null;
}

export default function PvPLobby() {
  const { lobbyId } = useParams() as { lobbyId: string };
  const router = useRouter();
  const [status, setStatus] = useState('joining');
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [player2Joined, setPlayer2Joined] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabaseClient = supabase;
    if (!supabaseClient) {
      router.push('/pvp');
      return;
    }

    // Fetch lobby
    const fetchLobby = async () => {
      const { data } = await supabaseClient
        .from('pvp_lobbies')
        .select('*')
        .eq('lobby_code', lobbyId)
        .single();
      
      if (data) {
        setLobby(data);
        setStatus(data.status || 'waiting');
      } else {
        setStatus('error');
        setError('Lobby not found');
      }
    };

    fetchLobby();

    // Realtime subscription
    const channel = supabaseClient.channel(`lobby:${lobbyId}`);
    channel
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pvp_lobbies', filter: `lobby_code=eq.${lobbyId}` },
        (payload: PostgresChangePayload) => {
          if (payload.new) {
            setLobby(payload.new);
            setStatus(payload.new.status || 'waiting');
            if (payload.new.status === 'matched') {
              setPlayer2Joined(true);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [lobbyId, router]);

  const startVoiceBattle = () => {
    if (lobby?.id) {
      router.push(`/pvp/battle/${lobby.id}`);
    }
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black/80 to-emerald-900/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-500/20 rounded-3xl p-8 border-4 border-red-500/50 mx-auto mb-8 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Lobby Error</h1>
          <p className="text-xl text-gray-300 mb-8">{error}</p>
          <button 
            onClick={() => router.push('/pvp')}
            className="px-8 py-4 bg-emerald-500/80 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all"
          >
            ← Back to PvP
          </button>
        </div>
      </div>
    );
  }

  if (status === 'joining') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black/80 to-emerald-900/20 flex items-center justify-center p-4">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full mx-auto mb-6 animate-spin shadow-lg shadow-emerald-500/20"></div>
          <p className="text-2xl font-bold text-emerald-400 bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text">
            Joining {lobbyId.toUpperCase()}
          </p>
          <p className="text-gray-400 mt-2">Connecting to opponent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black/80 to-emerald-900/20 p-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-emerald-500/30 mb-6 shadow-2xl">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              LIVE LOBBY
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-white to-emerald-500 bg-clip-text text-transparent mb-4 tracking-tight">
            {lobbyId.toUpperCase()}
          </h1>
        </div>

        {/* Status Card */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-emerald-500/20 shadow-2xl mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`w-5 h-5 rounded-full ${status === 'matched' ? 'bg-emerald-500 animate-ping shadow-emerald-500/50' : 'bg-yellow-500/50'}`}></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-300 mb-1">{status.toUpperCase()}</p>
              <p className={`text-lg font-semibold ${status === 'matched' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {status === 'matched' ? 'Opponent Found!' : 'Waiting for Player 2...'}
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full ${status === 'matched' ? 'bg-emerald-500 animate-ping shadow-emerald-500/50' : 'bg-yellow-500/50'}`}></div>
          </div>

          {status === 'matched' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl p-8 border-4 border-emerald-500/50 mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <span className="text-5xl">⚔️</span>
              </div>
              <button
                onClick={startVoiceBattle}
                className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white py-6 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all duration-300 border border-emerald-400/50"
              >
                🎤 START VOICE BATTLE
              </button>
            </div>
          )}
        </div>

        {/* Share Card */}
        {!player2Joined && (
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-400/20 text-center">
            <p className="text-gray-300 mb-4 font-medium">Share this code with opponent:</p>
            <div className="bg-black/50 px-8 py-4 rounded-2xl border border-emerald-400/50 font-mono text-2xl font-bold text-emerald-400 tracking-wider uppercase shadow-lg">
              {lobbyId}
            </div>
            <p className="text-sm text-gray-500 mt-4">They go to /pvp/{lobbyId}</p>
          </div>
        )}

        {/* Copy Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigator.clipboard.writeText(`/pvp/${lobbyId}`)}
            className="px-6 py-3 bg-emerald-500/80 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg transition-all"
          >
            📋 Copy Invite Link
          </button>
        </div>
      </div>
    </div>
  );
}

