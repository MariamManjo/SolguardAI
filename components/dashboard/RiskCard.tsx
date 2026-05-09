"use client";

import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { RiskLevel } from "@/types";
import { cn, getRiskBadgeClass } from "@/lib/utils";

interface RiskCardProps {
  score: number;
  level: RiskLevel;
  status: string;
}

function RiskIcon({ level }: { level: RiskLevel }) {
  const cls = "w-8 h-8";
  switch (level) {
    case "LOW": return <ShieldCheck className={cn(cls, "text-emerald-400")} />;
    case "MEDIUM": return <Shield className={cn(cls, "text-yellow-400")} />;
    case "HIGH": return <ShieldAlert className={cn(cls, "text-orange-400")} />;
    case "CRITICAL": return <ShieldX className={cn(cls, "text-red-400")} />;
  }
}

function getScoreColor(score: number) {
  if (score <= 25) return { text: "text-emerald-400", ring: "ring-emerald-500/30", glow: "shadow-emerald-500/20 shadow-2xl" };
  if (score <= 50) return { text: "text-yellow-400", ring: "ring-yellow-500/30", glow: "shadow-yellow-500/20 shadow-2xl" };
  if (score <= 75) return { text: "text-orange-400", ring: "ring-orange-500/30", glow: "shadow-orange-500/20 shadow-2xl" };
  return { text: "text-red-400", ring: "ring-red-500/30", glow: "shadow-red-500/20 shadow-2xl" };
}

const CIRCUMFERENCE = 2 * Math.PI * 54;

export function RiskCard({ score, level, status }: RiskCardProps) {
  const colors = getScoreColor(score);
  const strokeDash = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  const strokeColor =
    level === "LOW" ? "#10b981" :
    level === "MEDIUM" ? "#eab308" :
    level === "HIGH" ? "#f97316" :
    "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-2xl",
        "bg-zinc-950 border border-zinc-800",
        colors.glow
      )}
    >
      {/* Circular progress */}
      <div className="relative mb-4">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#27272a" strokeWidth="8" />
          <motion.circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: strokeDash }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn("text-3xl font-bold tabular-nums", colors.text)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-zinc-500">/100</span>
        </div>
      </div>

      <RiskIcon level={level} />

      <div className="mt-3 text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Risk Score</p>
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", getRiskBadgeClass(level))}>
          {status}
        </span>
      </div>
    </motion.div>
  );
}
