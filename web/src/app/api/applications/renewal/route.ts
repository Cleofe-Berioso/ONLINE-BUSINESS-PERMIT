/**
 * POST /api/applications/renewal
 * P2.0 Phase 4: Start RENEWAL application for existing permit
 *
 * Access: APPLICANT only
 * Context: Per-permit basis (permitId)
 * Validation: User owns permit, permit is eligible for renewal, no pending renewal exists
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRenewalEligibility } from "@/lib/application-helpers";
import { applicationSchema } from "@/lib/validations";
import { captureException } from "@/lib/monitoring";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "APPLICANT") {
      return NextResponse.json(
        { error: "Only applicants can start renewal applications" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request schema
    const validation = applicationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { previousPermitId } = validation.data;

    if (!previousPermitId) {
      return NextResponse.json(
        { error: "previousPermitId is required for RENEWAL" },
        { status: 400 }
      );
    }

    // Check renewal eligibility (user ownership, permit status, renewal window, no pending renewal)
    const eligibility = await getRenewalEligibility(
      session.user.id,
      previousPermitId
    );

    if (!eligibility.isEligible) {
      return NextResponse.json(
        {
          error: "Not eligible for renewal",
          reason: eligibility.reason,
          permit: eligibility.permit,
        },
        { status: 409 }
      );
    }

    // Create RENEWAL application in DRAFT status
    const application = await prisma.application.create({
      data: {
        applicationNumber: `BP-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: "RENEWAL",
        status: "DRAFT",
        applicantId: session.user.id,
        businessName: eligibility.permit?.businessName || "TBD",
        businessType: "TBD",
        businessAddress: "TBD",
        businessCity: "TBD",
        businessProvince: "TBD",
        previousPermitId: previousPermitId,
      },
      select: {
        id: true,
        applicationNumber: true,
        type: true,
        status: true,
        previousPermitId: true,
        createdAt: true,
      },
    });

    // Record in history
    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        newStatus: "DRAFT",
        comment: "Renewal application created",
        changedBy: session.user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Renewal application created successfully",
        application,
        nextStep: "Complete business details and submit documents",
      },
      { status: 201 }
    );
  } catch (error) {
    captureException(error, { route: "POST /api/applications/renewal" });
    console.error("Renewal application error:", error);
    return NextResponse.json(
      { error: "Failed to create renewal application" },
      { status: 500 }
    );
  }
}
