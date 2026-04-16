/**
 * GET /api/renewals/claim-schedule
 * Fetch claim schedule information for renewal applications
 *
 * Access: APPLICANT (own schedules), REVIEWER/ADMINISTRATOR (any)
 * Returns: Upcoming and past appointments, available slots
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { captureException } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Build where clause based on role
    const applicationWhere: any = {};

    if (session.user.role === "APPLICANT") {
      applicationWhere.applicantId = session.user.id;
    }

    // Fetch slot reservations for the user's renewal applications
    const now = new Date();

    // Get upcoming and past slot reservations with proper relations
    const upcomingReservation = await prisma.slotReservation.findFirst({
      where: {
        application: {
          ...applicationWhere,
          type: "RENEWAL",
        },
        timeSlot: {
          schedule: {
            date: {
              gte: now,
            },
          },
        },
      },
      include: {
        timeSlot: {
          include: {
            schedule: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const pastReservations = await prisma.slotReservation.findMany({
      where: {
        application: {
          ...applicationWhere,
          type: "RENEWAL",
        },
        timeSlot: {
          schedule: {
            date: {
              lt: now,
            },
          },
        },
      },
      include: {
        timeSlot: {
          include: {
            schedule: true,
          },
        },
      },
      orderBy: {
        timeSlot: {
          schedule: {
            date: "desc",
          },
        },
      },
    });

    // Get total available slots
    const totalSlots = await prisma.timeSlot.count({
      where: {
        schedule: {
          isBlocked: false,
        },
      },
    });

    // Get claim reference if exists
    let claimReference = null;
    if (upcomingReservation?.applicationId) {
      claimReference = await prisma.claimReference.findUnique({
        where: {
          applicationId: upcomingReservation.applicationId,
        },
      });
    }

    // Format response
    const upcomingAppointment = upcomingReservation
      ? {
          id: upcomingReservation.id,
          confirmationNumber: claimReference?.referenceNumber || upcomingReservation.id.substring(0, 8),
          scheduleDate: upcomingReservation.timeSlot.schedule.date
            .toISOString()
            .split("T")[0],
          timeSlotStart: upcomingReservation.timeSlot.startTime,
          timeSlotEnd: upcomingReservation.timeSlot.endTime,
          status: upcomingReservation.status,
          createdAt: upcomingReservation.createdAt.toISOString(),
        }
      : null;

    // Get claim references for past appointments
    const claimReferenceMap = new Map();
    if (pastReservations.length > 0) {
      const appIds = pastReservations.map((r) => r.applicationId);
      const claims = await prisma.claimReference.findMany({
        where: {
          applicationId: {
            in: appIds,
          },
        },
      });
      claims.forEach((c) => {
        claimReferenceMap.set(c.applicationId, c.referenceNumber);
      });
    }

    const formattedPastAppointments = pastReservations.map((res) => ({
      id: res.id,
      confirmationNumber: claimReferenceMap.get(res.applicationId) || res.id.substring(0, 8),
      scheduleDate: res.timeSlot.schedule.date.toISOString().split("T")[0],
      timeSlotStart: res.timeSlot.startTime,
      timeSlotEnd: res.timeSlot.endTime,
      status: res.status,
      createdAt: res.createdAt.toISOString(),
    }));

    // Log activity
    if (session.user.role === "APPLICANT") {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "RENEWAL_CLAIM_SCHEDULE_VIEWED",
          entity: "SlotReservation",
          details: {
            hasUpcoming: !!upcomingAppointment,
            pastCount: formattedPastAppointments.length,
          },
        },
      });
    }

    return NextResponse.json({
      upcomingAppointment,
      pastAppointments: formattedPastAppointments,
      availableSlots: totalSlots,
      message: "Claim schedule retrieved successfully",
    });
  } catch (error) {
    captureException(error, { route: "GET /api/renewals/claim-schedule" });
    console.error("Claim schedule error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve claim schedule" },
      { status: 500 }
    );
  }
}
