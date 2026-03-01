import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { Search, Clock, ArrowRight } from "lucide-react";

export const metadata = { title: "Track Applications" };

export default async function TrackingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const applications = await prisma.application.findMany({
    where: { applicantId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      history: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Track Applications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor the real-time status of your permit applications
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8 text-gray-400" />}
          title="No applications to track"
          description="Submit an application first to start tracking its progress."
          action={{ label: "New Application", href: "/dashboard/applications/new" }}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {app.applicationNumber}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {app.businessName}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs text-gray-500">
                        <span>Draft</span>
                        <span>Submitted</span>
                        <span>Under Review</span>
                        <span>Approved</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            app.status === "REJECTED" || app.status === "CANCELLED"
                              ? "bg-red-500"
                              : "bg-blue-600"
                          }`}
                          style={{
                            width: `${
                              {
                                DRAFT: 10,
                                SUBMITTED: 35,
                                UNDER_REVIEW: 60,
                                APPROVED: 100,
                                REJECTED: 60,
                                CANCELLED: 0,
                              }[app.status]
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Recent History */}
                    {app.history.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                          Recent Activity
                        </p>
                        <ul className="space-y-1">
                          {app.history.map((h) => (
                            <li
                              key={h.id}
                              className="flex items-center gap-2 text-xs text-gray-500"
                            >
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">
                                {h.newStatus.replace(/_/g, " ")}
                              </span>
                              <span>—</span>
                              <span>{formatDateTime(h.createdAt)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/applications/${app.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
