"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { Alert } from "@/components/ui/alert";
import { Plus, Eye, FileText } from "lucide-react";

interface Application {
  id: string;
  applicationNumber: string;
  type: string;
  status: string;
  businessName: string;
  businessType: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      } else {
        setError(data.error || "Failed to load applications");
      }
    } catch {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading applications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Manage your business permit applications</p>
        </div>
        <Link href="/dashboard/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">Start by creating your first business permit application</p>
            <Link href="/dashboard/applications/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium">
                        {app.applicationNumber}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="font-medium text-gray-900">{app.businessName}</p>
                    <p className="text-sm text-gray-500">
                      {app.type} • {app.businessType} • Created{" "}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/applications/${app.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}