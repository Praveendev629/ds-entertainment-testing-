import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function verifyAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) return false;
  return authHeader === `Bearer ${adminKey}`;
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServer();

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
