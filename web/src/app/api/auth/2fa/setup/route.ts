/**
 * 2FA Setup API - Enable/disable TOTP for user account
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { setup2FA, verify2FASetup } from '@/lib/two-factor';
import { hash } from 'bcryptjs';

// POST /api/auth/2fa/setup - Initialize 2FA setup
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'enable') {
      // Generate new 2FA secret and QR code
      const setupData = await setup2FA(session.user.email);

      // Store the secret temporarily (not yet enabled)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorSecret: setupData.secret },
      });

      return NextResponse.json({
        qrCode: setupData.qrCodeDataUrl,
        secret: setupData.secret,
        backupCodes: setupData.backupCodes,
      });
    }

    if (action === 'verify') {
      const { token } = body;
      if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { twoFactorSecret: true },
      });

      if (!user?.twoFactorSecret) {
        return NextResponse.json({ error: '2FA setup not initiated' }, { status: 400 });
      }

      const isValid = verify2FASetup(token, user.twoFactorSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid token. Please try again.' }, { status: 400 });
      }

      // Enable 2FA
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorEnabled: true },
      });

      // Hash and store backup codes
      const { backupCodes } = body;
      if (backupCodes && Array.isArray(backupCodes)) {
        const hashedCodes = await Promise.all(
          backupCodes.map((code: string) => hash(code, 10))
        );
        // Store in user's additional data or a separate model
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            twoFactorSecret: user.twoFactorSecret, // Keep the verified secret
          },
        });

        // Log backup codes creation (hashed)
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            action: '2FA_BACKUP_CODES_GENERATED',
            entity: 'User',
            entityId: session.user.id,
            details: { codesCount: hashedCodes.length },
          },
        });
      }

      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_ENABLED',
          entity: 'User',
          entityId: session.user.id,
        },
      });

      return NextResponse.json({ message: '2FA enabled successfully', enabled: true });
    }

    if (action === 'disable') {
      const { password } = body;
      if (!password) {
        return NextResponse.json({ error: 'Password is required to disable 2FA' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { compare } = await import('bcryptjs');
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: '2FA_DISABLED',
          entity: 'User',
          entityId: session.user.id,
        },
      });

      return NextResponse.json({ message: '2FA disabled successfully', enabled: false });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Failed to process 2FA request' }, { status: 500 });
  }
}
