/**
 * 2FA Verification API - Verify TOTP code during login
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyTotp } from '@/lib/two-factor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 });
    }

    const isValid = verifyTotp(token, user.twoFactorSecret);

    if (!isValid) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: '2FA_FAILED',
          entity: 'User',
          entityId: user.id,
        },
      });

      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 400 });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_2FA',
        entity: 'User',
        entityId: user.id,
      },
    });

    return NextResponse.json({
      message: '2FA verified successfully',
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA code' },
      { status: 500 }
    );
  }
}
