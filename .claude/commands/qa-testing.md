# QA Testing — OBPS Vitest + Playwright Test Generator

## Purpose

Create and run unit tests (Vitest), integration tests, E2E tests (Playwright), accessibility tests (axe-core), and performance tests (k6) for the Online Business Permit System.

## Usage

```
/qa-testing <description-of-what-to-test>
```

## Test Stack

| Tool                 | Type               | Config                 | Location                         |
| -------------------- | ------------------ | ---------------------- | -------------------------------- |
| Vitest 2.0.1         | Unit / Integration | `vitest.config.ts`     | `src/__tests__/`                 |
| Playwright 1.45.0    | E2E / Visual       | `playwright.config.ts` | `e2e/`                           |
| @axe-core/playwright | Accessibility      | In Playwright specs    | `e2e/accessibility.spec.ts`      |
| k6                   | Performance / Load | Script-based           | `tests/performance/load-test.js` |
| OWASP ZAP            | Security           | `zap-config.conf`      | `tests/security/`                |

## Unit Testing (Vitest)

### Setup

- Config: `web/vitest.config.ts`
- Setup file: `src/__tests__/setup.ts`
- Test pattern: `src/__tests__/**/*.test.{ts,tsx}`

### Existing Tests

| File                         | Tests                                      |
| ---------------------------- | ------------------------------------------ |
| `components/button.test.tsx` | Button rendering, variants, click handlers |
| `components/card.test.tsx`   | Card layout, slots                         |
| `components/input.test.tsx`  | Input rendering, error states              |
| `components/alert.test.tsx`  | Alert variants, dismiss                    |
| `lib/utils.test.ts`          | `cn()` utility, helpers                    |
| `lib/validations.test.ts`    | Zod schema validation                      |

### Unit Test Pattern

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### API Route Test Pattern

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => ({ user: { id: "1", role: "APPLICANT" } })),
}));
```

### Validation Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import { applicationSchema, registerSchema } from "@/lib/validations";

describe("applicationSchema", () => {
  it("validates valid application", () => {
    const result = applicationSchema.safeParse({
      businessName: "Test Business",
      businessType: "SOLE_PROPRIETORSHIP",
      address: "123 Main St",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty business name", () => {
    const result = applicationSchema.safeParse({ businessName: "" });
    expect(result.success).toBe(false);
  });
});
```

## E2E Testing (Playwright)

### Setup

- Config: `web/playwright.config.ts`
- Tests: `web/e2e/`

### Existing E2E Tests

| File                            | Tests                  |
| ------------------------------- | ---------------------- |
| `e2e/app.spec.ts`               | Navigation, page loads |
| `e2e/accessibility.spec.ts`     | axe-core WCAG checks   |
| `e2e/visual-regression.spec.ts` | Screenshot comparisons |

### E2E Test Pattern

```typescript
import { test, expect } from "@playwright/test";

test.describe("Application Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as applicant
    await page.goto("/login");
    await page.fill("[name=email]", "applicant@test.com");
    await page.fill("[name=password]", "Test1234!");
    await page.click("button[type=submit]");
    await page.waitForURL("/dashboard");
  });

  test("can create new application", async ({ page }) => {
    await page.goto("/dashboard/applications/new");
    await page.fill("[name=businessName]", "Test Corp");
    await page.click('button:has-text("Submit")');
    await expect(page.locator(".toast-success")).toBeVisible();
  });
});
```

## Test Commands

```bash
# Unit tests
npm test                    # Run all Vitest tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report

# E2E tests
npx playwright test         # Run all E2E tests
npx playwright test --ui    # Interactive UI mode
npx playwright test --headed # See browser

# Performance
npx k6 run tests/performance/load-test.js

# Security
pwsh tests/security/run-zap-scan.ps1
```

## Test Accounts (from seed.js)

| Role          | Email              | Password  |
| ------------- | ------------------ | --------- |
| APPLICANT     | applicant@test.com | Test1234! |
| STAFF         | staff@test.com     | Test1234! |
| REVIEWER      | reviewer@test.com  | Test1234! |
| ADMINISTRATOR | admin@test.com     | Test1234! |

## Related Lib Modules for Testing

| Module | Purpose | Testing Strategy |
|--------|---------|------------------|
| `src/lib/validations.ts` | Zod schemas | Unit test with safeParse() for valid/invalid inputs |
| `src/lib/auth.ts` | Authentication | Mock auth() in API route tests |
| `src/lib/permissions.ts` | RBAC enforcement | Test ability.can() with different roles |
| `src/lib/payments.ts` | Payment processing | Mock PayMongo API calls, webhook verification |
| `src/lib/email.ts` | Email notifications | Stub/mock SMTP, test template rendering |
| `src/lib/sms.ts` | SMS notifications | Mock Semaphore API, test message formatting |
| `src/lib/pdf.ts` | PDF generation | Test Puppeteer setup, QR code generation |
| `src/lib/cache.ts` | Redis caching | Mock Redis for cache hit/miss scenarios |
| `src/lib/queue.ts` | Background jobs | Mock BullMQ job processing |
| `src/lib/sanitize.ts` | Input sanitization | Test XSS prevention with malicious inputs |

## Checklist

- [ ] Test covers the happy path
- [ ] Test covers error/edge cases
- [ ] Mocks properly isolate the unit under test
- [ ] No test interdependencies
- [ ] Assertions are meaningful (not just "no error thrown")
- [ ] Accessibility assertions where relevant
- [ ] Tests pass in CI (no flaky timing issues)
