"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const SCANS = [
  { address: "7xKXtg...HkV", result: "HIGH RISK", type: "danger", time: "2s ago" },
  { address: "EPjFWdd...1v", result: "SAFE", type: "safe", time: "8s ago" },
  { address: "So11111...2A", result: "LOW RISK", type: "safe", time: "15s ago" },
  { address: "mSoLzYC...1P", result: "MEDIUM RISK", type: "warn", time: "23s ago" },
  { address: "DezXAZ8...u5", result: "HIGH RISK", type: "danger", time: "31s ago" },
];

export function SocialProof() {
  return (
    <section className="py-16 px-4 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Live Feed</p>
          <h2 className="text-2xl font-bold text-zinc-200">Recent Scans</h2>
        </motion.div>

        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-900/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-500">Real-time scan feed</span>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {SCANS.map((scan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {scan.type === "danger" ? (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  <span className="text-sm font-mono text-zinc-400">{scan.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      scan.type === "danger"
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : scan.type === "warn"
                        ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    }`}
                  >
                    {scan.result}
                  </span>
                  <span className="text-xs text-zinc-700 hidden sm:block">{scan.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
