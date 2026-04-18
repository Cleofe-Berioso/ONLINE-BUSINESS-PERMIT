/**
 * GET /api/permits?status=ACTIVE|EXPIRED|REVOKED&page=1&limit=20&search=permitNumber
 * List all permits with pagination, filtering, and search
 *
 * P5.1: Permit Listing & Management
 * Access: STAFF, REVIEWER, ADMINISTRATOR
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { captureException } from "@/lib/monitoring";
import { z } from "zod";

// Validation schema for list query parameters
const permitListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["ACTIVE", "EXPIRED", "REVOKED", "RENEWED"]).optional(),
  search: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only staff and above can view permit list
    if (
      !session?.user ||
      !["STAFF", "REVIEWER", "ADMINISTRATOR"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Staff access required" },
        { status: 403 }
      );
    }

    // Parse and validate query parameters
    const { page, limit, status, search } = permitListSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    // Build Prisma filter
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { permitNumber: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
        { businessAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch permits with pagination
    const [permits, total] = await Promise.all([
      prisma.permit.findMany({
        where,
        select: {
          id: true,
          permitNumber: true,
          businessName: true,
          businessAddress: true,
          ownerName: true,
          status: true,
          issueDate: true,
          expiryDate: true,
          createdAt: true,
          application: {
            select: {
              id: true,
              applicationNumber: true,
              applicantId: true,
              type: true,
            },
          },
          issuance: {
            select: {
              id: true,
              status: true,
              issuedAt: true,
              releasedAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.permit.count({ where }),
    ]);

    // Calculate pagination metadata
    const pages = Math.ceil(total / limit);

    // Log activity (optional, for high-volume operations you might want to skip this)
    // Would be: await createActivityLog(...)

    return NextResponse.json(
      {
        permits,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
        message: `Retrieved ${permits.length} permits`,
      },
      { status: 200 }
    );
  } catch (error) {
    captureException(error, { route: "GET /api/permits" });
    console.error("Permit list error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to retrieve permits" },
      { status: 500 }
    );
  }
}

