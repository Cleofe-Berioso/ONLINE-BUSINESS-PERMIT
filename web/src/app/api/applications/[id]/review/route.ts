import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generatePermitNumber, generateClaimReference } from "@/lib/utils";
import {
  broadcastApplicationStatusChange,
  broadcastNotification,
} from "@/lib/sse";
import { sendApplicationStatusEmail } from "@/lib/email";
import { captureException } from "@/lib/monitoring";
import { reviewActionSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only staff, reviewer, or admin can review
    if (session.user.role === "APPLICANT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;    const body = await request.json();
    const validated = reviewActionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }
    const { action, comment } = validated.data;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { applicant: true, previousPermit: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Determine new status
    let newStatus = application.status;
    if (action === "APPROVE") newStatus = "APPROVED";
    else if (action === "REJECT") newStatus = "REJECTED";
    else if (action === "REQUEST_REVISION") newStatus = "DRAFT";

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: newStatus,
        ...(action === "APPROVE" && {
          approvedAt: new Date(),
          reviewedAt: new Date(),
        }),
        ...(action === "REJECT" && {
          rejectedAt: new Date(),
          reviewedAt: new Date(),
          rejectionReason: comment || null,
        }),
      },
    });

    // Create review action
    await prisma.reviewAction.create({
      data: {
        applicationId: id,
        reviewerId: session.user.id,
        action,
        comment: comment || null,
      },
    });

    // Create history entry
    await prisma.applicationHistory.create({
      data: {
        applicationId: id,
        previousStatus: application.status,
        newStatus,
        comment:
          comment ||
          `Application ${action.toLowerCase().replace("_", " ")} by reviewer`,
        changedBy: session.user.id,
      },
    });    // If approved, auto-generate permit
    if (action === "APPROVE") {
      // For renewals: mark the previous permit as RENEWED
      if (application.type === "RENEWAL" && application.previousPermitId) {
        await prisma.permit.update({
          where: { id: application.previousPermitId },
          data: { status: "RENEWED" },
        });
      }

      const permitCount = await prisma.permit.count();
      const permitNumber = generatePermitNumber(permitCount + 1);

      const permit = await prisma.permit.create({
        data: {
          permitNumber,
          applicationId: id,
          businessName: application.businessName,
          businessAddress: application.businessAddress,
          ownerName: `${application.applicant.firstName} ${application.applicant.lastName}`,
          issueDate: new Date(),
          expiryDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          status: "ACTIVE",
        },
      });

      // Create permit issuance record
      await prisma.permitIssuance.create({
        data: {
          permitId: permit.id,
          issuedById: session.user.id,
          status: "PREPARED",
        },
      });

      // Generate claim reference
      await prisma.claimReference.create({
        data: {
          referenceNumber: generateClaimReference(),
          applicationId: id,
          generatedBy: application.applicantId,
          applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
          businessName: application.businessName,
          applicationStatus: "APPROVED",
          status: "GENERATED",
        },
      });
    }    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `REVIEW_${action}`,
        entity: "Application",
        entityId: id,
        details: { action, comment },
      },
    });    // Broadcast real-time status change to the applicant
    if (action !== "COMMENT") {
      broadcastApplicationStatusChange(
        application.applicantId,
        id,
        application.applicationNumber,
        newStatus,
        application.status
      );
      broadcastNotification(
        application.applicantId,
        "Application Status Updated",
        `Your application ${application.applicationNumber} has been ${action.toLowerCase().replace("_", " ")}.`,
        `/dashboard/applications/${id}`
      );

      // Send email notification (fire-and-forget)
      sendApplicationStatusEmail(
        application.applicant.email,
        `${application.applicant.firstName} ${application.applicant.lastName}`,
        application.applicationNumber,
        newStatus,
        action === "REJECT" ? (comment || undefined) : undefined
      ).catch((err: unknown) => console.error("Email notification error:", err));
    }

    return NextResponse.json({
      message: `Application ${action.toLowerCase().replace("_", " ")} successfully`,
      application: updatedApplication,
    });  } catch (error) {
    captureException(error, { route: 'POST /api/applications/[id]/review' });
    console.error("Review application error:", error);
    return NextResponse.json(
      { error: "Failed to process review action" },
      { status: 500 }
    );
  }
}
