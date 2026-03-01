import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { uploadFile, generateStoragePath, scanForVirus } from "@/lib/storage";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const applicationId = formData.get("applicationId") as string;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one file is required" },
        { status: 400 }
      );
    }

    // Verify application belongs to user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (
      session.user.role === "APPLICANT" &&
      application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const documents = [];
    const errors = [];

    for (const file of files) {
      // Validate file type and size
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File exceeds 10MB limit`);
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileId = randomUUID();
      const ext = file.name.split(".").pop() || "bin";
      const storagePath = generateStoragePath(applicationId, fileId, ext);

      // Virus scan
      const scanResult = await scanForVirus(buffer);
      if (!scanResult.clean) {
        errors.push(`${file.name}: Security threat detected — ${scanResult.threat}`);
        continue;
      }

      // Upload to S3/MinIO
      const uploadResult = await uploadFile({
        key: storagePath,
        body: buffer,
        contentType: file.type,
        metadata: {
          applicationId,
          uploadedBy: session.user.id,
          originalName: file.name,
        },
      });

      if (!uploadResult.success) {
        errors.push(`${file.name}: ${uploadResult.error}`);
        continue;
      }

      const doc = await prisma.document.create({
        data: {
          applicationId,
          uploadedBy: session.user.id,
          fileName: `${fileId}.${ext}`,
          originalName: file.name,
          mimeType: file.type,
          fileSize: buffer.length,
          filePath: storagePath,
          documentType: inferDocumentType(file.name),
          status: "UPLOADED",
        },
      });

      documents.push(doc);
    }

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPLOAD_DOCUMENTS",
        entity: "Document",
        entityId: applicationId,
        details: { count: documents.length, errors: errors.length > 0 ? errors : undefined },
      },
    });

    return NextResponse.json(
      {
        message: `${documents.length} document(s) uploaded successfully`,
        documents,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload documents error:", error);
    return NextResponse.json(
      { error: "Failed to upload documents" },
      { status: 500 }
    );
  }
}

function inferDocumentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("dti") || lower.includes("sec") || lower.includes("cda"))
    return "DTI_SEC_REGISTRATION";
  if (lower.includes("barangay")) return "BARANGAY_CLEARANCE";
  if (lower.includes("zoning")) return "ZONING_CLEARANCE";
  if (lower.includes("fire")) return "FIRE_SAFETY_CERTIFICATE";
  if (lower.includes("sanitary") || lower.includes("health"))
    return "SANITARY_PERMIT";
  if (lower.includes("cedula") || lower.includes("ctc"))
    return "COMMUNITY_TAX_CERTIFICATE";
  if (lower.includes("id")) return "VALID_ID";
  if (lower.includes("lease") || lower.includes("title"))
    return "LEASE_CONTRACT";
  return "OTHER";
}
