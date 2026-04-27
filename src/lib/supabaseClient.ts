import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we actually have the strings
export const HAS_SUPABASE = Boolean(url && anon);

if (!HAS_SUPABASE) {
  console.error("🚨 Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in Vercel env vars!");
}

// FIX: We provide empty strings as fallback to prevent "L is null" or "undefined" errors
export const supabase = HAS_SUPABASE
  ? createClient(url || "", anon || "", {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  : (null as any);

export const getUserProfile = async () => {
  // Guard clause to prevent crashing if supabase is null
  if (!supabase || !HAS_SUPABASE) return null;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name, department")
      .eq("id", session.user.id)
      .single();

    if (error || !data) {
      console.warn("Profile fetch error:", error?.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Identity fetch failed:", err);
    return null;
  }
};