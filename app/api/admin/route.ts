import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Vercel" },
      { status: 500 }
    );
  }

  let supabase;
  try {
    supabase = getSupabaseServer();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create Supabase client" },
      { status: 500 }
    );
  }

  // Mark stale sessions
  await supabase.rpc("mark_stale_sessions" as never);

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("last_seen", { ascending: false });

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .eq("is_active", true);

  if (sessionsError) {
    return NextResponse.json({ error: sessionsError.message }, { status: 500 });
  }

  // Map sessions to users
  const userMap = new Map<string, { activeSessions: number; sessionIds: string[] }>();
  for (const session of sessions || []) {
    const existing = userMap.get(session.user_id) || { activeSessions: 0, sessionIds: [] };
    existing.activeSessions++;
    existing.sessionIds.push(session.id);
    userMap.set(session.user_id, existing);
  }

  const enrichedUsers = (users || []).map((user) => ({
    ...user,
    active_sessions: userMap.get(user.id)?.activeSessions || 0,
    session_ids: userMap.get(user.id)?.sessionIds || [],
    is_online: (userMap.get(user.id)?.activeSessions || 0) > 0,
  }));

  return NextResponse.json({ users: enrichedUsers });
}
