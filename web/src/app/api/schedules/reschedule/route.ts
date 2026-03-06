import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendClaimConfirmationEmail } from "@/lib/email";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, newTimeSlotId } = body;

    if (!applicationId || !newTimeSlotId) {
      return NextResponse.json(
        { error: "applicationId and newTimeSlotId are required" },
        { status: 400 }
      );
    }

    // Fetch existing reservation
    const existing = await prisma.slotReservation.findUnique({
      where: { applicationId },
      include: { application: true, timeSlot: { include: { schedule: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No existing reservation found for this application" },
        { status: 404 }
      );
    }

    // Only applicant (owner) or staff/admin may reschedule
    if (
      session.user.role === "APPLICANT" &&
      existing.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (["COMPLETED", "CANCELLED"].includes(existing.status)) {
      return NextResponse.json(
        { error: `Cannot reschedule a ${existing.status.toLowerCase()} reservation` },
        { status: 400 }
      );
    }

    // Fetch the new time slot
    const newSlot = await prisma.timeSlot.findUnique({
      where: { id: newTimeSlotId },
      include: { schedule: true },
    });

    if (!newSlot) {
      return NextResponse.json(
        { error: "New time slot not found" },
        { status: 404 }
      );
    }

    if (!newSlot.isActive) {
      return NextResponse.json(
        { error: "Selected time slot is not active" },
        { status: 400 }
      );
    }

    if (newSlot.currentCount >= newSlot.maxCapacity) {
      return NextResponse.json(
        { error: "Selected time slot is fully booked" },
        { status: 400 }
      );
    }

    // Execute reschedule in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Decrement old slot
      await tx.timeSlot.update({
        where: { id: existing.timeSlotId },
        data: { currentCount: { decrement: 1 } },
      });

      // Update reservation to new slot
      const res = await tx.slotReservation.update({
        where: { applicationId },
        data: {
          timeSlotId: newTimeSlotId,
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      // Increment new slot
      await tx.timeSlot.update({
        where: { id: newTimeSlotId },
        data: { currentCount: { increment: 1 } },
      });

      // Update claim reference schedule info
      await tx.claimReference.updateMany({
        where: { applicationId },
        data: {
          claimScheduleDate: newSlot.schedule.date,
          claimScheduleTime: `${newSlot.startTime} - ${newSlot.endTime}`,
        },
      });

      return res;
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "RESCHEDULE_SLOT",
        entity: "SlotReservation",
        entityId: updated.id,
        details: {
          applicationId,
          oldSlotId: existing.timeSlotId,
          newSlotId: newTimeSlotId,
        },
      },
    });

    // Send updated confirmation email (fire-and-forget)
    try {
      const user = await prisma.user.findUnique({
        where: { id: existing.userId },
        select: { email: true, firstName: true, lastName: true },
      });
      const claimRef = await prisma.claimReference.findFirst({
        where: { applicationId },
        select: { referenceNumber: true },
      });
      if (user && claimRef) {
        const dateStr = new Date(newSlot.schedule.date).toLocaleDateString(
          "en-PH",
          { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        );
        sendClaimConfirmationEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          existing.application.applicationNumber,
          claimRef.referenceNumber,
          dateStr,
          `${newSlot.startTime} - ${newSlot.endTime}`
        ).catch((err: unknown) =>
          console.error("Reschedule confirmation email error:", err)
        );
      }
    } catch (emailErr) {
      console.error("Reschedule email error:", emailErr);
    }

    return NextResponse.json({
      message: "Rescheduled successfully",
      reservation: updated,
      newSchedule: {
        date: newSlot.schedule.date,
        time: `${newSlot.startTime} - ${newSlot.endTime}`,
      },
    });
  } catch (error) {
    console.error("Reschedule error:", error);
    return NextResponse.json(
      { error: "Failed to reschedule" },
      { status: 500 }
    );
  }
}
