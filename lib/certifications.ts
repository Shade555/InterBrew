import { supabase } from "./supabaseClient";

/**
 * Awards a certification for completing a mock interview section.
 * Idempotent — won't insert a duplicate for the same user + title.
 */
export async function awardInterviewCertification(sectionTitle: string): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const title = `${sectionTitle} — Mock Interview`;
    const issuer = "InterBrew";

    // Check if already awarded
    const { data: existing } = await supabase
      .from("certifications")
      .select("id")
      .eq("user_id", userId)
      .eq("title", title)
      .maybeSingle();

    if (existing) return; // already earned

    await supabase.from("certifications").insert({
      user_id: userId,
      title,
      issuer,
      issue_date: new Date().toISOString().split("T")[0],
    });
  } catch (e) {
    console.error("awardInterviewCertification error:", e);
  }
}
