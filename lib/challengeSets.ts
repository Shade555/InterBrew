import { supabase } from "./supabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchChallengeSetByCompany(supabaseClient: SupabaseClient | null, company: string) {
  console.log("fetchChallengeSetByCompany called with:", company);
  if (!company || !supabaseClient) {
    console.log("fetchChallengeSetByCompany: No company or no supabaseClient");
    return null;
  }
  
  // Query challenge_sets table
  console.log("Trying to fetch from challenge_sets...");
  const { data, error } = await supabaseClient
    .from("challenge_sets")
    .select("*")
    .ilike("company", company)
    .limit(1)
    .maybeSingle();
  
  console.log("Result from challenge_sets:", { data, error });
  
  if (error) {
    console.log("Challenge set fetch error:", error.message);
    return null;
  }
  
  return data;
}

export async function fetchQuestionsByChallengeSetId(supabaseClient: SupabaseClient | null, challengeSetId: string) {
  console.log("fetchQuestionsByChallengeSetId called with:", challengeSetId);
  if (!supabaseClient || !challengeSetId) {
    return [];
  }
  
  // Query questions table
  console.log("Trying to fetch from questions...");
  const { data, error } = await supabaseClient
    .from("questions")
    .select("*")
    .eq("challenge_set_id", challengeSetId);
  
  console.log("Result from questions:", { data, error });
  
  if (error) {
    console.log("Questions fetch error:", error.message);
    return [];
  }
  
  console.log("Questions fetched:", data?.length || 0);
  return data || [];
}
