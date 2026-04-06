/**
 * Next.js Instrumentation Hook
 * Runs once on server startup — registers cron-like background jobs:
 *   1. Every 5 min: expire TEMPORARY slot reservations past their hold window
 *   2. Every hour: mark permits whose expiryDate has passed as EXPIRED
 *      and send expiry reminder emails 30 days before expiry
 *
 * Uses node's setInterval — works in both dev and production (standalone output).
 * NOTE: In a multi-instance / serverless deployment switch to an external cron
 * service (Vercel Cron, Supabase pg_cron, etc.).
 */

export async function register() {
  // Only run in the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Initialize Sentry error tracking
  try {
    const { initSentry } = await import("@/lib/monitoring");
    await initSentry();
  } catch {
    // Sentry optional — continue without it
  }

  // Lazy-import heavy modules to avoid bundling them into the edge worker
  const { default: prisma } = await import("@/lib/prisma");
  const { sendPermitExpiryReminderEmail } = await import("@/lib/email");

  // ─────────────────────────────────────────────────────────────────────────
  // Job 1 — Temporary hold expiry (every 5 minutes)
  // ─────────────────────────────────────────────────────────────────────────
  const expireTemporaryHolds = async () => {
    try {
      const expired = await prisma.slotReservation.findMany({
        where: {
          status: "TEMPORARY",
          temporaryHoldExpiry: { lt: new Date() },
        },
        select: { id: true, timeSlotId: true },
      });

      if (expired.length === 0) return;

      await prisma.$transaction(async (tx) => {
        for (const r of expired) {
          await tx.slotReservation.update({
            where: { id: r.id },
            data: { status: "CANCELLED", cancelledAt: new Date() },
          });
          await tx.timeSlot.update({
            where: { id: r.timeSlotId },
            data: { currentCount: { decrement: 1 } },
          });
        }
      });

      console.log(
        `[Cron] Expired ${expired.length} temporary slot reservation(s)`
      );
    } catch (err) {
      console.error("[Cron] Temporary hold expiry error:", err);
    }
  };

  // Run immediately + every 5 min
  expireTemporaryHolds();
  setInterval(expireTemporaryHolds, 5 * 60 * 1000);

  // ─────────────────────────────────────────────────────────────────────────
  // Job 2 — Permit auto-expiry + reminder emails (every hour)
  // ─────────────────────────────────────────────────────────────────────────
  const processPermitExpiry = async () => {
    try {
      const now = new Date();

      // Auto-expire overdue ACTIVE permits
      const expired = await prisma.permit.updateMany({
        where: {
          status: "ACTIVE",
          expiryDate: { lt: now },
        },
        data: { status: "EXPIRED" },
      });

      if (expired.count > 0) {
        console.log(`[Cron] Marked ${expired.count} permit(s) as EXPIRED`);
      }

      // Send reminder emails to permits expiring in the next 30 days
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringSoon = await prisma.permit.findMany({
        where: {
          status: "ACTIVE",
          expiryDate: { gte: now, lte: in30Days },
        },
        include: {
          application: {
            include: {
              applicant: {
                select: { email: true, firstName: true, lastName: true },
              },
            },
          },
        },
      });

      for (const permit of expiringSoon) {
        const applicant = permit.application.applicant;
        const daysLeft = Math.ceil(
          (permit.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send reminder at 30, 14, and 7 days remaining
        if (![30, 14, 7].includes(daysLeft)) continue;        try {
          await sendPermitExpiryReminderEmail(
            applicant.email,
            `${applicant.firstName} ${applicant.lastName}`,
            permit.permitNumber,
            permit.businessName,
            permit.expiryDate.toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          );
          console.log(
            `[Cron] Sent expiry reminder to ${applicant.email} — ${daysLeft} day(s) remaining`
          );
        } catch (emailErr) {
          console.error(
            `[Cron] Failed to send expiry reminder to ${applicant.email}:`,
            emailErr
          );
        }
      }
    } catch (err) {
      console.error("[Cron] Permit expiry job error:", err);
    }
  };

  // Run immediately + every hour
  processPermitExpiry();
  setInterval(processPermitExpiry, 60 * 60 * 1000);

  console.log("[Instrumentation] Background cron jobs registered");
}
