# Test Gap Filler — OBPS Missing Test Coverage Detector

## Purpose

Identify untested code paths in the Online Business Permit System and generate missing tests for components, API routes, library functions, and workflows.

## Usage

```
/test-gap-filler [area-to-check]
```

## Current Test Coverage Map

### ✅ Has Tests

| File                       | Test File                              | Coverage            |
| -------------------------- | -------------------------------------- | ------------------- |
| `components/ui/button.tsx` | `__tests__/components/button.test.tsx` | Rendering, variants |
| `components/ui/card.tsx`   | `__tests__/components/card.test.tsx`   | Layout              |
| `components/ui/input.tsx`  | `__tests__/components/input.test.tsx`  | Rendering, error    |
| `components/ui/alert.tsx`  | `__tests__/components/alert.test.tsx`  | Variants            |
| `lib/utils.ts`             | `__tests__/lib/utils.test.ts`          | `cn()` helper       |
| `lib/validations.ts`       | `__tests__/lib/validations.test.ts`    | Zod schemas         |
| Navigation/pages           | `e2e/app.spec.ts`                      | Page loads          |
| Accessibility              | `e2e/accessibility.spec.ts`            | axe-core            |

### 🔴 Missing Tests (Priority)

| File                 | Priority | What to Test                               |
| -------------------- | -------- | ------------------------------------------ |
| `lib/auth.ts`        | HIGH     | authorize callback, session/JWT callbacks  |
| `lib/permissions.ts` | HIGH     | CASL ability for each role × action        |
| `lib/payments.ts`    | HIGH     | Checkout creation, webhook verification    |
| `lib/storage.ts`     | MEDIUM   | Upload, download, presigned URLs, fallback |
| `lib/email.ts`       | MEDIUM   | Email template rendering, send function    |
| `lib/sms.ts`         | MEDIUM   | SMS sending, provider fallback             |
| `lib/sanitize.ts`    | MEDIUM   | XSS prevention, HTML stripping             |
| `lib/rate-limit.ts`  | MEDIUM   | Rate limiter logic                         |
| `lib/two-factor.ts`  | MEDIUM   | TOTP generation, verification              |
| `lib/pdf.ts`         | LOW      | PDF generation, QR code                    |
| `lib/queue.ts`       | LOW      | Job scheduling, processing                 |
| `lib/cache.ts`       | LOW      | Redis cache, fallback                      |
| `middleware.ts`      | MEDIUM   | Route protection, rate limiting            |
| All API routes       | HIGH     | Request/response contracts                 |
| Dashboard components | MEDIUM   | Role-specific rendering                    |

## Gap Detection Process

1. List all source files: `find src -name '*.ts' -o -name '*.tsx' | grep -v __tests__`
2. List all test files: `find src/__tests__ e2e -name '*.test.*' -o -name '*.spec.*'`
3. Match source → test by naming convention
4. Identify files with no corresponding test
5. Prioritize by criticality (auth > payments > CRUD > UI)

## Test Templates

### Library Function Test

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external dependencies
vi.mock("ioredis", () => ({ default: vi.fn() }));

import { cacheGet, cacheSet } from "@/lib/cache";

describe("cache", () => {
  it("returns cached value when available", async () => {
    await cacheSet("key", "value", 60);
    const result = await cacheGet("key");
    expect(result).toBe("value");
  });

  it("returns null for missing key", async () => {
    const result = await cacheGet("nonexistent");
    expect(result).toBeNull();
  });
});
```

### API Route Test

```typescript
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => ({ user: { id: "1", role: "APPLICANT" } })),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { application: { findMany: vi.fn(() => []) } },
}));

import { GET } from "@/app/api/applications/route";

describe("GET /api/applications", () => {
  it("returns 200 with applications", async () => {
    const request = new NextRequest("http://localhost/api/applications");
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
```

## Commands

```bash
# Run tests with coverage
npm test -- --run --coverage

# Run specific test file
npm test -- --run src/__tests__/lib/validations.test.ts

# Watch mode
npm test -- --watch
```

## Checklist

- [ ] Coverage report generated (`--coverage`)
- [ ] All critical paths identified (auth, payments, permissions)
- [ ] Each gap has a corresponding test file created
- [ ] Tests use proper mocking (vi.mock for externals)
- [ ] Tests are isolated (no shared state between tests)
- [ ] Error cases covered (not just happy paths)
