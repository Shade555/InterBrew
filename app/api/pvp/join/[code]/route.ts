import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { code } = await params;
    const { userId } = await request.json(); // Catch the joining user's ID
    const lobbyCode = code.toUpperCase();

    // 1. Check if lobby exists and is joinable
    const { data: lobby, error } = await supabase
      .from('pvp_lobbies')
      .select('*')
      .eq('lobby_code', lobbyCode)
      .eq('status', 'waiting')
      .maybeSingle();

    if (error || !lobby) {
      return NextResponse.json({ error: 'Lobby not found or full' }, { status: 404 });
    }

    // 2. Prevent joining your own lobby
    if (lobby.player1_id === userId) {
      return NextResponse.json({ error: 'You cannot join your own lobby' }, { status: 400 });
    }

    // 3. Update with the REAL userId
    const { data: updatedLobby, error: updateError } = await supabase
      .from('pvp_lobbies')
      .update({
        player2_id: userId, // FIXED: Was null
        status: 'matched'
      })
      .eq('id', lobby.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ lobby: updatedLobby });
  } catch (error) {
    console.error('Join lobby error:', error);
    return NextResponse.json({ error: 'Failed to join lobby' }, { status: 500 });
  }
}
