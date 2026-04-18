/**
 * GET /api/claims/today
 * POST /api/claims/{id}/release
 * P6.0: Claim Processing
 *
 * Simplified to match actual Prisma schema
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { captureException } from "@/lib/monitoring";
import { sendClaimReleaseEmail } from "@/lib/email";
import { broadcastClaimReleased } from "@/lib/sse";
import { generateQrCode } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only STAFF can view today's claims
    if (!["STAFF", "ADMINISTRATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all reservations for today
    const claims = await prisma.slotReservation.findMany({
      where: {
        timeSlot: {
          schedule: {
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        },
        status: { in: ["CONFIRMED"] },
      },
      include: {
        timeSlot: { include: { schedule: true } },
        application: { include: { applicant: true } },
        user: true,
      },
      orderBy: { timeSlot: { startTime: "asc" } },
    });

    const formattedClaims = claims.map((claim) => ({
      id: claim.id,
      reservationId: claim.id,
      applicantName: `${claim.user.firstName} ${claim.user.lastName}`,
      businessName: claim.application.businessName,
      timeSlot: `${claim.timeSlot.startTime} - ${claim.timeSlot.endTime}`,
      status: claim.status,
    }));

    return NextResponse.json({
      claims: formattedClaims,
      total: claims.length,
      date: today.toISOString().split("T")[0],
    });
  } catch (error) {
    captureException(error, { route: "GET /api/claims/today" });
    console.error("List today's claims error:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

// Release permit and generate claim reference
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only STAFF can release (CRITICAL FIX #3: IDOR Prevention)
    if (!["STAFF", "ADMINISTRATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get("id");

    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    // Get reservation with check-in record
    const reservation = await prisma.slotReservation.findUnique({
      where: { id: reservationId },
      include: {
        application: { include: { applicant: true, permit: true } },
        checkIn: true,  // CRITICAL FIX #3: Load check-in record
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // CRITICAL FIX #3: Verify applicant was checked in and verified
    if (!reservation.checkIn || reservation.checkIn.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        {
          error: "Applicant not verified",
          message: "Applicant must complete check-in and ID verification before claim release",
        },
        { status: 400 }
      );
    }

    // Check if permit exists
    if (!reservation.application.permit) {
      return NextResponse.json(
        {
          error: "Permit not found",
          message: "Please ensure payment is complete and permit is generated",
        },
        { status: 400 }
      );
    }

    // Generate claim reference number
    const referenceNumber = `CLAIM-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // Generate QR code
    const qrCode = await generateQrCode(referenceNumber);

    // Create claim reference in transaction for atomicity
    const result = await prisma.$transaction(
      async (tx) => {
        // Create claim reference
        const claimReference = await tx.claimReference.create({
          data: {
            referenceNumber,
            applicationId: reservation.applicationId,
            generatedBy: session.user.id,
            applicantName: `${reservation.application.applicant.firstName} ${reservation.application.applicant.lastName}`,
            businessName: reservation.application.businessName,
            applicationStatus: reservation.application.status,
            status: "CLAIMED",  // Mark as CLAIMED
            claimedAt: new Date(),
          },
        });

        // Update reservation to mark it as claimed
        await tx.slotReservation.update({
          where: { id: reservationId },
          data: { claimId: claimReference.id },
        });

        // Update check-in record to mark as completed
        await tx.checkInRecord.update({
          where: { id: reservation.checkIn!.id },
          data: { verifiedAt: new Date() },
        });

        return claimReference;
      },
      { maxWait: 5000, timeout: 30000 }
    );

    // Log activity with comprehensive details
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "PERMIT_RELEASED",
        entity: "ClaimReference",
        entityId: result.id,
        details: {
          referenceNumber,
          permitNumber: reservation.application.permit.permitNumber,
          applicationId: reservation.applicationId,
          applicantId: reservation.application.applicantId,
          checkedInBy: reservation.checkIn.verifiedBy,
          verifiedAt: reservation.checkIn.verifiedAt,
          idType: reservation.checkIn.idType,
        },
      },
    });

    // Send email with reference number and QR code (non-blocking)
    try {
      await sendClaimReleaseEmail(
        reservation.application.applicant.email,
        {
          businessName: reservation.application.businessName,
          permitNumber: reservation.application.permit.permitNumber,
          referenceNumber,
          qrCode,
        }
      );
    } catch (error) {
      console.error("Failed to send claim release email:", error);
    }

    // Broadcast SSE event (non-blocking)
    try {
      await broadcastClaimReleased(
        reservation.application.applicantId,
        result.id,
        referenceNumber
      );
    } catch (error) {
      console.error("Failed to broadcast claim released event:", error);
    }

    return NextResponse.json(
      {
        claimReference: {
          id: result.id,
          referenceNumber,
          qrCode,
          businessName: result.businessName,
          permitNumber: reservation.application.permit.permitNumber,
        },
        message: "Permit released successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    captureException(error, { route: "POST /api/claims" });
    console.error("Claim release error:", error);
    return NextResponse.json(
      { error: "Failed to release permit" },
      { status: 500 }
    );
  }
}
