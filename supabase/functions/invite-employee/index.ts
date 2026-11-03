// @ts-nocheck
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Only these origins may call the function from a browser.
const ALLOWED_ORIGINS = [
  "https://quipmed.co",
  "https://www.quipmed.co",
  Deno.env.get("SITE_URL") ?? "",
  "http://localhost:5173",
].filter(Boolean);

const ADMIN_ROLES = ["Dev", "Admin"];
const ASSIGNABLE_ROLES = [
  "Dev",
  "Admin",
  "CEO",
  "GM",
  "Finance_Manager",
  "Operations_Manager",
  "Sales_Manager",
  "PR_Manager",
  "User",
];
const DEPARTMENTS = ["Medical", "Dental"];

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SITE_URL = Deno.env.get("SITE_URL") || "https://quipmed.co";

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── 1. Who is calling? ─────────────────────────────────────────
    // The public anon key is a valid JWT too, so we must resolve it to a
    // real signed-in user and check that user's role ourselves.
    const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Not signed in" }, 401, headers);

    const { data: caller, error: callerErr } = await admin.auth.getUser(token);
    if (callerErr || !caller?.user) return json({ error: "Not signed in" }, 401, headers);

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", caller.user.id)
      .single();

    if (!callerProfile || !ADMIN_ROLES.includes(callerProfile.role)) {
      return json({ error: "Only an admin can invite employees" }, 403, headers);
    }

    // ── 2. Validate input ──────────────────────────────────────────
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const full_name = String(body.full_name ?? "").trim().slice(0, 120);
    const role = ASSIGNABLE_ROLES.includes(body.role) ? body.role : "User";
    const department = DEPARTMENTS.includes(body.department) ? body.department : null;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "A valid email is required" }, 400, headers);
    }
    // Only a Dev can create another Dev.
    if (role === "Dev" && callerProfile.role !== "Dev") {
      return json({ error: "Only a Dev can grant the Dev role" }, 403, headers);
    }

    // ── 3. Invite, then assign the role server-side ────────────────
    // handle_new_user() always creates the profile as 'User'; the role is
    // set here with the service key so it never comes from user input.
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: full_name || "New Employee" },
      redirectTo: `${SITE_URL}/admin/login`,
    });
    if (error) throw error;

    const { error: profileErr } = await admin
      .from("profiles")
      .upsert({
        id: data.user.id,
        email,
        full_name: full_name || "New Employee",
        role,
        department,
      });
    if (profileErr) throw profileErr;

    console.log(`[invite-employee] ${caller.user.email} invited ${email} as ${role}`);
    return json({ ok: true, user: { id: data.user.id, email } }, 200, headers);
  } catch (e: any) {
    console.error("[invite-employee]", e?.message);
    return json({ error: e?.message ?? "Invite failed" }, 400, headers);
  }
});
