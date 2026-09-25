"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { RealtimeChannel } from "@supabase/supabase-js";

const HEARTBEAT_INTERVAL = 25_000;
const STORAGE_KEY_USER = "ds_user_id";
const STORAGE_KEY_USERNAME = "ds_username";
const STORAGE_KEY_SESSION = "ds_session_id";
const STORAGE_KEY_SYNCED = "ds_synced";

function generateId() {
  return crypto.randomUUID();
}

function getStoredUserId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY_USER); } catch { return null; }
}
function getStoredUsername(): string | null {
  try { return localStorage.getItem(STORAGE_KEY_USERNAME); } catch { return null; }
}
function getStoredSessionId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY_SESSION); } catch { return null; }
}
function clearStoredIdentity() {
  try { localStorage.removeItem(STORAGE_KEY_USER); } catch {}
  try { localStorage.removeItem(STORAGE_KEY_USERNAME); } catch {}
  try { localStorage.removeItem(STORAGE_KEY_SESSION); } catch {}
  try { localStorage.removeItem(STORAGE_KEY_SYNCED); } catch {}
}
// "0" = the local identity never reached the database (e.g. registered offline).
// A missing value counts as synced so accounts created before this flag still
// get wiped when an admin deletes them.
function isSynced(): boolean {
  try { return localStorage.getItem(STORAGE_KEY_SYNCED) !== "0"; } catch { return true; }
}
function markSynced(): void {
  try { localStorage.setItem(STORAGE_KEY_SYNCED, "1"); } catch {}
}
function markUnsynced(): void {
  try { localStorage.setItem(STORAGE_KEY_SYNCED, "0"); } catch {}
}

const NO_ROWS_ERROR = "PGRST116";

export interface UserProfile {
  id: string;
  username: string;
  is_blocked: boolean;
  is_kicked: boolean;
}

export interface UserTrackingState {
  initialized: boolean;
  needsUsername: boolean;
  profile: UserProfile | null;
  kicked: boolean;
  blocked: boolean;
}

export function useUserTracking() {
  const [state, setState] = useState<UserTrackingState>({
    initialized: false,
    needsUsername: false,
    profile: null,
    kicked: false,
    blocked: false,
  });
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const profileRef = useRef<UserProfile | null>(null);
  const unsubscribeRef = useRef<RealtimeChannel | null>(null);

  const cleanup = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current.unsubscribe();
      unsubscribeRef.current = null;
    }
  }, []);

  // The account no longer exists in the database (admin deleted it):
  // wipe the identity stored on this device so a new name is requested.
  const resetToUsernameSetup = useCallback(() => {
    clearStoredIdentity();
    cleanup();
    profileRef.current = null;
    setState({ initialized: true, needsUsername: true, profile: null, kicked: false, blocked: false });
  }, [cleanup]);

  const sendHeartbeat = useCallback(async (sessionId: string, userId: string) => {
    const supabase = getSupabaseBrowser();
    await supabase
      .from("sessions")
      .update({ last_heartbeat: new Date().toISOString(), is_active: true })
      .eq("id", sessionId);
    await supabase
      .from("users")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", userId);
  }, []);

  const registerOrLogin = useCallback(async (username: string) => {
    const supabase = getSupabaseBrowser();
    let userId = getStoredUserId();
    let sessionId = getStoredSessionId();

    if (!userId) userId = generateId();
    if (!sessionId) sessionId = generateId();

    try { localStorage.setItem(STORAGE_KEY_USER, userId); } catch {}
    try { localStorage.setItem(STORAGE_KEY_USERNAME, username); } catch {}
    try { localStorage.setItem(STORAGE_KEY_SESSION, sessionId); } catch {}
    markUnsynced();

    const ua = navigator.userAgent;

    // Upsert user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, is_blocked, is_kicked")
      .eq("id", userId)
      .single();

    if (existingUser) {
      const { error } = await supabase
        .from("users")
        .update({ username, last_seen: new Date().toISOString() })
        .eq("id", userId);
      if (!error) markSynced();
    } else {
      const { error } = await supabase.from("users").insert({
        id: userId,
        username,
        last_seen: new Date().toISOString(),
      });
      if (!error) markSynced();
    }

    // Deactivate old sessions for this user
    await supabase
      .from("sessions")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true);

    // Create new session
    await supabase.from("sessions").insert({
      id: sessionId,
      user_id: userId,
      is_active: true,
      user_agent: ua,
      last_heartbeat: new Date().toISOString(),
    });

    const profile: UserProfile = {
      id: userId,
      username,
      is_blocked: existingUser?.is_blocked ?? false,
      is_kicked: existingUser?.is_kicked ?? false,
    };

    profileRef.current = profile;
    setState({ initialized: true, needsUsername: false, profile, kicked: false, blocked: profile.is_blocked });
    return profile;
  }, []);

  const fetchUserStatus = useCallback(
    async (userId: string): Promise<
      { status: "ok"; blocked: boolean; kicked: boolean } | { status: "deleted" } | { status: "unknown" }
    > => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("users")
        .select("is_blocked, is_kicked")
        .eq("id", userId)
        .single();

      if (error) {
        // Only treat "no rows" as a deletion - network errors must not wipe the device.
        if (error.code === NO_ROWS_ERROR) return { status: "deleted" };
        return { status: "unknown" };
      }

      if (!data) return { status: "deleted" };
      return { status: "ok", blocked: data.is_blocked, kicked: data.is_kicked };
    },
    []
  );

  // Initialize: check stored credentials
  useEffect(() => {
    const init = async () => {
      const userId = getStoredUserId();
      const username = getStoredUsername();

      if (!userId || !username) {
        setState({ initialized: true, needsUsername: true, profile: null, kicked: false, blocked: false });
        return;
      }

      const supabase = getSupabaseBrowser();

      // Check if user exists and get status
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, username, is_blocked, is_kicked")
        .eq("id", userId)
        .single();

      if (!user && userError?.code === NO_ROWS_ERROR) {
        if (!isSynced()) {
          // The name was never stored in the database (e.g. registered offline) - retry.
          await registerOrLogin(username);
          return;
        }
        // Deleted by the administrator: forget this device and ask for a new name.
        resetToUsernameSetup();
        return;
      }

      if (!user) {
        // Row could not be read (offline / schema not deployed) - keep local identity.
        const fallbackProfile: UserProfile = {
          id: userId,
          username,
          is_blocked: false,
          is_kicked: false,
        };
        profileRef.current = fallbackProfile;
        setState({
          initialized: true,
          needsUsername: false,
          profile: fallbackProfile,
          kicked: false,
          blocked: false,
        });
        return;
      }

      const profile: UserProfile = {
        id: userId,
        username: user.username,
        is_blocked: user.is_blocked,
        is_kicked: user.is_kicked,
      };

      profileRef.current = profile;

      setState({
        initialized: true,
        needsUsername: false,
        profile,
        kicked: user.is_kicked,
        blocked: user.is_blocked,
      });
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start heartbeat + realtime subscription after profile loaded
  useEffect(() => {
    if (!state.profile) return;

    const supabase = getSupabaseBrowser();
    const userId = state.profile.id;
    const sessionId = getStoredSessionId();

    if (!sessionId) return;

    // Keep realtime + polling alive while kicked/blocked so an admin
    // unkick/unblock takes effect without the visitor having to reset.
    if (!state.blocked && !state.kicked) {
      sendHeartbeat(sessionId, userId);

      heartbeatRef.current = setInterval(() => {
        sendHeartbeat(sessionId, userId);
      }, HEARTBEAT_INTERVAL);
    }

    // Cleanup on page hide
    const handlePageHide = async () => {
      if (sessionId) {
        const s = getSupabaseBrowser();
        await s.from("sessions").update({ is_active: false }).eq("id", sessionId);
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    // Subscribe to realtime changes on users table for this user
    const channel = supabase
      .channel(`user-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${userId}` },
        (payload: { new: { is_blocked: boolean; is_kicked: boolean } }) => {
          const newData = payload.new as { is_blocked: boolean; is_kicked: boolean };
          if (newData.is_kicked) {
            setState((prev) => ({ ...prev, kicked: true }));
          }
          if (newData.is_blocked) {
            setState((prev) => ({ ...prev, blocked: true }));
          }
          if (!newData.is_kicked && !newData.is_blocked) {
            setState((prev) => ({ ...prev, kicked: false, blocked: false }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "users", filter: `id=eq.${userId}` },
        () => {
          resetToUsernameSetup();
        }
      )
      .subscribe();

    unsubscribeRef.current = channel;

    // Poll for kicked/blocked/deleted every 5s as fallback (realtime may not always fire)
    const pollInterval = setInterval(async () => {
      const result = await fetchUserStatus(userId);

      if (result.status === "deleted") {
        resetToUsernameSetup();
        return;
      }
      if (result.status === "unknown") return;

      setState((prev) => {
        if (prev.blocked !== result.blocked || prev.kicked !== result.kicked) {
          return { ...prev, blocked: result.blocked, kicked: result.kicked };
        }
        return prev;
      });
    }, 5000);

    return () => {
      cleanup();
      clearInterval(pollInterval);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      // Mark session inactive
      if (sessionId) {
        const s = getSupabaseBrowser();
        s.from("sessions").update({ is_active: false }).eq("id", sessionId);
      }
    };
  }, [state.profile, state.blocked, state.kicked, sendHeartbeat, cleanup, fetchUserStatus, resetToUsernameSetup]);

  const setUsername = useCallback(async (username: string) => {
    await registerOrLogin(username);
  }, [registerOrLogin]);

  return { ...state, setUsername };
}
