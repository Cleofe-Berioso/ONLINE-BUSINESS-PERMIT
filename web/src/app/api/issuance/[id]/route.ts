import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { action, staffNotes } = body;

    const issuance = await prisma.permitIssuance.findUnique({
      where: { id },
      include: { permit: true },
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
    });

    await prisma.activityLog.create({
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

    return NextResponse.json({
      message: `Permit issuance ${action.toLowerCase()} successfully`,
      issuance: updated,
    });
  } catch (error) {
    console.error("Update issuance error:", error);
    return NextResponse.json(
      { error: "Failed to update issuance" },
      { status: 500 }
    );
  }
}
