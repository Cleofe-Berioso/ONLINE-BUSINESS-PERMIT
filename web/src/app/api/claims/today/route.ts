import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "APPLICANT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's schedule with all reservations
    const todaySchedule = await prisma.claimSchedule.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        timeSlots: {
          orderBy: { startTime: "asc" },
          include: {
            reservations: {
              where: {
                status: { in: ["CONFIRMED", "COMPLETED"] },
              },
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
                application: {
                  select: {
                    id: true,
                    applicationNumber: true,
                    businessName: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get claim references for today
    const claimReferences = await prisma.claimReference.findMany({
      where: {
        claimScheduleDate: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ["GENERATED", "VERIFIED"] },
      },
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true,
            businessName: true,
            permit: {
              select: { id: true, permitNumber: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      schedule: todaySchedule,
      claimReferences,
    });
  } catch (error) {
    console.error("Fetch today claims error:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's claims" },
      { status: 500 }
    );
  }
}
