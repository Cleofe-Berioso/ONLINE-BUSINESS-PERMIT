"use client";

import Link from "next/link";
import { useRenewalEligibility } from "@/hooks/use-renewal-eligibility";
import { UnderConstructionCard } from "@/components/dashboard/under-construction-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Clock, MapPin } from "lucide-react";
import { formatExpiryInfo } from "@/lib/renewal-helpers";

export function RenewalPermitContent() {
  const { data, isLoading, error } = useRenewalEligibility();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
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
              Unable to load your permits. Please try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.isEligible || !data?.permits || data.permits.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No Permits Available for Renewal
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              You don't have any active or expired permits to renew.
            </p>
            <Link href="/dashboard/renew">
              <Button variant="outline">Back to Renewal Portal</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permits List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Available Permits ({data.eligibleCount})
        </h2>
        {data.permits.map((permit) => (
          <Card key={permit.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b p-4 sm:flex-col sm:items-start sm:gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {permit.businessName}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Permit #{permit.permitNumber}
                  </p>
                </div>
                <div className="mt-4 flex gap-2 sm:mt-0 sm:w-full">
                  <Link href={`/dashboard/renew/permit/${permit.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      Renew This Permit
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 sm:grid-cols-1">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-600">
                    Status
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        permit.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {permit.status === "ACTIVE" ? "Active" : "Expired"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-600">
                    Expiry Info
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-900">
                    <Clock className="h-4 w-4" />
                    {formatExpiryInfo(new Date(permit.expiryDate), permit.status)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-600">
                    Issue Date
                  </p>
                  <p className="mt-1 text-sm text-gray-900">{permit.issueDate}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-600">
                    Expiry Date
                  </p>
                  <p className="mt-1 text-sm text-gray-900">{permit.expiryDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TODO: Add renewal form placeholder when permit is selected */}
      <UnderConstructionCard pageTitle="Renewal Form" />
    </div>
  );
}
