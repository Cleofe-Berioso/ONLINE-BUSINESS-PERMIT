import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { authConfig } from "@/lib/auth.config";

declare module "next-auth" {
  interface User {
    role: Role;
    firstName: string;
    lastName: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      firstName: string;
      lastName: string;
      image?: string | null;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    role: Role;
    firstName: string;
    lastName: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account is not active. Please verify your email.");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            entity: "User",
            entityId: user.id,
          },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.avatar,
        };
      },
    }),
    Credentials({
      id: "2fa",
      name: "2fa",
      credentials: {
        userId: { type: "text" },
        otpId: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.otpId) return null;

        // Verify the OTP record: must be a used LOGIN_OTP belonging to this user,
        // created within the last 10 minutes (prevents replay attacks outside the
        // original OTP validity window).
        const otp = await prisma.otpToken.findUnique({
          where: { id: credentials.otpId as string },
        });

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (
          !otp ||
          otp.userId !== credentials.userId ||
          otp.type !== "LOGIN_OTP" ||
          !otp.used ||
          otp.createdAt < tenMinutesAgo
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId as string },
        });

        if (!user || user.status !== "ACTIVE") return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.avatar,
        };
      },
    }),
  ],
});
