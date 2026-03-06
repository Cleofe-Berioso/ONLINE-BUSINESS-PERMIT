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

    if (session.user.role !== "STAFF" && session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, staffNotes } = body;    const issuance = await prisma.permitIssuance.findUnique({
      where: { id },
      include: {
        permit: {
          include: {
            application: { select: { applicantId: true } },
          },
        },
      },
    });

    if (!issuance) {
      return NextResponse.json(
        { error: "Issuance record not found" },
        { status: 404 }
      );
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "ISSUE":
        updateData = {
          status: "ISSUED",
          issuedAt: new Date(),
          staffNotes: staffNotes || null,
        };
        break;
      case "RELEASE":
        updateData = {
          status: "RELEASED",
          releasedAt: new Date(),
          staffNotes: staffNotes || issuance.staffNotes,
        };
        break;
      case "COMPLETE":
        updateData = {
          status: "COMPLETED",
          completedAt: new Date(),
          staffNotes: staffNotes || issuance.staffNotes,
        };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action. Use ISSUE, RELEASE, or COMPLETE" },
          { status: 400 }
        );
    }

    const updated = await prisma.permitIssuance.update({
      where: { id },
      data: updateData,
    });    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `ISSUANCE_${action}`,
        entity: "PermitIssuance",
        entityId: id,
        details: {
          permitNumber: issuance.permit.permitNumber,
          action,
        },
      },
    });

    // Broadcast real-time permit_issued event to the applicant when permit is ISSUED
    if (action === "ISSUE" || action === "RELEASE") {
      const applicantId = issuance.permit.application.applicantId;
      sseBroadcaster.sendToUser(
        applicantId,
        createSSEEvent("permit_issued", {
          issuanceId: id,
          permitNumber: issuance.permit.permitNumber,
          action,
        }, applicantId)
      );
      broadcastNotification(
        applicantId,
        action === "ISSUE" ? "Permit Ready for Claiming" : "Permit Released",
        action === "ISSUE"
          ? `Your permit #${issuance.permit.permitNumber} is ready. Please schedule your claiming appointment.`
          : `Your permit #${issuance.permit.permitNumber} has been released.`,
        "/dashboard/claim-reference"
      );
    }

    return NextResponse.json({
      message: `Permit issuance ${action.toLowerCase()} successfully`,
      issuance: updated,
    });  } catch (error) {
    captureException(error, { route: 'POST /api/issuance/[id]' });
    console.error("Update issuance error:", error);
    return NextResponse.json(
      { error: "Failed to update issuance" },
      { status: 500 }
    );
  }
}
