import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolGuard AI — AI Security Layer for Solana",
  description:
    "Detect scam tokens, suspicious wallets, and risky on-chain activity using AI.",
  keywords: ["Solana", "AI", "security", "token analysis", "scam detection"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-black text-zinc-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
