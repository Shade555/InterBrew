"use client";

import { useEffect } from 'react';
import  {supabase}  from '@/lib/supabaseClient';
export default function TestSupabase() {
  useEffect(() => {
    const testSupabase = async () => {
      if (!supabase) {
        console.log('Supabase not loaded');
        return;
      }
      
      console.log('Supabase client:', supabase);
      
      try {
        const { data, error } = await supabase
          .from('pvp_lobbies')
          .insert([{ player1: 'test_user', status: 'waiting' }]);

        console.log('Insert result:', data, error);
        
        if (error) {
          console.error('Error details:', error);
        } else {
          console.log('Success! Data:', data);
          
          // Cleanup
          const { data: inserted, error: deleteError } = await supabase
            .from('pvp_lobbies')
            .delete()
            .eq('player1', 'test_user');
          console.log('Cleanup:', inserted, deleteError);
        }
      } catch (err) {
        console.error('Test failed:', err);
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">Supabase Test</h1>
      <p>Check browser console (F12 → Console) for results</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-6 py-3 bg-emerald-500 rounded-lg font-bold"
      >
        Test Again
      </button>
    </div>
  );
}

