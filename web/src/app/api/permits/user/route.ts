import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Permit } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PermitData {
  id: string;
  permitNumber: string;
  businessName: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

interface ResponseData {
  permits: PermitData[];
  isEligible: boolean;
  eligibleCount: number;
}

export async function GET(): Promise<NextResponse<ResponseData | { error: string }>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch only user's permits with ACTIVE or EXPIRED status
    const permits = await prisma.permit.findMany({
      where: {
        application: {
          applicantId: session.user.id,
        },
        status: {
          in: ["ACTIVE", "EXPIRED"],
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    // Format permits for response
    const formattedPermits: PermitData[] = permits.map((permit: Permit) => ({
      id: permit.id,
      permitNumber: permit.permitNumber,
      businessName: permit.businessName,
      issueDate: permit.issueDate.toISOString().split("T")[0],
      expiryDate: permit.expiryDate.toISOString().split("T")[0],
      status: permit.status,
    }));

    return NextResponse.json({
      permits: formattedPermits,
      isEligible: permits.length > 0,
      eligibleCount: permits.length,
    });
  } catch (error) {
    console.error("Error fetching permits:", error);
    return NextResponse.json(
      { error: "Failed to fetch permits" },
      { status: 500 }
    );
  }
}
