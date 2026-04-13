"use client";

import Link from "next/link";
import { useRenewalEligibility } from "@/hooks/use-renewal-eligibility";
import { UnderConstructionCard } from "@/components/dashboard/under-construction-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

export function RenewalMainContent() {
  const { data, isLoading, error } = useRenewalEligibility();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
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
              Unable to load renewal information. Please try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.isEligible) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No Permits to Renew
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              You don't have any active permits to renew yet. Please apply for a
              permit first.
            </p>
            {/* TODO: Link to apply for permit page when implemented */}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Eligibility Status */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">
                You're eligible for renewal
              </p>
              <p className="text-sm text-green-800">
                You have {data.eligibleCount} permit{data.eligibleCount !== 1 ? "s" : ""} that{" "}
                {data.eligibleCount === 1 ? "can" : "can"}
                be renewed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewal Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Renewal Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dashboard/renew/permit">
            <Button className="w-full" size="lg">
              Start Renewal
            </Button>
          </Link>
          <p className="text-sm text-gray-600">
            Click above to select a permit and begin the renewal process.
          </p>
        </CardContent>
      </Card>

      {/* TODO: Add renewal status overview, quick stats, etc. */}
      <UnderConstructionCard pageTitle="Renewal Dashboard" />
    </div>
  );
}
