"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { PageLoading } from "@/components/ui/loading";

interface IssuanceDetail {
  id: string;
  status: string;
  issuedAt: string | null;
  releasedAt: string | null;
  completedAt: string | null;
  staffNotes: string | null;
  permit: {
    id: string;
    permitNumber: string;
    businessName: string;
    businessAddress: string;
    ownerName: string;
    issueDate: string;
    expiryDate: string;
    status: string;
    application: {
      id: string;
      applicationNumber: string;
    };
  };
  issuedBy: {
    firstName: string;
    lastName: string;
  };
}

export default function IssuanceDetailPage() {
  const params = useParams();
  const router = useRouter();  const [issuance, setIssuance] = useState<IssuanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [staffNotes, setStaffNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fetchIssuance = useCallback(async () => {
    try {
      const res = await fetch(`/api/issuance/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setIssuance(data);
      }
      setLoading(false);
    } catch {
      setError("Failed to load issuance details");
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchIssuance();
  }, [fetchIssuance]);

  const handleAction = async (action: "ISSUE" | "RELEASE" | "COMPLETE") => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/issuance/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, staffNotes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update issuance");
        return;
      }

      setSuccess(data.message);
      setTimeout(() => router.push("/dashboard/issuance"), 2000);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permit Issuance</h1>
          <p className="text-gray-600">Process and issue business permit</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {issuance ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Permit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Permit Number</span>
                <p className="font-mono font-medium">{issuance.permit.permitNumber}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Business Name</span>
                <p className="font-medium">{issuance.permit.businessName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Owner</span>
                <p>{issuance.permit.ownerName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Address</span>
                <p>{issuance.permit.businessAddress}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Issue Date</span>
                  <p>{new Date(issuance.permit.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Expiry Date</span>
                  <p>{new Date(issuance.permit.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issuance Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Current Status</span>
                <p className="font-medium text-lg capitalize">
                  {issuance.status.toLowerCase().replace("_", " ")}
                </p>
              </div>

              <Textarea
                label="Staff Notes"
                placeholder="Add any notes about this issuance..."
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                rows={3}
              />

              <div className="flex gap-3">
                {issuance.status === "PREPARED" && (
                  <Button
                    onClick={() => handleAction("ISSUE")}
                    loading={actionLoading}
                    className="flex-1"
                  >
                    Mark as Issued
                  </Button>
                )}
                {issuance.status === "ISSUED" && (
                  <Button
                    onClick={() => handleAction("RELEASE")}
                    loading={actionLoading}
                    variant="success"
                    className="flex-1"
                  >
                    Release Permit
                  </Button>
                )}
                {issuance.status === "RELEASED" && (
                  <Button
                    onClick={() => handleAction("COMPLETE")}
                    loading={actionLoading}
                    variant="success"
                    className="flex-1"
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              Enter the issuance ID to process a permit, or use the issuance list to select one.
            </p>
            <Button onClick={() => router.push("/dashboard/issuance")}>
              Go to Issuance List
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
