import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, unknown> = {};

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    checks.database = { status: "error", error: String(err) };
  }

  const allOk = Object.values(checks).every(
    (c) => (c as { status: string }).status === "ok"
  );

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
