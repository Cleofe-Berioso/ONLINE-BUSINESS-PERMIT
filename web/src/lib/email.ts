/**
 * Email Notification Module
 * Nodemailer with Resend/SES fallback, templated HTML emails
 */

import nodemailer from 'nodemailer';

// ============================================================================
// Transport Configuration
// ============================================================================

function getTransporter() {
  const provider = process.env.EMAIL_PROVIDER || 'smtp';

  if (provider === 'resend') {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY || '',
      },
    });
  }

  if (provider === 'ses') {
    return nodemailer.createTransport({
      host: process.env.SES_SMTP_HOST || 'email-smtp.ap-southeast-1.amazonaws.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SES_SMTP_USER || '',
        pass: process.env.SES_SMTP_PASS || '',
      },
    });
  }

  // Default SMTP (also works for development with services like Mailtrap)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        }
      : undefined,
  });
}

const FROM_EMAIL = process.env.SMTP_FROM || 'noreply@businesspermit.gov.ph';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Online Business Permit System';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================================================
// Email Layout Template
// ============================================================================

function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: #fff; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 32px; }
    .body h2 { color: #1e40af; margin-top: 0; }
    .otp-code { background: #f0f7ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af; margin: 24px 0; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fef2f2; color: #991b1b; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .btn { display: inline-block; background: #1e40af; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
    .btn:hover { background: #1d4ed8; }
    .info-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 0 4px 4px 0; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #3b82f6; text-decoration: none; }
    table.details { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table.details td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    table.details td:first-child { font-weight: 600; color: #64748b; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ ${APP_NAME}</h1>
      <p>Your LGU Online Business Permit Portal</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
      <p><a href="${APP_URL}/data-privacy">Data Privacy Policy</a> | <a href="${APP_URL}/contact">Contact Us</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// Send Email Function
// ============================================================================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // In development without SMTP config, log to console
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST && !process.env.EMAIL_PROVIDER) {
      console.log(`[DEV EMAIL] To: ${options.to}, Subject: ${options.subject}`);
      return { success: true, messageId: `DEV-${Date.now()}` };
    }

    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email sending failed',
    };
  }
}

// ============================================================================
// Email Templates
// ============================================================================

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const body = `
    <h2>Welcome, ${name}! 🎉</h2>
    <p>Your account has been successfully created on the ${APP_NAME}.</p>
    <p>You can now:</p>
    <ul>
      <li>✅ Apply for a new business permit</li>
      <li>🔄 Renew your existing permit</li>
      <li>📋 Track your application status</li>
      <li>📅 Schedule permit claiming</li>
    </ul>
    <a href="${APP_URL}/dashboard" class="btn">Go to Dashboard</a>
    <div class="info-box">
      <strong>Need help?</strong><br>
      Visit our <a href="${APP_URL}/how-to-apply">How to Apply</a> page or <a href="${APP_URL}/contact">contact us</a>.
    </div>
  `;

  await sendEmail({
    to,
    subject: `Welcome to ${APP_NAME}`,
    html: emailLayout('Welcome', body),
  });
}

export async function sendOtpEmail(to: string, otp: string, type: 'verification' | 'login' | 'reset'): Promise<void> {
  const titles: Record<string, string> = {
    verification: 'Email Verification',
    login: 'Login Verification',
    reset: 'Password Reset',
  };

  const descriptions: Record<string, string> = {
    verification: 'Please use the following code to verify your email address:',
    login: 'Please use the following code to complete your login:',
    reset: 'Please use the following code to reset your password:',
  };

  const body = `
    <h2>${titles[type]}</h2>
    <p>${descriptions[type]}</p>
    <div class="otp-code">${otp}</div>
    <p>This code is valid for <strong>15 minutes</strong>.</p>
    <div class="info-box">
      ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. Our staff will never ask for your OTP.
    </div>
  `;

  await sendEmail({
    to,
    subject: `[${APP_NAME}] ${titles[type]} Code: ${otp}`,
    html: emailLayout(titles[type], body),
    text: `Your ${titles[type]} code is: ${otp}. Valid for 15 minutes.`,
  });
}

export async function sendApplicationStatusEmail(
  to: string,
  name: string,
  appNumber: string,
  status: string,
  reason?: string
): Promise<void> {
  const statusClasses: Record<string, string> = {
    SUBMITTED: 'status-submitted',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
  };

  const statusLabels: Record<string, string> = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Returned for Revision',
    CANCELLED: 'Cancelled',
  };

  const body = `
    <h2>Application Status Update</h2>
    <p>Dear ${name},</p>
    <p>Your business permit application has been updated:</p>
    <table class="details">
      <tr><td>Application Number</td><td><strong>${appNumber}</strong></td></tr>
      <tr><td>New Status</td><td><span class="status-badge ${statusClasses[status] || ''}">${statusLabels[status] || status}</span></td></tr>
    </table>
    ${reason ? `<div class="info-box"><strong>Remarks:</strong><br>${reason}</div>` : ''}
    ${status === 'APPROVED' ? `
      <p>🎉 Congratulations! Your application has been approved. Please schedule your permit claiming.</p>
      <a href="${APP_URL}/dashboard/schedule" class="btn">Schedule Claiming</a>
    ` : ''}
    ${status === 'REJECTED' ? `
      <p>Please review the remarks above and resubmit your application with the required corrections.</p>
      <a href="${APP_URL}/dashboard/applications/${appNumber}" class="btn">View Application</a>
    ` : `
      <a href="${APP_URL}/dashboard/tracking" class="btn">Track Application</a>
    `}
  `;

  await sendEmail({
    to,
    subject: `[${APP_NAME}] Application ${appNumber} - ${statusLabels[status] || status}`,
    html: emailLayout('Application Update', body),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<void> {
  const body = `
    <h2>Password Reset Request</h2>
    <p>Dear ${name},</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <p style="font-size: 13px; color: #64748b;">This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
    <div class="info-box">
      ⚠️ <strong>Security Notice:</strong> If you didn't request a password reset, your account may have been targeted. Consider enabling 2FA.
    </div>
  `;

  await sendEmail({
    to,
    subject: `[${APP_NAME}] Password Reset Request`,
    html: emailLayout('Password Reset', body),
  });
}

export async function sendClaimConfirmationEmail(
  to: string,
  name: string,
  appNumber: string,
  claimReference: string,
  date: string,
  time: string
): Promise<void> {
  const body = `
    <h2>Claiming Schedule Confirmed ✅</h2>
    <p>Dear ${name},</p>
    <p>Your permit claiming has been scheduled:</p>
    <table class="details">
      <tr><td>Application Number</td><td><strong>${appNumber}</strong></td></tr>
      <tr><td>Claim Reference</td><td><strong>${claimReference}</strong></td></tr>
      <tr><td>Date</td><td><strong>${date}</strong></td></tr>
      <tr><td>Time</td><td><strong>${time}</strong></td></tr>
    </table>
    <div class="info-box">
      📋 <strong>Requirements for Claiming:</strong>
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li>Valid Government-issued ID (original + photocopy)</li>
        <li>Claim Reference Number: <strong>${claimReference}</strong></li>
        <li>Authorization letter (if representative)</li>
      </ul>
    </div>
    <a href="${APP_URL}/dashboard/claim-reference" class="btn">View Claim Details</a>
  `;

  await sendEmail({
    to,
    subject: `[${APP_NAME}] Claiming Scheduled - ${appNumber}`,
    html: emailLayout('Claim Confirmation', body),
  });
}

export async function sendPermitExpiryReminderEmail(
  to: string,
  name: string,
  permitNumber: string,
  businessName: string,
  expiryDate: string
): Promise<void> {
  const body = `
    <h2>Permit Expiry Reminder ⏰</h2>
    <p>Dear ${name},</p>
    <p>Your business permit is expiring soon:</p>
    <table class="details">
      <tr><td>Permit Number</td><td><strong>${permitNumber}</strong></td></tr>
      <tr><td>Business Name</td><td><strong>${businessName}</strong></td></tr>
      <tr><td>Expiry Date</td><td><strong>${expiryDate}</strong></td></tr>
    </table>
    <p>Please renew your permit before the expiry date to avoid penalties.</p>
    <a href="${APP_URL}/dashboard/applications/new" class="btn">Renew Now</a>
  `;

  await sendEmail({
    to,
    subject: `[${APP_NAME}] Permit Expiring - ${permitNumber}`,
    html: emailLayout('Permit Expiry', body),
  });
}
