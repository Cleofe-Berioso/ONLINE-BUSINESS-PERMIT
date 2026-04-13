"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getStatusColor } from "@/lib/utils";

interface Application {
  id: string;
  applicationNumber: string;
  businessName: string;
  type: "NEW" | "RENEWAL";
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED";
  submittedAt: string | null;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
  };
  documents: Array<{ id: string; status: string }>;
  permit: { id: string; permitNumber: string; status: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export function AdminApplicationsClient() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/applications");
        if (!response.ok) throw new Error("Failed to fetch applications");
        const data = await response.json();
        setApplications(data.applications || []);
        setFilteredApplications(data.applications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Apply search and filters
  useEffect(() => {
    let filtered = applications;

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.applicationNumber.toLowerCase().includes(term) ||
          app.businessName.toLowerCase().includes(term) ||
          app.applicant.email.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, filterStatus, applications]);

  // Calculate progress percentage
  const getProgress = (app: Application): number => {
    let progress = 0;

    // Documents uploaded
    if (app.documents.length > 0) progress += 25;

    // Submitted
    if (app.status !== "DRAFT") progress += 25;

    // Under review or approved
    if (app.status === "APPROVED" || app.status === "UNDER_REVIEW") progress += 25;

    // Permit issued
    if (app.permit) progress += 25;

    return progress;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage your permit applications
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === null ? "default" : "outline"}
          onClick={() => setFilterStatus(null)}
          size="sm"
        >
          All
        </Button>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            onClick={() => setFilterStatus(status)}
            size="sm"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading applications...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const progress = getProgress(app);
            return (
              <Card key={app.id} className="p-6">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.applicationNumber}
                    </h3>
                    <p className="text-sm text-gray-600">{app.businessName}</p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[app.status]
                    }`}
                  >
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Application Type</p>
                    <p className="font-medium text-gray-900">
                      {app.type === "NEW" ? "New Business Permit" : "Renewal"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Submitted Date</p>
                    <p className="font-medium text-gray-900">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : "Not submitted"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Applicant</p>
                    <p className="font-medium text-gray-900">
                      {app.applicant.firstName} {app.applicant.lastName}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-xs font-medium text-gray-700">Progress</p>
                    <p className="text-xs font-medium text-gray-700">{progress}%</p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/admin/applications/${app.id}`)
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
