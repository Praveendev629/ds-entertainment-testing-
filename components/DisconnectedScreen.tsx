"use client";

import { motion } from "framer-motion";
import { ShieldOff, RefreshCw } from "lucide-react";

interface Props {
  type: "kicked" | "blocked";
}

export default function DisconnectedScreen({ type }: Props) {
  const isKicked = type === "kicked";

  const handleReload = () => {
    try { localStorage.clear(); } catch {}
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-4 text-center"
      >
        <div className="bg-[#0a0a0a] border border-pink-600/20 rounded-3xl p-8 shadow-2xl shadow-pink-600/5">
          <div className="w-20 h-20 bg-pink-600/10 border border-pink-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldOff className="w-10 h-10 text-pink-500" />
          </div>

          <h1 className="text-xl font-bold text-white mb-2">
            {isKicked ? "Disconnected" : "Access Blocked"}
          </h1>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            {isKicked
              ? "You have been disconnected by the administrator. Please try again later."
              : "Your access has been blocked by the administrator. Contact support if you believe this is an error."}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReload}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-600/30 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
