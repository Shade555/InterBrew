import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL configured:", !!supabaseUrl);
console.log("Supabase Anon Key configured:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.warn(
    'Warning: Missing or invalid NEXT_PUBLIC_SUPABASE_URL in .env file.\n' +
    'Please add your Supabase project URL (e.g., https://xxxx.supabase.co)\n' +
    'Get it from: https://app.supabase.com → Settings → API'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here' || supabaseAnonKey.length < 10) {
  console.warn(
    'Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid.\n' +
    'Please add your Supabase anon public key (a long JWT token)\n' +
    'Get it from: https://app.supabase.com → Settings → API'
  );
}

export const supabase = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here' && supabaseAnonKey.length >= 10
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log("Supabase client created:", !!supabase);

