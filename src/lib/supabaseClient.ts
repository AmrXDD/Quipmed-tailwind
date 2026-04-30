import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const HAS_SUPABASE = Boolean(url && anon);

// Providing fallbacks ensures the client object exists immediately
export const supabase = createClient(url || "", anon || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getUserProfile = async () => {
  if (!HAS_SUPABASE) return null;
  
  try {
    // getSession is faster than getUser for initial renders
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name, department")
      .eq("id", session.user.id)
      .single();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
};