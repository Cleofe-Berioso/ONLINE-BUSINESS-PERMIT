import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  otpVerificationSchema,
  applicationSchema,
  createScheduleSchema,
  reserveSlotSchema,
  verifyClaimSchema,
  profileUpdateSchema,
} from "@/lib/validations";

describe("registerSchema", () => {
  const validData = {
    email: "test@example.com",
    password: "Password1!",
    confirmPassword: "Password1!",
    firstName: "Juan",
    lastName: "Dela Cruz",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({ ...validData, email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects weak password (no uppercase)", () => {
    const result = registerSchema.safeParse({ ...validData, password: "password1!", confirmPassword: "password1!" });
    expect(result.success).toBe(false);
  });

  it("rejects weak password (no number)", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Password!", confirmPassword: "Password!" });
    expect(result.success).toBe(false);
  });

  it("rejects weak password (no special char)", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Password1", confirmPassword: "Password1" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "Different1!" });
    expect(result.success).toBe(false);
  });

  it("rejects short first name", () => {
    const result = registerSchema.safeParse({ ...validData, firstName: "J" });
    expect(result.success).toBe(false);
  });

  it("accepts valid Philippine phone number", () => {
    const result = registerSchema.safeParse({ ...validData, phone: "09171234567" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone number", () => {
    const result = registerSchema.safeParse({ ...validData, phone: "1234567" });
    expect(result.success).toBe(false);
  });

  it("accepts optional middleName", () => {
    const result = registerSchema.safeParse({ ...validData, middleName: "Bautista" });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "any" });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "any" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("otpVerificationSchema", () => {
  it("accepts 6-digit OTP", () => {
    const result = otpVerificationSchema.safeParse({ otp: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric OTP", () => {
    const result = otpVerificationSchema.safeParse({ otp: "abcdef" });
    expect(result.success).toBe(false);
  });

  it("rejects wrong length OTP", () => {
    const result = otpVerificationSchema.safeParse({ otp: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("applicationSchema", () => {
  const validApp = {
    type: "NEW" as const,
    businessName: "Test Business",
    businessType: "Retail",
    businessAddress: "123 Main St, City",
  };

  it("accepts valid application data", () => {
    const result = applicationSchema.safeParse(validApp);
    expect(result.success).toBe(true);
  });

  it("rejects invalid application type", () => {
    const result = applicationSchema.safeParse({ ...validApp, type: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects empty business name", () => {
    const result = applicationSchema.safeParse({ ...validApp, businessName: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid TIN format", () => {
    const result = applicationSchema.safeParse({ ...validApp, tinNumber: "123-456-789-000" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid TIN format", () => {
    const result = applicationSchema.safeParse({ ...validApp, tinNumber: "123456789" });
    expect(result.success).toBe(false);
  });

  it("accepts valid ZIP code", () => {
    const result = applicationSchema.safeParse({ ...validApp, businessZipCode: "1100" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid ZIP code", () => {
    const result = applicationSchema.safeParse({ ...validApp, businessZipCode: "123" });
    expect(result.success).toBe(false);
  });
});

describe("createScheduleSchema", () => {
  it("accepts valid schedule", () => {
    const result = createScheduleSchema.safeParse({
      date: "2026-03-15",
      timeSlots: [
        { startTime: "08:00", endTime: "09:00", maxCapacity: 10 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty time slots", () => {
    const result = createScheduleSchema.safeParse({
      date: "2026-03-15",
      timeSlots: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createScheduleSchema.safeParse({
      date: "March 15, 2026",
      timeSlots: [{ startTime: "08:00", endTime: "09:00", maxCapacity: 10 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("reserveSlotSchema", () => {
  it("accepts valid reservation", () => {
    const result = reserveSlotSchema.safeParse({
      timeSlotId: "slot123",
      applicationId: "app123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty timeSlotId", () => {
    const result = reserveSlotSchema.safeParse({
      timeSlotId: "",
      applicationId: "app123",
    });
    expect(result.success).toBe(false);
  });
});

describe("verifyClaimSchema", () => {
  it("accepts valid claim reference", () => {
    const result = verifyClaimSchema.safeParse({
      referenceNumber: "CLM-20260315-ABC123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid format", () => {
    const result = verifyClaimSchema.safeParse({
      referenceNumber: "INVALID-REF",
    });
    expect(result.success).toBe(false);
  });
});

describe("profileUpdateSchema", () => {
  it("accepts valid profile data", () => {
    const result = profileUpdateSchema.safeParse({
      firstName: "Juan",
      lastName: "Dela Cruz",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short first name", () => {
    const result = profileUpdateSchema.safeParse({
      firstName: "J",
      lastName: "Dela Cruz",
    });
    expect(result.success).toBe(false);
  });
});
