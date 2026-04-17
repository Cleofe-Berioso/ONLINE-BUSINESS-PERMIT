/**
 * GET /api/permits/renewal-eligible
 * Load renewal-eligible permits for authenticated applicant
 *
 * Access: APPLICANT only
 * Returns: Array of permits with renewal eligibility status
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRenewalEligibility } from "@/lib/application-helpers";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "APPLICANT") {
      return NextResponse.json(
        { error: "Only applicants can view renewal-eligible permits" },
        { status: 403 }
      );
    }

    // Load all permits for this applicant
    const permits = await prisma.permit.findMany({
      where: {
        application: { applicantId: session.user.id },
      },
      select: {
        id: true,
        permitNumber: true,
        status: true,
        expiryDate: true,
        application: {
          select: {
            businessName: true,
          },
        },
      },
    });

    // Check eligibility for each permit
    const eligibilityChecks = await Promise.all(
      permits.map(async (permit) => {
        const eligibility = await getRenewalEligibility(
          session.user.id,
          permit.id
        );
        return {
          permitId: permit.id,
          permitNumber: permit.permitNumber,
          businessName: permit.application.businessName,
          expiryDate: permit.expiryDate.toISOString(),
          isEligible: eligibility.isEligible,
          reason: eligibility.reason,
          renewalWindowInfo: eligibility.renewalWindowInfo,
        };
      })
    );

    return NextResponse.json({ permits: eligibilityChecks });
  } catch (error) {
    console.error("Error loading renewal-eligible permits:", error);
    return NextResponse.json(
      { error: "Failed to load renewal-eligible permits" },
      { status: 500 }
    );
  }
}
