import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Printer, FileText } from "lucide-react";

export const metadata = { title: "Permit Issuance" };

export default async function IssuancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "STAFF" && session.user.role !== "ADMINISTRATOR") {
    redirect("/dashboard");
  }

  // Get approved applications that don't have permits yet
  const pendingIssuance = await prisma.application.findMany({
    where: {
      status: "APPROVED",
      permit: null,
    },
    orderBy: { approvedAt: "asc" },
    include: {
      applicant: { select: { firstName: true, lastName: true } },
    },
  });

  // Get recently issued permits
  const recentPermits = await prisma.permit.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      application: {
        select: { applicationNumber: true },
      },
      issuance: {
        select: { status: true, issuedAt: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Permit Issuance</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate and issue business permits for approved applications
        </p>
      </div>

      {/* Pending Issuance */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Pending Issuance ({pendingIssuance.length})
        </h2>

        {pendingIssuance.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-gray-400" />}
            title="No pending issuances"
            description="All approved applications have been issued permits."
          />        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Mobile cards */}
            <div className="divide-y md:hidden">
              {pendingIssuance.map((app) => (
                <div key={app.id} className="p-4">
                  <p className="font-semibold text-blue-600 text-sm">{app.applicationNumber}</p>
                  <p className="mt-0.5 font-medium text-gray-900">{app.businessName}</p>
                  <p className="text-sm text-gray-500">{app.applicant.firstName} {app.applicant.lastName}</p>
                  {app.approvedAt && <p className="mt-1 text-xs text-gray-400">Approved: {formatDate(app.approvedAt)}</p>}
                  <Link href={`/dashboard/issuance/${app.id}`} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    <Printer className="h-4 w-4" /> Issue Permit
                  </Link>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Application #</th>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Approved</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingIssuance.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{app.applicationNumber}</td>
                      <td className="px-4 py-3">{app.businessName}</td>
                      <td className="px-4 py-3">{app.applicant.firstName} {app.applicant.lastName}</td>
                      <td className="px-4 py-3 text-gray-500">{app.approvedAt ? formatDate(app.approvedAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/issuance/${app.id}`}>
                          <Button size="sm"><Printer className="h-3 w-3" /> Issue Permit</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Permits */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Permits
        </h2>

        {recentPermits.length === 0 ? (
          <p className="text-sm text-gray-500">No permits issued yet.</p>        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Mobile cards */}
            <div className="divide-y md:hidden">
              {recentPermits.map((permit) => (
                <div key={permit.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-blue-600 text-sm">{permit.permitNumber}</p>
                      <p className="mt-0.5 font-medium text-gray-900">{permit.businessName}</p>
                      <p className="text-xs text-gray-500">{permit.application.applicationNumber}</p>
                    </div>
                    <StatusBadge status={permit.status} />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Issued: {formatDate(permit.issueDate)} · Expires: {formatDate(permit.expiryDate)}</p>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Permit #</th>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Application</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Issued</th>
                    <th className="px-4 py-3">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentPermits.map((permit) => (
                    <tr key={permit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-blue-600">{permit.permitNumber}</td>
                      <td className="px-4 py-3">{permit.businessName}</td>
                      <td className="px-4 py-3 text-gray-500">{permit.application.applicationNumber}</td>
                      <td className="px-4 py-3"><StatusBadge status={permit.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(permit.issueDate)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(permit.expiryDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
