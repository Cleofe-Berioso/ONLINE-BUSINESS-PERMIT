# Accessibility Auditor Skill (`/accessibility-auditor`)

**Purpose**: WCAG 2.1 AA compliance auditing.

## WCAG 2.1 AA Audit Areas

### 1. Color Contrast (4.5:1 for text)
**Check**: All text has sufficient contrast

```bash
# Use Axe or DevTools Accessibility tab
```

Colors used:
- Text: #1F2937 (gray-900) on #FFFFFF (white) → 15.3:1 ✓
- Secondary: #6B7280 (gray-500) on white → 5.1:1 ✓

### 2. Keyboard Navigation
**Check**: All interactive elements focusable with Tab

```typescript
// All buttons, inputs, links should have:
<button tabIndex={0}>
  Click me
</button>
```

**Test**: F12 → Accessibility tab → Keyboard navigation

### 3. Screen Reader Support
**Check**: ARIA labels on icons and form inputs

```typescript
<input
  aria-label="Search applications"
  placeholder="Search..."
/>

<button aria-label="Close modal">
  <X className="h-4 w-4" />
</button>
```

### 4. Form Accessibility
**Check**: Labels associated with inputs

```typescript
<label htmlFor="businessName">Business Name</label>
<input id="businessName" type="text" />

// Error messages referenced
<input
  aria-describedby="businessName-error"
/>
<p id="businessName-error" role="alert">Required</p>
```

### 5. Focus Management
**Check**: Focus visible and logical order

```typescript
// On modal open, focus first input
const modalRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  modalRef.current?.querySelector('input')?.focus();
}, [open]);
```

### 6. Landmark Regions
**Check**: Page has semantic structure

```typescript
<header role="banner">Navigation</header>
<main role="main">Content</main>
<footer role="contentinfo">Footer</footer>
<nav role="navigation">Sidebar</nav>
```

### 7. Image Alt Text
**Check**: All images have descriptive alt text

```typescript
<img
  src="/permit.pdf"
  alt="Approved business permit with QR code"
/>

// Decorative images
<img src="/separator.png" alt="" aria-hidden />
```

### 8. Text Alternatives
**Check**: Icons have labels or titles

```typescript
<CheckCircle
  className="h-4 w-4"
  aria-label="Verified"
  title="Verified"
/>
```

## Audit Tools

### 1. Axe DevTools
Browser extension: axe DevTools
Automated scanning for WCAG violations

### 2. Playwright Tests
```typescript
// e2e/accessibility.spec.ts
import { injectAxe, checkA11y } from "axe-playwright";

await checkA11y(page, null);
```

### 3. WAVE
WebAIM: https://wave.webaim.org/
Visual feedback on accessibility issues

### 4. Lighthouse
DevTools → Lighthouse tab
Run accessibility audit

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Low contrast | Increase font weight, darken text |
| Missing label | Add htmlFor + id pairing |
| No alt text | Describe image content |
| Keyboard trap | Add escape key handler |
| Focus not visible | Add focus-visible styles |
| Missing landmark | Use semantic HTML or role= |
| Icon without label | Add aria-label or title |
| Form errors not announced | Use role="alert" |

## Testing Checklist

- [ ] All inputs have labels (visual + programmatic)
- [ ] All images have alt text
- [ ] Color contrast ≥ 4.5:1
- [ ] Keyboard navigation works (Tab through all)
- [ ] Focus visible on all elements
- [ ] No keyboard traps
- [ ] Screen reader works (NVDA / JAWS)
- [ ] Form errors announced
- [ ] Page landmarks semantic

## Audit Report

```
Accessibility Audit Report
==========================

WCAG 2.1 AA Compliance: 92%

Contrast Ratios: ✓
  ✓ All text ≥ 4.5:1

Keyboard Navigation: ✓
  ✓ All interactive elements focusable
  ✓ Logical Tab order

Screen Reader: ✓
  ✓ ARIA labels present
  ✓ Form associations correct

Issues Found: 3
  ⚠ Modal: Focus not returned to trigger
  ⚠ Table: Column headers not marked <th>
  ⚠ Icon: Missing aria-label

Recommended: Add focus management to modal
```

