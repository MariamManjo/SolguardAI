"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, ExternalLink } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Token Security Scanner" }: NavbarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-black/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold text-zinc-100">{title}</h1>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-zinc-500">Mainnet</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-4 h-4" />
        </motion.button>

        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Landing
        </Link>

        <WalletButton />
      </div>
    </header>
  );
}
