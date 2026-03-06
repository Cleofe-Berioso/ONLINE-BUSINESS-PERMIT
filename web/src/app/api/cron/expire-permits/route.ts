/**
 * Cron Job: Expire Overdue Permits
 * Run nightly (e.g. 00:05 daily) to mark ACTIVE permits past their expiry as EXPIRED.
 *
 * Invoke via:
 *   - Vercel Cron:  cron schedule "5 0 * * *" → GET /api/cron/expire-permits
 *   - node-cron in instrumentation.ts
 *   - Manual: curl -H "x-cron-secret: $CRON_SECRET" /api/cron/expire-permits
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { captureException } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Protect with a shared secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("x-cron-secret");
    if (authHeader !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const now = new Date();

    // Find all ACTIVE permits that have passed their expiry date
    const expired = await prisma.permit.findMany({
      where: {
        status: "ACTIVE",
        expiryDate: { lt: now },
      },
      select: {
        id: true,
        permitNumber: true,
        expiryDate: true,
        application: {
          select: {
            applicantId: true,
            businessName: true,
          },
        },
      },
    });

    if (expired.length === 0) {
      logger.debug("[cron/expire-permits] No permits to expire");
      return NextResponse.json({ expired: 0, message: "No permits to expire" });
    }

    logger.info(`[cron/expire-permits] Expiring ${expired.length} permits`);

    // Mark all as EXPIRED in a single updateMany
    const result = await prisma.permit.updateMany({
      where: {
        id: { in: expired.map((p) => p.id) },
        status: "ACTIVE", // double-check to avoid race condition
      },
      data: { status: "EXPIRED" },
    });

    // Log activity for each expired permit
    await prisma.activityLog.createMany({
      data: expired.map((p) => ({
        action: "PERMIT_EXPIRED",
        entity: "Permit",
        entityId: p.id,
        userId: p.application.applicantId,
        details: {
          permitNumber: p.permitNumber,
          expiredAt: now.toISOString(),
          businessName: p.application.businessName,
        },
      })),
      skipDuplicates: true,
    });

    logger.info(`[cron/expire-permits] Successfully expired ${result.count} permit(s)`);
    return NextResponse.json({
      expired: result.count,
      message: `Expired ${result.count} permit(s)`,
      permits: expired.map((p) => ({
        id: p.id,
        permitNumber: p.permitNumber,
        expiryDate: p.expiryDate,
      })),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    captureException(error, { route: "GET /api/cron/expire-permits" });
    logger.error("[cron/expire-permits] Error:", error);
    return NextResponse.json({ error: "Failed to expire permits" }, { status: 500 });
  }
}
