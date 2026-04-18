# Test Gap Filler Skill (`/test-gap-filler`)

**Purpose**: Identify untested critical paths and generate test suites.

## Test Coverage Assessment

### Current Coverage

| Component | Tested % | Gap |
|-----------|----------|-----|
| Auth flows | 85% | OTP resend, 2FA |
| Applications | 80% | Renewal, closure |
| Documents | 70% | Verify workflow |
| Payments | 75% | Webhook handling |
| Permits | 60% | PDF generation |
| Schedules | 65% | Reschedule, conflicts |

### High-Priority Gaps

1. **OTP Resend**: Rate limiting, email retry
2. **Document Verification**: Rejection flow
3. **Webhook Idempotency**: Duplicate event handling
4. **Payment Refund**: Partial refund scenario
5. **Slot Conflicts**: Overlapping bookings

## Test Generation Template

### Unit Test
```typescript
// src/__tests__/lib/[module].test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ApplicationHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect duplicate application", async () => {
    const isDuplicate = await checkDuplicate("DTI123");
    expect(isDuplicate).toBe(true);
  });

  it("should reject if DTI invalid", async () => {
    expect(() => validateDTI("invalid")).toThrow();
  });
});
```

### E2E Test
```typescript
// e2e/payment-webhook.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Payment Webhook", () => {
  test("idempotent duplicate webhook", async ({ request }) => {
    const payload = {
      data: { id: "pay_123", status: "paid", amount: 2500 },
    };

    const res1 = await request.post(
      "http://localhost:3000/api/payments/webhook",
      { data: payload }
    );
    expect(res1.status()).toBe(200);

    // Duplicate
    const res2 = await request.post(
      "http://localhost:3000/api/payments/webhook",
      { data: payload }
    );
    expect(res2.status()).toBe(200);
    // Payment status should not change twice
  });
});
```

## Critical Path Tests

1. **Happy Path**: Standard workflow succeeds
2. **Error Cases**: Validation failures handled
3. **Edge Cases**: Boundary conditions
4. **Concurrency**: Multiple requests
5. **Recovery**: After failure

## Running Tests

```bash
# All tests
npm test

# Specific file
npm test -- applications.test.ts

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# E2E tests
npm run test:e2e
```

## Test Goals

| Metric | Current | Target |
|--------|---------|--------|
| Unit coverage | 75% | 85% |
| E2E flows | 8 | 15 |
| Edge cases | 20 | 40 |
| Error scenarios | 10 | 20 |

