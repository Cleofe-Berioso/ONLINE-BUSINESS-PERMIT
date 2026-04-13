import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * DELETE /api/admin/schedules/blocked-dates/[id]
 * Remove a blocked date (unblock a date)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check authorization (ADMINISTRATOR only)
    if (session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    // Find the schedule
    const schedule = await prisma.claimSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Blocked date not found" },
        { status: 404 }
      );
    }

    if (!schedule.isBlocked) {
      return NextResponse.json(
        { error: "This date is not blocked" },
        { status: 400 }
      );
    }

    // Update schedule to remove block
    const updated = await prisma.claimSchedule.update({
      where: { id },
      data: {
        isBlocked: false,
        blockReason: null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UNBLOCK_DATE",
        entity: "ClaimSchedule",
        entityId: id,
        details: {
          date: updated.date.toISOString().split("T")[0],
        },
      },
    });

    return NextResponse.json({
      message: "Blocked date removed successfully",
    });
  } catch (error) {
    console.error("Failed to remove blocked date:", error);
    return NextResponse.json(
      { error: "Failed to remove blocked date" },
      { status: 500 }
    );
  }
}
