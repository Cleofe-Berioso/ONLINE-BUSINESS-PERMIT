import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateAppointmentStatusSchema } from "@/lib/validations/schedules";
import { NextResponse } from "next/server";

/**
 * PATCH /api/admin/schedules/appointments/[id]
 * Update appointment status (complete or cancel)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check authorization (STAFF or ADMINISTRATOR)
    if (!["STAFF", "ADMINISTRATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    // Parse request body
    const body = await request.json();
    const validation = updateAppointmentStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // Find the appointment (slot reservation)
    const reservation = await prisma.slotReservation.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        applicationId: true,
        userId: true,
        application: {
          select: {
            businessName: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Can only update confirmed appointments" },
        { status: 400 }
      );
    }

    // Map frontend status to database status
    const newStatus = status === "completed" ? "COMPLETED" : "CANCELLED";
    const updateData: any = {
      status: newStatus,
    };

    if (newStatus === "COMPLETED") {
      updateData.confirmedAt = new Date();
    } else if (newStatus === "CANCELLED") {
      updateData.cancelledAt = new Date();
    }

    // Update reservation using transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Update the reservation
      const updated = await tx.slotReservation.update({
        where: { id },
        data: updateData,
      });

      // If completed, create/update claim reference
      if (newStatus === "COMPLETED") {
        // Check if claim reference exists
        const existing = await tx.claimReference.findUnique({
          where: { applicationId: reservation.applicationId },
        });

        if (!existing) {
          const user = await tx.user.findUnique({
            where: { id: reservation.userId },
            select: { firstName: true, lastName: true },
          });

          await tx.claimReference.create({
            data: {
              referenceNumber: `REF-${Date.now()}`,
              applicationId: reservation.applicationId,
              generatedBy: session.user.id,
              applicantName: user
                ? `${user.firstName} ${user.lastName}`
                : "Unknown",
              businessName: reservation.application.businessName,
              applicationStatus: "APPROVED",
              status: "GENERATED",
            },
          });
        }
      }

      return updated;
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: status === "completed" ? "COMPLETE_APPOINTMENT" : "CANCEL_APPOINTMENT",
        entity: "SlotReservation",
        entityId: id,
        details: {
          applicationId: reservation.applicationId,
          previousStatus: reservation.status,
          newStatus,
        },
      },
    });

    return NextResponse.json({
      message: `Appointment ${status === "completed" ? "completed" : "cancelled"} successfully`,
      appointment: {
        id: updated.id,
        status: newStatus.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
