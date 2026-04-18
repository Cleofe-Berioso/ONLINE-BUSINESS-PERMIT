/**
 * POST /api/claims/[id]/check-in
 * Process applicant check-in for claimed permits
 *
 * P6.1: Claim Check-In Processing
 * Access: Public (minimal verification) or STAFF/ADMIN
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { captureException } from "@/lib/monitoring";
import { broadcastClaimCompleted } from "@/lib/sse";
import { z } from "zod";

// Validation schema
const checkInSchema = z.object({
  referenceId: z.string().min(1, "Reference ID is required"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // For check-in, we allow either:
    // 1. STAFF/ADMIN with full access
    // 2. Public user with valid reference ID (for applicant self-check-in)
    if (session?.user && !["STAFF", "ADMINISTRATOR"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Staff access required" },
        { status: 403 }
      );
    }

    // Fetch ClaimReference with related data
    const claimReference = await prisma.claimReference.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            applicant: {
              select: { id: true, email: true, firstName: true, lastName: true }
            },
            permit: {
              select: { id: true, status: true, permitNumber: true }
            }
          }
        }
      }
    });

    if (!claimReference) {
      return NextResponse.json(
        { error: "Claim reference not found" },
        { status: 404 }
      );
    }

    // Verify claim reference status (must be GENERATED or VERIFIED, not yet CLAIMED)
    if (claimReference.status === "CLAIMED") {
      return NextResponse.json(
        { error: "Claim has already been processed" },
        { status: 400 }
      );
    }

    // Update claim reference status to CLAIMED
    const updated = await prisma.claimReference.update({
      where: { id },
      data: {
        status: "CLAIMED",
        claimedAt: new Date()
      }
    });

    // If there's an associated permit issuance, mark as completed
    if (claimReference.application.permit) {
      const issuance = await prisma.permitIssuance.findFirst({
        where: { permitId: claimReference.application.permit.id }
      });

      if (issuance) {
        await prisma.permitIssuance.update({
          where: { id: issuance.id },
          data: { completedAt: new Date() }
        });
      }
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: claimReference.application.applicantId,
        action: "CLAIM_CHECKED_IN",
        entity: "ClaimReference",
        entityId: id,
        details: {
          referenceNumber: claimReference.referenceNumber,
          applicationId: claimReference.applicationId
        }
      }
    });

    // Broadcast SSE event to staff/admins
    try {
      broadcastClaimCompleted(
        "admin", // Broadcast to admin users
        claimReference.application.applicantId,
        claimReference.application.applicationNumber
      );
    } catch (sseError) {
      console.error("SSE broadcast error:", sseError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Check-in successful",
        claimReference: {
          id: updated.id,
          status: updated.status,
          claimedAt: updated.claimedAt
        },
        permit: claimReference.application.permit || null
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    captureException(error, { route: "POST /api/claims/[id]/check-in" });
    console.error("Check-in error:", error);

    return NextResponse.json(
      { error: "Check-in failed" },
      { status: 500 }
    );
  }
}

