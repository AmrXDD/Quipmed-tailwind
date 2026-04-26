import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const HAS_SUPABASE = Boolean(url && anon);

export const supabase = HAS_SUPABASE
  ? createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : (null as any);

export const getUserProfile = async () => {
  if (!supabase) return null;
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
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
