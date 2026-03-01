import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createScheduleSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const upcoming = searchParams.get("upcoming") === "true";

    const where: Record<string, unknown> = {};

    if (dateStr) {
      where.date = new Date(dateStr);
    } else if (upcoming) {
      where.date = { gte: new Date() };
    }

    const schedules = await prisma.claimSchedule.findMany({
      where,
      orderBy: { date: "asc" },
      include: {
        timeSlots: {
          orderBy: { startTime: "asc" },
          include: {
            reservations: {
              select: {
                id: true,
                status: true,
                userId: true,
                applicationId: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Fetch schedules error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin/staff can create schedules
    if (session.user.role !== "ADMINISTRATOR" && session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = createScheduleSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { date, timeSlots } = validated.data;
    const scheduleDate = new Date(date);

    // Check if schedule already exists for this date
    const existing = await prisma.claimSchedule.findUnique({
      where: { date: scheduleDate },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A schedule already exists for this date" },
        { status: 409 }
      );
    }

    const schedule = await prisma.claimSchedule.create({
      data: {
        date: scheduleDate,
        timeSlots: {
          create: timeSlots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxCapacity: slot.maxCapacity,
          })),
        },
      },
      include: {
        timeSlots: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_SCHEDULE",
        entity: "ClaimSchedule",
        entityId: schedule.id,
        details: { date, slotsCount: timeSlots.length },
      },
    });

    return NextResponse.json(
      { message: "Schedule created successfully", schedule },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create schedule error:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
