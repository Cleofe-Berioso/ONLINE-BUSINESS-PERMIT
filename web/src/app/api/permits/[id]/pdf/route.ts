/**
 * Permit PDF Generation & Download API
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generatePermitPDF, buildPermitPDFData } from '@/lib/pdf';

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

    const permit = await prisma.permit.findUnique({
      where: { id },
      include: {
        application: {
          include: { applicant: true },
        },
        issuance: true,
      },
    });

    if (!permit) {
      return NextResponse.json({ error: 'Permit not found' }, { status: 404 });
    }

    // Check permissions
    if (
      session.user.role === 'APPLICANT' &&
      permit.application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build PDF data
    const pdfData = buildPermitPDFData({
      permitNumber: permit.permitNumber,
      businessName: permit.businessName,
      businessAddress: permit.businessAddress,
      ownerName: permit.ownerName,
      issueDate: permit.issueDate,
      expiryDate: permit.expiryDate,
      application: {
        applicationNumber: permit.application.applicationNumber,
        businessType: permit.application.businessType,
        tinNumber: permit.application.tinNumber,
        dtiSecRegistration: permit.application.dtiSecRegistration,
      },
    });    // Generate permit document (returns HTML buffer)
    const pdfBuffer = await generatePermitPDF(pdfData);

    // Log download
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'PERMIT_PDF_DOWNLOADED',
        entity: 'Permit',
        entityId: permit.id,
      },
    });

    // Detect if result is HTML or PDF based on content
    const content = pdfBuffer.toString('utf-8', 0, 15);
    const isHTML = content.startsWith('<!DOCTYPE') || content.startsWith('<html');

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': isHTML ? 'text/html; charset=utf-8' : 'application/pdf',
        'Content-Disposition': `${isHTML ? 'inline' : 'attachment'}; filename="permit-${permit.permitNumber}.${isHTML ? 'html' : 'pdf'}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Permit PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate permit PDF' }, { status: 500 });
  }
}
