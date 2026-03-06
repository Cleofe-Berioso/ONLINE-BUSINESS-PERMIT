import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { reserveSlotSchema } from "@/lib/validations";
import { sendClaimConfirmationEmail } from "@/lib/email";
import { captureException } from "@/lib/monitoring";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = reserveSlotSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { timeSlotId, applicationId } = validated.data;

    // Verify the application belongs to the user and is approved
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (
      session.user.role === "APPLICANT" &&
      application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (application.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved applications can schedule a claim" },
        { status: 400 }
      );
    }

    // Check if already reserved
    const existingReservation = await prisma.slotReservation.findUnique({
      where: { applicationId },
    });

    if (existingReservation && existingReservation.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "A reservation already exists for this application" },
        { status: 409 }
      );
    }

    // Check time slot availability
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: { schedule: true },
    });

    if (!timeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    if (!timeSlot.isActive) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 400 }
      );
    }

    if (timeSlot.currentCount >= timeSlot.maxCapacity) {
      return NextResponse.json(
        { error: "This time slot is fully booked" },
        { status: 400 }
      );
    }    // Create reservation and update slot count in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reservation = await prisma.$transaction(async (tx: any) => {
      const res = await tx.slotReservation.create({
        data: {
          timeSlotId,
          applicationId,
          userId: session.user.id,
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      await tx.timeSlot.update({
        where: { id: timeSlotId },
        data: { currentCount: { increment: 1 } },
      });

      // Update claim reference with schedule info
      await tx.claimReference.updateMany({
        where: { applicationId },
        data: {
          claimScheduleDate: timeSlot.schedule.date,
          claimScheduleTime: `${timeSlot.startTime} - ${timeSlot.endTime}`,
        },
      });

      return res;
    });    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "RESERVE_SLOT",
        entity: "SlotReservation",
        entityId: reservation.id,
        details: {
          timeSlotId,
          applicationId,
          date: timeSlot.schedule.date,
          time: `${timeSlot.startTime} - ${timeSlot.endTime}`,
        },
      },
    });

    // Send claim confirmation email (fire-and-forget)
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, firstName: true, lastName: true },
      });
      const claimRef = await prisma.claimReference.findFirst({
        where: { applicationId },
        select: { referenceNumber: true },
      });
      if (user && claimRef) {
        const dateStr = new Date(timeSlot.schedule.date).toLocaleDateString("en-PH", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        });
        sendClaimConfirmationEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          application.applicationNumber,
          claimRef.referenceNumber,
          dateStr,
          `${timeSlot.startTime} - ${timeSlot.endTime}`
        ).catch((err: unknown) => console.error("Claim email error:", err));
      }
    } catch (emailErr) {
      console.error("Claim confirmation email error:", emailErr);
    }

    return NextResponse.json(
      { message: "Slot reserved successfully", reservation },
      { status: 201 }
    );  } catch (error) {
    captureException(error, { route: 'POST /api/schedules/reserve' });
    console.error("Reserve slot error:", error);
    return NextResponse.json(
      { error: "Failed to reserve slot" },
      { status: 500 }
    );
  }
}
