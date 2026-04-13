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
// Payment Validations
// ============================================================================

export const paymentSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  method: z.enum(["GCASH", "MAYA", "BANK_TRANSFER", "OTC", "CASH"]).refine(Boolean, {
    message: "Invalid payment method",
  }),
  notes: z.string().max(500).optional(),
});

// ============================================================================
// Review Action Validations
// ============================================================================

export const reviewActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "REQUEST_REVISION", "COMMENT"]).refine(Boolean, {
    message: "Invalid review action",
  }),
  comment: z.string().max(1000).optional(),
});

// ============================================================================
// Admin User Management Validations
// ============================================================================

export const adminCreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
  phone: z
    .string()
    .regex(/^(\+63|0)(9\d{9})$/, "Invalid Philippine phone number")
    .optional()
    .or(z.literal("")),
  role: z.enum(["STAFF", "REVIEWER", "ADMINISTRATOR"]),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(["STAFF", "REVIEWER", "ADMINISTRATOR"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
  resetPassword: z.boolean().optional(),
});

// ============================================================================
// Permit Application Validations (Multi-step Business Permit Application)
// ============================================================================

export const permitApplicationStep1Schema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name is too long"),
  businessType: z.string().min(1, "Business type is required"),
  ownerName: z
    .string()
    .min(2, "Owner/Operator name must be at least 2 characters")
    .max(100, "Owner name is too long"),
  tinNumber: z
    .string()
    .regex(/^\d{3}-\d{3}-\d{3}-\d{3}$/, "Invalid TIN format (xxx-xxx-xxx-xxx)")
    .optional()
    .or(z.literal("")),
  barangay: z.string().min(1, "Barangay is required"),
  municipality: z.string().min(1, "Municipality is required"),
  businessAddress: z
    .string()
    .min(5, "Business address is required")
    .max(300, "Address is too long"),
});

export const permitApplicationStep2Schema = z.object({
  documents: z
    .array(
      z.object({
        type: z.string().min(1, "Document type is required"),
        fileName: z.string(),
      })
    )
    .optional(),
});

export const permitApplicationStep3Schema = z.object({
  businessArea: z.coerce
    .number()
    .positive("Business area must be greater than 0")
    .optional(),
  numberOfEmployees: z.coerce
    .number()
    .int()
    .nonnegative("Number of employees must be 0 or more")
    .optional(),
  capitalInvestment: z.coerce
    .number()
    .nonnegative("Capital investment must be 0 or more")
    .optional(),
  assessmentNotes: z.string().max(1000, "Assessment notes is too long").optional(),
});

export const permitApplicationStep4Schema = z.object({
  paymentMethod: z.enum(["GCASH", "MAYA", "BANK_TRANSFER", "OTC", "CASH"], {
    errorMap: () => ({ message: "Please select a payment method" }),
  }),
  paymentNotes: z.string().max(500, "Payment notes is too long").optional(),
});

export const permitApplicationStep5Schema = z.object({
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to submit this application",
    }),
});

export const fullPermitApplicationSchema = permitApplicationStep1Schema
  .merge(permitApplicationStep4Schema)
  .merge(permitApplicationStep5Schema);

// ============================================================================
// Enrollment Validations (Multi-step Business Enrollment)
// ============================================================================

export const enrollmentStep1Schema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name is too long"),
  businessType: z.string().min(1, "Business type is required"),
  businessCategory: z.string().min(1, "Business category is required"),
  dtiSecRegistration: z.string().optional(),
  tinNumber: z
    .string()
    .regex(/^\d{3}-\d{3}-\d{3}-\d{3}$/, "Invalid TIN format (xxx-xxx-xxx-xxx)")
    .optional()
    .or(z.literal("")),
  businessPhone: z
    .string()
    .regex(/^(\+63|0)(9\d{9})$/, "Invalid Philippine phone number")
    .optional()
    .or(z.literal("")),
  businessEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

export const enrollmentStep2Schema = z.object({
  ownerFirstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  ownerLastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  ownerMiddleName: z.string().max(50, "Middle name is too long").optional(),
  ownerPhone: z
    .string()
    .regex(/^(\+63|0)(9\d{9})$/, "Invalid Philippine phone number"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPosition: z.string().min(1, "Position/Title is required"),
});

export const enrollmentStep3Schema = z.object({
  businessAddress: z
    .string()
    .min(5, "Business address is required")
    .max(300, "Address is too long"),
  businessBarangay: z.string().min(1, "Barangay is required"),
  businessCity: z.string().min(1, "City/Municipality is required"),
  businessProvince: z.string().min(1, "Province is required"),
  businessZipCode: z
    .string()
    .regex(/^\d{4}$/, "ZIP code must be 4 digits"),
});

export const enrollmentStep4Schema = z.object({
  documents: z
    .array(
      z.object({
        type: z.string().min(1, "Document type is required"),
        file: z.instanceof(File),
      })
    )
    .optional(),
});

export const enrollmentStep5Schema = z.object({
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
});

export const fullEnrollmentSchema = enrollmentStep1Schema
  .merge(enrollmentStep2Schema)
  .merge(enrollmentStep3Schema)
  .merge(enrollmentStep5Schema);

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
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type EnrollmentStep1Input = z.infer<typeof enrollmentStep1Schema>;
export type EnrollmentStep2Input = z.infer<typeof enrollmentStep2Schema>;
export type EnrollmentStep3Input = z.infer<typeof enrollmentStep3Schema>;
export type EnrollmentStep4Input = z.infer<typeof enrollmentStep4Schema>;
export type EnrollmentStep5Input = z.infer<typeof enrollmentStep5Schema>;
export type FullEnrollmentInput = z.infer<typeof fullEnrollmentSchema>;
export type PermitApplicationStep1Input = z.infer<typeof permitApplicationStep1Schema>;
export type PermitApplicationStep2Input = z.infer<typeof permitApplicationStep2Schema>;
export type PermitApplicationStep3Input = z.infer<typeof permitApplicationStep3Schema>;
export type PermitApplicationStep4Input = z.infer<typeof permitApplicationStep4Schema>;
export type PermitApplicationStep5Input = z.infer<typeof permitApplicationStep5Schema>;
export type FullPermitApplicationInput = z.infer<typeof fullPermitApplicationSchema>;
