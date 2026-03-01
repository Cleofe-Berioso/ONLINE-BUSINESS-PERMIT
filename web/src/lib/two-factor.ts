/**
 * Two-Factor Authentication (2FA/TOTP) Module
 * otplib integration with Google Authenticator support
 */

import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

const APP_NAME = process.env.TOTP_ISSUER || process.env.NEXT_PUBLIC_APP_NAME || 'BusinessPermit';

// TOTP default options
const TOTP_OPTIONS = {
  period: 30,       // 30-second window
  digits: 6,        // 6-digit codes
  algorithm: 'sha1' as const, // Standard for Google Authenticator
};

// ============================================================================
// TOTP Secret Generation
// ============================================================================

export function generateTotpSecret(): string {
  return generateSecret();
}

// ============================================================================
// QR Code for Authenticator App
// ============================================================================

export function getTotpUri(email: string, secret: string): string {
  return generateURI({
    issuer: APP_NAME,
    label: email,
    secret,
    ...TOTP_OPTIONS,
  });
}

export async function generateTotpQRCode(email: string, secret: string): Promise<string> {
  const uri = getTotpUri(email, secret);
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
}

// ============================================================================
// TOTP Verification
// ============================================================================

export function verifyTotp(token: string, secret: string): boolean {
  try {
    const result = verifySync({ token, secret, ...TOTP_OPTIONS });
    // verifySync returns { valid, delta, epoch, timeStep } or false
    if (typeof result === 'object' && result !== null && 'valid' in result) {
      return (result as { valid: boolean }).valid;
    }
    return result === true;
  } catch {
    return false;
  }
}

// ============================================================================
// Backup Codes
// ============================================================================

export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 8 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('').toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

// ============================================================================
// 2FA Setup Response
// ============================================================================

export interface TwoFactorSetupData {
  secret: string;
  qrCodeDataUrl: string;
  uri: string;
  backupCodes: string[];
}

export async function setup2FA(email: string): Promise<TwoFactorSetupData> {
  const secret = generateTotpSecret();
  const qrCodeDataUrl = await generateTotpQRCode(email, secret);
  const uri = getTotpUri(email, secret);
  const backupCodes = generateBackupCodes();

  return {
    secret,
    qrCodeDataUrl,
    uri,
    backupCodes,
  };
}

export function verify2FASetup(token: string, secret: string): boolean {
  return verifyTotp(token, secret);
}
