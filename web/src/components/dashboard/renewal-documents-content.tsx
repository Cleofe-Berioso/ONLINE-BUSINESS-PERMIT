"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";
import type { DocumentStatus } from "@prisma/client";

interface DocumentData {
  id: string;
  fileName: string;
  originalName: string;
  documentType: string;
  status: DocumentStatus;
  fileSize: number;
  createdAt: string;
  verifiedAt: string | null;
  rejectionReason: string | null;
  filePath: string;
}

interface RenewalDocumentsResponse {
  documents: DocumentData[];
  total: number;
  message: string;
}

/**
 * RenewalDocumentsContent — Displays documents for renewal applications
 * Shows upload status, verification status, and allows document management
 */
export function RenewalDocumentsContent() {
  const { data, isLoading, error } = useQuery<RenewalDocumentsResponse>({
    queryKey: ["renewal-documents"],
    queryFn: async () => {
      const res = await fetch("/api/renewals/documents");

      if (!res.ok) {
        throw new Error("Failed to fetch documents");
      }

      return res.json();
    },
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">
              Unable to load your documents. Please try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING_VERIFICATION":
        return "bg-yellow-100 text-yellow-800";
      case "UPLOADED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "PENDING_VERIFICATION":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: DocumentStatus): string => {
    const labels: Record<DocumentStatus, string> = {
      UPLOADED: "Uploaded",
      PENDING_VERIFICATION: "Pending Review",
      VERIFIED: "Verified",
      REJECTED: "Rejected",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (!data?.documents || data.documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No Documents Uploaded
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Upload required documents for your renewal application.
            </p>
            <Link href="/dashboard/renew/permit">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Start Renewal & Upload Documents
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Document Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-600">
                Total Documents
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {data.total}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-600">
                Verified
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {data.documents.filter((d) => d.status === "VERIFIED").length}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-600">
                Pending
              </p>
              <p className="mt-2 text-2xl font-bold text-yellow-600">
                {
                  data.documents.filter((d) => d.status === "PENDING_VERIFICATION")
                    .length
                }
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-600">
                Rejected
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {data.documents.filter((d) => d.status === "REJECTED").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Uploaded Documents ({data.total})
        </h2>
        {data.documents.map((document) => (
          <Card key={document.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 sm:flex-col">
                {/* Document Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {document.originalName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {document.documentType} • {formatFileSize(document.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(document.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(document.status)}
                      {getStatusLabel(document.status)}
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-1">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Uploaded
                    </p>
                    <p className="mt-1 text-gray-900">{formatDate(document.createdAt)}</p>
                  </div>

                  {document.status === "VERIFIED" && document.verifiedAt && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Verified
                      </p>
                      <p className="mt-1 text-green-700">
                        {formatDate(document.verifiedAt)}
                      </p>
                    </div>
                  )}

                  {document.status === "REJECTED" && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Rejection Reason
                      </p>
                      <p className="mt-1 text-red-700">
                        {document.rejectionReason || "Not specified"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 sm:flex-col">
                  <Link href={document.filePath} target="_blank">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 sm:w-full">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </Link>

                  {document.status === "REJECTED" && (
                    <Button size="sm" className="flex items-center gap-2 sm:w-full">
                      <Upload className="h-4 w-4" />
                      Upload Replacement
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-gray-700">
            Please ensure all uploaded documents meet the following requirements:
          </p>
          <ul className="list-inside space-y-2 text-gray-600">
            <li>✓ Clear and legible scans (300 DPI minimum)</li>
            <li>✓ Original or certified copies only</li>
            <li>✓ File size under 5 MB each</li>
            <li>✓ Supported formats: PDF, JPG, PNG</li>
            <li>✓ Current/valid documents (within 6 months for most files)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
