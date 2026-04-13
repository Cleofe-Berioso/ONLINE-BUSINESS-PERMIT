import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DocumentReviewClient } from "@/components/dashboard/document-review-client";

export const metadata = { title: "Document Review" };

export default async function VerifyDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "APPLICANT") redirect("/dashboard");

  //Fetch initial data
  const applications = await prisma.application.findMany({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"] } },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      applicationNumber: true,
      businessName: true,
      status: true,
      submittedAt: true,
      documents: {
        select: {
          id: true,
          applicationId: true,
          originalName: true,
          documentType: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  const stats = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: "SUBMITTED" } }),
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
  ]);

  return (
    <DocumentReviewClient
      initialApplications={applications}
      stats={{
        total: stats[0],
        pending: stats[1],
        approved: stats[2],
        rejected: stats[3],
      }}
    />
  );
}
