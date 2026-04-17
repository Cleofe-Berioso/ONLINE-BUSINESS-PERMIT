"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import prisma from "@/lib/prisma";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ClosureApplicationPage() {
  const router = useRouter();
  const [selectedPermitId, setSelectedPermitId] = useState<string>("");
  const [closureReason, setClosureReason] = useState<string>("");
  const [closureEffectiveDate, setClosureEffectiveDate] = useState<string>("");

  // Fetch user's permits (server will handle eligibility check)
  const { data: permits, isLoading: permitsLoading } = useQuery({
    queryKey: ["closureEligiblePermits"],
    queryFn: async () => {
      const res = await fetch("/api/permits/closure-eligible");
      if (!res.ok) throw new Error("Failed to load permits");
      return res.json();
    },
  });

  // Submit closure application
  const submitMutation = useMutation({
    mutationFn: async (formData: {
      previousPermitId: string;
      closureReason: string;
      closureEffectiveDate: string;
    }) => {
      const res = await fetch("/api/applications/closure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CLOSURE",
          previousPermitId: formData.previousPermitId,
          closureReason: formData.closureReason,
          closureEffectiveDate: formData.closureEffectiveDate,
          businessName: "TBD",
          businessType: "TBD",
          businessAddress: "TBD",
          businessCity: "TBD",
          businessProvince: "TBD",
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.reason || error.error || "Failed to create closure application");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Closure application created successfully");
      router.push(`/dashboard/applications/${data.application.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermitId || !closureReason || !closureEffectiveDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    submitMutation.mutate({
      previousPermitId: selectedPermitId,
      closureReason,
      closureEffectiveDate,
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Close Your Business</h1>
        <p className="mt-2 text-gray-600">
          Initiate the permit closure process for your business.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-6">
          {/* Select Permit */}
          <div>
            <label htmlFor="permit" className="block text-sm font-medium text-gray-900">
              Select Permit to Close <span className="text-red-600">*</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Choose the active permit you wish to close.
            </p>
            <select
              id="permit"
              value={selectedPermitId}
              onChange={(e) => setSelectedPermitId(e.target.value)}
              disabled={permitsLoading}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {permitsLoading ? "Loading permits..." : "Select a permit"}
              </option>
              {permits?.permits?.map((permit: any) => (
                <option key={permit.id} value={permit.id} disabled={!permit.isEligible}>
                  {permit.permitNumber} - {permit.businessName}
                  {!permit.isEligible ? " (Blocked)" : ""}
                </option>
              ))}
            </select>

            {selectedPermitId && permits?.permits && (() => {
              const selectedPermit = permits.permits.find((p: any) => p.id === selectedPermitId);
              return selectedPermit && !selectedPermit.isEligible ? (
                <div className="mt-3 rounded-lg bg-red-50 p-3 border border-red-200">
                  <p className="text-sm text-red-800">
                    <span className="font-medium">Cannot close:</span> {selectedPermit.reason}
                  </p>
                </div>
              ) : null;
            })()}
          </div>

          {/* Closure Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-900">
              Reason for Closure <span className="text-red-600">*</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Explain why you are closing the business.
            </p>
            <textarea
              id="reason"
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              placeholder="e.g., Retirement, relocation, business sold, etc."
              rows={4}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Closure Effective Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-900">
              Effective Closure Date <span className="text-red-600">*</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Date when the business will officially close.
            </p>
            <input
              id="date"
              type="date"
              value={closureEffectiveDate}
              onChange={(e) => setClosureEffectiveDate(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={submitMutation.isPending || !selectedPermitId || !closureReason || !closureEffectiveDate}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 font-medium text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Closure Application
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-900 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
