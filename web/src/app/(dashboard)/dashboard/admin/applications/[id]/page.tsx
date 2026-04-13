"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${id}`);
        if (!response.ok) throw new Error("Failed to fetch application");
        const data = await response.json();
        setApplication(data.application);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (!id) return <div>Invalid application ID</div>;

  if (loading) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium">
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-gray-600">Loading application...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium">
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-lg bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error || "Application not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {application.applicationNumber}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{application.businessName}</p>
      </div>

      {/* Main Details */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Status</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {application.status}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Type</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {application.type === "NEW" ? "New Business Permit" : "Renewal"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Business Name</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {application.businessName}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Business Type</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {application.businessType}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Address</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {application.businessAddress}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Location</h3>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {application.businessBarangay}, {application.businessCity}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Info */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Name</h3>
              <p className="mt-1 text-gray-900">
                {application.applicant.firstName} {application.applicant.lastName}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Email</h3>
              <p className="mt-1 text-gray-900">{application.applicant.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {application.documents && application.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attached Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {application.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{doc.fileName || "Document"}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      doc.status === "VERIFIED" ? "bg-green-100 text-green-800" :
                      doc.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {application.status === "SUBMITTED" && (
          <>
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Approve Application
            </Button>
            <Button variant="destructive" className="flex-1">
              Reject Application
            </Button>
          </>
        )}
        {application.status === "UNDER_REVIEW" && (
          <>
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Approve
            </Button>
            <Button variant="destructive" className="flex-1">
              Reject
            </Button>
          </>
        )}
        {application.status === "APPROVED" && (
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            Generate Permit
          </Button>
        )}
      </div>
    </div>
  );
}
