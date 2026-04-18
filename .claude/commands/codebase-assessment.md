# Codebase Assessment Skill (`/codebase-assessment`)

**Purpose**: Comprehensive quantitative codebase grading across 6 categories.

## 6 Assessment Categories

### 1. Security (Weight: 25%)
**Checks**:
- Hardcoded secrets (API keys, passwords) - should be 0
- Missing auth guards on protected routes
- Input validation with Zod on all forms
- Rate limiting on auth endpoints
- Security headers in next.config.js
- Password hashing with bcryptjs
- JWT expiration (30 min) set
- CORS configured appropriately

**Grades**:
- A: 0 hardcoded secrets, all routes protected, all inputs validated
- B: 1-2 issues, most routes protected
- C: 3-5 issues, some validation gaps
- D: 6+ issues, major gaps

### 2. API & Data Integrity (Weight: 25%)
**Checks**:
- All API routes have try-catch
- All routes validate input with Zod
- No N+1 queries (Prisma includes used)
- Transactions for multi-step operations
- Error responses include proper status codes
- Pagination implemented (skip/take)
- Sensitive data sanitized from responses
- Foreign key constraints in schema

**Grades**:
- A: All checks pass, no N+1, transactions used
- B: 90%+ coverage, minor N+1 issues
- C: 80%+ coverage, some missing validations
- D: <80% coverage, many gaps

### 3. TypeScript & Code Quality (Weight: 15%)
**Checks**:
- npm run typecheck passes (0 errors)
- No `as any` in API/lib files
- Components under 500 lines
- Functions under 100 lines
- No unused variables/imports
- Consistent naming conventions

**Grades**:
- A: 0 TS errors, no any casts, all <500 lines
- B: 0 TS errors, 1-2 any casts, mostly <500 lines
- C: <10 TS errors, some large components
- D: 10+ TS errors, many violations

### 4. Frontend Quality (Weight: 15%)
**Checks**:
- Loading states on all async operations
- Error boundaries (error.tsx, global-error.tsx)
- SSE cleanup in useEffect
- `key` prop on all .map() renders
- Accessibility: labels on inputs
- Dark mode support implemented
- Responsive design (mobile-first)

**Grades**:
- A: All checks pass, fully accessible
- B: 90%+ coverage, minor a11y issues
- C: 80%+ coverage, some missing states
- D: <80%, major UX gaps

### 5. Testing (Weight: 10%)
**Checks**:
- Unit test coverage >80% for critical paths
- E2E tests for core workflows
- Accessibility tests (axe)
- Performance tests (k6)
- Critical API routes tested

**Grades**:
- A: 80%+ unit, full E2E, a11y, perf tested
- B: 70%+ unit, most E2E covered
- C: 60%+ unit, some E2E
- D: <60%, minimal tests

### 6. Architecture & Patterns (Weight: 10%)
**Checks**:
- No circular dependencies
- Server components by default
- Database normalization (no duplication)
- Lib modules don't import components
- API routes don't import from pages
- Consistent patterns across codebase
- No schema drift (migrations current)

**Grades**:
- A: Clean architecture, patterns consistent
- B: Minor violations, mostly good
- C: Several violations, some tech debt
- D: Major architectural issues

## Overall Grade Calculation

```
Grade = (Security*0.25) + (API/Data*0.25) + (TS/Quality*0.15) +
        (Frontend*0.15) + (Testing*0.10) + (Architecture*0.10)
```

## Report Format

```
Codebase Assessment Report
==========================

Security: A (95%)
  ✓ 0 hardcoded secrets
  ✓ All routes protected with auth
  ✗ Missing rate limit on /register

API & Data Integrity: A (92%)
  ✓ All routes validated with Zod
  ✓ Transactions used for multi-step ops
  ⚠ 2 N+1 queries in /api/applications

TypeScript & Quality: A (98%)
  ✓ 0 TypeScript errors
  ✓ All components <500 lines
  ✓ No 'as any' in API files

Frontend Quality: B (87%)
  ✓ Loading states on all async
  ✓ Error boundaries implemented
  ✗ Missing SSE cleanup in 1 hook

Testing: B (75%)
  ✓ 82% unit coverage
  ✓ E2E tests for core flows
  ✗ Performance tests not run

Architecture: A (94%)
  ✓ Clean layer separation
  ✓ No circular dependencies
  ⚠ 1 large component >500 lines

OVERALL GRADE: A (91%)
```

## Improvement Priorities

1. Address security issues first
2. Fix critical N+1 queries
3. Add missing tests
4. Refactor large components
5. Improve accessibility

