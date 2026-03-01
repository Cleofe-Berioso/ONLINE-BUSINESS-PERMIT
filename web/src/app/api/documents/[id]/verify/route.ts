import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "APPLICANT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({ where: { id } });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
        ...(status === "REJECTED" && {
          rejectionReason: body.reason || "Document rejected during verification",
        }),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `DOCUMENT_${status}`,
        entity: "Document",
        entityId: id,
      },
    });

    return NextResponse.json({ document: updated });
  } catch (error) {
    console.error("Verify document error:", error);
    return NextResponse.json(
      { error: "Failed to verify document" },
      { status: 500 }
    );
  }
}
