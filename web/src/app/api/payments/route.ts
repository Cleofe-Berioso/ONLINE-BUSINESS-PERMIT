/**
 * Payment API Routes
 * Process payments and record OTC transactions
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processPayment, calculateFees, generateReceipt } from '@/lib/payments';
import type { PaymentMethod } from '@/lib/payments';

// POST /api/payments - Initiate a payment
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, method } = body;

    if (!applicationId || !method) {
      return NextResponse.json(
        { error: 'Application ID and payment method are required' },
        { status: 400 }
      );
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { permit: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check ownership for applicants
    if (session.user.role === 'APPLICANT' && application.applicantId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate fees
    const fees = calculateFees(application.type, application.businessType);

    // Process payment
    const result = await processPayment({
      applicationId,
      amount: fees.totalAmount,
      method: method as PaymentMethod,
      description: `Business Permit - ${application.businessName}`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Generate receipt for completed payments
    let receipt = null;
    if (result.status === 'COMPLETED') {
      receipt = generateReceipt({
        transactionId: result.transactionId!,
        applicationId,
        amount: fees.totalAmount,
        method: method as PaymentMethod,
        paidBy: `${session.user.firstName} ${session.user.lastName}`,
        businessName: application.businessName,
        description: `Business Permit Fee - ${application.type}`,
      });
    }

    // Log payment activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'PAYMENT_INITIATED',
        entity: 'Application',
        entityId: applicationId,
        details: {
          method,
          amount: fees.totalAmount,
          transactionId: result.transactionId,
          status: result.status,
        },
      },
    });

    return NextResponse.json({
      payment: result,
      fees,
      receipt,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

// GET /api/payments?applicationId=xxx - Get fees for an application
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const fees = calculateFees(application.type, application.businessType);

    return NextResponse.json({ fees });
  } catch (error) {
    console.error('Payment fees error:', error);
    return NextResponse.json({ error: 'Failed to calculate fees' }, { status: 500 });
  }
}
