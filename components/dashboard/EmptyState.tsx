"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, Activity } from "lucide-react";

const FEATURES = [
  { icon: Shield, title: "Rug Pull Detection", desc: "AI identifies coordinated dump patterns" },
  { icon: Lock, title: "Authority Analysis", desc: "Detects active mint & freeze authorities" },
  { icon: Activity, title: "Wallet Tracking", desc: "Tracks suspicious wallet clusters" },
  { icon: Zap, title: "Instant Reports", desc: "Full analysis in under 5 seconds" },
];

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Animated shield */}
      <div className="relative mb-8">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 0px rgba(16,185,129,0)",
              "0 0 30px rgba(16,185,129,0.15)",
              "0 0 0px rgba(16,185,129,0)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Shield className="w-9 h-9 text-zinc-700" />
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-2.5 h-2.5 text-emerald-400" />
        </motion.div>
      </div>

      <h3 className="text-lg font-semibold text-zinc-200 mb-2">
        Ready to Analyze
      </h3>
      <p className="text-sm text-zinc-500 max-w-xs mb-10">
        Paste a Solana token address or wallet above to generate an AI-powered security report.
      </p>

      {/* Feature grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/60 hover:border-zinc-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <f.icon className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs font-medium text-zinc-300">{f.title}</p>
            <p className="text-xs text-zinc-600 text-center leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
