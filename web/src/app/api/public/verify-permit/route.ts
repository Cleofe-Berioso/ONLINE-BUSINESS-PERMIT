import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get("number")?.trim().toUpperCase();

  if (!number) {
    return NextResponse.json({ error: "Permit number is required" }, { status: 400 });
  }

  const permit = await prisma.permit.findFirst({
    where: { permitNumber: number },
    select: {
      permitNumber: true,
      businessName: true,
      businessAddress: true,
      ownerName: true,
      issueDate: true,
      expiryDate: true,
      status: true,
    },
  });

  if (!permit) {
    return NextResponse.json({ error: "Permit not found" }, { status: 404 });
  }

  return NextResponse.json({ permit });
}
