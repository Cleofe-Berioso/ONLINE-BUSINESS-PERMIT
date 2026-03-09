# Accessibility Auditor — OBPS WCAG 2.1 AA Compliance

## Purpose

Audit and fix accessibility issues in the Online Business Permit System to ensure WCAG 2.1 Level AA compliance, focusing on form accessibility, keyboard navigation, screen readers, and color contrast.

## Usage

```
/accessibility-auditor <page-or-component-to-audit>
```

## Tools

- **axe-core/playwright**: Automated a11y testing in E2E (`e2e/accessibility.spec.ts`)
- **Lighthouse**: Chrome DevTools accessibility audit
- **Browser DevTools**: Tab order, ARIA inspector

## Key Audit Areas

### 1. Forms (Critical for Permit System)

- All `<input>` have associated `<label>` elements
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required="true"`
- Form validation errors announced to screen readers
- File upload has clear instructions and status feedback

```tsx
// Pattern in src/components/ui/input.tsx
<label htmlFor={id}>{label}</label>
<input id={id} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={!!error} />
{error && <p id={`${id}-error`} role="alert">{error}</p>}
```

### 2. Navigation

- Skip-to-main-content link
- Keyboard-navigable sidebar (`src/components/dashboard/sidebar.tsx`)
- Focus management on route changes
- Logical tab order (no tabindex > 0)
- Visible focus indicators (Tailwind: `focus-visible:ring-2`)

### 3. Status & Notifications

- Application status changes announced via `aria-live="polite"`
- Toast notifications have `role="alert"`
- Loading states communicated (`aria-busy="true"`)
- Progress indicators labeled (`aria-label="Loading applications"`)

### 4. Color & Contrast

- Minimum contrast ratio 4.5:1 for normal text
- 3:1 for large text (18px+ or 14px+ bold)
- Status badges don't rely on color alone (include text/icons)
- Focus rings visible against all backgrounds

### 5. Interactive Elements

- All buttons have accessible names
- Icon-only buttons have `aria-label`
- Modals trap focus and have `aria-modal="true"`
- Dropdown menus support arrow key navigation
- Data tables have proper `<th>` with `scope`

### 6. Documents & Images

- `next/image` has `alt` text for meaningful images
- Decorative images have `alt=""`
- PDF permit has text layer (not image-only)
- File upload drag zone has keyboard alternative

## Automated Testing

```typescript
// e2e/accessibility.spec.ts pattern
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("login page has no a11y violations", async ({ page }) => {
  await page.goto("/login");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

## Test Commands

```bash
# Run a11y E2E tests
npx playwright test e2e/accessibility.spec.ts

# Run all E2E (includes a11y)
npx playwright test
```

## WCAG 2.1 AA Checklist

- [ ] **1.1.1** Non-text Content — alt text on images
- [ ] **1.3.1** Info and Relationships — semantic HTML, ARIA
- [ ] **1.4.3** Contrast Minimum — 4.5:1 ratio
- [ ] **2.1.1** Keyboard — all interactive elements keyboard accessible
- [ ] **2.4.1** Bypass Blocks — skip navigation link
- [ ] **2.4.3** Focus Order — logical tab sequence
- [ ] **2.4.7** Focus Visible — visible focus indicators
- [ ] **3.3.1** Error Identification — form errors identified
- [ ] **3.3.2** Labels or Instructions — all inputs labeled
- [ ] **4.1.2** Name, Role, Value — ARIA attributes correct
