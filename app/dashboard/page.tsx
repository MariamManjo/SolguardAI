"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { AnalysisReport } from "@/components/dashboard/AnalysisReport";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useState } from "react";
import { Menu, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { report, step, stepLabel, progress, error, analyze, reset } = useAnalysis();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoading = step !== "idle" && step !== "complete";

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="relative">
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 lg:hidden z-10 text-zinc-400 hover:text-zinc-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="lg:pl-0 pl-12">
            <Navbar title="Token Security Scanner" />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Search */}
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-semibold text-zinc-200">Scan Token or Wallet</h2>
              </div>
              <SearchBar onAnalyze={analyze} isLoading={isLoading} />
            </div>

            {/* Error state */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
              >
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">Analysis Failed</p>
                  <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
                </div>
                <button
                  onClick={reset}
                  className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Dismiss
                </button>
              </motion.div>
            )}

            {/* Output */}
            {step === "idle" && !error && <EmptyState />}
            {isLoading && (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800/60">
                <LoadingState step={step} stepLabel={stepLabel} progress={progress} />
              </div>
            )}
            {step === "complete" && report && (
              <AnalysisReport report={report} onReset={reset} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
