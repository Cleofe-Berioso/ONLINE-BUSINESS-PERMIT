/**
 * GET /api/schedules?days=30
 * POST /api/schedules/reserve
 * PUT /api/schedules/reschedule
 * P6.0: Claim Schedule Management
 *
 * Simplified to match actual Prisma schema
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rateLimitUpload } from "@/lib/rate-limit";
import { captureException } from "@/lib/monitoring";
import { sendScheduleConfirmationEmail } from "@/lib/email";
import { broadcastSlotAvailabilityChanged } from "@/lib/sse";
import {
  scheduleReservationSchema,
} from "@/lib/validations/schedules";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days") || "30";
    const days = Math.min(parseInt(daysParam), 90); // Max 90 days

    // Get available schedules from today onwards
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const schedules = await prisma.claimSchedule.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        isBlocked: false,
      },
      include: {
        timeSlots: {
          where: { isActive: true },
          orderBy: { startTime: "asc" },
          include: {
            reservations: {
              where: { status: "CONFIRMED" },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Format response with availability
    const formattedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      date: schedule.date,
      availableSlots: schedule.timeSlots.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.maxCapacity,
        reserved: slot.reservations.length,
        available: slot.maxCapacity - slot.reservations.length,
      })),
      isBlocked: schedule.isBlocked,
    }));

    return NextResponse.json({
      schedules: formattedSchedules,
      message: `Showing ${schedules.length} available schedules for next ${days} days`,
    });
  } catch (error) {
    captureException(error, { route: "GET /api/schedules" });
    console.error("List schedules error:", error);
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

    // Rate limiting: 10 reservations per hour
    const rateLimitResult = rateLimitUpload(session.user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const validated = scheduleReservationSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { timeSlotId, applicationId } = validated.data;

    // Verify application exists and is ENDORSED
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true, permit: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "ENDORSED") {
      return NextResponse.json(
        {
          error: "Application not ready for scheduling",
          message: `Application status is ${application.status}. Only ENDORSED applications can schedule claims.`,
        },
        { status: 400 }
      );
    }

    // Verify ownership
    if (
      session.user.role === "APPLICANT" &&
      application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // CRITICAL FIX #4: Race Condition Prevention - Wrap in atomic transaction
    const reservation = await prisma.$transaction(
      async (tx) => {
        // Re-fetch slot WITHIN transaction to get fresh data
        const timeSlot = await tx.timeSlot.findUnique({
          where: { id: timeSlotId },
          include: {
            schedule: true,
            reservations: { where: { status: "CONFIRMED" } },
          },
        });

        if (!timeSlot) {
          throw new Error("Time slot not found");
        }

        if (!timeSlot.schedule || timeSlot.schedule.isBlocked === true) {
          throw new Error("Schedule is blocked or unavailable");
        }

        // Check capacity WITHIN transaction (atomic check)
        if (timeSlot.reservations.length >= timeSlot.maxCapacity) {
          throw new Error("Time slot is full");
        }

        // Create reservation within transaction
        const newReservation = await tx.slotReservation.create({
          data: {
            timeSlotId,
            applicationId,
            userId: session.user.id,
            status: "CONFIRMED",
            confirmedAt: new Date(),
            temporaryHoldExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day hold
          },
        });

        // Increment slot count within same transaction
        await tx.timeSlot.update({
          where: { id: timeSlotId },
          data: { currentCount: { increment: 1 } },
        });

        return { reservation: newReservation, timeSlot };
      },
      { maxWait: 5000, timeout: 30000 }
    );

    // Outside transaction: non-critical operations
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "SCHEDULE_RESERVED",
        entity: "SlotReservation",
        entityId: reservation.reservation.id,
        details: {
          applicationId,
          timeSlotId,
          scheduleDate: reservation.timeSlot.schedule.date,
          timeSlot: `${reservation.timeSlot.startTime}-${reservation.timeSlot.endTime}`,
        },
      },
    });

    // Send confirmation email (non-blocking)
    try {
      await sendScheduleConfirmationEmail(
        application.applicant.email,
        {
          businessName: application.businessName,
          confirmationNumber: reservation.reservation.id.substring(0, 8).toUpperCase(),
          scheduleDate: reservation.timeSlot.schedule.date,
          timeSlot: `${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}`,
        }
      );
    } catch (error) {
      console.error("Failed to send schedule confirmation email:", error);
    }

    // Broadcast slot availability changed (non-blocking)
    try {
      await broadcastSlotAvailabilityChanged(reservation.timeSlot.scheduleId);
    } catch (error) {
      console.error("Failed to broadcast slot availability changed:", error);
    }

    return NextResponse.json(
      {
        reservation: {
          id: reservation.reservation.id,
          confirmationNumber: reservation.reservation.id.substring(0, 8).toUpperCase(),
          scheduleDate: reservation.timeSlot.schedule.date,
          timeSlot: `${reservation.timeSlot.startTime}-${reservation.timeSlot.endTime}`,
          expiresAt: reservation.reservation.temporaryHoldExpiry,
        },
        message: "Schedule reserved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle race condition error
    if (error instanceof Error && error.message === "Time slot is full") {
      return NextResponse.json(
        { error: "Time slot is full", message: "This slot was just booked. Please choose another." },
        { status: 400 }
      );
    }
    captureException(error, { route: "POST /api/schedules" });
    console.error("Create reservation error:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reservationId, newTimeSlotId } = body;

    if (!reservationId || !newTimeSlotId) {
      return NextResponse.json(
        { error: "Reservation ID and new time slot ID are required" },
        { status: 400 }
      );
    }

    // Get existing reservation
    const reservation = await prisma.slotReservation.findUnique({
      where: { id: reservationId },
      include: {
        timeSlot: { include: { schedule: true } },
        application: { include: { applicant: true } },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (
      session.user.role === "APPLICANT" &&
      reservation.application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check 24-hour rule
    const hoursUntilSchedule =
      (reservation.timeSlot.schedule.date.getTime() - Date.now()) /
      (1000 * 60 * 60);
    if (hoursUntilSchedule < 24) {
      return NextResponse.json(
        {
          error: "Cannot reschedule within 24 hours",
          message: `Your scheduled claim is in ${Math.floor(hoursUntilSchedule)} hours.`,
        },
        { status: 400 }
      );
    }

    // CRITICAL FIX #4: Race Condition Prevention - Atomic rescheduling transaction
    const updatedReservation = await prisma.$transaction(
      async (tx) => {
        // Re-fetch new slot WITHIN transaction to get fresh data
        const newSlot = await tx.timeSlot.findUnique({
          where: { id: newTimeSlotId },
          include: {
            schedule: true,
            reservations: { where: { status: "CONFIRMED" } },
          },
        });

        if (!newSlot) {
          throw new Error("New time slot not found");
        }

        if (!newSlot.schedule || newSlot.schedule.isBlocked === true) {
          throw new Error("New schedule is blocked or unavailable");
        }

        // Check capacity of NEW slot WITHIN transaction (atomic check)
        if (newSlot.reservations.length >= newSlot.maxCapacity) {
          throw new Error("New time slot is full");
        }

        // Update reservation within transaction
        const updated = await tx.slotReservation.update({
          where: { id: reservationId },
          data: {
            timeSlotId: newTimeSlotId,
            confirmedAt: new Date(),
          },
        });

        // Decrement old slot count
        await tx.timeSlot.update({
          where: { id: reservation.timeSlotId },
          data: { currentCount: { decrement: 1 } },
        });

        // Increment new slot count
        await tx.timeSlot.update({
          where: { id: newTimeSlotId },
          data: { currentCount: { increment: 1 } },
        });

        return { reservation: updated, newSlot };
      },
      { maxWait: 5000, timeout: 30000 }
    );

    // Outside transaction: non-critical operations
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "SCHEDULE_RESCHEDULED",
        entity: "SlotReservation",
        entityId: reservationId,
        details: {
          oldTimeSlotId: reservation.timeSlotId,
          newTimeSlotId,
          oldDate: reservation.timeSlot.schedule.date,
          newDate: updatedReservation.newSlot.schedule.date,
        },
      },
    });

    // Send rescheduling email (non-blocking)
    try {
      await sendScheduleConfirmationEmail(
        reservation.application.applicant.email,
        {
          businessName: reservation.application.businessName,
          confirmationNumber: updatedReservation.reservation.id
            .substring(0, 8)
            .toUpperCase(),
          scheduleDate: updatedReservation.newSlot.schedule.date,
          timeSlot: `${updatedReservation.newSlot.startTime} - ${updatedReservation.newSlot.endTime}`,
        }
      );
    } catch (error) {
      console.error("Failed to send reschedule confirmation email:", error);
    }

    // Broadcast slot availability changed (non-blocking)
    try {
      await broadcastSlotAvailabilityChanged(updatedReservation.newSlot.scheduleId);
    } catch (error) {
      console.error("Failed to broadcast slot availability changed:", error);
    }

    return NextResponse.json({
      reservation: {
        id: updatedReservation.reservation.id,
        confirmationNumber: updatedReservation.reservation.id
          .substring(0, 8)
          .toUpperCase(),
        scheduleDate: updatedReservation.newSlot.schedule.date,
        timeSlot: `${updatedReservation.newSlot.startTime}-${updatedReservation.newSlot.endTime}`,
        expiresAt: updatedReservation.reservation.temporaryHoldExpiry,
      },
      message: "Schedule rescheduled successfully",
    });
  } catch (error) {
    // Handle race condition error
    if (error instanceof Error && error.message === "New time slot is full") {
      return NextResponse.json(
        { error: "New time slot is full", message: "The new slot you selected was just booked. Please choose another." },
        { status: 400 }
      );
    }
    captureException(error, { route: "PUT /api/schedules" });
    console.error("Reschedule error:", error);
    return NextResponse.json(
      { error: "Failed to reschedule" },
      { status: 500 }
    );
  }
}
