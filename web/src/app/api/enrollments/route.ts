import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fullEnrollmentSchema } from "@/lib/validations";
import { generateApplicationNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = fullEnrollmentSchema.parse(body);

    // Get the count of applications to generate sequence
    const applicationCount = await prisma.application.count();
    const sequence = applicationCount + 1;
    const applicationNumber = generateApplicationNumber(sequence);

    // Create application record
    const application = await prisma.application.create({
      data: {
        applicationNumber,
        type: "NEW",
        status: "DRAFT",
        applicantId: session.user.id,
        businessName: validatedData.businessName,
        businessType: validatedData.businessType,
        businessAddress: validatedData.businessAddress,
        businessBarangay: validatedData.businessBarangay,
        businessCity: validatedData.businessCity,
        businessProvince: validatedData.businessProvince,
        businessZipCode: validatedData.businessZipCode,
        businessPhone: validatedData.businessPhone,
        businessEmail: validatedData.businessEmail,
        dtiSecRegistration: validatedData.dtiSecRegistration,
        tinNumber: validatedData.tinNumber,
        // Store owner info in additionalData JSON
        additionalData: {
          ownerFirstName: validatedData.ownerFirstName,
          ownerLastName: validatedData.ownerLastName,
          ownerMiddleName: validatedData.ownerMiddleName,
          ownerEmail: validatedData.ownerEmail,
          ownerPhone: validatedData.ownerPhone,
          ownerPosition: validatedData.ownerPosition,
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "BUSINESS_ENROLLMENT",
        entity: "Application",
        entityId: application.id,
        details: {
          businessName: application.businessName,
          applicationNumber: application.applicationNumber,
        },
      },
    });

    return NextResponse.json(
      {
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
        message: "Enrollment submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ENROLLMENTS_POST]", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Validation failed: " + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
