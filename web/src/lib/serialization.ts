/**
 * Serialization utilities for Prisma Decimal types
 * Converts Prisma Decimal objects to numbers/strings for JSON responses
 */

import type { Decimal } from "@prisma/client/runtime/library";

/**
 * Convert Decimal to number for JSON serialization
 */
export function toNumber(value: Decimal | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  // Prisma Decimal type
  if (typeof value === "object" && "toNumber" in value) {
    return (value as any).toNumber();
  }
  return null;
}

/**
 * Convert Decimal to string for safe storage in JSON
 */
export function toDecimalString(value: Decimal | number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  // Prisma Decimal type
  if (typeof value === "object" && "toString" in value) {
    return (value as any).toString();
  }
  return null;
}

/**
 * Safe serialization of payment object for API responses
 */
export function serializePayment(payment: any) {
  return {
    id: payment.id,
    applicationId: payment.applicationId,
    referenceNumber: payment.referenceNumber,
    amount: toNumber(payment.amount),
    method: payment.method,
    status: payment.status,
    transactionId: payment.transactionId,
    receiptNumber: payment.receiptNumber,
    checkoutUrl: payment.checkoutUrl,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    metadata: payment.metadata
      ? {
          ...payment.metadata,
          permitFee: payment.metadata.permitFee
            ? toDecimalString(payment.metadata.permitFee)
            : payment.metadata.permitFee,
          processingFee: payment.metadata.processingFee
            ? toDecimalString(payment.metadata.processingFee)
            : payment.metadata.processingFee,
          filingFee: payment.metadata.filingFee
            ? toDecimalString(payment.metadata.filingFee)
            : payment.metadata.filingFee,
        }
      : null,
  };
}
