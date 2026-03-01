import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (session?.user) {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "LOGOUT",
          entity: "User",
          entityId: session.user.id,
        },
      });
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to log out" },
      { status: 500 }
    );
  }
}
