"use client";

import Link from "next/link";
import { Shield, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-bold text-sm text-zinc-400">
              SolGuard <span className="text-emerald-400">AI</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Dashboard
            </Link>
            <a href="#features" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              How it works
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a href="#" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
          <p className="text-xs text-zinc-700">
            © 2024 SolGuard AI · Built for Solana Hackathon · Demo MVP
          </p>
          <p className="text-xs text-zinc-800 mt-1">
            This is a demonstration product. Do not use as sole source of investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
