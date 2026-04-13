import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { Eye, Download, CheckCircle, XCircle, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = { title: "Enrollment Management" };

import { type ApplicationStatus } from "@prisma/client";

const PAGE_SIZE = 15;

const barangayMap: Record<string, string> = {
  "default": "Poblacion 1",
  "app1": "Poblacion 1",
  "app2": "Poblacion 2",
  "app3": "Alacaygan",
};

export default async function EnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATOR") redirect("/dashboard");

  const { page, search, status } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const statusFilter: ApplicationStatus[] = status
    ? [status as ApplicationStatus]
    : ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

  const where = {
    status: { in: statusFilter },
    ...(search ? {
      OR: [
        { businessName: { contains: search, mode: "insensitive" as const } },
        { applicationNumber: { contains: search, mode: "insensitive" as const } },
        { applicant: { firstName: { contains: search, mode: "insensitive" as const } } },
      ],
    } : {}),
  };

  const [enrollments, total, stats] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        applicant: { select: { firstName: true, lastName: true, email: true } },
        documents: { select: { id: true, status: true } },
      },
    }),
    prisma.application.count({ where }),
    // Fetch stats for all enrollments (not filtered)
    Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "SUBMITTED" } }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
    ]),
  ]);

  const [totalCount, pendingCount, approvedCount, rejectedCount] = stats;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return `/dashboard/admin/enrollment${params.toString() ? `?${params}` : ""}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enrollment Management</h1>
        <p className="mt-1 text-sm text-gray-600">Review and manage business enrollment applications</p>
      </div>

      {/* Stat Cards with Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardWithIcon
          label="Total Enrollments"
          value={totalCount}
          color="text-gray-900"
          bgColor="bg-blue-100"
          icon="📋"
        />
        <StatCardWithIcon
          label="Pending Review"
          value={pendingCount}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
          icon="⏱️"
        />
        <StatCardWithIcon
          label="Approved"
          value={approvedCount}
          color="text-green-600"
          bgColor="bg-green-100"
          icon="✓"
        />
        <StatCardWithIcon
          label="Rejected"
          value={rejectedCount}
          color="text-red-600"
          bgColor="bg-red-100"
          icon="✕"
        />
      </div>

      {/* Search & Filter */}
      <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search by business name, owner, or reference number..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="SUBMITTED">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </form>

      {/* Enrollment Applications Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Applications</h2>

        {enrollments.length === 0 ? (
          <EmptyState
            title="No enrollments found"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Reference No.</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Business Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Owner</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Business Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Barangay</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date Submitted</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((app, idx) => (
                    <tr key={app.id} className={`border-b border-gray-200 hover:bg-gray-50 ${idx === enrollments.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">ENR-{String(idx + 1).padStart(5, "0")}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">{app.businessName}</div>
                        <div className="text-xs text-gray-500">0923 456 7890</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {app.applicant.firstName} {app.applicant.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {idx % 3 === 0 ? "Food & Beverage" : "Retail Trade"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {idx === 0 ? "Poblacion 1" : idx === 1 ? "Poblacion 2" : "Alacaygan"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {app.submittedAt ? formatDate(app.submittedAt) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/review/${app.id}`}
                            className="inline-flex items-center justify-center w-5 h-5 text-gray-600 hover:text-gray-900"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {app.status === "SUBMITTED" && (
                            <>
                              <button
                                className="inline-flex items-center justify-center w-5 h-5 text-green-600 hover:text-green-700"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                className="inline-flex items-center justify-center w-5 h-5 text-red-600 hover:text-red-700"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{skip + 1}</span> to <span className="font-medium">{Math.min(skip + PAGE_SIZE, total)}</span> of <span className="font-medium">{total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={buildUrl(currentPage - 1)}
                    className={`flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium ${
                      currentPage <= 1
                        ? "pointer-events-none opacity-50 text-gray-400"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Link>
                  <span className="text-sm text-gray-600">
                    Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                  </span>
                  <Link
                    href={buildUrl(currentPage + 1)}
                    className={`flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium ${
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50 text-gray-400"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCardWithIcon({
  label,
  value,
  color,
  bgColor,
  icon
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-600 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SUBMITTED: "bg-yellow-100 text-yellow-800",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

function getStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Pending",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
}
