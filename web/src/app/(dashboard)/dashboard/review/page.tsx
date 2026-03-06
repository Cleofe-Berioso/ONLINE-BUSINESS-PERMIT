import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { CheckSquare, Search, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = { title: "Review Applications" };

import { type ApplicationStatus } from "@prisma/client";

const PAGE_SIZE = 15;

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "APPLICANT") redirect("/dashboard");

  const { page, search, status } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const statusFilter: ApplicationStatus[] = status
    ? [status as ApplicationStatus]
    : ["SUBMITTED", "UNDER_REVIEW"];

  const where = {
    status: { in: statusFilter },
    ...(search ? {
      OR: [
        { businessName: { contains: search, mode: "insensitive" as const } },
        { applicationNumber: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { submittedAt: "asc" },
      skip,
      take: PAGE_SIZE,
      include: {
        applicant: { select: { firstName: true, lastName: true, email: true } },
        documents: { select: { id: true, status: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return `/dashboard/review${params.toString() ? `?${params}` : ""}`;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Applications</h1>
        <p className="mt-1 text-sm text-gray-600">Review and process pending permit applications</p>
      </div>      {/* Search & Filter */}
      <form method="GET" className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search business name or application #…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-none"
          >
            <option value="">Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Filter
          </button>
          {(search || status) && (
            <Link href="/dashboard/review" className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Clear
            </Link>
          )}
        </div>
      </form>

      {applications.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-8 w-8 text-gray-400" />}
          title="No pending applications"
          description="All applications have been reviewed. Check back later."
        />      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {applications.map((app) => {
              const docsVerified = app.documents.filter((d) => d.status === "VERIFIED").length;
              return (
                <div key={app.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-blue-600 text-sm">{app.applicationNumber}</p>
                      <p className="mt-0.5 font-medium text-gray-900 text-sm truncate">{app.businessName}</p>
                      <p className="text-xs text-gray-500">{app.applicant.firstName} {app.applicant.lastName}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <StatusBadge status={app.type} />
                    <span className="rounded bg-gray-100 px-2 py-0.5">Docs: {docsVerified}/{app.documents.length}</span>
                    {app.submittedAt && <span>{formatDate(app.submittedAt)}</span>}
                  </div>
                  <Link
                    href={`/dashboard/review/${app.id}`}
                    className="mt-3 flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Review Application
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
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
                  const docsVerified = app.documents.filter((d) => d.status === "VERIFIED").length;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-blue-600">{app.applicationNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{app.applicant.firstName} {app.applicant.lastName}</td>
                      <td className="px-4 py-3 text-gray-700">{app.businessName}</td>
                      <td className="px-4 py-3"><StatusBadge status={app.type} /></td>
                      <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-3 text-gray-600">{docsVerified}/{app.documents.length}</td>
                      <td className="px-4 py-3 text-gray-500">{app.submittedAt ? formatDate(app.submittedAt) : "—"}</td>
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-gray-500">Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}</p>
              <div className="flex items-center gap-2">
                <Link href={buildUrl(currentPage - 1)} aria-disabled={currentPage <= 1}
                  className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 font-medium ${currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Link>
                <span className="px-2 text-gray-600">Page {currentPage} of {totalPages}</span>
                <Link href={buildUrl(currentPage + 1)} aria-disabled={currentPage >= totalPages}
                  className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 font-medium ${currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50"}`}>
                  Next <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
