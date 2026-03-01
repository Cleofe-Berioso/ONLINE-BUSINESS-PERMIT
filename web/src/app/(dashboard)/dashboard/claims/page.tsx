"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Tag, CheckCircle } from "lucide-react";

interface Reservation {
  id: string;
  claimId: string | null;
  status: string;
  confirmedAt: string | null;
  application: {
    applicationNumber: string;
    businessName: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
  timeSlot: {
    startTime: string;
    endTime: string;
  };
}

export default function ClaimsPage() {  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchRef, setSearchRef] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/claims/today");
      const data = await res.json();
      if (res.ok) {
        setReservations(data.reservations || []);
      }
    } catch {
      setError("Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRelease = async (reservationId: string) => {
    setProcessing(reservationId);
    setError("");

    try {
      const res = await fetch(`/api/claims/${reservationId}/release`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process claim");
        return;
      }

      setSuccess("Permit released successfully!");
      fetchReservations();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const handleSearchRef = async () => {
    if (!searchRef.trim()) return;

    setError("");
    try {
      const res = await fetch(
        `/api/claims/verify?ref=${encodeURIComponent(searchRef)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reference not found");
        return;
      }

      setSuccess(`Reference verified: ${data.reference.applicantName} — ${data.reference.businessName}`);
    } catch {
      setError("Verification failed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading claims..." />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Claims Processing</h1>
        <p className="mt-1 text-sm text-gray-600">
          Verify claim references and release permits to applicants
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Verify Reference */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Verify Claim Reference
          </CardTitle>
          <CardDescription>
            Enter the applicant&apos;s claim reference number to verify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              name="searchRef"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="CLM-20260301-XXXXXX"
              className="max-w-sm"
            />
            <Button onClick={handleSearchRef}>Verify</Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Claiming Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <EmptyState
              icon={<Tag className="h-8 w-8 text-gray-400" />}
              title="No claims scheduled for today"
              description="There are no claiming appointments for today."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Claim ID</th>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Time Slot</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">
                        {res.claimId || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {res.user.firstName} {res.user.lastName}
                      </td>
                      <td className="px-4 py-3">
                        {res.application.businessName}
                      </td>
                      <td className="px-4 py-3">
                        {res.timeSlot.startTime} – {res.timeSlot.endTime}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={res.status} />
                      </td>
                      <td className="px-4 py-3">
                        {res.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyAndRelease(res.id)}
                            loading={processing === res.id}
                          >
                            <CheckCircle className="h-3 w-3" /> Release
                          </Button>
                        )}
                        {res.status === "COMPLETED" && (
                          <span className="text-sm text-green-600">Released</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
