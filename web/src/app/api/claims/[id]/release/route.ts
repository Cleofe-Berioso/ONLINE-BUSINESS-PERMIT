import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { broadcastNotification, sseBroadcaster, createSSEEvent } from "@/lib/sse";
import { captureException } from "@/lib/monitoring";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "APPLICANT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Find the claim reference
    const claimRef = await prisma.claimReference.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            permit: {
              include: { issuance: true },
            },
          },
        },
      },
    });

    if (!claimRef) {
      return NextResponse.json(
        { error: "Claim reference not found" },
        { status: 404 }
      );
    }

    if (claimRef.status === "CLAIMED") {
      return NextResponse.json(
        { error: "This permit has already been claimed" },
        { status: 400 }
      );
    }

    // Update claim reference status
    await prisma.claimReference.update({
      where: { id },
      data: {
        status: "CLAIMED",
        claimedAt: new Date(),
      },
    });

    // Update permit issuance status
    if (claimRef.application.permit?.issuance) {
      await prisma.permitIssuance.update({
        where: { id: claimRef.application.permit.issuance.id },
        data: {
          status: "RELEASED",
          releasedAt: new Date(),
        },
      });
    }

    // Update slot reservation as completed
    const reservation = await prisma.slotReservation.findUnique({
      where: { applicationId: claimRef.applicationId },
    });

    if (reservation) {
      await prisma.slotReservation.update({
        where: { id: reservation.id },
        data: { status: "COMPLETED" },
      });
    }    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "RELEASE_PERMIT",
        entity: "ClaimReference",
        entityId: id,
        details: {
          referenceNumber: claimRef.referenceNumber,
          businessName: claimRef.businessName,
        },
      },
    });

    // Broadcast permit-released event to the applicant
    sseBroadcaster.sendToUser(
      claimRef.generatedBy,
      createSSEEvent("permit_issued", {
        claimReferenceId: id,
        referenceNumber: claimRef.referenceNumber,
        businessName: claimRef.businessName,
      }, claimRef.generatedBy)
    );
    broadcastNotification(
      claimRef.generatedBy,
      "Permit Released",
      `Your business permit for "${claimRef.businessName}" has been released. Please proceed to collect it.`,
      "/dashboard/claim-reference"
    );

    return NextResponse.json({
      message: "Permit released successfully",
    });  } catch (error) {
    captureException(error, { route: 'POST /api/claims/[id]/release' });
    console.error("Release claim error:", error);
    return NextResponse.json(
      { error: "Failed to release permit" },
      { status: 500 }
    );
  }
}
