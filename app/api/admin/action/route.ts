import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, action } = body as {
    userId: string;
    action: "kick" | "unkick" | "block" | "unblock" | "delete";
  };

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  if (action === "kick") {
    // Mark all active sessions as inactive
    await supabase
      .from("sessions")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true);

    // Set kicked flag
    const { error } = await supabase
      .from("users")
      .update({ is_kicked: true })
      .eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "block") {
    // Mark all active sessions as inactive
    await supabase
      .from("sessions")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true);

    const { error } = await supabase
      .from("users")
      .update({ is_blocked: true })
      .eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "unblock") {
    const { error } = await supabase
      .from("users")
      .update({ is_blocked: false, is_kicked: false })
      .eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "unkick") {
    const { error } = await supabase
      .from("users")
      .update({ is_kicked: false })
      .eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "delete") {
    const { error: sessionsError } = await supabase
      .from("sessions")
      .delete()
      .eq("user_id", userId);

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
