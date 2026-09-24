"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ArrowRight, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (username: string) => Promise<void>;
}

export default function UsernameSetup({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 30) {
      setError("Name must be 30 characters or less");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(trimmed);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="bg-[#0a0a0a] border border-pink-600/20 rounded-3xl p-8 shadow-2xl shadow-pink-600/5">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-pink-600/10 border border-pink-600/20 rounded-2xl flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-xl font-bold text-white text-center">Welcome to DS Entertainment</h1>
            <p className="text-sm text-zinc-500 text-center mt-2">Enter your name to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Your name..."
                maxLength={30}
                autoFocus
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-600/30 focus:border-pink-600/30 transition-all"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-2 ml-1"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || name.trim().length < 2}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-600/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-[10px] text-zinc-700 text-center mt-6 leading-relaxed">
            Your name is visible to the site administrator only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
