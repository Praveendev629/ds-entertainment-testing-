"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, Wifi, WifiOff, Search, ArrowLeft, Loader2,
  Ban, LogOut, Clock, Unlock, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  username: string;
  is_blocked: boolean;
  is_kicked: boolean;
  is_admin: boolean;
  created_at: string;
  last_seen: string;
  active_sessions: number;
  session_ids: string[];
  is_online: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    type: "kick" | "block" | "unblock";
    userId: string;
    username: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setUsers(data.users || []);
      setFetchError(null);
    } catch (e) {
      console.error("Failed to fetch users");
      setFetchError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10_000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const performAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: confirmAction.userId,
          action: confirmAction.type,
        }),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch {
      console.error("Action failed");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = users.filter((u) => u.is_online).length;
  const blockedCount = users.filter((u) => u.is_blocked).length;
  const recentCount = users.filter((u) => {
    const diff = Date.now() - new Date(u.last_seen).getTime();
    return diff < 5 * 60 * 1000;
  }).length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const timeSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/50 border-b border-pink-600/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-zinc-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-500" />
              <span className="text-lg font-bold">Admin Dashboard</span>
            </div>
          </div>
          <button
            onClick={fetchUsers}
            className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-zinc-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
            <p className="text-zinc-500 font-medium">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: users.length, icon: Users, color: "text-white" },
                { label: "Online Now", value: onlineCount, icon: Wifi, color: "text-green-400" },
                { label: "Recently Active", value: recentCount, icon: Clock, color: "text-blue-400" },
                { label: "Blocked", value: blockedCount, icon: Ban, color: "text-red-400" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/5 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">{stat.label}</span>
                  </div>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by username or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-600/30 transition-all placeholder:text-zinc-600 text-sm"
              />
            </div>

            {fetchError && (
              <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium">
                Failed to load users: {fetchError}
              </div>
            )}

            {/* User Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-xs text-zinc-500 uppercase tracking-widest font-black">Username</th>
                    <th className="text-left py-3 px-4 text-xs text-zinc-500 uppercase tracking-widest font-black">Status</th>
                    <th className="text-left py-3 px-4 text-xs text-zinc-500 uppercase tracking-widest font-black hidden md:table-cell">First Seen</th>
                    <th className="text-left py-3 px-4 text-xs text-zinc-500 uppercase tracking-widest font-black hidden md:table-cell">Last Seen</th>
                    <th className="text-right py-3 px-4 text-xs text-zinc-500 uppercase tracking-widest font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-[10px] text-zinc-600 font-mono mt-0.5">{user.id.slice(0, 12)}...</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {user.is_online ? (
                            <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-[10px] font-bold uppercase flex items-center gap-1">
                              <Wifi className="w-3 h-3" /> Online
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-zinc-500/10 border border-zinc-500/20 rounded-lg text-zinc-500 text-[10px] font-bold uppercase flex items-center gap-1">
                              <WifiOff className="w-3 h-3" /> Offline
                            </span>
                          )}
                          {user.is_blocked && (
                            <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-bold uppercase">Blocked</span>
                          )}
                          {user.is_kicked && (
                            <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-[10px] font-bold uppercase">Kicked</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-xs hidden md:table-cell">{formatTime(user.created_at)}</td>
                      <td className="py-3 px-4 text-zinc-500 text-xs hidden md:table-cell">
                        <span>{timeSince(user.last_seen)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {!user.is_blocked ? (
                            <button
                              onClick={() => setConfirmAction({ type: "block", userId: user.id, username: user.username })}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all"
                              title="Block user"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmAction({ type: "unblock", userId: user.id, username: user.username })}
                              className="p-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-green-400 hover:text-green-300 transition-all"
                              title="Unblock user"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmAction({ type: "kick", userId: user.id, username: user.username })}
                            className="p-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl text-orange-400 hover:text-orange-300 transition-all"
                            title="Kick user"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && !fetchError && (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-600 font-medium">No users found</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#0a0a0a] border border-pink-600/20 rounded-3xl p-6 shadow-2xl max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-white mb-2">
                {confirmAction.type === "kick" && "Kick User"}
                {confirmAction.type === "block" && "Block User"}
                {confirmAction.type === "unblock" && "Unblock User"}
              </h3>
              <p className="text-sm text-zinc-500 mb-6">
                {confirmAction.type === "kick" && `Are you sure you want to kick "${confirmAction.username}"? They will be disconnected immediately.`}
                {confirmAction.type === "block" && `Are you sure you want to block "${confirmAction.username}"? They will lose access to the site.`}
                {confirmAction.type === "unblock" && `Are you sure you want to unblock "${confirmAction.username}"?`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-zinc-400 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={performAction}
                  disabled={actionLoading}
                  className={`flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    confirmAction.type === "unblock"
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-pink-600 hover:bg-pink-500"
                  } disabled:opacity-50`}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    confirmAction.type === "kick" ? "Kick" : confirmAction.type === "block" ? "Block" : "Unblock"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
