import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/permits/[id]/prefill
 * Returns the application details for pre-filling a renewal form.
 * Only accessible by the permit owner (APPLICANT) or staff/admin.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const permit = await prisma.permit.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            applicantId: true,
            businessName: true,
            businessType: true,
            businessAddress: true,
            businessBarangay: true,
            businessCity: true,
            businessProvince: true,
            businessZipCode: true,
            businessPhone: true,
            businessEmail: true,
            dtiSecRegistration: true,
            tinNumber: true,
            sssNumber: true,
            businessArea: true,
            numberOfEmployees: true,
            capitalInvestment: true,
            grossSales: true,
          },
        },
      },
    });

    if (!permit) {
      return NextResponse.json({ error: "Permit not found" }, { status: 404 });
    }

    // Access control: applicant can only pre-fill their own permit
    if (
      session.user.role === "APPLICANT" &&
      permit.application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow pre-fill from ACTIVE or EXPIRED permits
    if (!["ACTIVE", "EXPIRED"].includes(permit.status)) {
      return NextResponse.json(
        { error: `Cannot renew a ${permit.status.toLowerCase()} permit` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      permit: {
        permitNumber: permit.permitNumber,
        status: permit.status,
        expiryDate: permit.expiryDate,
      },
      application: permit.application,
    });
  } catch (error) {
    console.error("Permit prefill error:", error);
    return NextResponse.json(
      { error: "Failed to fetch permit details" },
      { status: 500 }
    );
  }
}
