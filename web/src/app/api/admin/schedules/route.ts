import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/schedules
 * Fetch statistics, blocked dates, and appointments for admin dashboard
 */
export async function GET() {
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

    // Fetch stats: count appointments by status
    const [scheduled, completed, cancelled] = await Promise.all([
      prisma.slotReservation.count({
        where: { status: "CONFIRMED" },
      }),
      prisma.slotReservation.count({
        where: { status: "COMPLETED" },
      }),
      prisma.slotReservation.count({
        where: { status: "CANCELLED" },
      }),
    ]);

    // Fetch blocked dates
    const blockedDates = await prisma.claimSchedule.findMany({
      where: { isBlocked: true },
      select: {
        id: true,
        date: true,
        blockReason: true,
      },
      orderBy: { date: "asc" },
    });

    // Fetch confirmed appointments with related data
    const appointments = await prisma.slotReservation.findMany({
      where: { status: { in: ["CONFIRMED", "COMPLETED", "CANCELLED"] } },
      select: {
        id: true,
        status: true,
        confirmedAt: true,
        cancelledAt: true,
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
            schedule: {
              select: {
                date: true,
              },
            },
          },
        },
        application: {
          select: {
            id: true,
            applicantId: true,
            businessName: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { confirmedAt: "desc" },
      take: 50, // Limit to recent appointments
    });

    // Transform data for frontend
    const transformedAppointments = appointments.map((apt) => {
      const date = new Date(apt.timeSlot.schedule.date);
      const permitId = `BP-${date.getFullYear()}-${String(apt.application.id).substring(0, 3).toUpperCase()}`;

      return {
        id: apt.id,
        permitId,
        applicantName: `${apt.user.firstName} ${apt.user.lastName}`,
        businessName: apt.application.businessName,
        date: apt.timeSlot.schedule.date.toISOString().split("T")[0],
        time: `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`,
        location: "LSU Main Office - Window 1", // TODO: Get from application data
        status: apt.status === "CONFIRMED" ? "scheduled" : apt.status.toLowerCase(),
      };
    });

    const transformedBlockedDates = blockedDates.map((bd) => ({
      id: bd.id,
      date: bd.date.toISOString().split("T")[0],
      reason: bd.blockReason || "Unavailable",
    }));

    return NextResponse.json({
      stats: {
        scheduled,
        completed,
        cancelled,
      },
      blockedDates: transformedBlockedDates,
      appointments: transformedAppointments,
    });
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule data" },
      { status: 500 }
    );
  }
}
