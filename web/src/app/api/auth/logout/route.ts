import { NextResponse } from "next/server";
import { signOut, auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { captureException } from "@/lib/monitoring";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Log the logout activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "LOGOUT",
        entity: "User",
        entityId: session.user.id,
      },
    });

    // Sign out the user
    await signOut({ redirectTo: "/login" });

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    captureException(error, { route: "POST /api/auth/logout" });
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during logout" },
      { status: 500 }
    );
  }
}
