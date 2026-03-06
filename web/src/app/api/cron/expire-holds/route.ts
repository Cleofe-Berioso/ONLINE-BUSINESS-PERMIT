/**
 * Cron Job: Expire Temporary Schedule Holds
 * Run every 5 minutes to release stale TEMPORARY reservations.
 *
 * Invoke via:
 *   - Vercel Cron:  cron schedule "*/5 * * * *" → GET /api/cron/expire-holds
 *   - node-cron in instrumentation.ts
 *   - Manual: curl -H "x-cron-secret: $CRON_SECRET" /api/cron/expire-holds
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { captureException } from "@/lib/monitoring";
import { cacheDelPattern } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Protect with a shared secret (set CRON_SECRET in .env)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("x-cron-secret");
    if (authHeader !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const now = new Date();

    // Find all expired temporary holds
    const expired = await prisma.slotReservation.findMany({
      where: {
        status: "TEMPORARY",
        temporaryHoldExpiry: { lt: now },
      },
      select: { id: true, timeSlotId: true },
    });

    if (expired.length === 0) {
      logger.debug("[cron/expire-holds] No expired temporary holds found");
      return NextResponse.json({ expired: 0, message: "No expired holds" });
    }

    logger.info(`[cron/expire-holds] Expiring ${expired.length} temporary holds`);

    // Cancel each expired reservation and decrement slot count in a transaction
    const results = await prisma.$transaction(
      expired.map((r) =>
        prisma.slotReservation.update({
          where: { id: r.id },
          data: { status: "CANCELLED" },
        })
      )
    );

    // Decrement currentCount for affected time slots
    const slotIds = [...new Set(expired.map((r) => r.timeSlotId))];
    await Promise.all(
      slotIds.map((slotId) =>
        prisma.timeSlot.update({
          where: { id: slotId },
          data: { currentCount: { decrement: 1 } },
        }).catch(() => {
          // Ignore if count is already 0
        })
      )
    );

    // Invalidate schedule cache so fresh availability is shown
    await cacheDelPattern("schedule:slots:*");

    logger.info(`[cron/expire-holds] Successfully expired ${results.length} holds`);
    return NextResponse.json({
      expired: results.length,
      message: `Expired ${results.length} temporary hold(s)`,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    captureException(error, { route: "GET /api/cron/expire-holds" });
    logger.error("[cron/expire-holds] Error:", error);
    return NextResponse.json({ error: "Failed to expire holds" }, { status: 500 });
  }
}
