import { z } from "zod";

// ============================================================================
// User Validations
// ============================================================================

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be at most 50 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be at most 50 characters"),
    middleName: z.string().max(50).optional(),
    phone: z
      .string()
      .regex(
        /^(\+63|0)(9\d{9})$/,
        "Invalid Philippine phone number (e.g., 09171234567)"
      )
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  middleName: z.string().max(50).optional(),
  phone: z
    .string()
    .regex(/^(\+63|0)(9\d{9})$/, "Invalid Philippine phone number")
    .optional()
    .or(z.literal("")),
});

// ============================================================================
// Application Validations
// ============================================================================

export const applicationSchema = z.object({
  type: z.enum(["NEW", "RENEWAL"]),
  businessName: z
    .string()
    .min(2, "Business name is required")
    .max(200, "Business name is too long"),
  businessType: z.string().min(1, "Business type is required"),
  businessAddress: z.string().min(5, "Business address is required"),
  businessBarangay: z.string().optional(),
  businessCity: z.string().optional(),
  businessProvince: z.string().optional(),
  businessZipCode: z
    .string()
    .regex(/^\d{4}$/, "ZIP code must be 4 digits")
    .optional()
    .or(z.literal("")),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  dtiSecRegistration: z.string().optional(),
  tinNumber: z
    .string()
    .regex(/^\d{3}-\d{3}-\d{3}-\d{3}$/, "Invalid TIN format (xxx-xxx-xxx-xxx)")
    .optional()
    .or(z.literal("")),
  sssNumber: z.string().optional(),
  businessArea: z.coerce.number().positive().optional(),
  numberOfEmployees: z.coerce.number().int().positive().optional(),
  capitalInvestment: z.coerce.number().nonnegative().optional(),
  grossSales: z.coerce.number().nonnegative().optional(),
  previousPermitId: z.string().optional(),
});

// ============================================================================
// Claim Schedule Validations
// ============================================================================

export const createScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  timeSlots: z
    .array(
      z.object({
        startTime: z
          .string()
          .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
        endTime: z
          .string()
          .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
        maxCapacity: z.coerce
          .number()
          .int()
          .positive("Capacity must be a positive number"),
      })
    )
    .min(1, "At least one time slot is required"),
});

export const reserveSlotSchema = z.object({
  timeSlotId: z.string().min(1, "Time slot is required"),
  applicationId: z.string().min(1, "Application is required"),
});

// ============================================================================
// Claim Reference Validations
// ============================================================================

export const verifyClaimSchema = z.object({
  referenceNumber: z
    .string()
    .min(1, "Claim reference number is required")
    .regex(/^CLM-\d{8}-[A-Z0-9]{6}$/, "Invalid claim reference format"),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type ReserveSlotInput = z.infer<typeof reserveSlotSchema>;
export type VerifyClaimInput = z.infer<typeof verifyClaimSchema>;
