"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Wallet, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { cn, formatAddress } from "@/lib/utils";

interface WalletButtonProps {
  variant?: "default" | "compact";
  className?: string;
}

export function WalletButton({ variant = "default", className }: WalletButtonProps) {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect, connecting } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  if (publicKey) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg",
            "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
            "hover:bg-emerald-500/20 transition-all duration-200",
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-mono">{formatAddress(publicKey.toBase58())}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </motion.button>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl z-50"
          >
            <button
              onClick={() => { disconnect(); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-zinc-300 hover:text-red-400 hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => setVisible(true)}
      disabled={connecting}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm",
        "bg-zinc-900 border border-zinc-700 text-zinc-300",
        "hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5",
        "transition-all duration-200 disabled:opacity-50",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Wallet className="w-4 h-4" />
      {connecting ? "Connecting…" : "Connect Wallet"}
    </motion.button>
  );
}
