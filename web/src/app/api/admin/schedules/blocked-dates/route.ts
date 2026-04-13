import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { blockDateSchema } from "@/lib/validations/schedules";
import { NextResponse } from "next/server";

/**
 * POST /api/admin/schedules/blocked-dates
 * Create a blocked date (mark a date as unavailable)
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const validation = blockDateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { date, reason } = validation.data;
    const blockDate = new Date(date);

    // Check if schedule already exists for this date
    const existingSchedule = await prisma.claimSchedule.findUnique({
      where: {
        date: blockDate,
      },
    });

    let schedule;

    if (existingSchedule) {
      // Update existing schedule to mark as blocked
      schedule = await prisma.claimSchedule.update({
        where: { date: blockDate },
        data: {
          isBlocked: true,
          blockReason: reason,
        },
      });
    } else {
      // Create new schedule and mark as blocked
      schedule = await prisma.claimSchedule.create({
        data: {
          date: blockDate,
          isBlocked: true,
          blockReason: reason,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "BLOCK_DATE",
        entity: "ClaimSchedule",
        entityId: schedule.id,
        details: {
          date: blockDate.toISOString().split("T")[0],
          reason,
        },
      },
    });

    return NextResponse.json(
      {
        blockedDate: {
          id: schedule.id,
          date: blockDate.toISOString().split("T")[0],
          reason: schedule.blockReason,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to block date:", error);
    return NextResponse.json(
      { error: "Failed to block date" },
      { status: 500 }
    );
  }
}
