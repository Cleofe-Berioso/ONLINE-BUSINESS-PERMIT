"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { ArrowLeft, CheckCircle, XCircle, FileText } from "lucide-react";

interface ApplicationDetail {
  id: string;
  applicationNumber: string;
  type: string;
  status: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessBarangay?: string;
  businessCity?: string;
  businessProvince?: string;
  tinNumber?: string;
  dtiSecRegistration?: string;
  capitalInvestment?: number;
  numberOfEmployees?: number;
  applicant: { firstName: string; lastName: string; email: string };
  documents: {
    id: string;
    originalName: string;
    documentType: string;
    status: string;
    version: number;
  }[];
}

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");  const fetchApplication = useCallback(async () => {
    try {
      const res = await fetch(`/api/applications/${id}`);
      const data = await res.json();
      if (res.ok) {
        setApplication(data.application);
      } else {
        setError("Application not found");
      }
    } catch {
      setError("Failed to load application");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleAction = async (action: "APPROVE" | "REJECT" | "REQUEST_REVISION") => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/applications/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Action failed");
        return;
      }

      setSuccess(
        action === "APPROVE"
          ? "Application approved successfully!"
          : action === "REJECT"
          ? "Application rejected."
          : "Revision requested."
      );

      setTimeout(() => router.push("/dashboard/review"), 1500);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  if (!application) {
    return (
      <Alert variant="error">
        Application not found. <Link href="/dashboard/review" className="underline">Go back</Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reviews
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Review: {application.applicationNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{application.businessName}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Applicant</dt>
                  <dd className="font-medium text-gray-900">
                    {application.applicant.firstName} {application.applicant.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">
                    {application.applicant.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Business Name</dt>
                  <dd className="font-medium text-gray-900">
                    {application.businessName}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Business Type</dt>
                  <dd className="font-medium text-gray-900">
                    {application.businessType}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Address</dt>
                  <dd className="font-medium text-gray-900">
                    {[
                      application.businessAddress,
                      application.businessBarangay,
                      application.businessCity,
                      application.businessProvince,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
                {application.tinNumber && (
                  <div>
                    <dt className="text-gray-500">TIN</dt>
                    <dd className="font-medium text-gray-900">
                      {application.tinNumber}
                    </dd>
                  </div>
                )}
                {application.dtiSecRegistration && (
                  <div>
                    <dt className="text-gray-500">DTI/SEC Reg.</dt>
                    <dd className="font-medium text-gray-900">
                      {application.dtiSecRegistration}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents ({application.documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {application.documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded.</p>
              ) : (
                <ul className="divide-y">
                  {application.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {doc.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.documentType.replace(/_/g, " ")} · v{doc.version}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  label="Comments / Notes"
                  name="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add review comments..."
                />

                <div className="space-y-2">
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={() => handleAction("APPROVE")}
                    loading={submitting}
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="warning"
                    className="w-full"
                    onClick={() => handleAction("REQUEST_REVISION")}
                    loading={submitting}
                  >
                    Request Revision
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleAction("REJECT")}
                    loading={submitting}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
