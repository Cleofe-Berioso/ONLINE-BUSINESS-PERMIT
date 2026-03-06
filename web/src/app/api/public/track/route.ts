import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("number")?.trim().toUpperCase();

  if (!ref) {
    return NextResponse.json({ error: "Application number is required" }, { status: 400 });
  }

  const application = await prisma.application.findFirst({
    where: { applicationNumber: ref },
    select: {
      applicationNumber: true,
      businessName: true,
      type: true,
      status: true,
      createdAt: true,
      approvedAt: true,
      rejectedAt: true,
      history: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { newStatus: true, createdAt: true, comment: true },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ application });
}
