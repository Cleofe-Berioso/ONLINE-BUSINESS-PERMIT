import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const referenceNumber = searchParams.get("ref");

    if (!referenceNumber) {
      return NextResponse.json(
        { error: "Reference number is required" },
        { status: 400 }
      );
    }

    const claimReference = await prisma.claimReference.findUnique({
      where: { referenceNumber },
      include: {
        application: {
          include: {
            applicant: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
            permit: {
              select: {
                id: true,
                permitNumber: true,
                status: true,
                issueDate: true,
                expiryDate: true,
              },
            },
            documents: {
              select: { id: true, documentType: true, status: true },
            },
          },
        },
      },
    });

    if (!claimReference) {
      return NextResponse.json(
        { error: "Claim reference not found" },
        { status: 404 }
      );
    }

    // If applicant, only allow viewing their own
    if (
      session.user.role === "APPLICANT" &&
      claimReference.application.applicant.email !== session.user.email
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark as verified if staff is checking
    if (
      session.user.role !== "APPLICANT" &&
      claimReference.status === "GENERATED"
    ) {
      await prisma.claimReference.update({
        where: { id: claimReference.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "VERIFY_CLAIM_REFERENCE",
          entity: "ClaimReference",
          entityId: claimReference.id,
        },
      });
    }

    return NextResponse.json({ claimReference });
  } catch (error) {
    console.error("Verify claim error:", error);
    return NextResponse.json(
      { error: "Failed to verify claim reference" },
      { status: 500 }
    );
  }
}
