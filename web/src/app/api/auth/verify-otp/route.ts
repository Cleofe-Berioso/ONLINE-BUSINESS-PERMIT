import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { otpVerificationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type } = body;

    const validated = otpVerificationSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    if (!userId || !type) {
      return NextResponse.json(
        { error: "User ID and OTP type are required" },
        { status: 400 }
      );
    }

    // Find valid OTP
    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        userId,
        type,
        token: validated.data.otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await prisma.otpToken.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Handle different OTP types
    if (type === "EMAIL_VERIFICATION") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });

      await prisma.activityLog.create({
        data: {
          userId,
          action: "EMAIL_VERIFIED",
          entity: "User",
          entityId: userId,
        },
      });

      return NextResponse.json({
        message: "Email verified successfully. You can now log in.",
        verified: true,
      });
    }

    if (type === "LOGIN_OTP") {
      // Update last login
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });

      await prisma.activityLog.create({
        data: {
          userId,
          action: "LOGIN_2FA",
          entity: "User",
          entityId: userId,
        },
      });

      return NextResponse.json({
        message: "OTP verified. Login successful.",
        verified: true,
        loginApproved: true,
      });
    }

    if (type === "PASSWORD_RESET") {
      return NextResponse.json({
        message: "OTP verified. You can now reset your password.",
        verified: true,
        resetToken: otpRecord.id,
      });
    }

    return NextResponse.json({ message: "OTP verified", verified: true });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
