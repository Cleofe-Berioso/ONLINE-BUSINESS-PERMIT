import type { Permit } from "@prisma/client";

/**
 * Check if an applicant is eligible for renewal
 * Eligible only if they have ACTIVE or EXPIRED permits
 */
export function isEligibleForRenewal(permits: Permit[]): boolean {
  return permits.length > 0;
}

/**
 * Get the number of days until permit expiry
 */
export function getDaysUntilExpiry(expiryDate: Date): number {
  const now = new Date();
  const daysMs = expiryDate.getTime() - now.getTime();
  return Math.ceil(daysMs / (1000 * 60 * 60 * 24));
}

/**
 * Get permit status description
 */
export function getPermitStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    EXPIRED: "Expired",
    REVOKED: "Revoked",
    RENEWED: "Renewed",
  };
  return labels[status] || status;
}

/**
 * Format permit expiry information
 */
export function formatExpiryInfo(
  expiryDate: Date,
  status: string
): string {
  if (status === "EXPIRED") {
    return "Expired - renewal available";
  }

  const daysLeft = getDaysUntilExpiry(expiryDate);
  if (daysLeft < 0) {
    return "Expired - renewal available";
  }
  if (daysLeft === 0) {
    return "Expires today";
  }
  if (daysLeft === 1) {
    return "Expires tomorrow";
  }
  if (daysLeft <= 30) {
    return `Expires in ${daysLeft} days`;
  }

  const months = Math.floor(daysLeft / 30);
  return `Expires in ${months} month${months > 1 ? "s" : ""}`;
}
