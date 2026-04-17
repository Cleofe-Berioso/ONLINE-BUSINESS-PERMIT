/**
 * GET /api/public/verify-permit?ref={referenceNumber}
 * P6.0 Phase E: Public Permit Verification
 *
 * Allow public lookup of permit validity by claim reference number
 * Supports QR code scanning
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceNumber = searchParams.get("ref");

    if (!referenceNumber) {
      return NextResponse.json(
        { error: "Reference number is required" },
        { status: 400 }
      );
    }

    // Find claim reference with application and permit
    const claimReference = await prisma.claimReference.findFirst({
      where: { referenceNumber },
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true,
            type: true,
            status: true,
          },
          include: {
            permit: {
              select: {
                id: true,
                permitNumber: true,
                status: true,
                businessName: true,
                issueDate: true,
                expiryDate: true,
              },
            },
          },
        },
      },
    });

    if (!claimReference) {
      return NextResponse.json(
        { error: "Permit reference not found" },
        { status: 404 }
      );
    }

    // Check permit validity
    const now = new Date();
    const permitData = claimReference.application.permit;
    const expiryDate = new Date(permitData?.expiryDate || now);
    const isValid =
      permitData?.status === "ACTIVE" && expiryDate > now;

    // Calculate days until expiry
    const daysToExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Format response for public disclosure (sanitize personal details)
    return NextResponse.json(
      {
        verified: true,
        referenceNumber: claimReference.referenceNumber,
        status: claimReference.status,
        permit: {
          permitNumber: permitData?.permitNumber,
          businessName: permitData?.businessName,
          permitStatus: permitData?.status,
          isValid,
          issuedDate: permitData?.issueDate?.toISOString(),
          expiryDate: permitData?.expiryDate?.toISOString(),
          daysToExpiry: isValid ? daysToExpiry : 0,
        },
        application: {
          applicationNumber: claimReference.application.applicationNumber,
          applicationType: claimReference.application.type,
        },
        claimedAt: claimReference.claimedAt?.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Public permit verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify permit" },
      { status: 500 }
    );
  }
}
