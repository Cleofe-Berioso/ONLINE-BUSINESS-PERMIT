import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  BarChart3,
  CalendarCheck,
  Download,
} from "lucide-react";

export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATOR") redirect("/dashboard");

  // Aggregate stats
  const [
    totalUsers,
    totalApplications,
    statusCounts,
    totalPermits,
    totalDocuments,
    recentApplications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.application.count(),
    prisma.application.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.permit.count(),
    prisma.document.count(),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        applicationNumber: true,
        businessName: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s) => {
    statusMap[s.status] = s._count;
  });

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Total Applications",
      value: totalApplications,
      icon: <FileText className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      label: "Approved",
      value: statusMap["APPROVED"] || 0,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Under Review",
      value: statusMap["UNDER_REVIEW"] || 0,
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Rejected",
      value: statusMap["REJECTED"] || 0,
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      bg: "bg-red-50",
    },
    {
      label: "Permits Issued",
      value: totalPermits,
      icon: <CalendarCheck className="h-6 w-6 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      label: "Documents",
      value: totalDocuments,
      icon: <BarChart3 className="h-6 w-6 text-teal-600" />,
      bg: "bg-teal-50",
    },
    {
      label: "Submitted",
      value: statusMap["SUBMITTED"] || 0,
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      bg: "bg-orange-50",
    },
  ];
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">System overview and application statistics</p>
        </div>
        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2">          {[
            { type: "applications", label: "Applications" },
            { type: "users", label: "Users" },
            { type: "permits", label: "Permits" },
            { type: "payments", label: "Payments" },
            { type: "audit", label: "Audit Log" },
          ].map(({ type, label }) => (
            <a
              key={type}
              href={`/api/admin/reports/export?type=${type}`}
              download
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-3.5 w-3.5" />
              {label} CSV
            </a>
          ))}
        </div>
      </div>      {/* Stats Grid */}
      <div className="mb-8 grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
              <div className={`rounded-lg ${stat.bg} p-2 sm:p-3 flex-shrink-0`}>{stat.icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 sm:text-sm truncate">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Status Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusMap).map(([status, count]) => {
                const percentage =
                  totalApplications > 0
                    ? ((count / totalApplications) * 100).toFixed(1)
                    : "0";

                const colors: Record<string, string> = {
                  DRAFT: "bg-gray-400",
                  SUBMITTED: "bg-blue-500",
                  UNDER_REVIEW: "bg-yellow-500",
                  APPROVED: "bg-green-500",
                  REJECTED: "bg-red-500",
                  CANCELLED: "bg-gray-300",
                };

                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {status.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full ${colors[status] || "bg-gray-400"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentApplications.map((app) => (
                <li
                  key={app.applicationNumber}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {app.businessName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.applicationNumber}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      {
                        DRAFT: "bg-gray-100 text-gray-700",
                        SUBMITTED: "bg-blue-100 text-blue-700",
                        ENDORSED: "bg-purple-100 text-purple-700",
                        UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
                        APPROVED: "bg-green-100 text-green-700",
                        REJECTED: "bg-red-100 text-red-700",
                        CANCELLED: "bg-gray-100 text-gray-500",
                      }[app.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {app.status.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
