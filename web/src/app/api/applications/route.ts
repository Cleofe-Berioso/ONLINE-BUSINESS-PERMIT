import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations";
import { generateApplicationNumber } from "@/lib/utils";
import { captureException } from "@/lib/monitoring";
import {
  cacheOrCompute,
  invalidateApplicationCaches,
  CacheKeys,
  CacheTTL,
} from "@/lib/cache";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }    const where =
      session.user.role === "APPLICANT"
        ? { applicantId: session.user.id }
        : {};

    // Only cache applicant-scoped lists (staff/admin see all — too volatile)
    const isApplicant = session.user.role === "APPLICANT";
    const cacheKey = isApplicant
      ? CacheKeys.userApplications(session.user.id)
      : null;

    const fetchApplications = () =>
      prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          applicant: {
            select: { firstName: true, lastName: true, email: true },
          },
          documents: { select: { id: true, status: true } },
          permit: { select: { id: true, permitNumber: true, status: true } },
        },
      });

    const applications = cacheKey
      ? await cacheOrCompute(cacheKey, fetchApplications, CacheTTL.SHORT)
      : await fetchApplications();

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { submitAsDraft, ...applicationData } = body;

    const validated = applicationSchema.safeParse(applicationData);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    // Generate application number
    const count = await prisma.application.count();
    const applicationNumber = generateApplicationNumber(count + 1);

    const status = submitAsDraft ? "DRAFT" : "SUBMITTED";

    const application = await prisma.application.create({
      data: {
        applicationNumber,
        type: validated.data.type,
        status,
        applicantId: session.user.id,
        businessName: validated.data.businessName,
        businessType: validated.data.businessType,
        businessAddress: validated.data.businessAddress,
        businessBarangay: validated.data.businessBarangay || null,
        businessCity: validated.data.businessCity || null,
        businessProvince: validated.data.businessProvince || null,
        businessZipCode: validated.data.businessZipCode || null,
        businessPhone: validated.data.businessPhone || null,
        businessEmail: validated.data.businessEmail || null,
        dtiSecRegistration: validated.data.dtiSecRegistration || null,
        tinNumber: validated.data.tinNumber || null,
        sssNumber: validated.data.sssNumber || null,
        businessArea: validated.data.businessArea || null,
        numberOfEmployees: validated.data.numberOfEmployees || null,
        capitalInvestment: validated.data.capitalInvestment || null,
        grossSales: validated.data.grossSales || null,
        submittedAt: submitAsDraft ? null : new Date(),
      },
    });

    // Create history entry
    await prisma.applicationHistory.create({
      data: {
        applicationId: application.id,
        newStatus: status,
        comment: submitAsDraft
          ? "Application saved as draft"
          : "Application submitted",
        changedBy: session.user.id,
      },
    });    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: submitAsDraft ? "SAVE_DRAFT" : "SUBMIT_APPLICATION",
        entity: "Application",
        entityId: application.id,
        details: { applicationNumber },
      },
    });

    // Invalidate the applicant's cached applications list
    await invalidateApplicationCaches(application.id, session.user.id);

    return NextResponse.json({ application }, { status: 201 });} catch (error) {
    captureException(error, { route: 'POST /api/applications' });
    console.error("Create application error:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
