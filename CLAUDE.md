# Online Business Permit System — Agentic Workflow Guide

## Project Overview

**Online Business Permit System (OBPS)** is a comprehensive web-based Business Permit Application & Management System built for Philippine Local Government Units (LGUs). It digitizes the end-to-end business permit lifecycle: application, document verification, review, payment, permit generation, and claim scheduling.

| Aspect            | Technology                                                                    |
| ----------------- | ----------------------------------------------------------------------------- |
| **Framework**     | Next.js 16 (App Router, Server Components, Server Actions)                    |
| **Frontend**      | React 19 + TypeScript 5.9                                                     |
| **Styling**       | Tailwind CSS v4 + class-variance-authority (CVA)                              |
| **UI Components** | Custom UI library (`src/components/ui/`) with Lucide React icons              |
| **State**         | Zustand 5 (UI store, application store) + React Query (TanStack Query v5)     |
| **Forms**         | React Hook Form 7 + Zod 4 validation                                          |
| **ORM**           | Prisma 7 with `@prisma/adapter-pg` (PostgreSQL adapter)                       |
| **Database**      | PostgreSQL 16                                                                 |
| **Auth**          | NextAuth v5 (Auth.js) — Credentials provider, JWT strategy, 30-min sessions   |
| **Real-Time**     | Server-Sent Events (SSE) via `/api/events`                                    |
| **File Storage**  | S3/MinIO with local filesystem fallback                                       |
| **Caching**       | Redis (ioredis) with in-memory fallback                                       |
| **Job Queue**     | BullMQ (Redis-backed)                                                         |
| **Email**         | Nodemailer (SMTP/Resend/SES)                                                  |
| **SMS**           | Semaphore / Globe Labs API                                                    |
| **Payments**      | PayMongo (GCash, Maya, bank transfer) + OTC/Cash                              |
| **PDF**           | QR code generation (qrcode lib) + HTML-to-PDF (Puppeteer)                     |
| **2FA**           | otplib TOTP (Google Authenticator compatible)                                 |
| **i18n**          | next-intl (English + Filipino)                                                |
| **RBAC**          | CASL.js (`@casl/ability` + `@casl/prisma`)                                    |
| **Testing**       | Vitest + Testing Library (unit), Playwright (E2E), k6 (perf), OWASP ZAP (sec) |
| **Build**         | Next.js standalone output, Docker multi-stage                                 |
| **SEO**           | next-sitemap, JSON-LD structured data, Open Graph                             |
| **PWA**           | Service worker, manifest.json, offline fallback                               |
| **Monitoring**    | Sentry (optional) + Prometheus metrics endpoint                               |
| **Notifications** | sonner (toast), Lucide icons                                                  |
| **Theme**         | next-themes (light/dark support)                                              |

---

## Seven Core Modules

| #   | Module                              | Key Models & Features                                                                                        |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | **User & Access Management**        | 4 roles (APPLICANT, STAFF, REVIEWER, ADMINISTRATOR), OTP login, 2FA/TOTP, session management, activity logs  |
| 2   | **Permit Application Management**   | NEW/RENEWAL applications, status lifecycle (DRAFT→SUBMITTED→UNDER_REVIEW→APPROVED/REJECTED), review workflow |
| 3   | **Digital Document Management**     | Upload with magic bytes validation, virus scanning stub, verification workflow, version tracking             |
| 4   | **Application & Renewal Tracking**  | Real-time SSE updates, status timeline, dashboard widgets                                                    |
| 5   | **Claim Scheduling Management**     | Time slot management, capacity limits, rescheduling, walk-in handling                                        |
| 6   | **Claim Reference & Reporting**     | Reference numbers with QR codes, analytics, CSV/PDF export                                                   |
| 7   | **Permit Issuance & Certification** | PDF generation with QR codes, permit printing, status updates                                                |

### Additional Systems

- **Payment System** — GCash, Maya, bank transfer, OTC, cash (PayMongo integration)
- **Government API Integration** — DTI, BIR, SEC verification (mock mode for dev)
- **Notification System** — Email (Nodemailer), SMS (Semaphore), real-time (SSE)

---

## Code Quality Standards

- **TypeScript**: Strict mode, 0 production errors (`npm run typecheck`)
- **Validation**: All forms use Zod schemas from `src/lib/validations.ts`
- **Security**: No API keys in code — use env vars. Security headers in `next.config.js`
- **Auth pattern**: NextAuth v5 Credentials provider. Edge-safe config split (`auth.config.ts` + `auth.ts`)
- **Null safety**: Always use optional chaining (`user?.id`) for nullable references
- **Data sanitization**: Use `sanitizeUser()` from `src/lib/sanitize.ts` before sending user data in responses
- **No debug console.logs**: Use `console.warn`/`console.error` only in error handlers
- **Financial amounts**: Use `Decimal(12,2)` or `Decimal(15,2)` via Prisma — never store money as Float

### Code Quality Targets

| Category                  | Standard                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Security                  | No hardcoded secrets, env vars for all config, rate limiting, security headers, CSRF protection  |
| API & Data Integrity      | Zod validation on all inputs, try/catch on all handlers, Prisma transactions for multi-table ops |
| TypeScript & Code Quality | 0 TS errors, no `as any` in API/lib files, components decomposed under 500 lines                 |
| Frontend Quality          | Loading states, error boundaries, SSE cleanup, `key` props on all `.map()` renders               |
| Testing                   | Unit tests for critical paths, E2E for core workflows, accessibility testing                     |
| Architecture & Patterns   | No circular dependencies, env config for all URLs/ports, SSE listeners cleaned up                |

### Enforcement Rules

- **No hardcoded API URLs** — use relative paths in Next.js API routes
- **No direct Prisma imports in components** — Prisma only in `src/lib/` and `src/app/api/` (server-side)
- **No `console.log` in production** — use proper error responses; `console.error` only in catch blocks
- **No empty catch blocks** — all exceptions must be logged or re-thrown
- **All API route handlers must validate input** — use Zod schemas from `src/lib/validations.ts`
- **All financial amounts must use Decimal** — never store money as Float or Int
- **SSE listeners must have cleanup** — return cleanup function from `useEffect`
- **Build must produce 0 errors** before any commit (`npm run typecheck`)
- **All Prisma schema changes must validate** — `npx prisma validate` from `web/`

---

## Project Structure

```
ONLINE-BUSINESS-PERMIT/
├── CLAUDE.md                   # This file (agentic workflow guide)
├── START_HERE.md               # Comprehensive setup & walkthrough guide
├── PROJECT-PLAN.md             # Full project plan with architecture
├── MISSING_REQUIREMENTS.md     # Missing API keys & services status
├── tasks.md                    # Comprehensive audit & task tracker
├── docker-compose.yml          # PostgreSQL 16 + Redis 7 + MinIO + App
├── package.json                # Root workspace scripts (proxy to web/)
├── .claude/                    # Agentic workflow configuration
│   ├── AVAILABLE_SKILLS.md     # Skill catalog (22 skills)
│   ├── command-reference.md    # Quick command reference
│   ├── commands/               # 22 skill definition files (.md)
│   ├── workflows.json          # Machine-readable workflow definitions
│   └── settings.local.json     # Claude Code permissions
│
└── web/                        # Next.js 16 application
    ├── package.json            # Dependencies & scripts
    ├── next.config.js          # Next.js config (security headers, CSP, standalone)
    ├── tsconfig.json           # TypeScript configuration
    ├── vitest.config.ts        # Unit test config (Vitest + jsdom)
    ├── playwright.config.ts    # E2E test config (Playwright + Chromium)
    ├── eslint.config.mjs       # ESLint 9 flat config
    ├── postcss.config.js       # PostCSS + Tailwind CSS v4
    ├── Dockerfile              # Production Docker image (standalone)
    │
    ├── prisma/
    │   ├── schema.prisma       # Database schema (16 models, 11 enums, ~500 lines)
    │   └── seed.js             # Test data seeder (6 users, 5 apps, permits, etc.)
    │
    ├── public/
    │   ├── manifest.json       # PWA manifest
    │   ├── sw.js               # Service worker (offline support)
    │   ├── offline.html        # Offline fallback page
    │   ├── robots.txt          # SEO robots file
    │   └── icons/              # PWA icons (72px → 512px)
    │
    ├── e2e/                    # Playwright E2E tests
    │   ├── app.spec.ts
    │   ├── accessibility.spec.ts
    │   └── visual-regression.spec.ts
    │
    ├── tests/
    │   ├── performance/load-test.js  # k6 load tests
    │   └── security/                 # OWASP ZAP scan scripts
    │
    └── src/
        ├── middleware.ts        # Auth + rate limiting + RBAC middleware (Edge Runtime)
        ├── instrumentation.ts   # Server instrumentation hook
        │
        ├── lib/                 # Core business logic (22 files)
        │   ├── auth.ts          # NextAuth v5 config (Credentials provider)
        │   ├── auth.config.ts   # Edge-safe auth config (no Node.js imports)
        │   ├── prisma.ts        # PrismaClient singleton (PrismaPg adapter)
        │   ├── validations.ts   # Zod schemas for all forms
        │   ├── permissions.ts   # CASL.js RBAC (4 roles × 10 actions × 10 subjects)
        │   ├── payments.ts      # PayMongo (GCash, Maya), bank transfer, OTC
        │   ├── sms.ts           # Semaphore + Globe Labs SMS
        │   ├── email.ts         # Nodemailer (SMTP/Resend/SES)
        │   ├── storage.ts       # S3/MinIO with local filesystem fallback
        │   ├── pdf.ts           # Permit PDF generation with QR codes
        │   ├── two-factor.ts    # TOTP 2FA (otplib)
        │   ├── rate-limit.ts    # Sliding window rate limiter
        │   ├── queue.ts         # BullMQ job queues
        │   ├── government-api.ts # DTI/BIR/SEC verification (mock mode in dev)
        │   ├── sse.ts           # Server-Sent Events broadcaster
        │   ├── i18n.ts          # Filipino/English i18n
        │   ├── stores.ts        # Zustand stores (UI state, notifications)
        │   ├── cache.ts         # Redis + in-memory cache fallback
        │   ├── monitoring.ts    # Sentry + Prometheus metrics
        │   ├── sanitize.ts      # Data sanitization
        │   ├── logger.ts        # Structured logging
        │   └── utils.ts         # Utility functions (cn, formatDate, etc.)
        │
        ├── hooks/
        │   └── use-sse.ts       # SSE client hook with auto-reconnect
        │
        ├── messages/            # i18n translations
        │   ├── en.json          # English
        │   └── fil.json         # Filipino
        │
        ├── components/
        │   ├── ui/              # 14 reusable UI components
        │   ├── dashboard/       # Dashboard shell, sidebar, header, notification bell
        │   ├── privacy/         # Cookie consent (RA 10173 compliance)
        │   ├── seo/             # JSON-LD structured data schemas
        │   ├── pwa/             # Service worker registration
        │   ├── public/          # Public nav, footer
        │   └── providers/       # QueryProvider, ThemeProvider
        │
        ├── app/
        │   ├── layout.tsx       # Root layout (providers, SEO, PWA, Toaster)
        │   ├── page.tsx         # Landing page
        │   │
        │   ├── (public)/        # 9 public pages (no auth required)
        │   │   ├── contact/, data-privacy/, faqs/, how-to-apply/
        │   │   ├── privacy/, requirements/, terms/
        │   │   ├── track/, verify-permit/
        │   │
        │   ├── (auth)/          # 4 auth pages
        │   │   ├── login/, register/, forgot-password/, verify-otp/
        │   │
        │   ├── (dashboard)/dashboard/  # Protected dashboard pages
        │   │   ├── applications/       # Application CRUD + new
        │   │   ├── documents/          # Document management
        │   │   ├── tracking/           # Real-time tracking
        │   │   ├── review/             # Reviewer queue
        │   │   ├── verify-documents/   # Staff document verification
        │   │   ├── schedule/           # Schedule management
        │   │   ├── claims/             # Claim processing
        │   │   ├── claim-reference/    # Reference numbers
        │   │   ├── issuance/           # Permit issuance
        │   │   ├── profile/            # User profile + 2FA
        │   │   └── admin/              # Admin: users, settings, schedules, reports, audit-logs
        │   │
        │   └── api/                    # 18 API route groups
        │       ├── auth/, applications/, documents/, schedules/
        │       ├── claims/, permits/, issuance/, payments/
        │       ├── events/, analytics/, metrics/, health/
        │       ├── profile/, privacy/, admin/, public/
        │       ├── files/, cron/
        │
        └── __tests__/               # Unit tests (Vitest)
```

---

## User Roles

| Role              | Description                                    | Key Pages                                                         |
| ----------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| **APPLICANT**     | Business owners applying for permits           | Dashboard, Applications, Documents, Track, Claims                 |
| **STAFF**         | BPLO clerks handling daily operations          | Verify Documents, Manage Schedules, Process Claims, Issue Permits |
| **REVIEWER**      | BPLO officers reviewing/approving applications | Review Queue, Approve/Reject, Reports                             |
| **ADMINISTRATOR** | Full system access and user management         | All pages + Admin Users, Settings, Reports, Audit Logs            |

---

## Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  middleware.ts (Edge Runtime)                                │
│  ├── Rate limiting (auth:10/min, api:100/min, otp:5/15min) │
│  ├── Auth redirects (login ↔ dashboard)                     │
│  └── Role-based access (admin routes, review routes)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  auth.config.ts (Edge-safe — no Node.js imports)            │
│  ├── JWT callbacks (role, firstName, lastName in token)     │
│  ├── Session callbacks (attach user data)                   │
│  └── Session: JWT strategy, 30-min maxAge                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  auth.ts (Node.js Runtime — Credentials provider)           │
│  ├── Email + password login (bcryptjs comparison)           │
│  ├── Account status check (ACTIVE required)                 │
│  ├── Update lastLoginAt on successful login                 │
│  └── Activity log creation                                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Auth Patterns

```typescript
// Server Component — get session
import { auth } from "@/lib/auth";
const session = await auth();
const role = session?.user?.role;

// API Route — protect endpoint
import { auth } from "@/lib/auth";
export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Middleware — rate limiting + RBAC handled automatically by src/middleware.ts
```

---

## Database Schema (16 Models, 11 Enums)

| Model                | Module | Purpose                                               |
| -------------------- | ------ | ----------------------------------------------------- |
| `User`               | 1      | Accounts with 4 roles, 2FA, lockout                   |
| `Session`            | 1      | Active user sessions                                  |
| `OtpToken`           | 1      | OTP codes (email verification, login, password reset) |
| `ActivityLog`        | 1      | Audit trail of all user actions                       |
| `Application`        | 2      | Business permit applications (NEW/RENEWAL)            |
| `ApplicationHistory` | 2      | Status change history with timestamps                 |
| `ReviewAction`       | 2      | Reviewer decisions (APPROVE/REJECT/REQUEST_REVISION)  |
| `Document`           | 3      | Uploaded files with verification status               |
| `ClaimSchedule`      | 5      | Available dates for permit claiming                   |
| `TimeSlot`           | 5      | Time windows within a schedule date                   |
| `SlotReservation`    | 5      | Applicant bookings for time slots                     |
| `ClaimReference`     | 6      | Generated reference numbers with QR codes             |
| `Permit`             | 7      | Issued permits with validity periods                  |
| `PermitIssuance`     | 7      | Issuance records and printing status                  |
| `SystemSetting`      | —      | Configurable system parameters                        |
| `Payment`            | —      | Payment records (GCash, Maya, bank, OTC, cash)        |

### Enums

`Role` (4), `AccountStatus` (4), `ApplicationType` (2), `ApplicationStatus` (6), `DocumentStatus` (4), `ReservationStatus` (5), `ClaimReferenceStatus` (4), `PermitStatus` (4), `IssuanceStatus` (4), `PaymentStatus` (6), `PaymentMethod` (5)

---

## Development Commands

```bash
cd web

# Development
npm run dev                   # Start dev server (port 3000)
npm run build                 # Production build
npm run typecheck             # TypeScript check (must return 0 errors)
npm run lint                  # ESLint

# Database
npm run db:push               # Push schema to DB (dev)
npm run db:migrate            # Create & run migrations (production)
npm run db:seed               # Seed test data
npm run db:studio             # Prisma Studio (port 5555)

# Testing
npm test                      # Vitest unit tests
npm run test:e2e              # Playwright E2E
npm run test:a11y             # WCAG 2.1 AA
npm run test:coverage         # Coverage report

# Docker (from project root)
docker compose up -d                       # All services
docker compose up -d postgres redis minio  # Infrastructure only
```

---

## API Routes (18 Groups)

| Group           | Path                | Key Endpoints                              |
| --------------- | ------------------- | ------------------------------------------ |
| `auth/`         | `/api/auth/`        | Login, register, OTP, 2FA, forgot-password |
| `applications/` | `/api/applications` | CRUD, verify-registration, review          |
| `documents/`    | `/api/documents`    | Upload, verify, download                   |
| `schedules/`    | `/api/schedules`    | CRUD, reserve, reschedule                  |
| `claims/`       | `/api/claims`       | List, today, verify                        |
| `permits/`      | `/api/permits`      | Details, PDF generation                    |
| `issuance/`     | `/api/issuance`     | Record issuance, update status             |
| `payments/`     | `/api/payments`     | Create payment, webhook                    |
| `events/`       | `/api/events`       | SSE real-time stream                       |
| `analytics/`    | `/api/analytics`    | Dashboard analytics (admin)                |
| `metrics/`      | `/api/metrics`      | Prometheus metrics                         |
| `health/`       | `/api/health`       | Health check                               |
| `profile/`      | `/api/profile`      | User profile CRUD                          |
| `privacy/`      | `/api/privacy`      | Data privacy (RA 10173)                    |
| `admin/`        | `/api/admin/`       | Users, settings, reports                   |
| `public/`       | `/api/public/`      | Public track + verify-permit               |
| `files/`        | `/api/files/`       | Local file serving                         |
| `cron/`         | `/api/cron/`        | Expire holds, expire permits               |

---

## Real-Time (SSE)

| Event                        | Trigger                        |
| ---------------------------- | ------------------------------ |
| `application_status_changed` | Application status updates     |
| `document_verified`          | Document verification complete |
| `claim_scheduled`            | Claim slot booked              |
| `permit_issued`              | Permit issued                  |
| `slot_availability_changed`  | Schedule slot changes          |
| `notification`               | Generic user notification      |
| `heartbeat`                  | Keep-alive (30s interval)      |

---

## Key Patterns

```typescript
// Prisma Client (singleton with PrismaPg adapter)
import prisma from "@/lib/prisma";

// Zod validation
import { registerSchema } from "@/lib/validations";
const result = registerSchema.safeParse(body);

// CASL permissions
import { defineAbilitiesFor } from "@/lib/permissions";
const ability = defineAbilitiesFor(session.user.role);

// Zustand store
import { useUIStore } from "@/lib/stores";

// Cache (Redis + in-memory fallback)
import { cacheOrCompute } from "@/lib/cache";

// Data sanitization (strip password from responses)
import { sanitizeUser } from "@/lib/sanitize";

// File upload (S3/MinIO with local fallback)
import { uploadFile } from "@/lib/storage";
```

---

## Test Accounts (after `npm run db:seed`)

| Role          | Email                 | Password       |
| ------------- | --------------------- | -------------- |
| Administrator | `admin@lgu.gov.ph`    | `Password123!` |
| Reviewer      | `reviewer@lgu.gov.ph` | `Password123!` |
| Staff         | `staff@lgu.gov.ph`    | `Password123!` |
| Applicant     | `juan@example.com`    | `Password123!` |
| Applicant     | `pedro@example.com`   | `Password123!` |
| Pending       | `ana@example.com`     | `Password123!` |

---

## Infrastructure

| Service    | Container       | Port(s)    | Fallback if unavailable      |
| ---------- | --------------- | ---------- | ---------------------------- |
| PostgreSQL | `obps-postgres` | 5432       | None (required)              |
| Redis      | `obps-redis`    | 6379       | In-memory cache              |
| MinIO      | `obps-minio`    | 9000, 9001 | Local `./uploads/` directory |

---

## Philippine Compliance

- **RA 11032** — Ease of Doing Business (online application, real-time tracking)
- **RA 10173** — Data Privacy Act (cookie consent, data privacy page, data export)
- **DICT Standards** — Government cloud compatible, WCAG 2.1 AA
- **NBCP** — Fire safety document requirements

---

## Available Skills

| Skill                     | Purpose                                           |
| ------------------------- | ------------------------------------------------- |
| `/backend-service`        | Next.js API routes, server actions, lib modules   |
| `/database-query`         | Prisma queries, migrations, schema management     |
| `/debug-issue`            | Diagnose and fix issues across the stack          |
| `/frontend-design`        | React components with Tailwind CSS + CVA          |
| `/qa-testing`             | Vitest unit tests, Playwright E2E, test scenarios |
| `/workflow-definitions`   | Application workflow documentation                |
| `/workflow-verificator`   | Pre-deployment validation                         |
| `/cleanup-codebase`       | Dead code, console.log removal, TODO tracking     |
| `/codebase-assessment`    | Quantitative grading across 6 categories          |
| `/security-hardening`     | Auth audit, OWASP Top 10, CSP headers             |
| `/performance-profiler`   | Prisma queries, bundle size, API response         |
| `/pwa-offline`            | Service worker, caching, offline support          |
| `/full-system-validation` | Cross-cutting validation (routes→types→SSE→auth)  |
| `/implementation-plan`    | Sprint planning, feature prioritization           |
| `/payment-integration`    | PayMongo, GCash, Maya, webhook handling           |
| `/accessibility-auditor`  | WCAG 2.1 AA compliance                            |
| `/test-gap-filler`        | Identify untested paths, generate test suites     |
| `/code-cleanup`           | Dead code removal, naming fixes                   |
| `/god-class-decomposer`   | Break apart large components/modules              |
| `/memory-leak-detector`   | SSE cleanup, timer leaks, subscriptions           |
| `/code-behind-extractor`  | Extract inline logic to lib modules               |
| `/migration-helper`       | Prisma migrations, schema evolution               |

---

## Reference Documentation

- `.claude/AVAILABLE_SKILLS.md` — Full skill catalog with usage examples
- `.claude/command-reference.md` — Quick command reference
- `.claude/commands/` — 22 skill definitions
- `.claude/workflows.json` — Machine-readable workflow definitions
