# OBPS: Claude Configuration — Complete User Guide

> **What is the `.claude` folder?**
> It is the "brain" of the AI assistant for this project. It tells the AI **what it knows**, **what it can do**, **how to do it safely**, and **how to validate the entire system**. Think of it as the AI's project manual + toolbox.

---

## 📁 Folder Contents at a Glance

```
.claude/
├── settings.local.json      → AI permissions & feature flags
├── workflows.json           → Full system blueprint (24 workflows)
├── AVAILABLE_SKILLS.md      → Catalog of all 22 commands
├── command-reference.md     → Quick syntax cheat sheet
├── CLAUDE-COWORK.md         → Multi-agent testing strategy
└── commands/                → 22 detailed instruction files (one per command)
    ├── backend-service.md
    ├── database-query.md
    ├── debug-issue.md
    ├── frontend-design.md
    ├── qa-testing.md
    ├── security-hardening.md
    ├── performance-profiler.md
    ├── payment-integration.md
    ├── accessibility-auditor.md
    ├── implementation-plan.md
    ├── workflow-verificator.md
    ├── cleanup-codebase.md
    ├── codebase-assessment.md
    ├── pwa-offline.md
    ├── full-system-validation.md
    ├── test-gap-filler.md
    ├── code-cleanup.md
    ├── god-class-decomposer.md
    ├── memory-leak-detector.md
    ├── code-behind-extractor.md
    ├── city-restriction.md
    └── fee-structure.md
```

---

## 📄 File-by-File Breakdown

---

### 1. `settings.local.json` — AI Permissions & Environment

**What it does:** Configures what terminal commands the AI is allowed to run and enables experimental features like multi-agent teams.

**Key contents:**
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "permissions": {
    "allow": ["Bash(npm:*)", "Bash(npx:*)", "Bash(docker:*)", "Bash(git:*)", ...]
  }
}
```

**How to use it:**
- You normally don't interact with this file directly.
- If you need to allow a new command (e.g., `Bash(yarn:*)`), add it to the `allow` array.
- The `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` flag enables the COWORK multi-agent feature.

---

### 2. `workflows.json` — Full System Blueprint

**What it does:** Acts as the **single source of truth** for all 24 business workflows in the system. It maps every user action to its corresponding files, API routes, and database models.

**Key contents:**
- **Tech stack** definition (Next.js 16, Prisma 7, PostgreSQL 16, etc.)
- **4 User Roles**: APPLICANT, STAFF, REVIEWER, ADMINISTRATOR
- **24 Workflows** across 7 categories:

| Category       | # Workflows | Examples                                    |
|----------------|-------------|---------------------------------------------|
| Authentication | 4           | Register, Login, OTP Verify, Password Reset |
| Application    | 5           | Create, Review, Track, Gov. Verification    |
| Documents      | 3           | Upload, Verify, Download                    |
| Scheduling     | 3           | Create Schedule, Reserve Slot, Reschedule   |
| Permits        | 3           | Generate, Issue, Public Verify              |
| Payments       | 2           | Online (PayMongo), OTC Cash                 |
| Admin          | 4           | User Mgmt, Settings, Reports, Cron Jobs     |

**How to use it:**
- Reference this when you want to understand how a workflow is **wired** (page → API → DB).
- Use with `/workflow-definitions` or `/workflow-verificator` commands.
- Example: To understand payment flow, find `WF-PAY-001` which shows the full chain from the Pay Now button → PayMongo → Webhook → DB update.

---

### 3. `AVAILABLE_SKILLS.md` — Command Catalog

**What it does:** The master catalog of all **22 custom AI commands** available in this project. Each entry explains the purpose, capabilities, key files, and example use cases for one command.

**Command Categories:**

| Category              | Commands                                                                                                                                                                                                                                                                           |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Core Development (13) | `/backend-service`, `/database-query`, `/debug-issue`, `/frontend-design`, `/qa-testing`, `/workflow-definitions`, `/workflow-verificator`, `/cleanup-codebase`, `/codebase-assessment`, `/security-hardening`, `/performance-profiler`, `/pwa-offline`, `/full-system-validation` |
| Domain-Specific (9)   | `/implementation-plan`, `/payment-integration`, `/accessibility-auditor`, `/test-gap-filler`, `/code-cleanup`, `/god-class-decomposer`, `/memory-leak-detector`, `/code-behind-extractor`, `/migration-helper`                                                                     |

**How to use it:**
- Read this file when you don't know which command to use.
- Use the **Usage Guidelines** section at the bottom to pick the right command for your situation.

---

### 4. `command-reference.md` — Quick Syntax Cheat Sheet

**What it does:** A condensed reference showing the exact syntax for every command. No lengthy descriptions — just the command patterns.

**How to use it:**
- Keep this open while working. It's the fastest way to find command syntax.
- Full command table summary:

| Command                   | Use For                                               |
|---------------------------|-------------------------------------------------------|
| `/backend-service`        | Create API routes, server actions, lib modules        |
| `/database-query`         | Prisma queries, aggregations, migrations              |
| `/debug-issue`            | Fix 401/404/500 errors, auth, Prisma, SSE bugs        |
| `/frontend-design`        | Create pages, components, modals, forms               |
| `/qa-testing`             | Unit, E2E, accessibility, performance tests           |
| `/workflow-definitions`   | Understand application business flows                 |
| `/workflow-verificator`   | Verify a feature is fully wired end-to-end            |
| `/cleanup-codebase`       | Remove console.logs, dead code, unused imports        |
| `/codebase-assessment`    | Full quality grade across 6 categories               |
| `/security-hardening`     | OWASP Top 10 audit, auth, headers, rate limits        |
| `/performance-profiler`   | Find N+1 queries, slow bundles, API bottlenecks       |
| `/pwa-offline`            | Service worker, offline page, install prompt          |
| `/full-system-validation` | Pre-deployment cross-cutting check                    |
| `/implementation-plan`    | Sprint planning, feature breakdown                    |
| `/payment-integration`    | PayMongo, GCash, Maya, OTC flows                      |
| `/accessibility-auditor`  | WCAG 2.1 AA: contrast, keyboard, ARIA                 |
| `/test-gap-filler`        | Find untested critical paths                          |
| `/code-cleanup`           | TODOs, dead code, `any` types, naming                 |
| `/god-class-decomposer`   | Split files > 500 lines into focused units            |
| `/memory-leak-detector`   | SSE leaks, stale timers, Zustand subscriptions        |
| `/code-behind-extractor`  | Move inline logic to hooks/lib modules                |
| `/migration-helper`       | Prisma schema: add models, fields, indexes            |

---

### 5. `CLAUDE-COWORK.md` — Multi-Agent Testing Strategy

**What it does:** Defines a coordinated **5-team validation plan** where multiple AI agents work in parallel to test the entire system end-to-end across all 4 user roles.

**The 5 Agent Teams:**

| Team                  | Focus                               | Key Checks                                             |
|-----------------------|-------------------------------------|--------------------------------------------------------|
| **Team 1: Auth**      | Registration, OTP, Login, RBAC      | All 4 accounts login; APPLICANT can't access `/admin`; JWT expiry |
| **Team 2: Lifecycle** | DRAFT → APPROVED status flow        | ApplicationHistory records; SSE notifications          |
| **Team 3: Scheduling**| Schedules, Slots, Concurrency       | No double-booking; walk-in claim processing            |
| **Team 4: Payment**   | Fee calc, PayMongo, Permit PDF      | Webhook updates status; PDF has QR code                |
| **Team 5: Cross-Cutting** | Security, i18n, Cache, Rate limits | CSP headers; XSS rejected; Redis cache hit/miss    |

**5 Test Scenarios:**

| # | Scenario                          | Roles Involved      |
|---|-----------------------------------|---------------------|
| 1 | Happy Path — New Permit           | APPLICANT, STAFF, REVIEWER |
| 2 | Rejection and Resubmission        | APPLICANT, REVIEWER |
| 3 | Permit Renewal                    | APPLICANT, STAFF    |
| 4 | Concurrent Slot Reservation       | APPLICANT × 2       |
| 5 | Public Permit Verification (QR)   | Public (no auth)    |

**Satisfaction Scorecard:**

| Score    | Grade | Meaning              |
|----------|-------|----------------------|
| 95–100   | A+    | Production-ready     |
| 90–94    | A     | Minor issues only    |
| 80–89    | B+    | Non-critical failures|
| 70–79    | B     | Needs attention      |
| Below 70 | C/F   | Do not deploy        |

**How to trigger the full COWORK validation:**
```
/cowork Validate the OBPS using the scenario definitions in CLAUDE-COWORK.md.
Assign teams as defined. Each team validates their scenarios and reports back.
Produce the satisfaction scorecard.
```

---

## 📂 `commands/` Folder — The 22 Instruction Files

Each file is the detailed instruction manual for one command. Here is what each teaches the AI (and you):

---

### `backend-service.md`
- **Teaches:** How to create Next.js API route handlers following OBPS standards.
- **Key rules enforced:** Always check `auth()` session first; Zod validation on all inputs; Prisma `$transaction` for multi-model writes; return `{ data, error, message }`; rate limit on sensitive endpoints; log with Winston.
- **Use when:** You need a new API endpoint, server action, or lib module.
- **Example:** `/backend-service create api route for permit renewal`

---

### `database-query.md`
- **Teaches:** How to write correct Prisma queries for all 16 models and 11 enums in the OBPS schema.
- **Key rules enforced:** Cursor-based pagination; `groupBy` aggregations; atomic multi-model writes with `$transaction`.
- **All 16 models:** User, Application, ApplicationHistory, Document, Payment, Permit, PermitIssuance, ClaimSchedule, TimeSlot, SlotReservation, ClaimReference, ReviewAction, SystemSetting, Notification, AuditLog, VerificationToken.
- **Use when:** You need to query, insert, update, or migrate database data.
- **Example:** `/database-query find all SUBMITTED applications older than 7 days`

---

### `debug-issue.md`
- **Teaches:** A 5-step debugging workflow: Reproduce → Isolate → Inspect → Fix → Prevent.
- **Covers:** NextAuth session bugs (`AUTH_SECRET` missing, Edge import errors), Prisma errors (P2002 unique violation, P2025 not found), API 500s (missing `await`, ZodError not caught), SSE disconnections, TypeScript build failures.
- **Debug commands it provides:**
  ```bash
  npx prisma studio         # Browse the database visually
  npx prisma migrate status # Check migration state
  npx prisma validate       # Validate schema syntax
  ```
- **Use when:** Something is broken and you need a systematic approach.
- **Example:** `/debug-issue api 401 unauthorized on applications endpoint`

---

### `frontend-design.md`
- **Teaches:** How to build React 19 pages and components using Tailwind CSS v4, CVA, React Hook Form, and Zod.
- **Key rules enforced:** Server Components by default; `"use client"` only for interactivity; `cn()` for class merging (`clsx` + `tailwind-merge`); Lucide icons; sonner toasts; role-aware sidebar nav.
- **Project structure covered:** `(auth)/`, `(dashboard)/`, `(public)/`, `components/ui/`, `components/dashboard/`.
- **Use when:** You need a new page, component, form, or modal.
- **Example:** `/frontend-design create modal document-preview`

---

### `qa-testing.md`
- **Teaches:** How to write unit tests (Vitest + React Testing Library), E2E tests (Playwright), accessibility tests (axe-core), performance tests (k6), and security scans (OWASP ZAP).
- **Existing test files:**

| File | Tests |
|------|-------|
| `__tests__/components/button.test.tsx` | Rendering, variants, click handlers |
| `__tests__/components/input.test.tsx` | Input states, error display |
| `__tests__/lib/validations.test.ts` | Zod schema validation |
| `e2e/app.spec.ts` | Full user flow E2E |
| `e2e/accessibility.spec.ts` | axe-core WCAG checks |
| `tests/performance/load-test.js` | k6 load testing |

- **Use when:** You need tests for new or existing features.
- **Example:** `/qa-testing e2e application submission flow`

---

### `security-hardening.md`
- **Teaches:** OWASP Top 10 audit checklist tailored to OBPS.
- **Covers:** bcrypt (12 rounds), 30-min JWT, CASL RBAC, 7 security headers (CSP, HSTS, X-Frame-Options), rate limiting, Prisma parameterization, XSS via `sanitize.ts`, account lockout.
- **Key files audited:** `src/middleware.ts`, `src/lib/auth.ts`, `src/lib/rate-limit.ts`, `src/lib/sanitize.ts`, `next.config.js`.
- **Use when:** Security audit or hardening is needed.
- **Example:** `/security-hardening headers`

---

### `payment-integration.md`
- **Teaches:** Full PayMongo integration: GCash, Maya, bank transfer, and OTC cash recording.
- **Key flow:** Pay Now → `POST /api/payments` → PayMongo checkout → redirect → webhook → verify signature → update DB → notify via SSE + email.
- **Important:** PayMongo amounts are in **centavos** (multiply PHP by 100).
- **Use when:** Debugging or extending payment flows.
- **Example:** `/payment-integration webhook handling`

---

### `implementation-plan.md`
- **Teaches:** How to break down a new feature into 5 phases: Schema → Backend → Frontend → Integration → Testing.
- **Module status reference:**

| Module | Status |
|--------|--------|
| Auth, Application CRUD, Documents, Review, SSE | ✅ Complete |
| Scheduling, Permit Issuance, Payments, Notifications | 🔄 In Progress |
| Admin Panel, Analytics | ⚠️ Partial |

- **Use when:** Starting a new feature from scratch.
- **Example:** `/implementation-plan add bulk document download feature`

---

### `performance-profiler.md`
- **Teaches:** How to find bottlenecks in Prisma (N+1 queries, missing indexes), React rendering (unnecessary re-renders, missing `memo`), bundle size (code splitting, lazy imports for admin pages), and SSE (connection management, payload size).
- **Use when:** The app is slow or you want to optimize before deployment.
- **Example:** `/performance-profiler prisma`

---

### `accessibility-auditor.md`
- **Teaches:** WCAG 2.1 AA compliance: color contrast ≥ 4.5:1, all elements keyboard-focusable, ARIA labels on icons, error messages linked to inputs, focus trapped in modals.
- **Use when:** Auditing pages for government accessibility compliance.
- **Example:** `/accessibility-auditor keyboard-nav`

---

### `codebase-assessment.md`
- **Teaches:** How to grade the codebase across 6 categories: Security, API & Data Integrity, TypeScript Quality, Frontend Quality, Testing, and Architecture.
- **Use when:** You want an overall health report before a release.
- **Example:** `/codebase-assessment full`

---

### `workflow-verificator.md`
- **Teaches:** How to verify a feature is fully wired — API exists and is called, auth guard is in place, SSE fires on state change, DB models are complete, Zod schemas cover all inputs.
- **Use when:** Checking if a recently built feature is complete end-to-end.
- **Example:** `/workflow-verificator check payment flow`

---

### `cleanup-codebase.md` & `code-cleanup.md`
- **Teaches:** How to scan for and safely remove `console.log` statements, TODO comments, unused imports, dead code, and `any` TypeScript types.
- **Use when:** Before a release or after heavy development work.
- **Example:** `/cleanup-codebase scan all`

---

### `pwa-offline.md`
- **Teaches:** How to audit and improve the Progressive Web App setup — `public/sw.js` (service worker), `public/manifest.json`, `public/offline.html` fallback, and the install prompt component.
- **Use when:** Testing offline behavior or improving PWA installability score.
- **Example:** `/pwa-offline audit`

---

### `full-system-validation.md`
- **Teaches:** A 6-phase cross-cutting validation: route registration → page↔API wiring → component↔data wiring → type consistency → SSE wiring → auth flow completeness.
- **Use when:** Final check before deploying to production.
- **Example:** `/full-system-validation`

---

### `test-gap-filler.md`
- **Teaches:** How to find untested critical paths (API routes with no tests, auth flows, payment webhooks) and generate targeted test suites to fill those gaps.
- **Use when:** Improving test coverage without guessing what's missing.
- **Example:** `/test-gap-filler critical paths`

---

### `god-class-decomposer.md`
- **Teaches:** How to split files over 500 lines into focused, single-responsibility modules following the project's coding standards.
- **Use when:** A file has grown too large and is hard to maintain.
- **Example:** `/god-class-decomposer analyze src/lib/payments.ts`

---

### `memory-leak-detector.md`
- **Teaches:** How to detect leaks from SSE connections not cleaned up in `useEffect`, uncleaned `setInterval`/`setTimeout`, Zustand store subscriptions, and DOM event listeners.
- **Key files it checks:** `src/hooks/use-sse.ts`, `src/lib/stores.ts`, `src/lib/sse.ts`.
- **Use when:** The app becomes slow over time or browser memory grows unbounded.
- **Example:** `/memory-leak-detector sse-connections`

---

### `code-behind-extractor.md`
- **Teaches:** How to move inline business logic out of page components and into custom hooks or lib modules to keep pages clean and testable.
- **Use when:** A page component has grown complex with too much inline logic.
- **Example:** `/code-behind-extractor analyze dashboard/applications/page.tsx`

---

### `city-restriction.md` & `fee-structure.md`
- **Teaches:** Domain-specific rules for LGU (Local Government Unit) city-level restrictions and permit fee calculation structures specific to Philippine business permit regulations.
- **Use when:** Implementing or debugging city-specific business rules or fee calculations.

---

## 🧭 Decision Guide: Which Command to Use?

| Situation                                | Command to Use                    |
|------------------------------------------|-----------------------------------|
| Build a new API endpoint                 | `/backend-service`                |
| Write a Prisma query or migration        | `/database-query`                 |
| Fix a bug or error                       | `/debug-issue`                    |
| Build a new page or component            | `/frontend-design`                |
| Write tests                              | `/qa-testing`                     |
| Find what tests are missing              | `/test-gap-filler`                |
| Check security vulnerabilities           | `/security-hardening`             |
| Check performance bottlenecks            | `/performance-profiler`           |
| Check WCAG accessibility                 | `/accessibility-auditor`          |
| Plan a new feature from scratch          | `/implementation-plan`            |
| Debug payments or PayMongo               | `/payment-integration`            |
| Verify a feature is fully wired          | `/workflow-verificator`           |
| Understand a workflow or data flow       | `/workflow-definitions`           |
| Clean up the code before a release       | `/cleanup-codebase` or `/code-cleanup` |
| Grade overall code quality               | `/codebase-assessment`            |
| Final pre-deployment validation          | `/full-system-validation`         |
| Run full multi-agent system validation   | `/cowork` (CLAUDE-COWORK.md)      |

---

## 🔑 Test Accounts (from `seed.js`)

| Role          | Email               | Password  |
|---------------|---------------------|-----------|
| APPLICANT     | applicant@test.com  | Test1234! |
| STAFF         | staff@test.com      | Test1234! |
| REVIEWER      | reviewer@test.com   | Test1234! |
| ADMINISTRATOR | admin@test.com      | Test1234! |

---

## 🛠 Quick Start Commands

```bash
# Start all services (DB, Redis, MinIO)
docker-compose up -d

# Seed the database with test accounts and sample data
cd web && npx prisma db seed

# Run all unit tests
npm test -- --run

# Run E2E tests (requires running app)
npx playwright test

# Run full multi-agent COWORK validation
# (paste into Claude Code chat)
/cowork Validate the OBPS using the scenario definitions in CLAUDE-COWORK.md.
Assign teams as defined. Each team validates their scenarios and reports back.
Produce the satisfaction scorecard.
```

---

*Last Updated: March 9, 2026 · Tech Stack: Next.js 16 · React 19 · TypeScript 5.9 · Prisma 7 · PostgreSQL 16 · Tailwind CSS v4*
