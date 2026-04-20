import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { subject = 'os', userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const lobbyCode = 'LOBBY' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const { data, error } = await supabase
      .from('pvp_lobbies')
      .insert({
        subject,
        lobby_code: lobbyCode,
        player1_id: userId,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ lobby: data });
  } catch (error) {
    console.error('Create lobby error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}