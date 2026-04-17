# eBPLS Codebase Structure
**Project:** Online Business Permit and Licensing System
**Last Updated:** April 17, 2026
**Type:** Next.js 16 Full-Stack Application

---

## 📁 Root Directory Structure

```
ONLINE-BUSINESS-PERMIT/
├── web/                           # Next.js application (main codebase)
├── DFD's and data template/       # Business requirements (DFD & data specs)
├── .claude/                       # Claude Code configuration & skills
├── .git/                          # Git repository
├── .github/                       # GitHub workflows
│
├── 📋 DOCUMENTATION (Root)
│   ├── CLAUDE.md                  # Tech stack, architecture, patterns
│   ├── START_HERE.md              # Setup & deployment guide
│   ├── PROJECT-PLAN.md            # Complete project roadmap
│   ├── FRONTEND-UI-ALIGNMENT-AUDIT.md     # Frontend audit report (2000+ lines)
│   ├── FRONTEND-GAPS-IMPLEMENTATION-SUMMARY.md  # Implementation summary
│   ├── DFD-IMPLEMENTATION-GAP-ANALYSIS.md      # DFD compliance analysis
│   ├── CODE-REVIEW-ANALYSIS.md    # Code quality audit
│   ├── MISSING_REQUIREMENTS.md    # Configuration checklist
│   └── ... (12+ other analysis docs)
│
└── docker-compose.yml            # PostgreSQL 16, Redis 7, MinIO, App
```

---

## 🚀 Web Application Structure (Next.js 16)

```
web/
├── 📦 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.js            # Next.js config (security headers, CSP)
│   ├── postcss.config.js         # PostCSS + Tailwind CSS v4
│   ├── vitest.config.ts          # Unit test config
│   ├── playwright.config.ts      # E2E test config
│   └── eslint.config.mjs         # ESLint 9 flat config
│
├── 🗄️ Database
│   └── prisma/
│       ├── schema.prisma         # Prisma schema (16 models, 11 enums)
│       └── seed.js               # Test data seeder
│
├── 📄 Public Assets
│   └── public/
│       ├── manifest.json         # PWA manifest
│       ├── sw.js                 # Service worker (offline support)
│       ├── offline.html          # Offline fallback
│       ├── robots.txt            # SEO robots
│       └── icons/                # PWA icons (72px → 512px)
│
├── 🧪 Tests
│   ├── e2e/                      # Playwright E2E tests
│   │   ├── app.spec.ts
│   │   ├── accessibility.spec.ts
│   │   └── visual-regression.spec.ts
│   ├── tests/
│   │   ├── performance/          # k6 load tests
│   │   └── security/             # OWASP ZAP scan scripts
│   └── src/__tests__/            # Vitest unit tests
│       ├── api/                  # API route tests
│       ├── components/           # Component tests
│       └── lib/                  # Library function tests
│
├── 🔧 Source Code (src/)
│   │
│   ├── middleware.ts             # Edge runtime: auth, rate limiting, RBAC
│   ├── instrumentation.ts        # Server instrumentation
│   │
│   ├── 📚 lib/ (22 files - Business Logic & Utilities)
│   │   ├── auth.ts               # NextAuth v5 config (Credentials provider)
│   │   ├── auth.config.ts        # Edge-safe auth config
│   │   ├── prisma.ts             # PrismaClient singleton (PrismaPg adapter)
│   │   ├── validations.ts        # Zod schemas for all forms
│   │   ├── validations/          # Organized validation schemas
│   │   ├── permissions.ts        # CASL.js RBAC (4 roles × 10 actions)
│   │   ├── application-helpers.ts # Core business logic (renewal, closure validation)
│   │   ├── payments.ts           # PayMongo integration (GCash, Maya)
│   │   ├── sms.ts                # Semaphore + Globe Labs SMS
│   │   ├── email.ts              # Nodemailer (SMTP/Resend/SES)
│   │   ├── storage.ts            # S3/MinIO with local filesystem fallback
│   │   ├── pdf.ts                # Permit PDF generation with QR codes
│   │   ├── two-factor.ts         # TOTP 2FA (otplib)
│   │   ├── rate-limit.ts         # Sliding window rate limiter
│   │   ├── queue.ts              # BullMQ job queues
│   │   ├── government-api.ts     # DTI/BIR/SEC verification (mock mode)
│   │   ├── sse.ts                # Server-Sent Events broadcaster
│   │   ├── i18n.ts               # Filipino/English i18n
│   │   ├── stores.ts             # Zustand stores (UI state)
│   │   ├── cache.ts              # Redis + in-memory cache fallback
│   │   ├── sanitize.ts           # Data sanitization
│   │   ├── logger.ts             # Structured logging
│   │   └── utils.ts              # Utility functions (cn, formatDate, etc.)
│   │
│   ├── 🪝 hooks/
│   │   └── use-sse.ts            # SSE client hook with auto-reconnect
│   │
│   ├── 🌍 messages/
│   │   ├── en.json               # English translations
│   │   └── fil.json              # Filipino translations
│   │
│   ├── 🎨 components/
│   │   ├── ui/                   # 14 reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── select.tsx
│   │   │   ├── modal.tsx
│   │   │   └── ... (4 more UI components)
│   │   │
│   │   ├── dashboard/            # Dashboard-specific components
│   │   │   ├── shell.tsx         # Main dashboard shell (sidebar + header)
│   │   │   ├── sidebar.tsx       # Navigation sidebar (role-based)
│   │   │   ├── header.tsx        # Top header bar
│   │   │   ├── renewal-shell.tsx # Renewal-specific layout
│   │   │   ├── renewal-sidebar.tsx
│   │   │   ├── tracking-client.tsx # Real-time tracking (SSE)
│   │   │   ├── verify-document-actions.tsx
│   │   │   └── ... (other dashboard components)
│   │   │
│   │   ├── privacy/              # Cookie consent (RA 10173 compliance)
│   │   ├── providers/            # Context providers (Query, Theme)
│   │   ├── public/               # Public nav, footer
│   │   ├── pwa/                  # Service worker registration
│   │   └── seo/                  # JSON-LD structured data
│   │
│   ├── 📱 app/ (Next.js 16 App Router)
│   │   │
│   │   ├── layout.tsx            # Root layout (providers, SEO, PWA, Toaster)
│   │   ├── page.tsx              # Landing page
│   │   │
│   │   ├── (public)/             # 9 public pages (no auth required)
│   │   │   ├── contact/
│   │   │   ├── data-privacy/
│   │   │   ├── faqs/
│   │   │   ├── how-to-apply/
│   │   │   ├── privacy/
│   │   │   ├── requirements/
│   │   │   ├── terms/
│   │   │   ├── track/            # Public permit tracker
│   │   │   └── verify-permit/
│   │   │
│   │   ├── (auth)/               # 4 auth pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── verify-otp/
│   │   │
│   │   ├── (dashboard)/dashboard/ # Protected dashboard pages
│   │   │   ├── layout.tsx        # Dashboard shell layout
│   │   │   ├── page.tsx          # Dashboard home (stats, quick actions)
│   │   │   │
│   │   │   ├── applications/     # Application management
│   │   │   │   ├── page.tsx      # List applications
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx  # ✅ Detail view (IMPLEMENTED)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  # NEW application form
│   │   │   │   ├── closure/
│   │   │   │   │   └── page.tsx  # CLOSURE form (TBD bug FIXED)
│   │   │   │   └── renewal/
│   │   │   │
│   │   │   ├── renew/            # Renewal portal
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx      # Renewal permit selection
│   │   │   │   └── permit/
│   │   │   │       └── page.tsx  # ✅ Renewal form (IMPLEMENTED)
│   │   │   │
│   │   │   ├── documents/        # Document management
│   │   │   ├── tracking/         # Application tracking
│   │   │   ├── schedule/         # Claim slot scheduling
│   │   │   ├── claims/           # Staff: today's claims
│   │   │   ├── claim-reference/  # Claim reference display
│   │   │   ├── review/           # Reviewer queue
│   │   │   │   ├── page.tsx      # Review list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # ✅ Review detail (IMPLEMENTED)
│   │   │   │
│   │   │   ├── issuance/         # Permit issuance
│   │   │   │   ├── page.tsx      # Issuance list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # ✅ Issuance detail + Mayor signing (ENHANCED)
│   │   │   │
│   │   │   ├── profile/          # User profile + 2FA
│   │   │   └── admin/            # Admin pages
│   │   │       ├── users/
│   │   │       ├── settings/
│   │   │       ├── schedules/
│   │   │       ├── reports/
│   │   │       └── audit-logs/
│   │   │
│   │   └── api/ (18 API route groups)
│   │       ├── auth/             # Login, register, OTP, 2FA
│   │       ├── applications/     # CRUD, renewal, closure, review
│   │       ├── documents/        # Upload, verify, download
│   │       ├── schedules/        # Schedule CRUD, reservations
│   │       ├── claims/           # Today's claims, verify, release
│   │       ├── permits/          # Permit details, PDF, renewal-eligible
│   │       ├── issuance/         # Issuance actions (ISSUE, RELEASE, MAYOR_*)
│   │       ├── payments/         # PayMongo integration
│   │       ├── events/           # SSE real-time stream
│   │       ├── analytics/        # Dashboard analytics
│   │       ├── metrics/          # Prometheus metrics
│   │       ├── health/           # Health checks
│   │       ├── profile/          # User profile CRUD
│   │       ├── privacy/          # Data privacy (RA 10173)
│   │       ├── admin/            # Admin operations
│   │       ├── public/           # Public track, verify-permit
│   │       ├── files/            # File serving
│   │       └── cron/             # Scheduled tasks
│   │
│   └── 🧪 __tests__/
│       ├── api/
│       ├── components/
│       └── lib/
```

---

## 📊 Database Schema (Prisma)

### 16 Models
| Model | Purpose |
|-------|---------|
| `User` | Accounts (4 roles: APPLICANT, STAFF, REVIEWER, ADMINISTRATOR) |
| `Session` | Active user sessions |
| `OtpToken` | OTP codes (email/login/password reset) |
| `ActivityLog` | Audit trail of all actions |
| `Application` | Business permit applications (NEW/RENEWAL/CLOSURE) |
| `ApplicationHistory` | Status change history |
| `ReviewAction` | Reviewer decisions (APPROVE/REJECT/REQUEST_REVISION) |
| `Document` | Uploaded files with verification status |
| `ClaimSchedule` | Available claiming dates |
| `TimeSlot` | Time windows for claiming |
| `SlotReservation` | Applicant bookings |
| `ClaimReference` | Reference numbers with QR codes |
| `Permit` | Issued permits with validity periods |
| `PermitIssuance` | Issuance records + **Mayor signing fields** |
| `SystemSetting` | System configuration parameters |
| `Payment` | Payment records (GCash, Maya, bank, OTC, cash) |

### 11 Enums
- `Role`, `AccountStatus`, `ApplicationType`, `ApplicationStatus`, `DocumentStatus`
- `ReservationStatus`, `ClaimReferenceStatus`, `PermitStatus`, `IssuanceStatus`
- `PaymentStatus`, `PaymentMethod`

---

## 🔑 Key Implementation Files (Recently Updated)

### ✅ Critical Gaps Fixed (Phase 13)

| File | Change | Status |
|------|--------|--------|
| `/dashboard/applications/[id]/page.tsx` | Application detail view (180 lines) | ✅ NEW |
| `/dashboard/renew/permit/page.tsx` | Renewal form with Gross Sales (150 lines) | ✅ NEW |
| `/dashboard/issuance/[id]/page.tsx` | Mayor signing workflow UI | ✅ ENHANCED |
| `/dashboard/applications/closure/page.tsx` | Fixed TBD hardcoding | ✅ FIXED |
| `/dashboard/renew/page.tsx` | Updated flow to use form page | ✅ UPDATED |

### Core Business Logic

| File | Purpose | Lines |
|------|---------|-------|
| `lib/application-helpers.ts` | Renewal/closure validation, clearance routing | 900+ |
| `lib/validations.ts` | Zod schemas for all forms | 300+ |
| `lib/payments.ts` | PayMongo integration | 200+ |
| `lib/auth.ts` | NextAuth v5 configuration | 150+ |
| `lib/permissions.ts` | CASL.js RBAC rules | 200+ |

---

## 📚 Documentation Files (Root)

### Primary Guides
- **`START_HERE.md`** — Complete setup & deployment guide
- **`CLAUDE.md`** — Tech stack, architecture, 7 modules, development commands
- **`PROJECT-PLAN.md`** — Full project roadmap with phases

### Audit & Analysis
- **`FRONTEND-UI-ALIGNMENT-AUDIT.md`** (2000+ lines) — Comprehensive frontend audit
- **`FRONTEND-GAPS-IMPLEMENTATION-SUMMARY.md`** — Implementation summary
- **`DFD-IMPLEMENTATION-GAP-ANALYSIS.md`** — DFD compliance analysis
- **`CODE-REVIEW-ANALYSIS.md`** — Code quality audit

### Status & Tracking
- **`tasks.md`** — Comprehensive task tracker
- **`MISSING_REQUIREMENTS.md`** — Configuration checklist

---

## 🔧 Available Development Commands

```bash
# Development
npm run dev           # Start dev server (port 3000)
npm run build         # Production build
npm run typecheck     # TypeScript validation (0 errors)
npm run lint          # ESLint check

# Database
npm run db:push       # Push schema to DB (dev)
npm run db:migrate    # Create migrations (production)
npm run db:seed       # Seed test data
npm run db:studio     # Prisma Studio (port 5555)

# Testing
npm test              # Vitest unit tests
npm run test:e2e      # Playwright E2E
npm run test:a11y     # WCAG 2.1 AA accessibility
npm run test:coverage # Coverage report

# Docker (from root)
docker compose up -d              # All services
docker compose up -d postgres     # PostgreSQL only
```

---

## 📈 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Files (excluding node_modules)** | 500+ |
| **TypeScript Components** | 80+ |
| **API Routes** | 18 groups (50+ endpoints) |
| **Database Models** | 16 |
| **Enums** | 11 |
| **Zod Schemas** | 25+ |
| **Tests** | 35+ E2E, 50+ unit tests |
| **Documentation Pages** | 30+ markdown files |
| **Lines of Code** | 10,000+ (excluding tests/docs) |

---

## 🎯 Project Status

| Aspect | Status |
|--------|--------|
| **Build** | ✅ SUCCESS (0 TypeScript errors) |
| **Frontend Alignment** | ✅ A- (90%+) — Critical gaps fixed |
| **Staging Readiness** | ✅ APPROVED |
| **Production Ready** | ✅ Pending staging validation |
| **Critical Path Coverage** | ✅ 100% implemented |

---

## 🚀 Next Phase

**Staging Deployment** → Execute critical path tests → Production deployment

For detailed setup, see **START_HERE.md**
For tech stack details, see **CLAUDE.md**
For implementation status, see **Phase 13 in memory/MEMORY.md**
