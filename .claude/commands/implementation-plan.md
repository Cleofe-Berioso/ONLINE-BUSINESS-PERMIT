# Implementation Plan — OBPS Feature Implementation Guide

## Purpose

Create structured implementation plans for new features or modules in the Online Business Permit System, breaking down work into phases with clear deliverables.

## Usage

```
/implementation-plan <feature-or-module-description>
```

## Planning Template

### 1. Requirements Analysis

- What user story or requirement does this address?
- Which user role(s) are involved?
- Which existing modules are affected?
- What data models need changes?

### 2. Technical Design

- New/modified files (pages, API routes, components, lib)
- Prisma schema changes (models, enums, relations)
- State management needs (Zustand, React Query)
- External integrations (payments, email, SMS, storage)

### 3. Implementation Phases

```
Phase 1: Database & Schema
  - Prisma schema changes
  - Migration generation & testing
  - Seed data updates

Phase 2: Backend (API Routes)
  - Route handlers with Zod validation
  - Business logic in lib modules
  - Auth/RBAC enforcement

Phase 3: Frontend (UI)
  - Server Component pages
  - Client Components for interactivity
  - Form handling (React Hook Form + Zod)

Phase 4: Integration
  - Wire frontend to API routes
  - Real-time updates (SSE)
  - Notifications (email, SMS, in-app)

Phase 5: Testing
  - Unit tests (Vitest)
  - E2E tests (Playwright)
  - Manual QA with all roles
```

### 4. Acceptance Criteria

- List specific conditions that must be true for the feature to be complete
- Include role-based scenarios
- Include error/edge cases

## Reference: Existing Module Structure

| Module                    | Status      | Files                                           |
| ------------------------- | ----------- | ----------------------------------------------- |
| Auth (login/register/OTP) | ✅ Complete | `(auth)/`, `api/auth/`                          |
| Application CRUD          | ✅ Complete | `dashboard/applications/`, `api/applications/`  |
| Document Management       | ✅ Complete | `dashboard/verify-documents/`, `api/documents/` |
| Review Workflow           | ✅ Complete | `dashboard/review/`, `api/applications/[id]/`   |
| Claim Scheduling          | 🟡 In Progress | `dashboard/schedule/`, `api/schedules/`         |
| Permit Issuance           | 🟡 In Progress | `dashboard/issuance/`, `api/issuance/`          |
| Payment Processing        | 🟡 In Progress | `api/payments/`                                 |
| Admin Panel               | 🟡 Partial | `dashboard/admin/`, `api/admin/`                |
| Analytics/Reports         | 🟡 Partial | `api/analytics/`                                |
| Real-time (SSE)           | ✅ Complete | `api/events`, `hooks/use-sse.ts`                |
| Notifications             | ✅ Complete | Email (`lib/email.ts`), SMS (`lib/sms.ts`), In-app (SSE) |

## Cross-cutting Concerns

Every new feature must address:

- [ ] Auth check (session + role)
- [ ] Input validation (Zod)
- [ ] Error handling (try/catch, user-friendly messages)
- [ ] Loading states (Skeleton, Suspense)
- [ ] Mobile responsiveness
- [ ] i18n (useTranslations)
- [ ] Accessibility (labels, keyboard nav)
- [ ] Audit logging (AuditLog model)
- [ ] Test coverage (unit + E2E)
