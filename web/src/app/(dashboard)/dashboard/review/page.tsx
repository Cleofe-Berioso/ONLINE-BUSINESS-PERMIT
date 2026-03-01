import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { CheckSquare } from "lucide-react";

export const metadata = { title: "Review Applications" };

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "APPLICANT") redirect("/dashboard");

  const applications = await prisma.application.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
    },
    orderBy: { submittedAt: "asc" },
    include: {
      applicant: {
        select: { firstName: true, lastName: true, email: true },
      },
      documents: { select: { id: true, status: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Applications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and process pending permit applications
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-8 w-8 text-gray-400" />}
          title="No pending applications"
          description="All applications have been reviewed. Check back later."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Application #</th>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Business</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Docs</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => {
                const docsVerified = app.documents.filter(
                  (d) => d.status === "VERIFIED"
                ).length;

                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-600">
                      {app.applicationNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {app.applicant.firstName} {app.applicant.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {app.businessName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.type} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {docsVerified}/{app.documents.length}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {app.submittedAt ? formatDate(app.submittedAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/review/${app.id}`}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
