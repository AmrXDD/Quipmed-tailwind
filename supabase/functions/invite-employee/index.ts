// @ts-nocheck
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:5173";

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    // We see "department": "Medical" in your logs
    const { email, full_name, role, department } = body;

    if (!email) throw new Error("Email is required");

    // FIX: Check if 'department' is a valid UUID. 
    // If it's a string like "Medical", we set it to null so the DB doesn't crash.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validDeptId = department && uuidRegex.test(department) ? department : null;

    console.log(`[Admin] Inviting ${email}. Valid UUID: ${!!validDeptId}`);

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: full_name || "New Employee",
        role: role || "staff",
        department_id: validDeptId // We use department_id to match the DB column
      },
      redirectTo: `${SITE_URL}/admin/login`,
    });

    if (error) {
      console.error("[Auth Error]", error.message);
      throw error;
    }

    return new Response(JSON.stringify({ ok: true, user: data.user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (e: any) {
    console.error("CRITICAL ERROR:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});