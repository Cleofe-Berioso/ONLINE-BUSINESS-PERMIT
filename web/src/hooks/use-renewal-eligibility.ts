"use client";

import { useQuery } from "@tanstack/react-query";

export interface PermitData {
  id: string;
  permitNumber: string;
  businessName: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

export interface RenewalEligibilityData {
  permits: PermitData[];
  isEligible: boolean;
  eligibleCount: number;
}

/**
 * Hook to fetch user's permits and check renewal eligibility
 * Eligible only if user has ACTIVE or EXPIRED permits
 */
export function useRenewalEligibility() {
  return useQuery<RenewalEligibilityData>({
    queryKey: ["renewal-eligibility"],
    queryFn: async () => {
      const res = await fetch("/api/permits/user");

      if (!res.ok) {
        throw new Error("Failed to fetch permits");
      }

      return res.json();
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 1,
  });
}
