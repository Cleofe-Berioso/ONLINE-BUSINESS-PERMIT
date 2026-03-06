"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Clock, ArrowRight, Radio } from "lucide-react";
import { useSSE } from "@/hooks/use-sse";
import { toast } from "sonner";
import type { SSEEvent } from "@/lib/sse";

interface HistoryEntry {
  id: string;
  newStatus: string;
  createdAt: string;
  comment: string | null;
}

interface ApplicationRow {
  id: string;
  applicationNumber: string;
  businessName: string;
  status: string;
  updatedAt: string;
  history: HistoryEntry[];
}

const PROGRESS: Record<string, number> = {
  DRAFT: 10, SUBMITTED: 35, UNDER_REVIEW: 60,
  APPROVED: 100, REJECTED: 60, CANCELLED: 0,
};

export function TrackingClient({ initialApplications }: { initialApplications: ApplicationRow[] }) {
  const [apps, setApps] = useState<ApplicationRow[]>(initialApplications);
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());

  const handleStatusChange = useCallback((event: SSEEvent) => {
    if (event.type !== "application_status_changed") return;
    const { applicationId, applicationNumber, newStatus } = event.data as {
      applicationId: string; applicationNumber: string; newStatus: string;
    };

    setApps((prev) =>
      prev.map((app) => {
        if (app.id !== applicationId) return app;
        // Prepend a synthetic history entry for immediate feedback
        const syntheticEntry: HistoryEntry = {
          id: `live-${Date.now()}`,
          newStatus,
          createdAt: new Date().toISOString(),
          comment: "Status updated in real-time",
        };
        return {
          ...app,
          status: newStatus,
          history: [syntheticEntry, ...app.history].slice(0, 3),
        };
      })
    );
    setLiveIds((prev) => new Set([...prev, applicationId]));
    toast.info(
      `${applicationNumber} status changed to ${newStatus.replace(/_/g, " ")}`,
      { description: "Your application was just updated.", duration: 6000 }
    );
  }, []);

  useSSE({ application_status_changed: handleStatusChange });

  return (
    <div className="space-y-4">
      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-green-600">
        <Radio className="h-3.5 w-3.5 animate-pulse" />
        <span>Live updates active — status changes appear instantly</span>
      </div>

      {apps.map((app) => (
        <Card
          key={app.id}
          className={`transition-all duration-500 ${liveIds.has(app.id) ? "ring-2 ring-blue-400 ring-offset-1" : ""} hover:shadow-md`}
        >
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {app.applicationNumber}
                  </h3>
                  <StatusBadge status={app.status} />
                  {liveIds.has(app.id) && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Updated
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{app.businessName}</p>                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="mb-2 hidden justify-between text-xs text-gray-500 sm:flex">
                    <span>Draft</span>
                    <span>Submitted</span>
                    <span>Under Review</span>
                    <span>Approved</span>
                  </div>
                  <div className="mb-1 flex justify-between text-xs text-gray-500 sm:hidden">
                    <span>Draft</span>
                    <span>Review</span>
                    <span>Done</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        app.status === "REJECTED" || app.status === "CANCELLED"
                          ? "bg-red-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${PROGRESS[app.status] ?? 0}%` }}
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
                        <li key={h.id} className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{h.newStatus.replace(/_/g, " ")}</span>
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
  );
}
