import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { challenge_id, score, challenges_completed, accuracy, user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert new leaderboard record
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        user_id,
        total_score: score,
        challenges_completed: challenges_completed || 1,
        accuracy: accuracy || 100,
        category: 'XP',
        xp: score,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      })
      .select()
      .single();

    if (error) {
      console.error('Leaderboard insert error:', error);
      return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      record_id: data.id,
      message: `+${score} XP recorded` 
    });
  } catch (err) {
    console.error('Complete challenge error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

