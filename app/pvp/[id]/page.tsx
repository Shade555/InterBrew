"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';
import { QUESTION_BANK } from '@/data/challengeData';
import type { OSQuestion } from '@/data/osQuestions';

const QuizModal = dynamic(() => import('@/components/challenges/QuizModal'), { ssr: false });

interface Lobby {
  id: string;
  subject: string;
  player1_id: string;
  player2_id: string | null;
  status: string;
  lobby_code: string;
}

export default function PvPLobby() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isBot, setIsBot] = useState(false);
  const [botScore, setBotScore] = useState(0);
  const lobbyId = params.id as string;
  const BOT_ID = '00000000-0000-0000-0000-000000000000';

  let channelRef = null;

  // Auth + lobby fetch + realtime (single effect)
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !lobbyId) {
        if (mounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pvp_lobbies')
        .select('*')
        .eq('id', lobbyId)
        .single();

      if (error || !data || (data.player1_id !== user.id && data.player2_id !== user.id)) {
        if (mounted) {
          router.push('/pvp');
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setUser(user);
        setLobby(data);
        setIsBot(data.player2_id === BOT_ID);
        
        const subject = data.subject || 'Meta';
        const category = 'system';
        const questions = (QUESTION_BANK[subject as keyof typeof QUESTION_BANK]?.[category as keyof typeof QUESTION_BANK[typeof subject]] || []).slice(0, 10);
        setQuizQuestions(questions);
        setLoading(false);
      }

      // Realtime
      const channel = supabase.channel(`lobby-${lobbyId}`);
      channel
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'pvp_lobbies', 
          filter: `id=eq.${lobbyId}` 
        }, (payload) => {
          const newLobby = payload.new as Lobby;
          setLobby(newLobby);
          setIsBot(newLobby.player2_id === BOT_ID);
        })
        .subscribe();

      channelRef = channel;

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();

    return () => {
      mounted = false;
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, [lobbyId]);

  // Bot simulation
  useEffect(() => {
    if (!isBot || !lobby?.status === 'matched') return;

    const interval = setInterval(() => {
      setBotScore((prev) => Math.min(prev + Math.floor(Math.random() * 8) + 2, 100));
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isBot, lobby?.status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-emerald-900/20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black/80 to-emerald-900/20 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mb-4">
            PvP {lobby?.subject?.toUpperCase() || 'ARENA'}
          </h1>
          <div className="flex justify-center items-center gap-6 mb-4">
            <span className="text-lg">P1: {lobby?.player1_id.slice(-8)}</span>
            <div className="text-3xl">⚔️</div>
            <span className={isBot ? 'text-yellow-400 animate-pulse' : 'text-emerald-400 text-lg'}>
              {isBot ? '🤖 BOT' : lobby?.player2_id?.slice(-8) || '---'}
            </span>
          </div>
          {isBot && <p className="text-yellow-400 font-bold">Robot Practice Mode</p>}
        </div>

        {lobby?.status === 'matched' && quizQuestions.length > 0 ? (
          <QuizModal
            company="PvP"
            category={lobby.subject || 'system'}
            questions={quizQuestions}
            isPvp={true}
            lobby_code={lobby.lobby_code}
            opponentScore={isBot ? botScore : 0}
            onClose={() => router.push('/pvp')}
          />
        ) : (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-emerald-400/30 border-t-emerald-400 mx-auto mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">Lobby Ready</h2>
            <p className="text-gray-500 mb-4">Status: {lobby?.status || 'initializing'}</p>
            <p className="text-sm text-gray-400">Share code: <code className="bg-black px-3 py-1 rounded font-mono">{lobby?.lobby_code}</code></p>
          </div>
        )}
      </div>
    </div>
  );
}
