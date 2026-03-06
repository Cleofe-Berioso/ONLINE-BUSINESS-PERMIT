import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ClipboardList, Download } from "lucide-react";

export const metadata = { title: "Audit Logs" };

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATOR") redirect("/dashboard");

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      createdAt: true,
      ipAddress: true,
      user: {
        select: { email: true, firstName: true, lastName: true },
      },
    },
  });

  const actionColors: Record<string, string> = {
    LOGIN: "bg-green-100 text-green-700",
    LOGOUT: "bg-gray-100 text-gray-700",
    REGISTER: "bg-blue-100 text-blue-700",
    REVIEW_APPROVE: "bg-green-100 text-green-700",
    REVIEW_REJECT: "bg-red-100 text-red-700",
    DOCUMENT_VERIFIED: "bg-green-100 text-green-700",
    DOCUMENT_REJECTED: "bg-red-100 text-red-700",
    RELEASE_PERMIT: "bg-purple-100 text-purple-700",
    ADMIN_UPDATE_USER: "bg-orange-100 text-orange-700",
    ADMIN_CREATE_USER: "bg-blue-100 text-blue-700",
    UPDATE_SETTINGS: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-600">
            System activity trail — last 200 events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
            <ClipboardList className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{logs.length} events</span>
          </div>
          <a
            href="/api/admin/reports/export?type=audit"
            download
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </div>
      </div>      <Card>
        <CardContent className="p-0">
          {/* Mobile cards */}
          <div className="divide-y md:hidden">
            {logs.map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(log.createdAt)}</span>
                </div>
                <div className="mt-1.5">
                  {log.user ? (
                    <p className="text-sm font-medium text-gray-900">{log.user.firstName} {log.user.lastName}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">System</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {log.entity}{log.entityId && <span className="ml-1 font-mono">#{log.entityId.slice(-6)}</span>}
                    {log.ipAddress && <span className="ml-2 font-mono">{log.ipAddress}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Entity</th>
                  <th className="px-4 py-3 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <p className="font-medium text-gray-900">{log.user.firstName} {log.user.lastName}</p>
                          <p className="text-xs text-gray-500">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">System</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.entity}
                      {log.entityId && <span className="ml-1 text-xs text-gray-400 font-mono">#{log.entityId.slice(-6)}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
