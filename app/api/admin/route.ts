import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function describeError(e: unknown): string {
  if (!(e instanceof Error)) return "Unknown error";
  const cause = e.cause ? ` (cause: ${String(e.cause)})` : "";
  return `${e.message}${cause}`;
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing env vars on this deployment: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not available to the server function. Add them in Vercel, then redeploy.",
      },
      { status: 500 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    await fetch(`${supabaseUrl}/rest/v1/`, { method: "GET" });
  } catch (e) {
    const cause = e instanceof Error && e.cause ? ` | cause: ${String(e.cause)}` : "";
    return NextResponse.json(
      {
        error: `Server cannot reach Supabase at "${supabaseUrl}"${
          e instanceof Error ? ` | ${e.message}` : ""
        }${cause}`,
      },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseServer();

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("last_seen", { ascending: false });

    if (usersError) {
      const hint = usersError.message.includes("Could not find the table")
        ? " The database schema was never created - run supabase/schema.sql in the Supabase SQL Editor."
        : "";
      return NextResponse.json(
        { error: `Could not read users table: ${usersError.message}.${hint}` },
        { status: 500 }
      );
    }

    try {
      await supabase.rpc("mark_stale_sessions" as never);
    } catch {
      // best-effort cleanup, non-fatal
    }

    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("is_active", true);

    if (sessionsError) {
      const hint = sessionsError.message.includes("Could not find the table")
        ? " The database schema was never created - run supabase/schema.sql in the Supabase SQL Editor."
        : "";
      return NextResponse.json(
        { error: `Could not read sessions table: ${sessionsError.message}.${hint}` },
        { status: 500 }
      );
    }

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
  } catch (e) {
    return NextResponse.json({ error: describeError(e) }, { status: 500 });
  }
}
