import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { signIn } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import { sendOtpSms } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === "PENDING_VERIFICATION") {
      return NextResponse.json(
        { error: "Please verify your email before logging in" },
        { status: 403 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your account has been suspended. Contact support." },
        { status: 403 }
      );
    }

    if (user.status === "INACTIVE") {
      return NextResponse.json(
        { error: "Your account is inactive. Contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate login OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await prisma.otpToken.create({
        data: {
          token: otp,
          type: "LOGIN_OTP",
          userId: user.id,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      });      // Send OTP via email
      await sendOtpEmail(email, otp, "login");

      // Send OTP via SMS if phone number available
      if (user.phone) {
        await sendOtpSms(user.phone, otp);
      }

      // In development, also log OTP to console
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Login OTP for ${email}: ${otp}`);
      }

      return NextResponse.json(
        {
          requires2FA: true,
          message: "OTP sent to your registered phone/email",
          userId: user.id,
        },
        { status: 200 }
      );
    }

    // Sign in using NextAuth
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
