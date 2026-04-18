# QA Testing Skill (`/qa-testing`)

**Purpose**: Generate unit, E2E, accessibility, visual, and performance tests.

## Testing Infrastructure

**Unit/Component**: Vitest + @testing-library/react in `src/__tests__/`
**E2E**: Playwright in `e2e/`
**Accessibility**: @axe-core/playwright in `e2e/accessibility.spec.ts`
**Visual**: Playwright snapshots in `e2e/visual-regression.spec.ts`
**Performance**: k6 in `tests/performance/load-test.js`
**Security**: OWASP ZAP in `tests/security/`

## Unit Test (Vitest)

```typescript
// src/__tests__/components/button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick handler", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalled();
  });

  it("disables button when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

## E2E Test (Playwright)

```typescript
// e2e/app.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Application Workflow", () => {
  test("user can log in and create application", async ({ page }) => {
    // Navigate to login
    await page.goto("/login");
    
    // Fill login form
    await page.fill('input[name="email"]', "juan@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click("button:has-text('Sign In')");
    
    // Wait for dashboard
    await page.waitForURL("/dashboard");
    expect(page.url()).toContain("/dashboard");
    
    // Navigate to applications
    await page.click("text=Applications");
    await page.click("button:has-text('New Application')");
    
    // Fill application form
    await page.fill('input[name="businessName"]', "Juan's Store");
    await page.selectOption('select[name="businessType"]', "Retail");
    await page.click("button:has-text('Submit')");
    
    // Verify success
    await expect(page.locator("text=Application created")).toBeVisible();
  });

  test("admin can view all applications", async ({ page }) => {
    await page.goto("/login");
    // Admin login...
    await page.goto("/dashboard/admin/applications");
    
    // Check applications table
    const rows = await page.locator("table tbody tr").count();
    expect(rows).toBeGreaterThan(0);
  });
});
```

## Accessibility Test

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";

test.describe("Accessibility", () => {
  test("dashboard page passes axe audit", async ({ page }) => {
    await page.goto("/dashboard");
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test("form labels associated with inputs", async ({ page }) => {
    await page.goto("/dashboard/applications/new");
    
    const label = page.locator('label[for="businessName"]');
    const input = page.locator('input#businessName');
    
    await expect(label).toBeVisible();
    await expect(input).toBeVisible();
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Tab through interactive elements
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveClass(/button|input|link/);
  });
});
```

## Visual Regression Test

```typescript
// e2e/visual-regression.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("dashboard page matches screenshot", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("dashboard.png");
  });

  test("application form matches", async ({ page }) => {
    await page.goto("/dashboard/applications/new");
    await expect(page).toHaveScreenshot("application-form.png");
  });
});
```

## Performance Test (k6)

```javascript
// tests/performance/load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 },  // Ramp-up
    { duration: "5m", target: 100 },  // Stay at 100
    { duration: "2m", target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.1"],
  },
};

export default function () {
  // Test GET /api/applications
  const res = http.get("http://localhost:3000/api/applications", {
    headers: { Authorization: "Bearer TOKEN" },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

## Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Accessibility
npm run test:a11y

# All tests
npm run test:coverage
```

## Test Coverage Targets

| Area | Coverage | Status |
|------|----------|--------|
| Auth flows | 90%+ | Critical |
| API routes | 85%+ | Critical |
| Components | 80%+ | Important |
| Utils | 90%+ | Important |
| Edge cases | As possible | Nice to have |

## Common Test Patterns

**Mock API calls**:
```typescript
vi.mock("@/lib/prisma", () => ({
  default: {
    application: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));
```

**User interaction**:
```typescript
const user = userEvent.setup();
await user.click(screen.getByRole("button"));
await user.type(screen.getByRole("textbox"), "text");
await user.selectOption(screen.getByRole("combobox"), "option");
```

**Async utilities**:
```typescript
await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

