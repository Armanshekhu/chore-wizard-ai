import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to verify identity
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Service client for admin operations
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Check admin role
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate current week start (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // Check if already distributed this week
    const { data: existing } = await adminClient
      .from("assigned_chores")
      .select("id")
      .eq("week_start", weekStartStr)
      .limit(1);

    const { force } = await req.json().catch(() => ({ force: false }));

    if (existing && existing.length > 0 && !force) {
      return new Response(
        JSON.stringify({
          error: "already_distributed",
          message: "Tasks have already been distributed for this week. Send force=true to redistribute.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If forcing, delete existing assignments for this week that aren't completed
    if (existing && existing.length > 0 && force) {
      await adminClient
        .from("assigned_chores")
        .delete()
        .eq("week_start", weekStartStr)
        .eq("completed", false);
    }

    // Fetch all weekly chores
    const { data: chores } = await adminClient
      .from("chores")
      .select("*")
      .eq("frequency", "weekly");

    // Fetch all users (non-admin members)
    const { data: allRoles } = await adminClient
      .from("user_roles")
      .select("user_id, role");

    const memberIds = (allRoles || [])
      .filter((r) => r.role === "user")
      .map((r) => r.user_id);

    if (!memberIds.length) {
      return new Response(
        JSON.stringify({ error: "No members found to assign chores to" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!chores || !chores.length) {
      return new Response(
        JSON.stringify({ error: "No weekly chores found to distribute" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch completion history for fairness
    const { data: history } = await adminClient
      .from("assigned_chores")
      .select("user_id, completed")
      .eq("completed", true);

    const completionCounts: Record<string, number> = {};
    memberIds.forEach((id) => (completionCounts[id] = 0));
    (history || []).forEach((h) => {
      if (completionCounts[h.user_id] !== undefined) {
        completionCounts[h.user_id]++;
      }
    });

    // Fair distribution: round-robin sorted by least completed tasks
    const sortedMembers = [...memberIds].sort(
      (a, b) => (completionCounts[a] || 0) - (completionCounts[b] || 0)
    );

    const assignments: Array<{
      chore_id: string;
      user_id: string;
      due_date: string;
      week_start: string;
      completed: boolean;
    }> = [];

    chores.forEach((chore, index) => {
      const assignee = sortedMembers[index % sortedMembers.length];
      // Spread due dates across the week
      const dueDay = new Date(weekStart);
      dueDay.setDate(weekStart.getDate() + (index % 7));
      
      assignments.push({
        chore_id: chore.id,
        user_id: assignee,
        due_date: dueDay.toISOString().split("T")[0],
        week_start: weekStartStr,
        completed: false,
      });
    });

    const { error: insertError } = await adminClient
      .from("assigned_chores")
      .insert(assignments);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save assignments" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Distributed ${assignments.length} chores to ${memberIds.length} members`,
        count: assignments.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("distribute-chores error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
