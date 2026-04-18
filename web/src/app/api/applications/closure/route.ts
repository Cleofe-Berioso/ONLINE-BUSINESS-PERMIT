/**
 * POST /api/applications/closure
 * P2.0 Phase 4: Start CLOSURE application for existing permit
 *
 * Access: APPLICANT only
 * Context: Per-permit basis (permitId)
 * Validation: User owns permit, no outstanding obligations, no pending closure exists
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  checkClosureEligibility,
} from "@/lib/application-helpers";
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
        { error: "Only applicants can start closure applications" },
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

    const { previousPermitId, closureReason, closureEffectiveDate } =
      validation.data;

    if (!previousPermitId) {
      return NextResponse.json(
        { error: "previousPermitId is required for CLOSURE" },
        { status: 400 }
      );
    }

    // Check closure eligibility (user ownership, permit status, outstanding obligations)
    const eligibility = await checkClosureEligibility(
      session.user.id,
      previousPermitId
    );

    if (!eligibility.isEligible) {
      return NextResponse.json(
        {
          error: "Not eligible for closure",
          reason: eligibility.reason,
          outstandingBalance: eligibility.outstandingBalance,
          pendingPayments: eligibility.pendingPayments,
        },
        { status: 409 }
      );
    }

    // Verify permit exists and belongs to user
    const permit = await prisma.permit.findUnique({
      where: { id: previousPermitId },
      select: {
        id: true,
        permitNumber: true,
        businessName: true,
        businessAddress: true,
        application: {
          select: { applicantId: true },
        },
      },
    });

    if (!permit) {
      return NextResponse.json(
        { error: "Permit not found" },
        { status: 404 }
      );
    }

    if (permit.application.applicantId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to close this permit" },
        { status: 403 }
      );
    }

    // Check for existing pending closure for same permit
    const existingClosure = await prisma.application.findFirst({
      where: {
        applicantId: session.user.id,
        type: "CLOSURE",
        previousPermitId: previousPermitId,
        status: { in: ["DRAFT", "SUBMITTED"] },
      },
      select: {
        id: true,
        applicationNumber: true,
      },
    });

    if (existingClosure) {
      return NextResponse.json(
        {
          error: "You already have a pending closure application for this permit",
          existingAppId: existingClosure.id,
          existingAppNumber: existingClosure.applicationNumber,
        },
        { status: 409 }
      );
    }

    // Create CLOSURE application in DRAFT status
    const application = await prisma.application.create({
      data: {
        applicationNumber: `BP-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: "CLOSURE",
        status: "DRAFT",
        applicantId: session.user.id,
        businessName: permit.businessName,
        businessType: "TBD",
        businessAddress: permit.businessAddress,
        businessCity: "TBD",
        businessProvince: "TBD",
        previousPermitId: previousPermitId,
        // Store closure-specific data
        additionalData: {
          closureReason: closureReason || null,
          closureEffectiveDate: closureEffectiveDate || null,
        },
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
        comment: "Closure application created",
        changedBy: session.user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Closure application created successfully",
        application,
        nextStep: "Complete closure details and submit for review",
      },
      { status: 201 }
    );
  } catch (error) {
    captureException(error, { route: "POST /api/applications/closure" });
    console.error("Closure application error:", error);
    return NextResponse.json(
      { error: "Failed to create closure application" },
      { status: 500 }
    );
  }
}
