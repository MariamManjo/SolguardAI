import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import type {
  AnalysisReport,
  HolderData,
  TransactionPoint,
  RiskBreakdown,
  SuspiciousSignal,
  WalletActivity,
  RiskLevel,
} from "@/types";

const RPC_ENDPOINT =
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";

function getConnection() {
  return new Connection(RPC_ENDPOINT, { commitment: "confirmed" });
}

// ─── External API types ──────────────────────────────────────────────────────

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

interface DexPair {
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  volume: { h24: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  priceChange?: { h24?: number };
  txns?: { h24: { buys: number; sells: number } };
}

// ─── Data fetchers ───────────────────────────────────────────────────────────

async function fetchJupiterToken(address: string): Promise<JupiterToken | null> {
  try {
    const res = await fetch(`https://tokens.jup.ag/token/${address}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchDexScreener(address: string): Promise<DexPair | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.pairs?.length) return null;
    // Pick the pair with highest liquidity
    return (data.pairs as DexPair[]).sort(
      (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
    )[0];
  } catch {
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

function formatSupply(total: number): string {
  if (total >= 1_000_000_000_000) return `${(total / 1_000_000_000_000).toFixed(2)}T`;
  if (total >= 1_000_000_000) return `${(total / 1_000_000_000).toFixed(2)}B`;
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(2)}M`;
  return total.toLocaleString();
}

function groupSigsByDay(
  sigs: Array<{ blockTime?: number | null }>
): TransactionPoint[] {
  const nowSec = Date.now() / 1000;
  const map: Record<string, number> = {};

  for (let i = 9; i >= 0; i--) {
    const key = new Date((nowSec - i * 86400) * 1000).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    );
    map[key] = 0;
  }

  for (const s of sigs) {
    if (!s.blockTime) continue;
    const key = new Date(s.blockTime * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (key in map) map[key]++;
  }

  return Object.entries(map).map(([date, transactions]) => ({
    date,
    transactions,
    volume: transactions * 120,
  }));
}

// ─── Risk engine ─────────────────────────────────────────────────────────────

interface RiskSignals {
  hasMintAuth: boolean;
  hasFreezeAuth: boolean;
  liquidityUSD: number;
  topHolderPct: number;
  top3HolderPct: number;
  ageInDays: number | null;
  notInJupiter: boolean;
  priceChange24h: number | null;
  name: string;
  symbol: string;
}

function computeRisk(s: RiskSignals): {
  score: number;
  breakdown: RiskBreakdown[];
  signals: SuspiciousSignal[];
} {
  let score = 0;
  const signals: SuspiciousSignal[] = [];

  if (s.hasMintAuth) {
    score += 30;
    signals.push({
      id: "mint-auth",
      type: "danger",
      title: "Active Mint Authority",
      description:
        "Mint authority is not renounced. The deployer can print unlimited tokens at any time — a critical rug-pull vector.",
      severity: "CRITICAL",
    });
  }

  if (s.hasFreezeAuth) {
    score += 25;
    signals.push({
      id: "freeze-auth",
      type: "danger",
      title: "Freeze Authority Enabled",
      description:
        "An active freeze authority can lock any holder's token account, preventing selling.",
      severity: "CRITICAL",
    });
  }

  if (s.topHolderPct > 30) {
    score += 15;
    signals.push({
      id: "top-holder",
      type: "danger",
      title: `Top Holder Controls ${s.topHolderPct.toFixed(1)}% of Supply`,
      description:
        "A single wallet holds a dominant share. One sell-off could collapse the price.",
      severity: "HIGH",
    });
  }

  if (s.top3HolderPct > 50) {
    score += 12;
    signals.push({
      id: "concentration",
      type: "warning",
      title: `Top 3 Wallets: ${s.top3HolderPct.toFixed(1)}% of Supply`,
      description:
        "High concentration among a small group of wallets. Coordinated dumping is a serious risk.",
      severity: "HIGH",
    });
  }

  if (s.liquidityUSD === 0) {
    score += 18;
    signals.push({
      id: "no-liq",
      type: "danger",
      title: "No Liquidity Pool Detected",
      description:
        "No active DEX pool found. Token may be untradeable or not yet launched.",
      severity: "HIGH",
    });
  } else if (s.liquidityUSD < 10_000) {
    score += 18;
    signals.push({
      id: "low-liq",
      type: "danger",
      title: `Critically Low Liquidity ($${s.liquidityUSD.toLocaleString()})`,
      description:
        "Liquidity is far below safe thresholds. Even a small sell order will cause massive price impact.",
      severity: "HIGH",
    });
  } else if (s.liquidityUSD < 100_000) {
    score += 8;
    signals.push({
      id: "thin-liq",
      type: "warning",
      title: `Low Liquidity ($${(s.liquidityUSD / 1000).toFixed(1)}K)`,
      description:
        "Liquidity is below recommended levels for safe trading.",
      severity: "MEDIUM",
    });
  }

  if (s.ageInDays !== null && s.ageInDays < 7) {
    score += 18;
    signals.push({
      id: "very-new",
      type: "warning",
      title: `Token is Only ${s.ageInDays} Day(s) Old`,
      description:
        "Extremely new tokens carry high exit scam risk with no established history.",
      severity: "HIGH",
    });
  } else if (s.ageInDays !== null && s.ageInDays < 30) {
    score += 8;
    signals.push({
      id: "new",
      type: "warning",
      title: `New Token (${s.ageInDays} Days Old)`,
      description:
        "Token has less than 30 days of on-chain history.",
      severity: "MEDIUM",
    });
  }

  if (s.notInJupiter) {
    score += 8;
    signals.push({
      id: "unverified",
      type: "warning",
      title: "Not in Jupiter Verified Token List",
      description:
        "Token is not listed on Jupiter's verified registry, indicating limited community vetting.",
      severity: "MEDIUM",
    });
  }

  if (s.priceChange24h !== null && s.priceChange24h < -50) {
    score += 10;
    signals.push({
      id: "price-crash",
      type: "danger",
      title: `Price Down ${Math.abs(s.priceChange24h).toFixed(1)}% in 24h`,
      description:
        "Severe price crash may indicate an ongoing dump or coordinated exit.",
      severity: "HIGH",
    });
  }

  score = Math.min(100, Math.round(score));

  const breakdown: RiskBreakdown[] = [
    {
      category: "Mint Authority",
      score: s.hasMintAuth ? 90 : 5,
      max: 100,
      label: s.hasMintAuth ? "Critical" : "Safe",
    },
    {
      category: "Freeze Authority",
      score: s.hasFreezeAuth ? 80 : 5,
      max: 100,
      label: s.hasFreezeAuth ? "High" : "Safe",
    },
    {
      category: "Supply Concentration",
      score: Math.min(100, Math.round(s.top3HolderPct)),
      max: 100,
      label:
        s.top3HolderPct > 70
          ? "Critical"
          : s.top3HolderPct > 50
          ? "High"
          : s.top3HolderPct > 30
          ? "Medium"
          : "Low",
    },
    {
      category: "Liquidity Risk",
      score:
        s.liquidityUSD === 0
          ? 80
          : s.liquidityUSD < 10_000
          ? 70
          : s.liquidityUSD < 100_000
          ? 40
          : 10,
      max: 100,
      label:
        s.liquidityUSD === 0
          ? "Critical"
          : s.liquidityUSD < 10_000
          ? "High"
          : s.liquidityUSD < 100_000
          ? "Medium"
          : "Low",
    },
    {
      category: "Token Age",
      score:
        s.ageInDays === null
          ? 50
          : s.ageInDays < 7
          ? 80
          : s.ageInDays < 30
          ? 50
          : s.ageInDays < 90
          ? 20
          : 5,
      max: 100,
      label:
        s.ageInDays === null
          ? "Unknown"
          : s.ageInDays < 7
          ? "High"
          : s.ageInDays < 30
          ? "Medium"
          : "Low",
    },
    {
      category: "Verification",
      score: s.notInJupiter ? 40 : 5,
      max: 100,
      label: s.notInJupiter ? "Unverified" : "Verified",
    },
  ];

  return { score, breakdown, signals };
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

function getStatus(score: number): string {
  if (score >= 75) return "HIGH RISK";
  if (score >= 50) return "MEDIUM RISK";
  if (score >= 25) return "LOW RISK";
  return "SAFE";
}

function buildAISummary(s: RiskSignals, score: number): string {
  const level = getRiskLevel(score);
  const concerns: string[] = [];

  if (s.hasMintAuth) concerns.push("an active unconstrained mint authority");
  if (s.hasFreezeAuth) concerns.push("freeze authority over all token accounts");
  if (s.topHolderPct > 30)
    concerns.push(`a single wallet controlling ${s.topHolderPct.toFixed(1)}% of supply`);
  if (s.liquidityUSD < 10_000 && s.liquidityUSD >= 0)
    concerns.push("critically thin liquidity");
  if (s.ageInDays !== null && s.ageInDays < 30)
    concerns.push(`being only ${s.ageInDays} days old`);
  if (s.notInJupiter) concerns.push("absence from Jupiter's verified list");

  if (concerns.length === 0) {
    return `${s.name} (${s.symbol}) shows strong security characteristics. No critical risk signals were detected. Mint and freeze authorities appear renounced, supply distribution looks healthy, and liquidity is adequate. Always conduct your own research.`;
  }

  const concatConcerns = concerns.slice(0, 3).join(", ");
  return `${s.name} (${s.symbol}) exhibits ${level === "HIGH" ? "multiple high-risk" : "moderate"} characteristics, including ${concatConcerns}. ${level === "HIGH" ? "Extreme caution is strongly advised before interacting with this token." : "Conduct thorough due diligence before investing."}`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function analyzeToken(addressString: string): Promise<AnalysisReport> {
  let mintPubkey: PublicKey;
  try {
    mintPubkey = new PublicKey(addressString);
  } catch {
    throw new Error("Invalid Solana address format.");
  }

  const connection = getConnection();

  // Fetch everything in parallel
  const [mintResult, largestResult, sigsResult, jupResult, dexResult] =
    await Promise.allSettled([
      getMint(connection, mintPubkey),
      connection.getTokenLargestAccounts(mintPubkey),
      connection.getSignaturesForAddress(mintPubkey, { limit: 300 }),
      fetchJupiterToken(addressString),
      fetchDexScreener(addressString),
    ]);

  if (mintResult.status === "rejected") {
    throw new Error(
      "Token not found on Solana mainnet. Check the address and try again."
    );
  }

  const mint = mintResult.value;
  const largest =
    largestResult.status === "fulfilled" ? largestResult.value : null;
  const sigs =
    sigsResult.status === "fulfilled" ? sigsResult.value : [];
  const jupToken =
    jupResult.status === "fulfilled" ? jupResult.value : null;
  const dex = dexResult.status === "fulfilled" ? dexResult.value : null;

  // ── Token metadata ──
  const name =
    jupToken?.name ?? dex?.baseToken?.name ?? "Unknown Token";
  const symbol =
    jupToken?.symbol ?? dex?.baseToken?.symbol ?? "???";
  const decimals = mint.decimals;
  const totalSupply = Number(mint.supply) / Math.pow(10, decimals);
  const mintAuthority = mint.mintAuthority?.toBase58() ?? null;
  const freezeAuthority = mint.freezeAuthority?.toBase58() ?? null;

  // ── Holder distribution ──
  const topAccounts = largest?.value ?? [];
  let holderData: HolderData[] = [];
  let topHolderPct = 0;
  let top3HolderPct = 0;

  if (topAccounts.length > 0 && totalSupply > 0) {
    const sliced = topAccounts.slice(0, 5);
    const topSum = sliced.reduce((s, a) => s + (a.uiAmount ?? 0), 0);
    const otherAmt = Math.max(0, totalSupply - topSum);

    holderData = sliced.map((acc, i) => {
      const pct = ((acc.uiAmount ?? 0) / totalSupply) * 100;
      return {
        name:
          i === 0
            ? "Top Holder"
            : i === 1
            ? "Holder #2"
            : i === 2
            ? "Holder #3"
            : `Wallet #${i + 1}`,
        value: acc.uiAmount ?? 0,
        percentage: Math.round(pct * 10) / 10,
      };
    });

    if (otherAmt > 0) {
      holderData.push({
        name: "Others",
        value: otherAmt,
        percentage: Math.round((otherAmt / totalSupply) * 1000) / 10,
      });
    }

    topHolderPct = holderData[0]?.percentage ?? 0;
    top3HolderPct = holderData
      .slice(0, 3)
      .reduce((s, h) => s + h.percentage, 0);
  }

  // ── Wallet activity ──
  const walletActivity: WalletActivity[] = topAccounts
    .slice(0, 4)
    .map((acc, i) => {
      const pct =
        totalSupply > 0
          ? ((acc.uiAmount ?? 0) / totalSupply) * 100
          : 0;
      const suspicious = pct > 20;
      return {
        address: shortAddr(acc.address.toBase58()),
        label:
          i === 0 && pct > 30
            ? "Dev Wallet?"
            : i === 0
            ? "Top Holder"
            : `Wallet #${i + 1}`,
        percentage: Math.round(pct * 10) / 10,
        transactions: 0, // would require extra per-account RPC calls
        firstSeen: "On-chain",
        lastSeen: "On-chain",
        isSuspicious: suspicious,
      };
    });

  // ── Transaction history chart ──
  const transactionActivity = groupSigsByDay(sigs);

  // ── DEX data ──
  const liquidityUSD = dex?.liquidity?.usd ?? 0;
  const marketCapUSD = dex?.marketCap ?? dex?.fdv ?? 0;
  const priceChange24h = dex?.priceChange?.h24 ?? null;

  // ── Token age ──
  let ageInDays: number | null = null;
  if (dex?.pairCreatedAt) {
    ageInDays = Math.floor((Date.now() - dex.pairCreatedAt) / 86_400_000);
  } else if (sigs.length > 0) {
    const oldest = sigs[sigs.length - 1];
    if (oldest.blockTime) {
      ageInDays = Math.floor(
        (Date.now() / 1000 - oldest.blockTime) / 86400
      );
    }
  }

  const createdAt =
    ageInDays !== null
      ? new Date(Date.now() - ageInDays * 86_400_000).toISOString()
      : new Date().toISOString();

  // ── Risk scoring ──
  const riskSignals: RiskSignals = {
    hasMintAuth: !!mintAuthority,
    hasFreezeAuth: !!freezeAuthority,
    liquidityUSD,
    topHolderPct,
    top3HolderPct,
    ageInDays,
    notInJupiter: !jupToken,
    priceChange24h,
    name,
    symbol,
  };

  const { score, breakdown, signals } = computeRisk(riskSignals);

  return {
    tokenAddress: addressString,
    riskScore: score,
    riskLevel: getRiskLevel(score),
    status: getStatus(score),
    aiSummary: buildAISummary(riskSignals, score),
    tokenMetadata: {
      name,
      symbol,
      address: addressString,
      decimals,
      supply: formatSupply(totalSupply),
      mintAuthority,
      freezeAuthority,
      updateAuthority: null,
      createdAt,
      network: "mainnet",
    },
    holderDistribution:
      holderData.length > 0
        ? holderData
        : [{ name: "Data Unavailable", value: 100, percentage: 100 }],
    transactionActivity,
    riskBreakdown: breakdown,
    suspiciousSignals: signals,
    walletActivity,
    liquidityUSD,
    marketCapUSD,
    analyzedAt: new Date().toISOString(),
  };
}
