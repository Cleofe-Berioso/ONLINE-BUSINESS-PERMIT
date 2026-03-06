/**
 * Data Sanitization Utilities
 * Strips sensitive fields before sending data in API responses.
 */

/** Fields that must never appear in any API response */
const SENSITIVE_USER_FIELDS = ["password", "passwordResetToken", "passwordResetExpiry"] as const;

type SensitiveField = typeof SENSITIVE_USER_FIELDS[number];

// A user record as returned by Prisma (may include password hash)
export type RawUser = Record<string, unknown>;

/**
 * Remove sensitive fields from a user object.
 * Safe to call on partial Prisma `select` results too — it's a no-op if the
 * field was never included.
 */
export function sanitizeUser<T extends RawUser>(user: T): Omit<T, SensitiveField> {
  const result = { ...user };
  for (const field of SENSITIVE_USER_FIELDS) {
    delete (result as Record<string, unknown>)[field];
  }
  return result as Omit<T, SensitiveField>;
}

/**
 * Remove sensitive fields from an array of user objects.
 */
export function sanitizeUsers<T extends RawUser>(users: T[]): Omit<T, SensitiveField>[] {
  return users.map(sanitizeUser);
}

/**
 * Strip a field from any object (generic helper).
 */
export function omitField<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  field: K
): Omit<T, K> {
  const { [field]: _omitted, ...rest } = obj;
  return rest as Omit<T, K>;
}
