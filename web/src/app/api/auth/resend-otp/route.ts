import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { captureException } from "@/lib/monitoring";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type = "EMAIL_VERIFICATION" } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't resend if already verified
    if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified. Please log in." },
        { status: 400 }
      );
    }

    // Invalidate previous unused OTPs of same type
    await prisma.otpToken.updateMany({
      where: { userId, type, used: false },
      data: { used: true },
    });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.otpToken.create({
      data: {
        token: otp,
        type,
        userId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Send OTP email
    await sendOtpEmail(user.email, otp, "verification");

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Resent OTP for ${user.email}: ${otp}`);
    }

    return NextResponse.json({ message: "OTP resent successfully." });
  } catch (error) {
    captureException(error, { route: "POST /api/auth/resend-otp" });
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Failed to resend OTP" }, { status: 500 });
  }
}
