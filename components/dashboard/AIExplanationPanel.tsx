"use client";

import { motion } from "framer-motion";
import { Sparkles, Bot } from "lucide-react";

interface AIExplanationPanelProps {
  summary: string;
}

export function AIExplanationPanel({ summary }: AIExplanationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">AI Security Analysis</h3>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">AI Generated</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-emerald-500/60 to-transparent" />
        <p className="pl-4 text-sm text-zinc-400 leading-relaxed">{summary}</p>
      </div>
    </motion.div>
  );
}
