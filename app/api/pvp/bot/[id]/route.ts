import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const lobbyId = id;

    // First check if lobby exists and is waiting
    const { data: lobby, error: fetchError } = await supabase
      .from('pvp_lobbies')
      .select('*')
      .eq('id', lobbyId)
      .eq('status', 'waiting')
      .single();

    if (fetchError || !lobby) {
      return NextResponse.json({ error: 'No waiting lobby found' }, { status: 404 });
    }

    // Call summon_bot RPC (assumes it exists; will create next)
    const { data, error: rpcError } = await supabase.rpc('summon_bot', {
      p_lobby_id: lobbyId
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      // Fallback: direct update if RPC not exist yet
      const { data: updated, error: updateError } = await supabase
        .from('pvp_lobbies')
        .update({
          player2_id: '00000000-0000-0000-0000-000000000000',
          status: 'matched',
          scores: { p1: 0, p2: 0 }
        })
        .eq('id', lobbyId)
        .select()
        .single();

      if (updateError) throw updateError;
      return NextResponse.json({ lobby: updated, action: 'bot_joined' });
    }

    return NextResponse.json({ lobby: data, action: 'bot_joined' });
  } catch (error) {
    console.error('Bot summon error:', error);
    return NextResponse.json({ error: 'Failed to summon bot' }, { status: 500 });
  }
}
