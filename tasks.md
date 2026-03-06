# 📋 TASKS.md — Online Business Permit System

> **Comprehensive Audit & Task Tracker**
> Last updated: 2026-03-06
> Status Legend: ✅ Done | 🔴 Critical | 🟡 Important | 🟢 Nice-to-Have | 🔵 Recommendation

---

## Table of Contents

1. [Infrastructure & Database Setup](#1-infrastructure--database-setup)
2. [Module 1: User & Access Management](#2-module-1-user--access-management)
3. [Module 2: Permit Application Management](#3-module-2-permit-application-management)
4. [Module 3: Digital Document Management](#4-module-3-digital-document-management)
5. [Module 4: Application & Renewal Tracking](#5-module-4-application--renewal-tracking)
6. [Module 5: Claim Scheduling Management](#6-module-5-claim-scheduling-management)
7. [Module 6: Claim Reference & Reporting](#7-module-6-claim-reference--reporting)
8. [Module 7: Permit Issuance & Certification](#8-module-7-permit-issuance--certification)
9. [Email, SMS & Notification System](#9-email-sms--notification-system)
10. [Real-Time Events (SSE)](#10-real-time-events-sse)
11. [Payment System](#11-payment-system)
12. [Library Modules Not Wired](#12-library-modules-not-wired)
13. [UI/UX & Frontend Issues](#13-uiux--frontend-issues)
14. [PWA & Offline Support](#14-pwa--offline-support)
15. [Internationalization (i18n)](#15-internationalization-i18n)
16. [Security Hardening](#16-security-hardening)
17. [Testing Gaps](#17-testing-gaps)
18. [DevOps, CI/CD & Deployment](#18-devops-cicd--deployment)
19. [SEO & Performance](#19-seo--performance)
20. [Code Quality & Housekeeping](#20-code-quality--housekeeping)
21. [Documentation](#21-documentation)
22. [Priority Roadmap](#22-priority-roadmap)

---

## 1. Infrastructure & Database Setup

### 🔴 1.1 — PostgreSQL Database Initialization
**Status:** NOT DONE
**What's missing:** PostgreSQL is installed but the database has not been created, schema not pushed, and seed not run.
**Files involved:** `.env`, `prisma/schema.prisma`, `prisma/seed.js`
**Steps required:**
1. Update `DATABASE_URL` in `web/.env` with the correct PostgreSQL password
2. Create the database: `CREATE DATABASE business_permit;`
3. Run `npx prisma db push` from `web/` to create all tables
4. Run `npm run db:seed` to populate test data (6 users, 5 applications, documents, permits, schedules, settings)
5. Verify with `npx prisma studio`

### 🔴 1.2 — No Database Migration Files
**Status:** NOT DONE
**What's missing:** Only `prisma db push` is used (fine for dev), but production requires versioned migrations.
**Files involved:** `prisma/migrations/` (does not exist)
**Action:** Run `npx prisma migrate dev --name init` after DB is running to generate the initial migration. All future schema changes must use `prisma migrate dev`.

### ✅ 1.3 — No Root `package.json`
**Status:** DONE — Root `package.json` exists with proxy scripts for dev, build, test, db:push, db:seed, db:migrate, etc.

### 🟡 1.4 — Docker Compose Services Not Tested
**Status:** NOT VERIFIED
**What's missing:** `docker-compose.yml` defines PostgreSQL 16, Redis 7, MinIO, and the App service, but they have not been started together to verify they all connect.
**Files involved:** `docker-compose.yml`, `web/Dockerfile`, `web/.env`
**Action:** Run `docker-compose up -d` and verify:
- PostgreSQL is accessible on port 5432
- Redis is accessible on port 6379
- MinIO console is accessible on port 9001
- App container builds and starts correctly
- Environment variables in `.env` match docker-compose service names

### 🟡 1.5 — Redis Not Required for Dev
**Status:** OK (graceful fallback exists)
**Note:** `cache.ts` falls back to in-memory cache when Redis is unavailable. `rate-limit.ts` uses in-memory tracking. Both work without Redis. However, `queue.ts` (BullMQ) will fail without Redis — this is acceptable since background job processing is not yet wired.

---

## 2. Module 1: User & Access Management

### ✅ 2.1 — Auth System (NextAuth v5)
- Credentials provider with bcryptjs password hashing ✅
- JWT + session callbacks ✅
- Edge-compatible split (`auth.config.ts` + `auth.ts`) ✅
- Login / Register / Forgot Password / Verify OTP pages ✅
- 2FA setup + verify API routes ✅
- TOTP via otplib ✅

### 🔴 2.2 — Email/SMS OTP Delivery NOT Wired
**Status:** NOT DONE — 3 `TODO` comments in API routes
**What's missing:** OTP tokens are generated and saved to DB, but never actually sent. The `email.ts` and `sms.ts` libraries are fully written but NEVER imported by any API route.
**Files with TODOs:**
- `src/app/api/auth/register/route.ts` line 74: `// TODO: Send OTP via email/SMS`
- `src/app/api/auth/login/route.ts` line 79: `// TODO: Send OTP via SMS/email`
- `src/app/api/auth/forgot-password/route.ts` line 48: `// TODO: Send OTP via email`
**Action:** Import `sendOTPEmail` from `@/lib/email` and `sendOTP` from `@/lib/sms` in each route, and call them after OTP creation. In dev mode, OTP is logged to console (already done).

### ✅ 2.3 — Admin User Management is Read-Only
**Status:** DONE — Full CRUD implemented: create user modal, change role, suspend/activate, reset password. Server-side pagination (15/page), search by name/email, filter by role and status.

### 🟡 2.4 — CASL Permissions Not Enforced
**Status:** NOT WIRED
**What's missing:** `permissions.ts` defines a complete RBAC system using `@casl/ability` with 4 roles (APPLICANT, STAFF, REVIEWER, ADMINISTRATOR) and 10 actions × 10 subjects. However, `permissions.ts` is **never imported** by any page or API route. Authorization is done via simple `session.user.role` checks instead.
**Files involved:** `src/lib/permissions.ts` (165 lines, unused)
**Action:**
1. Create a helper `checkPermission(session, action, subject)` wrapper
2. Replace all manual `role !== "ADMINISTRATOR"` checks in API routes with CASL ability checks
3. Use CASL in middleware or layout guards for page-level access control
4. This provides fine-grained permissions (e.g., REVIEWER can `review` but not `delete` applications)

### ✅ 2.5 — Session/Token Management Incomplete
**Status:** DONE — `lastLoginAt` is updated on successful login in `api/auth/login/route.ts`. Account lockout (5 failures → 15 min) also implemented.

### 🟢 2.6 — Password Change on Profile Page
**Status:** PARTIAL
**What's missing:** The profile page (`profile/page.tsx`) has a "Change Password" section in the UI but the `PUT /api/profile` route needs verification that it properly handles password changes (old password verification, hashing new password).
**Action:** Verify and test the password change flow end-to-end.

### 🟢 2.7 — Account Lockout After Failed Attempts
**Status:** NOT IMPLEMENTED
**What's missing:** No brute-force protection beyond rate limiting. After N failed login attempts, the account should be temporarily locked.
**Action:** Add `failedLoginAttempts` and `lockedUntil` fields to User model. Increment on failed login, lock after 5 failures for 15 minutes.

---

## 3. Module 2: Permit Application Management

### ✅ 3.1 — Application CRUD
- New application form (multi-step, 4 steps) ✅
- Application list page ✅
- Application detail page (`[id]/page.tsx`) ✅
- Application API routes (create, list, get by ID) ✅
- Application types (NEW / RENEWAL) ✅
- Status lifecycle (DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED) ✅

### ✅ 3.2 — Review Workflow
- Review page for REVIEWER/STAFF/ADMIN ✅
- Review API route (`[id]/review`) with APPROVE/REJECT/REQUEST_REVISION actions ✅
- Review history tracked via `ReviewAction` model ✅

### ✅ 3.3 — Dashboard Stats Are Hardcoded Zeros
**Status:** DONE — `dashboard/page.tsx` queries real counts from Prisma with role-based filtering (APPLICANT sees own, staff/admin see all). Stats are cached with `cacheOrCompute` (2 min TTL).

### 🟡 3.4 — Application Status History Not Shown on Detail Page
**Status:** PARTIAL
**What's missing:** The `ApplicationHistory` model stores every status transition, but the application detail page may not render the full timeline.
**Action:** Verify `[id]/page.tsx` includes the status history timeline. If not, add a visual timeline component showing each status change with timestamp and user.

### 🟡 3.5 — Renewal Flow Not Fully Tested
**Status:** SCAFFOLDED
**What's missing:** The application form supports `type: "RENEWAL"` and the schema has `previousPermitId`, but:
- No UI to select/link the previous permit being renewed
- No validation that the previous permit is ACTIVE or EXPIRED
- No automatic carry-over of business details from previous application
**Action:** Add a "Renew" button on the applicant's permit list that pre-fills the form with previous data and links `previousPermitId`.

### 🟢 3.6 — Draft Auto-Save
**Status:** NOT IMPLEMENTED
**What's missing:** Multi-step form does not auto-save. If user navigates away, all data is lost.
**Action:** Use `zustand` persist middleware or `localStorage` to auto-save draft state every 30 seconds. Load draft on page mount.

### ✅ 3.7 — Application Search & Filters
**Status:** DONE — `applications/page.tsx` has search (by business name), status filter, and pagination (10/page). STAFF/REVIEWER/ADMIN see all applications; APPLICANT sees only their own.

---

## 4. Module 3: Digital Document Management

### ✅ 4.1 — Document Upload
- File upload API route with S3/MinIO integration ✅
- Magic bytes validation for file type spoofing prevention ✅
- File size limits (5MB default) ✅
- Allowed file types (PDF, JPEG, PNG, WebP) ✅
- File upload UI component (`file-upload.tsx`) ✅

### ✅ 4.2 — Document Verification
- Verify/reject documents API route (`documents/[id]/verify`) ✅
- Verify document actions component ✅
- Document status tracking (UPLOADED → PENDING_VERIFICATION → VERIFIED/REJECTED) ✅

### ✅ 4.3 — No Document Download/View Endpoint
**Status:** DONE — `GET /api/documents/[id]/download` generates a presigned URL from MinIO/S3, enforces ownership check for APPLICANT role, and logs the download activity.

### 🟡 4.4 — Document Versioning Not Implemented
**Status:** SCHEMA ONLY
**What's missing:** The `Document` model has a `version` field (defaults to 1), but there's no logic to:
- Upload a new version of an existing document
- View version history
- Compare or rollback versions
**Action:** Add `PUT /api/documents/[id]/upload` for version updates. Increment `version`, keep previous versions as separate records or with a `parentDocumentId` reference.

### 🟡 4.5 — Virus Scanning is a Stub
**Status:** STUB ONLY
**What's missing:** `storage.ts` exports `scanForVirus()` which is called in the upload route, but the implementation just logs `[Virus Scan]` and returns `{ clean: true }` always.
**Action:** Integrate ClamAV (via `clamscan` npm package or ClamAV Docker container) for actual file scanning. Add ClamAV to `docker-compose.yml`.

### 🟢 4.6 — Document Checklist Per Application Type
**Status:** NOT IMPLEMENTED
**What's missing:** Different application types (NEW vs RENEWAL) and business types require different documents. There's no dynamic checklist that shows which documents are required vs uploaded vs missing.
**Action:** Create a `REQUIRED_DOCUMENTS` config per application/business type. Display a checklist on the application detail page showing completion status.

---

## 5. Module 4: Application & Renewal Tracking

### ✅ 5.1 — Tracking Page
- Tracking page shows all user applications with status ✅
- Application history (last 3 entries) displayed ✅

### 🟡 5.2 — Real-Time Tracking Not Connected
**Status:** NOT WIRED
**What's missing:** The SSE infrastructure exists (`sse.ts`, `/api/events`) but the tracking page does not subscribe to SSE events. Status updates require manual page refresh.
**Action:**
1. Add an `EventSource` connection on the tracking page that listens for `application_status_changed` events
2. Auto-update the application status in the UI when an event is received
3. Show a toast notification when status changes

### 🟡 5.3 — Tracking for Staff/Reviewer/Admin
**Status:** PARTIAL
**What's missing:** The tracking page filters by `applicantId: session.user.id`, so STAFF/REVIEWER/ADMIN users see nothing (they have no applications of their own). They should see all applications or those assigned to them.
**Action:** Remove the `applicantId` filter for non-APPLICANT roles, or route them to the `review` page instead.

### ✅ 5.4 — Public Tracking by Application Number
**Status:** DONE — `/(public)/track` page with application number search field. `GET /api/public/track?number=APP-xxx` returns status, history (last 5), approval/rejection dates.

---

## 6. Module 5: Claim Scheduling Management

### ✅ 6.1 — Schedule Browsing & Reservation
- Schedule page with date/time slot selection ✅
- Reserve API route (`/api/schedules/reserve`) ✅
- Slot capacity tracking ✅

### ✅ 6.2 — Admin Schedule Management
- Admin schedules page exists ✅
- Schedule creation API ✅

### 🟡 6.3 — Temporary Hold Expiry Not Enforced
**Status:** NOT IMPLEMENTED
**What's missing:** `SlotReservation` has `temporaryHoldExpiry` and status `TEMPORARY`, but there's no background job or cron that expires stale temporary holds. Uncompleted reservations will hold slots indefinitely.
**Action:** Create a scheduled job (BullMQ repeatable job or Next.js cron via `vercel.json` / node-cron) that runs every 5 minutes and:
1. Finds all `TEMPORARY` reservations past `temporaryHoldExpiry`
2. Sets them to `CANCELLED`
3. Decrements `currentCount` on the associated `TimeSlot`

### 🟡 6.4 — Rescheduling Not Implemented
**Status:** NOT IMPLEMENTED
**What's missing:** The `ReservationStatus` enum includes `RESCHEDULED` but there's no UI or API to reschedule an existing reservation.
**Action:** Add `PUT /api/schedules/reschedule` that cancels the old reservation and creates a new one. Add a "Reschedule" button on the applicant's schedule confirmation.

### 🟢 6.5 — Calendar UI
**Status:** BASIC
**What's missing:** The schedule page lists dates/times as cards. A proper calendar widget would improve UX.
**Action:** Integrate a calendar component (e.g., `react-day-picker` or custom) to visually browse available dates.

---

## 7. Module 6: Claim Reference & Reporting

### ✅ 7.1 — Claim Reference Display
- Claim reference page shows reference numbers, schedule dates, status ✅

### ✅ 7.2 — Claim Reference Page Scoping Bug
**Status:** DONE — `claim-reference/page.tsx` correctly scopes by `{ generatedBy: session.user.id }` for APPLICANT; `{}` (all) for STAFF/REVIEWER/ADMIN.

### ✅ 7.3 — Report Export (CSV/PDF) Not Implemented
**Status:** DONE — `GET /api/admin/reports/export?type=applications|users|permits|payments` exports CSV. Payments export added (transaction ID, receipt #, amounts, method, status). Export buttons on `admin/reports/page.tsx`.

### 🟡 7.4 — No Audit Trail Report
**Status:** NOT IMPLEMENTED
**What's missing:** `ActivityLog` model captures all actions, but there's no admin page to browse, search, or export audit logs.
**Action:** Create `admin/audit-logs/page.tsx` with:
- Searchable/filterable table of activity logs
- Filter by user, action type, date range
- Export to CSV

### 🟡 7.5 — Claim Verification Flow
**Status:** PARTIAL
**What's missing:** `/api/claims/verify` exists but the full claim verification workflow (staff scans/enters reference → verifies identity → releases permit) needs end-to-end testing.
**Action:** Verify the `claims/page.tsx` → `/api/claims/today` → `/api/claims/[id]/release` flow works correctly.

---

## 8. Module 7: Permit Issuance & Certification

### ✅ 8.1 — Permit Issuance Pages
- Issuance list page (pending + issued permits) ✅
- Issuance detail page (`issuance/[id]/page.tsx`) ✅
- Issuance API route (`/api/issuance/[id]`) ✅

### ✅ 8.2 — Permit PDF Generation
- HTML-based permit template in `pdf.ts` ✅
- QR code generation ✅
- PDF API route (`/api/permits/[id]/pdf`) ✅

### 🟡 8.3 — PDF Generation Requires Puppeteer
**Status:** NOT TESTED
**What's missing:** `pdf.ts` generates HTML but actual PDF conversion requires Puppeteer (listed in `serverExternalPackages`). Puppeteer is NOT in `package.json` dependencies.
**Action:**
1. Install Puppeteer: `npm install puppeteer` (or `puppeteer-core` + chromium for Docker)
2. Add Chromium to Docker image or use a headless Chrome service
3. Test PDF generation end-to-end
4. Alternative: Use `@react-pdf/renderer` or `jspdf` for serverless-compatible PDF generation

### ✅ 8.4 — Permit Status Lifecycle
**Status:** DONE — Renewal flow now calls `prisma.permit.update({ status: "RENEWED" })` on the previous permit when approving a RENEWAL application. Auto-expire cron job still pending (§6.3).

### ✅ 8.5 — Digital Signature / Verification
**Status:** DONE — `/(public)/verify-permit` page with permit number search, `GET /api/public/verify-permit` returns permit validity, status (ACTIVE/EXPIRED/REVOKED/RENEWED), owner, dates. QR codes on PDFs link here.

---

## 9. Email, SMS & Notification System

### 🔴 9.1 — Email Library Written But Never Called
**Status:** NOT WIRED
**What's missing:** `email.ts` (336 lines) is a complete email module with:
- Nodemailer transport (SMTP, Resend, SES)
- Templated HTML emails (OTP, welcome, status update, claim confirmation, permit expiry)
- `sendOTPEmail()`, `sendWelcomeEmail()`, `sendStatusUpdateEmail()`, `sendClaimConfirmationEmail()`
But **no file imports from `@/lib/email`** — it is completely dead code.
**Action:** Wire email sending into:
- `register/route.ts` → `sendOTPEmail()`
- `login/route.ts` → `sendOTPEmail()` (for 2FA)
- `forgot-password/route.ts` → `sendOTPEmail()` (type: PASSWORD_RESET)
- Application review route → `sendStatusUpdateEmail()` (on approve/reject)
- Schedule reservation → `sendClaimConfirmationEmail()`
- Permit issuance → custom email notification

### 🔴 9.2 — SMS Library Written But Never Called
**Status:** NOT WIRED
**What's missing:** `sms.ts` (233 lines) supports Semaphore and Globe Labs APIs for Philippine SMS delivery. Includes `sendOTP()`, `sendNotification()`, `sendClaimReminder()`. But **no file imports from `@/lib/sms`** — completely dead code.
**Action:** Wire SMS sending alongside email for OTP delivery. SMS is critical for Philippine users who may not check email promptly.

### 🟡 9.3 — In-App Notification System
**Status:** NOT IMPLEMENTED
**What's missing:** `stores.ts` defines a `Notification` type and `useUIStore` with `addNotification()`, `markNotificationRead()`, etc., but:
- No component renders notifications in the UI
- No API fetches notifications from the server
- No notification bell/dropdown in the dashboard header
- `stores.ts` is never imported by any page or component
**Action:**
1. Add a `Notification` model to Prisma (or use `ActivityLog` as the source)
2. Add a notification bell icon in the dashboard header with unread count
3. Create a notification dropdown/panel
4. Wire SSE events to trigger in-app notifications

---

## 10. Real-Time Events (SSE)

### ✅ 10.1 — SSE Infrastructure
- `sse.ts` broadcaster with subscribe/unsubscribe ✅
- `/api/events` SSE endpoint with heartbeat ✅

### ✅ 10.2 — No API Route Broadcasts Events
**Status:** DONE — `broadcastApplicationStatusChange` and `broadcastNotification` called in `review/route.ts`; `broadcastDocumentUpdate` in `documents/[id]/verify/route.ts`; `broadcastNotification` in `claims/[id]/release/route.ts` and `issuance/[id]/route.ts`.

### ✅ 10.3 — No Client-Side SSE Consumer
**Status:** DONE — `useSSE()` hook in `src/hooks/use-sse.ts`; `TrackingClient` subscribes to `application_status_changed` events with live status updates + toasts; `NotificationBell` subscribes to `notification`, `application_status_changed`, `permit_issued`.

---

## 11. Payment System

### ✅ 11.1 — Payment API Exists But No UI
**Status:** DONE (partial) — Payment history card added to application detail page. `prisma.payment.create()` persists payments after processing. Receipt number, method, status, paidAt all stored. Full payment gateway (PayMongo) integration still pending.

### ✅ 11.2 — No Payment Model in Schema
**Status:** DONE — `Payment` model exists in Prisma schema. `POST /api/payments` now calls `prisma.payment.create()` after processing, persisting transactionId, receiptNumber, method, status, paidAt, notes. Payments CSV export added to reports.

---

## 12. Library Modules Not Wired

### Summary of Library Utilization

| Library File | Lines | Imported By | Status |
|---|---|---|---|
| `auth.ts` | ~80 | Many pages/routes | ✅ Fully used |
| `auth.config.ts` | ~80 | middleware.ts, auth.ts | ✅ Fully used |
| `prisma.ts` | ~30 | Many pages/routes | ✅ Fully used |
| `utils.ts` | ~100 | Many components | ✅ Fully used |
| `validations.ts` | ~120 | Register/login routes | ✅ Fully used |
| `rate-limit.ts` | ~100 | middleware.ts | ✅ Fully used |
| `storage.ts` | ~240 | documents/upload route | ✅ Partially used |
| `two-factor.ts` | ~100 | 2fa/setup, 2fa/verify | ✅ Used |
| `government-api.ts` | ~120 | verify-registration route | ✅ Used |
| `pdf.ts` | ~340 | permits/[id]/pdf route | ✅ Used |
| `sse.ts` | ~160 | /api/events route | ⚠️ Broadcaster never triggered |
| `monitoring.ts` | ~280 | /api/metrics route | ⚠️ Only metrics export used |
| `i18n.ts` | ~42 | language-switcher component | ⚠️ Minimal use |
| `email.ts` | ~336 | **NOTHING** | 🔴 Dead code |
| `sms.ts` | ~233 | **NOTHING** | 🔴 Dead code |
| `cache.ts` | ~287 | **NOTHING** | 🔴 Dead code |
| `queue.ts` | ~240 | **NOTHING** | 🔴 Dead code |
| `permissions.ts` | ~165 | **NOTHING** | 🔴 Dead code |
| `stores.ts` | ~182 | **NOTHING** | 🔴 Dead code |
| `payments.ts` | ~200 | /api/payments route | ✅ Used |

### 🔴 12.1 — Wire `email.ts` (see §9.1)
### 🔴 12.2 — Wire `sms.ts` (see §9.2)
### 🔴 12.3 — Wire `permissions.ts` (see §2.4)

### 🟡 12.4 — Wire `cache.ts`
**What's missing:** Redis caching layer with TTL, invalidation, and in-memory fallback is written but never used. Would improve performance for:
- Dashboard stats (cache for 60 seconds)
- Schedule availability (cache for 30 seconds)
- User profile data
- System settings
**Action:** Add `cacheGet()`/`cacheSet()` calls in high-traffic API routes (analytics, schedules, dashboard data).

### 🟡 12.5 — Wire `queue.ts`
**What's missing:** BullMQ job queue with typed workers for `email`, `sms`, `pdf`, `report` jobs is written but never used. Would enable:
- Async email/SMS sending (non-blocking API responses)
- Background PDF generation
- Scheduled report generation
**Action:** Replace direct email/SMS calls with queue jobs. Add worker startup in a separate process or Next.js instrumentation hook.

### ✅ 12.6 — Wire `stores.ts`
**Status:** DONE — `useUIStore` wired in `shell.tsx` (sidebar collapse/open). `useDraftStore` wired in `applications/new/page.tsx` (auto-save draft with persist middleware). `usePreferencesStore` available for settings page.

### ✅ 12.7 — Wire `monitoring.ts` Fully
**Status:** DONE — `captureException()` imported and called in all key API routes: `payments`, `review`, `auth/login`, `auth/register`, `auth/forgot-password`, `applications`, `documents/[id]/verify`, `schedules/reserve`, `issuance/[id]`, `claims/[id]/release`, `admin/users`.

---

## 13. UI/UX & Frontend Issues

### ✅ 13.1 — Admin Settings Page is Static Display Only
**Status:** DONE — `AdminSettingsClient` fully reads from and writes to `SystemSetting` model. `PUT /api/admin/settings` upserts all keys with cache invalidation. Inline editing with save button.

### 🟡 13.2 — No Pagination Anywhere
**Status:** NOT IMPLEMENTED
**What's missing:** All list pages (applications, users, documents, claims, reports) fetch ALL records without pagination. This will cause performance issues at scale.
**Files affected:** All pages with `prisma.*.findMany()` without `take`/`skip`
**Action:** Add cursor-based or offset pagination to:
- Application list pages
- Admin users page
- Document list
- Activity logs
- Claim references

### 🟡 13.3 — No Loading States on Server Components
**Status:** PARTIAL
**What's missing:** Server-rendered pages (applications list, issuance, users, reports) have no `loading.tsx` files for Suspense boundaries. Users see a blank page while data loads.
**Action:** Add `loading.tsx` files in each dashboard route directory with skeleton loaders.

### ✅ 13.4 — No Error Boundaries
**Status:** DONE — `error.tsx` files created for all dashboard routes: `applications/`, `claims/`, `issuance/`, `documents/`, `review/`, `schedule/`, `claim-reference/`, `tracking/`, `profile/`. Shared `DashboardError` component with retry button.

### ✅ 13.5 — No `not-found.tsx` Pages
**Status:** DONE — `not-found.tsx` at app root and inside `(dashboard)/dashboard/` layout (renders within dashboard chrome).

### 🟡 13.6 — Mobile Responsiveness Not Verified
**Status:** NOT TESTED
**What's missing:** Components use Tailwind responsive classes, but the dashboard sidebar behavior on mobile (collapse, overlay, hamburger menu) has not been tested.
**Action:** Test on mobile viewports. Ensure sidebar collapses to a hamburger menu. Verify all tables are horizontally scrollable.

### 🟢 13.7 — Dark Mode Support
**Status:** SCAFFOLDED BUT NOT IMPLEMENTED
**What's missing:** `next-themes` is installed and in `package.json`, but no theme toggle exists in the UI and components don't use dark mode classes.
**Action:** Add a theme toggle in the dashboard header. Add `dark:` variants to component styles.

### 🟢 13.8 — Toast/Snackbar Notifications
**Status:** NOT IMPLEMENTED
**What's missing:** Success/error messages use the `<Alert>` component inline, but there's no toast/snackbar system for transient notifications.
**Action:** Add a toast component (e.g., `sonner` or `react-hot-toast`) for non-blocking feedback messages.

---

## 14. PWA & Offline Support

### ✅ 14.1 — PWA Manifest
- `manifest.json` with name, icons, theme color, display mode ✅
- Service worker registration component ✅
- `sw.js` with cache-first strategy ✅
- `offline.html` fallback page ✅

### 🔴 14.2 — Missing PWA Icon Files
**Status:** NOT DONE
**What's missing:** `manifest.json` references 7 icon sizes (`/icons/icon-72x72.png` through `/icons/icon-512x512.png`) but the `public/icons/` directory does NOT exist. PWA installation will fail.
**Action:** Create or generate icon files in all required sizes:
- `public/icons/icon-72x72.png`
- `public/icons/icon-96x96.png`
- `public/icons/icon-128x128.png`
- `public/icons/icon-144x144.png`
- `public/icons/icon-192x192.png`
- `public/icons/icon-384x384.png`
- `public/icons/icon-512x512.png`
Use a tool like `pwa-asset-generator` or create a base SVG logo and resize.

### 🟡 14.3 — Service Worker Cache Strategy
**Status:** BASIC
**What's missing:** `sw.js` implements a basic cache-first strategy but doesn't handle:
- API response caching for offline viewing of previously loaded data
- Background sync for form submissions while offline
- Cache versioning and cleanup
**Action:** Enhance `sw.js` with workbox patterns for runtime caching of API responses.

---

## 15. Internationalization (i18n)

### ✅ 15.1 — i18n Foundation
- English and Filipino message files (`en.json`, `fil.json`) ✅
- Language switcher component ✅
- `i18n.ts` locale utilities ✅

### 🟡 15.2 — i18n Not Integrated Into Pages
**Status:** NOT WIRED
**What's missing:** `next-intl` is installed but not configured. The i18n system uses a custom cookie-based approach via `i18n.ts`, but:
- No page uses translated strings — all text is hardcoded English
- The language switcher component exists but is not placed in any layout
- `next-intl` provider is not set up in layout.tsx
- `fil.json` translations may be incomplete
**Action:**
1. Add `NextIntlClientProvider` to `layout.tsx`
2. Replace hardcoded strings with `useTranslations()` hook calls
3. Add the language switcher to the dashboard header or footer
4. Audit `fil.json` for completeness

---

## 16. Security Hardening

### ✅ 16.1 — Security Headers
- HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy ✅
- CSP header configured ✅

### ✅ 16.2 — Rate Limiting
- Per-route rate limiting in middleware ✅
- Different limits for auth (10/min), API (100/min), OTP (5/15min), upload (20/min), payment (5/min) ✅

### ✅ 16.3 — Input Validation
- Zod schemas for registration, login ✅
- File type and size validation ✅

### 🟡 16.4 — CSRF Protection
**Status:** PARTIAL
**What's missing:** NextAuth handles CSRF for its own routes, but custom API routes (`/api/applications`, `/api/payments`, etc.) don't have explicit CSRF token validation.
**Action:** Add CSRF token middleware for state-changing API routes (POST, PUT, DELETE), or rely on SameSite cookies + origin header checking.

### ✅ 16.5 — API Route Input Validation Inconsistent
**Status:** DONE — All key API routes use Zod: register, login, applications, schedules/reserve, payments, review actions. `paymentSchema` and `reviewActionSchema` added to `validations.ts`.

### 🟡 16.6 — Sensitive Data Exposure
**Status:** NEEDS AUDIT
**What's missing:**
- API responses may include fields that should be hidden (e.g., `password` hash in user queries)
- Prisma `select` is used inconsistently — some queries use `select` (good), others return full records
**Action:** Audit all `prisma.user.findUnique()` / `findMany()` calls to ensure `password` is never included in responses. Add a `sanitizeUser()` helper.

### 🟡 16.7 — File Upload Security
**Status:** PARTIAL
**What's missing:**
- Magic bytes validation exists ✅
- File size limits exist ✅
- BUT: No Content-Disposition header enforcement on download
- No file name sanitization (path traversal risk)
- Virus scanning is a stub (see §4.5)
**Action:** Sanitize uploaded file names. Set `Content-Disposition: attachment` on downloads. Implement real virus scanning.

### 🟢 16.8 — Security Audit Logging
**Status:** PARTIAL
**What's missing:** `ActivityLog` captures some actions (REGISTER, LOGIN, etc.) but not all security-relevant events:
- Failed login attempts are not logged
- Permission denied events are not logged
- Settings changes are not logged
- Document access is not logged
**Action:** Add logging for all security events. Include IP address and user agent.

---

## 17. Testing Gaps

### ✅ 17.1 — Unit Tests (81 tests, all passing)
- Button, Card, Alert, Input component tests ✅
- Utils and validations lib tests ✅
- Vitest + Testing Library + jsdom ✅

### ✅ 17.2 — E2E Test Structure
- Playwright config ✅
- App E2E tests (`app.spec.ts`) ✅
- Accessibility tests with axe-core ✅
- Visual regression tests ✅

### 🟡 17.3 — No Integration Tests for API Routes
**Status:** NOT IMPLEMENTED
**What's missing:** No tests for any API route. The 13+ API route groups have zero test coverage.
**Action:** Create integration tests using `vitest` + `next/test-server` or supertest-equivalent for:
- `POST /api/auth/register` — success, duplicate email, validation errors
- `POST /api/auth/login` — success, wrong password, suspended account, 2FA flow
- `POST /api/applications` — create, validation, unauthorized
- `POST /api/documents/upload` — file validation, size limits, type checks
- `POST /api/schedules/reserve` — capacity limits, conflicts
- Full application lifecycle: register → apply → upload docs → review → approve → schedule → claim

### 🟡 17.4 — No Tests for Dashboard Pages
**Status:** NOT IMPLEMENTED
**What's missing:** No component tests for any dashboard page. Only 4 basic UI components are tested.
**Action:** Add tests for:
- Dashboard page (stats rendering)
- Application list (empty state, populated state)
- Application form (multi-step navigation, validation)
- Admin users page (table rendering)

### 🟡 17.5 — E2E Tests Not Verified
**Status:** NOT RUN
**What's missing:** E2E tests exist but have not been executed against a running app. They may have issues with selectors or flow assumptions.
**Action:** Start the app with seed data, run `npm run test:e2e`, fix any failures.

### 🟡 17.6 — Performance Tests Require k6
**Status:** NOT VERIFIED
**What's missing:** `tests/performance/load-test.js` exists but k6 must be installed separately. The test script has not been run.
**Action:** Install k6, run the load test against a running instance, establish baseline metrics.

### 🟢 17.7 — Test Coverage Target
**Status:** NO TARGET SET
**Action:** Set minimum coverage thresholds in `vitest.config.ts`:
- Statements: 70%
- Branches: 60%
- Functions: 70%
- Lines: 70%

---

## 18. DevOps, CI/CD & Deployment

### ✅ 18.1 — CI Pipeline
- GitHub Actions CI workflow (lint, type-check, test, build) ✅
- Security workflow (npm audit, secret scanning) ✅

### ✅ 18.2 — Docker
- Multi-stage Dockerfile ✅
- Docker Compose with all services ✅

### 🟡 18.3 — CI Pipeline Not Tested
**Status:** NOT VERIFIED
**What's missing:** CI workflows exist but have not been triggered (no GitHub repo created/pushed yet).
**Action:** Push to GitHub, verify CI passes. Fix any issues with dependency installation or test execution.

### 🟡 18.4 — No Staging/Production Environment Config
**Status:** NOT DONE
**What's missing:**
- No `docker-compose.prod.yml` with production settings
- No environment variable documentation for production
- No SSL/TLS configuration
- No reverse proxy config (Nginx/Traefik)
- No database backup strategy
**Action:**
1. Create `docker-compose.prod.yml` with production passwords, resource limits, logging
2. Add Nginx reverse proxy config with SSL
3. Document production deployment checklist
4. Add database backup cron job

### 🟡 18.5 — No Health Check Endpoint
**Status:** NOT IMPLEMENTED
**What's missing:** No `/api/health` endpoint for load balancer health checks.
**Action:** Create `GET /api/health` that checks database connectivity and returns status.

### 🟢 18.6 — No Monitoring Dashboard
**Status:** NOT IMPLEMENTED
**What's missing:** `/api/metrics` exposes Prometheus-compatible metrics but no Grafana dashboard config exists.
**Action:** Add `monitoring/grafana/dashboard.json` with pre-configured panels for request rate, error rate, response time, and business metrics.

---

## 19. SEO & Performance

### ✅ 19.1 — SEO Foundation
- Meta tags in layout.tsx ✅
- JSON-LD structured data (GovernmentService, Organization, WebApplication) ✅
- `robots.txt` ✅
- `next-sitemap` config ✅
- Open Graph tags ✅

### 🟡 19.2 — Sitemap Not Generated
**Status:** NOT DONE
**What's missing:** `next-sitemap.config.js` exists but `postbuild` script is not in `package.json`. The sitemap won't be generated on build.
**Action:** Add `"postbuild": "next-sitemap"` to `package.json` scripts.

### 🟡 19.3 — No Image Optimization
**Status:** NOT IMPLEMENTED
**What's missing:** No images/logos exist in the project. The system needs:
- LGU logo/seal for the homepage and permit PDFs
- Placeholder/default avatar for users
- Illustration assets for empty states
**Action:** Add placeholder assets. Use `next/image` for all images.

### 🟢 19.4 — Lighthouse Audit
**Status:** NOT DONE
**Action:** Run Lighthouse audit on key pages and optimize for:
- Performance score > 90
- Accessibility score > 95
- Best Practices score > 95
- SEO score > 95

---

## 20. Code Quality & Housekeeping

### 🔴 20.1 — Multiple ESLint Config Files
**Status:** BUG
**What's missing:** Three ESLint config files exist simultaneously:
- `eslint.config.mjs` (the one actually used by ESLint 9 flat config)
- `eslint.config.js` (duplicate/conflicting)
- `eslint.config.cjs` (duplicate/conflicting)
**Action:** Delete `eslint.config.js` and `eslint.config.cjs`. Keep only `eslint.config.mjs`.

### 🟡 20.2 — TypeScript Strict Mode
**Status:** NEEDS VERIFICATION
**What's missing:** Verify `tsconfig.json` has `strict: true` enabled. Some files use `@typescript-eslint/no-explicit-any` eslint-disable comments — audit if these are necessary.
**Action:** Enable `strict: true` if not already set. Minimize `any` usage.

### 🟡 20.3 — Console.log Statements in Production Code
**Status:** CLEANUP NEEDED
**What's missing:** Multiple `console.log()` and `console.error()` statements in API routes and lib files. These should use a proper logger in production.
**Action:**
1. Create a `logger.ts` utility with log levels (debug, info, warn, error)
2. Replace `console.log` with `logger.info` / `logger.debug`
3. In production, only log warn/error level

### 🟡 20.4 — Unused Dependencies
**Status:** NOT AUDITED
**What's missing:** Several installed packages may be unused or underused:
- `@casl/prisma` — never imported (only `@casl/ability` is used in `permissions.ts`, which itself is dead code)
- `next-intl` — installed but `next-intl` provider is not configured
- `bullmq` + `ioredis` — imported only in dead-code `queue.ts` and `cache.ts`
**Action:** Run `npx depcheck` to identify unused dependencies. Remove or wire them.

### 🟢 20.5 — Code Documentation
**Status:** PARTIAL
**What's missing:** Library files have good JSDoc comments, but page components and API routes have minimal documentation.
**Action:** Add JSDoc comments to all API route handlers and complex page components.

---

## 21. Documentation

### ✅ 21.1 — Existing Documentation
- `PROJECT-PLAN.md` (756 lines) — comprehensive project plan ✅
- `START_HERE.md` (500+ lines) — setup guide, API reference, troubleshooting ✅
- `tasks.md` — this file ✅

### 🟡 21.2 — API Documentation
**Status:** NOT DONE
**What's missing:** No interactive API documentation (Swagger/OpenAPI).
**Action:** Consider adding `next-swagger-doc` or a static API reference page. Alternatively, the API reference in `START_HERE.md` may suffice for this project scale.

### 🟡 21.3 — Database Schema Documentation
**Status:** NOT DONE
**What's missing:** No ER diagram or visual schema documentation.
**Action:** Generate an ER diagram using `prisma-erd-generator` or `dbdiagram.io`. Add to `docs/` folder.

### 🟢 21.4 — User Manual
**Status:** NOT DONE
**What's missing:** No end-user documentation for:
- Applicants (how to apply, track, claim)
- Staff (how to review, issue permits)
- Administrators (how to manage users, settings, schedules)
**Action:** Create a user manual or in-app help section. The `/(public)/how-to-apply` page is a start but covers only the applicant flow.

---

## 22. Priority Roadmap

### 🏁 Phase 1 — Critical (Must Do Before First Run)

| # | Task | Section | Effort |
|---|---|---|---|
| 1 | Initialize PostgreSQL database | §1.1 | 15 min |
| 2 | Wire email.ts into auth routes | §9.1 | 30 min |
| 3 | Wire sms.ts into auth routes | §9.2 | 20 min |
| 4 | Fix dashboard hardcoded stats | §3.3 | 30 min |
| 5 | Fix claim reference scoping bug | §7.2 | 10 min |
| 6 | Create document download endpoint | §4.3 | 30 min |
| 7 | Generate PWA icon files | §14.2 | 15 min |
| 8 | Delete duplicate ESLint configs | §20.1 | 2 min |
| 9 | Wire SSE broadcasts into API routes | §10.2 | 30 min |

**Estimated Total: ~3 hours**

### 🏗️ Phase 2 — Important (Before User Testing)

| # | Task | Section | Effort | Status |
|---|---|---|---|---|
| 10 | Admin user management (CRUD actions) | §2.3 | 2 hrs | ✅ Done |
| 11 | Wire CASL permissions | §2.4 | 2 hrs | 🔴 Pending |
| 12 | Admin settings page (read/write from DB) | §13.1 | 1.5 hrs | ✅ Done |
| 13 | Report export (CSV/PDF) | §7.3 | 2 hrs | ✅ Done |
| 14 | Add pagination to all list pages | §13.2 | 2 hrs | ✅ Done (applications + admin users) |
| 15 | Add loading.tsx skeletons | §13.3 | 1 hr | ✅ Done |
| 16 | Add error.tsx boundaries | §13.4 | 1 hr | ✅ Done |
| 17 | Update lastLoginAt on login | §2.5 | 10 min | ✅ Done |
| 18 | Add postbuild sitemap generation | §19.2 | 5 min | ✅ Done |
| 19 | Create root package.json | §1.3 | 10 min | ✅ Done |
| 20 | Generate Prisma migrations | §1.2 | 15 min | 🔴 Pending |
| 21 | Add client-side SSE consumer hook | §10.3 | 1.5 hrs | ✅ Done |
| 22 | In-app notification bell + dropdown | §9.3 | 2 hrs | ✅ Done |
| 23 | Payment UI page/modal | §11.1 | 2 hrs | ⚠️ Partial (history shown, no pay modal) |
| 24 | API input validation (Zod schemas) | §16.5 | 2 hrs | ✅ Done (paymentSchema + reviewActionSchema added; all key routes use Zod) |

**Estimated Total: ~20 hours**

### 🔧 Phase 3 — Pre-Production

| # | Task | Section | Effort | Status |
|---|---|---|---|---|
| 25 | Integration tests for API routes | §17.3 | 4 hrs | 🔴 Pending |
| 26 | Dashboard page component tests | §17.4 | 3 hrs | 🔴 Pending |
| 27 | Install Puppeteer for PDF generation | §8.3 | 1 hr | 🔴 Pending |
| 28 | Wire cache.ts into API routes | §12.4 | 1.5 hrs | 🔴 Pending |
| 29 | Wire queue.ts for async jobs | §12.5 | 2 hrs | 🔴 Pending |
| 30 | Wire monitoring.ts (Sentry) | §12.7 | 1 hr | ✅ Done (captureException in all key routes) |
| 31 | Wire stores.ts into components | §12.6 | 1 hr | 🔴 Pending |
| 32 | Audit trail admin page | §7.4 | 2 hrs | ✅ Done |
| 33 | Temporary hold expiry cron job | §6.3 | 1.5 hrs | 🔴 Pending |
| 34 | Permit expiry cron job | §8.4 | 1 hr | 🔴 Pending |
| 35 | Renewal flow (pre-fill, link permits) | §3.5 | 2 hrs | ⚠️ Partial (mark RENEWED done; UI pre-fill pending) |
| 36 | Document versioning | §4.4 | 1.5 hrs | 🔴 Pending |
| 37 | Public permit verification page | §8.5 | 1.5 hrs | 🔴 Pending |
| 38 | Health check endpoint | §18.5 | 15 min | ✅ Done |
| 39 | Sanitize user data in API responses | §16.6 | 1 hr | 🔴 Pending |
| 40 | Create logger.ts utility | §20.3 | 1 hr | 🔴 Pending |
| 41 | Run E2E tests and fix failures | §17.5 | 2 hrs | 🔴 Pending |
| 42 | Docker Compose integration test | §1.4 | 1 hr | 🔴 Pending |
| 43 | Account lockout after failed attempts | §2.7 | 1 hr | 🔴 Pending |
| 44 | Rescheduling flow | §6.4 | 1.5 hrs | 🔴 Pending |
| 45 | Payment model in Prisma | §11.2 | 1 hr | ✅ Done |

**Estimated Total: ~32 hours**

### ✨ Phase 4 — Nice-to-Have (Polish)

| # | Task | Section | Effort |
|---|---|---|---|
| 46 | Dark mode support | §13.7 | 2 hrs |
| 47 | Toast notification system | §13.8 | 1 hr |
| 48 | Draft auto-save | §3.6 | 1.5 hrs |
| 49 | Application search & filters | §3.7 | 2 hrs |
| 50 | Document checklist per type | §4.6 | 1.5 hrs |
| 51 | Public tracking page | §5.4 | 1.5 hrs |
| 52 | Calendar UI for scheduling | §6.5 | 2 hrs |
| 53 | Virus scanning (ClamAV) | §4.5 | 2 hrs |
| 54 | Lighthouse optimization | §19.4 | 2 hrs |
| 55 | i18n integration into pages | §15.2 | 4 hrs |
| 56 | Production Docker config | §18.4 | 3 hrs |
| 57 | Grafana dashboard | §18.6 | 2 hrs |
| 58 | ER diagram generation | §21.3 | 30 min |
| 59 | User manual / help docs | §21.4 | 4 hrs |
| 60 | Custom 404 page | §13.5 | 30 min |
| 61 | Mobile responsiveness audit | §13.6 | 2 hrs |
| 62 | Test coverage thresholds | §17.7 | 15 min |
| 63 | Remove unused npm dependencies | §20.4 | 30 min |
| 64 | Enhanced PWA offline caching | §14.3 | 2 hrs |
| 65 | CSRF protection for custom routes | §16.4 | 1.5 hrs |
| 66 | Security event logging | §16.8 | 1.5 hrs |
| 67 | API documentation (OpenAPI) | §21.2 | 2 hrs |

**Estimated Total: ~39 hours**

---

## Summary Statistics

| Category | Total Tasks | Critical 🔴 | Important 🟡 | Nice-to-Have 🟢 |
|---|---|---|---|---|
| Infrastructure | 5 | 2 | 3 | 0 |
| Module 1: Users & Auth | 6 | 2 | 2 | 2 |
| Module 2: Applications | 5 | 0 | 3 | 2 |
| Module 3: Documents | 4 | 1 | 2 | 1 |
| Module 4: Tracking | 3 | 0 | 2 | 1 |
| Module 5: Scheduling | 3 | 0 | 2 | 1 |
| Module 6: Claims & Reports | 4 | 2 | 2 | 0 |
| Module 7: Issuance | 3 | 0 | 3 | 0 |
| Email/SMS/Notifications | 3 | 2 | 1 | 0 |
| Real-Time (SSE) | 2 | 1 | 1 | 0 |
| Payments | 2 | 0 | 2 | 0 |
| Dead Code Libraries | 5 | 0 | 4 | 0 |
| UI/UX | 8 | 0 | 5 | 3 |
| PWA | 2 | 1 | 1 | 0 |
| i18n | 1 | 0 | 1 | 0 |
| Security | 5 | 0 | 4 | 1 |
| Testing | 5 | 0 | 4 | 1 |
| DevOps/CI/CD | 4 | 0 | 3 | 1 |
| SEO/Performance | 3 | 0 | 2 | 1 |
| Code Quality | 5 | 1 | 3 | 1 |
| Documentation | 3 | 0 | 2 | 1 |
| **TOTAL** | **81** | **12** | **51** | **17** |

> Some items are cross-referenced (e.g., email/sms wiring appears in both §9 and §12)

---

> **Overall Assessment:** The scaffolding is comprehensive and well-architected. The Prisma schema covers all 7 modules from the PDF spec. All pages and API routes exist. The primary gap is **wiring** — many powerful library modules (email, SMS, cache, queue, permissions, stores, monitoring) are fully written but never imported/used by the actual application code. Phase 1 tasks (~3 hours) will make the system functional. Phase 2 (~20 hours) will make it user-testable. Phase 3 (~32 hours) will make it production-ready. Phase 4 (~39 hours) adds polish and enterprise features.
