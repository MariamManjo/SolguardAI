"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";

export function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6"
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-bold text-zinc-100">
            SolGuard <span className="text-emerald-400">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            How it works
          </a>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <WalletButton variant="compact" />
          <Link href="/dashboard">
            <motion.button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Launch App
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
