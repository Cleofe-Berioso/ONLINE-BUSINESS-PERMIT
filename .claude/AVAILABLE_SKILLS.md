# Online Business Permit System — Available Skills/Commands

## Overview

This document catalogs all available skills and commands for the Online Business Permit System (OBPS), organized by domain and functionality.

**Last Updated**: March 9, 2026
**Total Skills**: 22
**Tech Stack**: Next.js 16 · React 19 · TypeScript 5.9 · Prisma 7 · PostgreSQL 16 · Tailwind CSS v4

---

## Core Development Skills (13)

### 1. Backend Service (`/backend-service`)

**File**: `.claude/commands/backend-service.md`
**Purpose**: Create and modify Next.js API route handlers, server actions, and lib modules

**Capabilities**:

- Create new API route handlers (`src/app/api/*/route.ts`)
- Add server-side lib modules (`src/lib/*.ts`)
- Create server actions
- Add middleware logic
- Follow Next.js App Router patterns with Prisma + Zod

**Key Files**: `src/app/api/*/route.ts`, `src/lib/*.ts`, `src/middleware.ts`

**Example Use Cases**:

```
/backend-service create api route for reports
/backend-service add PUT endpoint to applications/[id]
/backend-service create lib module for document-checklist
```

---

### 2. Database Query (`/database-query`)

**File**: `.claude/commands/database-query.md`
**Purpose**: Generate Prisma queries and manage PostgreSQL database operations

**Capabilities**:

- Generate findMany/findUnique/create/update/delete queries
- Aggregation and groupBy queries
- Transaction handling (`prisma.$transaction`)
- Schema modifications and migrations
- Index management

**Key Files**: `web/prisma/schema.prisma`, `src/lib/prisma.ts`, `web/prisma/seed.js`

**Database**: PostgreSQL 16 via Prisma 7 with `@prisma/adapter-pg`

**Example Use Cases**:

```
/database-query find applications with status=SUBMITTED for a user
/database-query create payment for application
/database-query aggregate applications by status for analytics
/database-query migrate add field businessCategory to Application
```

---

### 3. Debug Issue (`/debug-issue`)

**File**: `.claude/commands/debug-issue.md`
**Purpose**: Diagnose and fix issues across the Next.js full-stack

**Capabilities**:

- API route errors (401, 404, 500)
- NextAuth authentication problems
- Prisma/database errors
- React state management issues
- Build/TypeScript compilation errors
- SSE connection issues
- Middleware and rate limiting problems

**Example Use Cases**:

```
/debug-issue api 401 unauthorized on applications endpoint
/debug-issue auth session not persisting after login
/debug-issue prisma connection timeout with PrismaPg adapter
/debug-issue sse events not reaching client
```

---

### 4. Frontend Design (`/frontend-design`)

**File**: `.claude/commands/frontend-design.md`
**Purpose**: Create and modify React components with Tailwind CSS and CVA

**Capabilities**:

- Create page components (App Router pages)
- Create reusable UI components (`src/components/ui/`)
- Create dashboard components (`src/components/dashboard/`)
- Implement forms with React Hook Form + Zod
- Apply Tailwind CSS v4 styling with class-variance-authority

**Key Patterns**:

- Tailwind CSS v4 (utility-first, no config file)
- CVA for component variants (`class-variance-authority`)
- `cn()` utility for class merging (`clsx` + `tailwind-merge`)
- Lucide React for icons
- sonner for toast notifications

**Example Use Cases**:

```
/frontend-design create page application-detail
/frontend-design create component status-timeline
/frontend-design create modal document-preview
/frontend-design add feature dark mode toggle to header
```

---

### 5. QA Testing (`/qa-testing`)

**File**: `.claude/commands/qa-testing.md`
**Purpose**: Generate tests and validation strategies

**Capabilities**:

- Unit tests (Vitest + React Testing Library)
- E2E tests (Playwright)
- Accessibility tests (@axe-core/playwright)
- Visual regression tests (Playwright snapshots)
- Performance tests (k6 load testing)
- Security tests (OWASP ZAP)

**Test Infrastructure**:
| Tool | Config | Purpose |
|------|--------|---------|
| Vitest | `vitest.config.ts` | Unit tests with jsdom |
| Playwright | `playwright.config.ts` | E2E + a11y + visual |
| k6 | `tests/performance/load-test.js` | Load testing |
| OWASP ZAP | `tests/security/zap-config.conf` | Security scanning |

**Example Use Cases**:

```
/qa-testing unit login form validation
/qa-testing e2e application submission flow
/qa-testing a11y dashboard pages
/qa-testing performance api/applications endpoint
```

---

### 6. Workflow Definitions (`/workflow-definitions`)

**File**: `.claude/commands/workflow-definitions.md`
**Purpose**: Document and analyze OBPS application workflows

**Key Workflows**:

- Application lifecycle (DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED)
- Document verification (UPLOADED → VERIFIED/REJECTED)
- Claim scheduling (reserve → confirm → complete)
- Permit issuance (PREPARED → ISSUED → RELEASED → COMPLETED)
- Payment processing (PENDING → PAID/FAILED)

**Example Use Cases**:

```
/workflow-definitions explain application approval
/workflow-definitions trace document from upload to verification
/workflow-definitions diagram permit issuance lifecycle
```

---

### 7. Workflow Verificator (`/workflow-verificator`)

**File**: `.claude/commands/workflow-verificator.md`
**Purpose**: Verify workflow implementations are complete and correct

**Validation Areas**:

- API route ↔ page component wiring
- Zod schema coverage on all form inputs
- Auth guards on protected routes
- SSE event emission on status changes
- Database model completeness

**Example Use Cases**:

```
/workflow-verificator check application approval flow
/workflow-verificator validate claim scheduling
/workflow-verificator audit authentication flow
```

---

### 8. Cleanup Codebase (`/cleanup-codebase`)

**File**: `.claude/commands/cleanup-codebase.md`
**Purpose**: Maintain code quality by cleaning dead code, debug statements, and unused files

**Cleanup Categories**:

- `console.log` debug statements
- TODO/FIXME comments
- Unused imports and variables
- Dead code removal
- Unused lib modules (written but never imported)

**Example Use Cases**:

```
/cleanup-codebase scan all
/cleanup-codebase report console logs
/cleanup-codebase find unused imports
/cleanup-codebase verify post-cleanup
```

---

### 9. Codebase Assessment (`/codebase-assessment`)

**File**: `.claude/commands/codebase-assessment.md`
**Purpose**: Comprehensive quantitative codebase assessment with grading across 6 categories

**Categories**:

1. **Security** — Hardcoded secrets, missing auth guards, CSP headers, rate limiting
2. **API & Data Integrity** — Zod validation, error handling, N+1 queries, transactions
3. **TypeScript & Code Quality** — TS errors, `any` usage, large components, TODOs
4. **Frontend Quality** — Error boundaries, loading states, SSE cleanup, key props
5. **Testing** — Coverage ratios, critical path tests, E2E completeness
6. **Architecture & Patterns** — Circular deps, layer violations, dead code, schema drift

**Example Use Cases**:

```
/codebase-assessment
/codebase-assessment security
/codebase-assessment full
```

---

### 10. Security Hardening (`/security-hardening`)

**File**: `.claude/commands/security-hardening.md`
**Purpose**: Security audit and hardening following OWASP Top 10

**Audit Areas**:

1. **Authentication** — NextAuth config, JWT expiration, session management, account lockout
2. **Secrets & Environment** — Hardcoded secrets, env var usage, `.gitignore` coverage
3. **Input Validation** — Zod schema coverage, Prisma parameterization, XSS prevention
4. **Rate Limiting** — Middleware rate limits per route category
5. **Headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy (in `next.config.js`)
6. **Data Exposure** — Password hash exclusion, Prisma select, error sanitization

**Key Files**: `src/middleware.ts`, `next.config.js`, `src/lib/auth.ts`, `src/lib/sanitize.ts`

**Example Use Cases**:

```
/security-hardening
/security-hardening auth
/security-hardening headers
/security-hardening validation
```

---

### 11. Performance Profiler (`/performance-profiler`)

**File**: `.claude/commands/performance-profiler.md`
**Purpose**: Identify and optimize performance bottlenecks

**Profiling Domains**:

1. **Prisma Queries** — N+1 detection, missing select/include, pagination, index usage
2. **React Rendering** — Unnecessary re-renders, missing memo, large list handling
3. **Bundle Size** — Code splitting, lazy loading, dynamic imports for admin pages
4. **API Response** — Over-fetching, caching (Redis + HTTP headers), compression
5. **SSE Performance** — Connection management, heartbeat interval, payload size

**Example Use Cases**:

```
/performance-profiler
/performance-profiler prisma
/performance-profiler bundle
```

---

### 12. PWA & Offline Resilience (`/pwa-offline`)

**File**: `.claude/commands/pwa-offline.md`
**Purpose**: Progressive Web App capabilities, service worker, and offline support

**Components**:

- **Service Worker**: `public/sw.js` with cache-first/network-first strategies
- **PWA Manifest**: `public/manifest.json` with full icon set
- **Offline Page**: `public/offline.html` fallback
- **Registration**: `src/components/pwa/service-worker.tsx`

**Example Use Cases**:

```
/pwa-offline audit
/pwa-offline caching
/pwa-offline install-prompt
```

---

### 13. Full System Validation (`/full-system-validation`)

**File**: `.claude/commands/full-system-validation.md`
**Purpose**: Cross-cutting validation ensuring all routes, APIs, components, and auth flows are wired

**Validation Phases**:

1. **API Route Registration** — All route groups exist and export correct HTTP methods
2. **Page ↔ API Wiring** — Dashboard pages call correct API endpoints
3. **Component ↔ Data Wiring** — No hardcoded mock data in production
4. **Type Consistency** — Frontend types match Prisma models
5. **SSE Event Wiring** — Broadcaster → endpoint → client hook → consuming components
6. **Authentication Flow** — Middleware, auth config, protected routes, 401 handling

**Example Use Cases**:

```
/full-system-validation
/full-system-validation routes
/full-system-validation api-wiring
/full-system-validation sse
```

---

## Domain-Specific Skills (9)

### 14. Implementation Plan (`/implementation-plan`)

**File**: `.claude/commands/implementation-plan.md`
**Purpose**: Sprint planning, feature prioritization, and gap analysis

**Reference Docs**: `tasks.md`, `PROJECT-PLAN.md`, `MISSING_REQUIREMENTS.md`

**Example Use Cases**:

```
/implementation-plan status
/implementation-plan priorities
/implementation-plan gaps
```

---

### 15. Payment Integration (`/payment-integration`)

**File**: `.claude/commands/payment-integration.md`
**Purpose**: PayMongo payment gateway (GCash, Maya, bank transfer) + OTC recording

**Key Files**: `src/lib/payments.ts`, `src/app/api/payments/route.ts`, `src/app/api/payments/webhook/route.ts`

**Payment Methods**: GCash (PayMongo), Maya (PayMongo), Bank Transfer, OTC (over-the-counter), Cash

**Example Use Cases**:

```
/payment-integration gcash flow
/payment-integration webhook handling
/payment-integration otc recording
```

---

### 16. Accessibility Auditor (`/accessibility-auditor`)

**File**: `.claude/commands/accessibility-auditor.md`
**Purpose**: WCAG 2.1 AA compliance auditing for the web application

**Audit Areas**:

- Color contrast ratios (AA minimum 4.5:1 for text)
- Keyboard navigation (all interactive elements focusable)
- Screen reader support (ARIA labels, landmarks)
- Form accessibility (labels, error messages)
- Focus management (modals, page transitions)

**Key Files**: `e2e/accessibility.spec.ts`, `src/components/ui/*.tsx`

**Example Use Cases**:

```
/accessibility-auditor full
/accessibility-auditor contrast
/accessibility-auditor keyboard-nav
```

---

### 17. Test Gap Filler (`/test-gap-filler`)

**File**: `.claude/commands/test-gap-filler.md`
**Purpose**: Identify untested critical paths and generate targeted test suites

**Current Test Coverage**:
| Area | Files | Framework |
|------|-------|-----------|
| Component tests | `__tests__/components/` | Vitest + Testing Library |
| Lib tests | `__tests__/lib/` | Vitest |
| E2E tests | `e2e/` | Playwright |
| Performance | `tests/performance/` | k6 |
| Security | `tests/security/` | OWASP ZAP |

**Example Use Cases**:

```
/test-gap-filler scan
/test-gap-filler api routes
/test-gap-filler critical paths
```

---

### 18. Code Cleanup (`/code-cleanup`)

**File**: `.claude/commands/code-cleanup.md`
**Purpose**: Systematic code quality improvements

**Focus Areas**:

- Dead code removal
- TODO/FIXME resolution
- Naming convention fixes
- Unused import cleanup
- Console.log removal
- Type narrowing (`any` → proper types)

**Example Use Cases**:

```
/code-cleanup todos
/code-cleanup dead-code
/code-cleanup any-types
```

---

### 19. God Class Decomposer (`/god-class-decomposer`)

**File**: `.claude/commands/god-class-decomposer.md`
**Purpose**: Break apart large components/modules into focused, single-responsibility units

**Targets**: Components or lib modules exceeding 500 lines, files with excessive imports

**Example Use Cases**:

```
/god-class-decomposer analyze src/lib/payments.ts
/god-class-decomposer split large-page-component
```

---

### 20. Memory Leak Detector (`/memory-leak-detector`)

**File**: `.claude/commands/memory-leak-detector.md`
**Purpose**: Detect and prevent memory leaks in the Next.js application

**Common Leak Sources**:

- SSE connections not cleaned up in `useEffect`
- Timers/intervals without cleanup
- Zustand store subscriptions
- Event listeners on window/document

**Key Files**: `src/hooks/use-sse.ts`, `src/lib/stores.ts`, `src/lib/sse.ts`

**Example Use Cases**:

```
/memory-leak-detector scan
/memory-leak-detector sse-connections
/memory-leak-detector timers
```

---

### 21. Code-Behind Extractor (`/code-behind-extractor`)

**File**: `.claude/commands/code-behind-extractor.md`
**Purpose**: Extract inline business logic from page components into lib modules and custom hooks

**Patterns**:

- Extract data fetching to React Query hooks or server components
- Extract form logic to custom hooks with React Hook Form
- Move business rules to lib modules
- Extract reusable UI logic to custom hooks

**Example Use Cases**:

```
/code-behind-extractor analyze dashboard/applications/page.tsx
/code-behind-extractor extract form-logic
```

---

### 22. Migration Helper (`/migration-helper`)

**File**: `.claude/commands/migration-helper.md`
**Purpose**: Prisma schema migrations, data transforms, and safe field evolution

**Migration Types**:

1. **Add New Model** — Schema → migration → API route → page component
2. **Add Field** — Safe patterns (nullable/default) vs. 3-step required field migration
3. **Enum Changes** — Adding values (safe), renaming (requires manual SQL)
4. **Add Index** — Performance optimization via targeted indexes
5. **Relation Changes** — New relations, cascading deletes

**Key Files**: `web/prisma/schema.prisma`, `web/prisma/seed.js`

**Commands**:

```bash
npx prisma validate          # Validate schema
npx prisma db push           # Push schema (dev)
npx prisma migrate dev       # Create migration (dev)
npx prisma migrate deploy    # Apply migrations (production)
```

**Example Use Cases**:

```
/migration-helper add model AuditReport
/migration-helper add field businessCategory String to Application
/migration-helper add index on Application(status, createdAt)
/migration-helper check status
```

---

## Skill Coverage Matrix

| Domain            | Lib Module                                   | API Route                              | Frontend Page/Component                                     |
| ----------------- | -------------------------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| **Auth**          | `auth.ts`, `auth.config.ts`, `two-factor.ts` | `api/auth/*`                           | `(auth)/login`, `register`, `forgot-password`, `verify-otp` |
| **Applications**  | `validations.ts`                             | `api/applications/*`                   | `dashboard/applications/*`                                  |
| **Documents**     | `storage.ts`                                 | `api/documents/*`                      | `dashboard/documents/*`, `verify-documents`                 |
| **Scheduling**    | —                                            | `api/schedules/*`                      | `dashboard/schedule/*`                                      |
| **Claims**        | —                                            | `api/claims/*`                         | `dashboard/claims/*`, `claim-reference`                     |
| **Permits**       | `pdf.ts`                                     | `api/permits/*`                        | `dashboard/issuance/*`                                      |
| **Payments**      | `payments.ts`                                | `api/payments/*`                       | Pay Now button component                                    |
| **Analytics**     | `cache.ts`                                   | `api/analytics`                        | Dashboard page stats                                        |
| **Notifications** | `email.ts`, `sms.ts`, `sse.ts`               | `api/events`                           | `use-sse.ts` hook, notification bell                        |
| **Admin**         | `permissions.ts`                             | `api/admin/*`                          | `dashboard/admin/*`                                         |
| **Gov API**       | `government-api.ts`                          | `api/applications/verify-registration` | Application form                                            |
| **Monitoring**    | `monitoring.ts`                              | `api/metrics`, `api/health`            | —                                                           |
| **Privacy**       | —                                            | `api/privacy/*`                        | `(public)/data-privacy`, `privacy`                          |
| **i18n**          | `i18n.ts`                                    | —                                      | Language switcher component                                 |

---

## Technology Stack

### Frontend

- **Framework**: Next.js 16 (App Router, React Server Components)
- **UI**: React 19 + TypeScript 5.9
- **Styling**: Tailwind CSS v4 + CVA + tailwind-merge
- **State**: Zustand 5 + TanStack React Query v5
- **Forms**: React Hook Form 7 + Zod 4
- **Icons**: Lucide React
- **Toasts**: sonner
- **Theme**: next-themes

### Backend (Next.js API Routes)

- **Runtime**: Node.js 18+ (22.x recommended)
- **Auth**: NextAuth v5 (Auth.js) with Credentials provider
- **ORM**: Prisma 7 with `@prisma/adapter-pg`
- **Database**: PostgreSQL 16
- **Caching**: Redis (ioredis) with in-memory fallback
- **Queue**: BullMQ (Redis-backed)
- **Storage**: AWS SDK v3 (S3/MinIO) with local fallback
- **Email**: Nodemailer (SMTP/Resend/SES)
- **SMS**: Semaphore / Globe Labs
- **Payments**: PayMongo (GCash, Maya)
- **PDF**: QR code + HTML-to-PDF (Puppeteer)
- **2FA**: otplib TOTP
- **RBAC**: CASL.js

### Testing

- **Unit**: Vitest + @testing-library/react + jsdom
- **E2E**: Playwright
- **Accessibility**: @axe-core/playwright
- **Performance**: k6
- **Security**: OWASP ZAP

### DevOps

- **Build**: Next.js standalone output
- **Container**: Docker + docker-compose
- **CI**: GitHub Actions (lint, test, build)

---

## Usage Guidelines

### Selecting the Right Skill

1. **New Feature Development**:
   - Backend → `/backend-service` + `/database-query`
   - Frontend → `/frontend-design`
   - Full-stack → both + `/migration-helper` (if schema changes needed)

2. **Debugging**:
   - Runtime errors → `/debug-issue`
   - Workflow issues → `/workflow-verificator`

3. **Testing**:
   - Unit/E2E → `/qa-testing`
   - Coverage gaps → `/test-gap-filler`
   - Workflow validation → `/workflow-verificator`

4. **Quality & Maintenance**:
   - Code quality → `/codebase-assessment`
   - Cleanup → `/cleanup-codebase` or `/code-cleanup`
   - Security → `/security-hardening`
   - Performance → `/performance-profiler`

5. **Pre-Deployment**:
   - Full validation → `/full-system-validation`
   - Security check → `/security-hardening`
   - Accessibility → `/accessibility-auditor`

---

## Maintenance

This document should be updated when:

- New skills/commands are added to `.claude/commands/`
- Major refactoring changes file structure
- New modules or features are introduced
- Technology stack changes (package upgrades, new dependencies)

**Review Frequency**: After major feature additions or dependency updates
