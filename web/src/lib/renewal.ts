import type { Session } from "next-auth";
import prisma from "@/lib/prisma";

/**
 * Result of renewal eligibility check
 */
export interface RenewalEligibilityResult {
  isEligible: boolean;
  count: number;
}

/**
 * Check if a user is eligible for renewal
 * Eligible only if they have ACTIVE or EXPIRED permits
 *
 * @param userId - The user's ID
 * @returns Eligibility status and permit count
 */
export async function checkRenewalEligibility(
  userId: string
): Promise<RenewalEligibilityResult> {
  const permits = await prisma.permit.findMany({
    where: {
      application: {
        applicantId: userId,
      },
      status: {
        in: ["ACTIVE", "EXPIRED"],
      },
    },
    take: 1, // Just check if at least one exists
  });

  return {
    isEligible: permits.length > 0,
    count: permits.length,
  };
}

/**
 * Verify that a session has renewal eligibility
 * Throws an error if session is invalid or user is not eligible
 *
 * @param session - The user session
 * @returns Eligibility result if valid
 * @throws Error if session is invalid or user is not eligible
 */
export async function requireRenewalEligibility(
  session: Session | null
): Promise<RenewalEligibilityResult> {
  if (!session?.user?.id) {
    throw new Error("Unauthorized: No valid session");
  }

  const eligibility = await checkRenewalEligibility(session.user.id);

  if (!eligibility.isEligible) {
    throw new Error("Ineligible for renewal: No active or expired permits found");
  }

  return eligibility;
}
