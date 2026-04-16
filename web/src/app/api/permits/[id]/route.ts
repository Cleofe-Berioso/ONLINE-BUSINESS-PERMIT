/**
 * Permit Details API Route
 * GET /api/permits/{id} - Retrieve permit information
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch permit with all related data
    const permit = await prisma.permit.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        issuance: true,
      },
    });

    if (!permit) {
      return NextResponse.json({ error: 'Permit not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === 'APPLICANT') {
      if (permit.application.applicantId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Calculate permit validity status
    const now = new Date();
    const expiryDate = new Date(permit.expiryDate);
    const isExpired = expiryDate < now;
    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Format response
    return NextResponse.json({
      permit: {
        id: permit.id,
        permitNumber: permit.permitNumber,
        status: permit.status,
        isExpired,
        daysRemaining: isExpired ? 0 : daysRemaining,
        businessName: permit.businessName,
        businessAddress: permit.businessAddress,
        ownerName: permit.ownerName,
        // Get business details from application, not permit
        businessType: permit.application.businessType,
        businessBarangay: permit.application.businessBarangay,
        businessCity: permit.application.businessCity,
        businessProvince: permit.application.businessProvince,
        issueDate: permit.issueDate.toISOString(),
        expiryDate: permit.expiryDate.toISOString(),
        applicant: {
          id: permit.application.applicant?.id,
          name: permit.application.applicant
            ? `${permit.application.applicant.firstName} ${permit.application.applicant.lastName}`
            : 'Unknown',
          email: permit.application.applicant?.email,
          phone: permit.application.applicant?.phone,
        },
        application: {
          id: permit.application.id,
          applicationNumber: permit.application.applicationNumber,
          status: permit.application.status,
          type: permit.application.type,
        },
        issuance: permit.issuance || null,
        createdAt: permit.createdAt.toISOString(),
        updatedAt: permit.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Permit retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve permit' },
      { status: 500 }
    );
  }
}
