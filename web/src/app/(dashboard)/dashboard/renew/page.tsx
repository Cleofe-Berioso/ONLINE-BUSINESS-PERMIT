"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getRenewalEligibility,
} from "@/lib/application-helpers";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface RenewalEligiblePermit {
  permitId: string;
  permitNumber: string;
  businessName: string;
  expiryDate: string;
  isEligible: boolean;
  reason?: string;
  renewalWindowInfo?: {
    expirerOn: Date;
    earliestRenewalDate: Date;
    latestRenewalDate: Date;
  };
}

export default function RenewalPage() {
  const router = useRouter();
  const [permits, setPermits] = useState<RenewalEligiblePermit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingPermitId, setSubmittingPermitId] = useState<string | null>(null);

  useEffect(() => {
    const loadRenewalEligiblePermits = async () => {
      try {
        const response = await fetch("/api/permits/renewal-eligible");
        if (!response.ok) {
          toast.error("Failed to load permits");
          return;
        }
        const data = await response.json();
        setPermits(data.permits || []);
      } catch (error) {
        toast.error("Failed to load renewal-eligible permits");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadRenewalEligiblePermits();
  }, []);

  const handleStartRenewal = async (permitId: string) => {
    setSubmittingPermitId(permitId);
    try {
      const response = await fetch("/api/applications/renewal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RENEWAL",
          previousPermitId: permitId,
          businessName: "",
          businessType: "",
          businessAddress: "",
          businessCity: "",
          businessProvince: "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.reason || error.error || "Failed to start renewal");
        return;
      }

      const data = await response.json();
      toast.success("Renewal application created successfully");
      router.push(`/dashboard/applications/${data.application.id}`);
    } catch (error) {
      toast.error("Failed to start renewal application");
      console.error(error);
    } finally {
      setSubmittingPermitId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!permits || permits.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Renew Your Permit</h1>
          <p className="mt-2 text-gray-600">
            Manage permit renewals for your business.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <h3 className="font-medium text-amber-900">No eligible permits</h3>
              <p className="mt-1 text-sm text-amber-800">
                You currently have no permits eligible for renewal. Check back when your permit approaches expiry.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Renew Your Permit</h1>
        <p className="mt-2 text-gray-600">
          Select a permit below to start the renewal process.
        </p>
      </div>

      <div className="space-y-4">
        {permits.map((permit) => (
          <div
            key={permit.permitId}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {permit.businessName}
                  </h3>
                  {permit.isEligible && (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      Eligible
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Permit: <span className="font-mono font-medium">{permit.permitNumber}</span>
                </p>

                {permit.renewalWindowInfo && (
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>
                      Expires: <span className="font-medium">
                        {new Date(permit.renewalWindowInfo.expirerOn).toLocaleDateString()}
                      </span>
                    </p>
                    <p>
                      Renewal opens: <span className="font-medium">
                        {new Date(permit.renewalWindowInfo.earliestRenewalDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p>
                      Renewal closes: <span className="font-medium">
                        {new Date(permit.renewalWindowInfo.latestRenewalDate).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                )}

                {!permit.isEligible && permit.reason && (
                  <div className="mt-3 rounded-lg bg-amber-50 p-3">
                    <p className="text-sm text-amber-800">
                      <AlertCircle className="mb-1 inline h-4 w-4 mr-1" />
                      {permit.reason}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleStartRenewal(permit.permitId)}
                disabled={!permit.isEligible || submittingPermitId === permit.permitId}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
              >
                {submittingPermitId === permit.permitId && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Start Renewal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
