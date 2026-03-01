import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Applications" };

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const applications = await prisma.application.findMany({
    where: { applicantId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { permit: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage your business permit applications
          </p>
        </div>
        <Link href="/dashboard/applications/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Start by submitting a new business permit application."
          action={{
            label: "New Application",
            href: "/dashboard/applications/new",
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Application #</th>
                <th className="px-4 py-3 font-semibold">Business Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date Filed</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-600">
                    <Link href={`/dashboard/applications/${app.id}`}>
                      {app.applicationNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{app.businessName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.type} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/applications/${app.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
