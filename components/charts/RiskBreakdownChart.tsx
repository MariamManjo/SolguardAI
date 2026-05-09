"use client";

import { motion } from "framer-motion";
import { RiskBreakdown } from "@/types";
import { cn } from "@/lib/utils";

interface RiskBreakdownChartProps {
  data: RiskBreakdown[];
}

function getBarColor(score: number) {
  if (score <= 25) return "bg-emerald-500";
  if (score <= 50) return "bg-yellow-500";
  if (score <= 75) return "bg-orange-500";
  return "bg-red-500";
}

function getLabelColor(label: string) {
  switch (label) {
    case "Critical": return "text-red-400";
    case "High": return "text-orange-400";
    case "Medium": return "text-yellow-400";
    case "Low": return "text-emerald-400";
    case "Safe": return "text-emerald-400";
    default: return "text-zinc-400";
  }
}

export function RiskBreakdownChart({ data }: RiskBreakdownChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5"
    >
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">Risk Breakdown</h3>
      <div className="space-y-3.5">
        {data.map((item, i) => (
          <div key={item.category}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-400">{item.category}</span>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium", getLabelColor(item.label))}>
                  {item.label}
                </span>
                <span className="text-xs text-zinc-500 font-mono">{item.score}</span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", getBarColor(item.score))}
                initial={{ width: 0 }}
                animate={{ width: `${(item.score / item.max) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
