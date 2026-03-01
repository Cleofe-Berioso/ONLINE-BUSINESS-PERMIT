/**
 * Government Registration Verification API
 * Verify DTI, BIR, and SEC registrations
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { verifyBusinessRegistration } from '@/lib/government-api';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dtiNumber, tinNumber, secNumber } = body;

    if (!dtiNumber && !tinNumber && !secNumber) {
      return NextResponse.json(
        { error: 'At least one registration number is required' },
        { status: 400 }
      );
    }

    const results = await verifyBusinessRegistration({
      dtiNumber,
      tinNumber,
      secNumber,
    });

    // Log verification attempt
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'GOVERNMENT_VERIFICATION',
        entity: 'Application',
        details: {
          dtiNumber,
          tinNumber,
          secNumber,
          results: results.map((r) => ({
            source: r.source,
            verified: r.verified,
            status: r.status,
          })),
        },
      },
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
