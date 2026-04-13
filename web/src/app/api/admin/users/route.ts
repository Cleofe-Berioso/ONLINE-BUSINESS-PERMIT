import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
    });

    const total = await prisma.user.count();

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}
