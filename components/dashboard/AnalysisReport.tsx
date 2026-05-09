"use client";

import { motion } from "framer-motion";
import { RefreshCw, Download, Clock } from "lucide-react";
import { AnalysisReport as Report } from "@/types";
import { RiskCard } from "./RiskCard";
import { AIExplanationPanel } from "./AIExplanationPanel";
import {
  TokenMetadataCard,
  SuspiciousSignalsCard,
  WalletActivityCard,
} from "./AnalysisCard";
import { HolderDistributionChart } from "@/components/charts/HolderDistributionChart";
import { TransactionActivityChart } from "@/components/charts/TransactionActivityChart";
import { RiskBreakdownChart } from "@/components/charts/RiskBreakdownChart";
import { formatAddress } from "@/lib/utils";

interface AnalysisReportProps {
  report: Report;
  onReset: () => void;
}

export function AnalysisReport({ report, onReset }: AnalysisReportProps) {
  const analyzedTime = new Date(report.analyzedAt).toLocaleTimeString();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Report header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">Analysis for</p>
          <p className="text-sm font-mono text-zinc-300">{formatAddress(report.tokenAddress)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600">
            <Clock className="w-3 h-3" />
            {analyzedTime}
          </div>
          <motion.button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw className="w-3 h-3" />
            New Scan
          </motion.button>
        </div>
      </div>

      {/* Top row: Risk + AI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <RiskCard
            score={report.riskScore}
            level={report.riskLevel}
            status={report.status}
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <AIExplanationPanel summary={report.aiSummary} />
          <TokenMetadataCard report={report} />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HolderDistributionChart data={report.holderDistribution} />
        <TransactionActivityChart data={report.transactionActivity} />
      </div>

      {/* Risk breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskBreakdownChart data={report.riskBreakdown} />
        <WalletActivityCard report={report} />
      </div>

      {/* Signals */}
      <SuspiciousSignalsCard report={report} />
    </motion.div>
  );
}
