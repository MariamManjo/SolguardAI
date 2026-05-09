import { NextRequest, NextResponse } from "next/server";
import { analyzeToken } from "@/lib/solanaAnalysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address?.trim()) {
    return NextResponse.json(
      { error: "Missing ?address= parameter" },
      { status: 400 }
    );
  }

  try {
    const report = await analyzeToken(address.trim());
    return NextResponse.json(report);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Analysis failed. Try again.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
