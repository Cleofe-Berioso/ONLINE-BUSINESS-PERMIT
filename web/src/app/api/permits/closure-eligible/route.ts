/**
 * GET /api/permits/closure-eligible
 * Load closure-eligible permits for authenticated applicant
 *
 * Access: APPLICANT only
 * Returns: Array of permits with closure eligibility status
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkClosureEligibility } from "@/lib/application-helpers";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "APPLICANT") {
      return NextResponse.json(
        { error: "Only applicants can view closure-eligible permits" },
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
        const eligibility = await checkClosureEligibility(
          session.user.id,
          permit.id
        );
        return {
          id: permit.id,
          permitNumber: permit.permitNumber,
          businessName: permit.application.businessName,
          isEligible: eligibility.isEligible,
          reason: eligibility.reason,
        };
      })
    );

    return NextResponse.json({ permits: eligibilityChecks });
  } catch (error) {
    console.error("Error loading closure-eligible permits:", error);
    return NextResponse.json(
      { error: "Failed to load closure-eligible permits" },
      { status: 500 }
    );
  }
}
