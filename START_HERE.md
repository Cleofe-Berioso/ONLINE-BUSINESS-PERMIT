# 🏛️ Online Business Permit System — START HERE

> **A comprehensive web-based Business Permit Application & Management System built for Philippine Local Government Units (LGUs)**

Welcome! This guide will walk you through everything you need to get the system up and running, from initial setup to exploring every feature.

---

## 📋 Table of Contents

1. [System Overview](#-system-overview)
2. [Prerequisites](#-prerequisites)
3. [Quick Start (5 minutes)](#-quick-start-5-minutes)
4. [Detailed Setup Options](#-detailed-setup-options)
   - [Option A: Docker (Recommended)](#option-a-docker-recommended)
   - [Option B: Manual Local Setup](#option-b-manual-local-setup)
5. [Environment Variables](#-environment-variables)
6. [Database Setup](#-database-setup)
7. [Test Accounts & Login](#-test-accounts--login)
8. [App Walkthrough by Role](#-app-walkthrough-by-role)
   - [Applicant (Business Owner)](#applicant-business-owner)
   - [Staff (BPLO Clerk)](#staff-bplo-clerk)
   - [Reviewer (BPLO Officer)](#reviewer-bplo-officer)
   - [Administrator](#administrator)
9. [Core Modules Guide](#-core-modules-guide)
10. [API Reference](#-api-reference)
11. [Running Tests](#-running-tests)
12. [Project Structure](#-project-structure)
13. [Available Scripts](#-available-scripts)
14. [Deployment](#-deployment)
15. [Troubleshooting](#-troubleshooting)
16. [Further Reading](#-further-reading)

---

## 🌐 System Overview

This system digitizes the end-to-end business permit lifecycle for Philippine LGUs:

```
Applicant Registers → Fills Application → Uploads Documents → Submits
     ↓
Staff Reviews Documents → Reviewer Approves/Returns/Rejects
     ↓
Payment Processing → Permit Generated (PDF with QR code)
     ↓
Claim Scheduling → Applicant Claims Permit → Done!
```

### Seven Core Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **User & Access Management** | RBAC (4 roles), OTP login, 2FA/TOTP, session management |
| 2 | **Permit Application Management** | New/renewal applications, full status lifecycle |
| 3 | **Digital Document Management** | Upload, versioning, virus scanning, verification |
| 4 | **Application & Renewal Tracking** | Real-time SSE updates, dashboards, status history |
| 5 | **Claim Scheduling Management** | Time slot management, capacity limits, rescheduling |
| 6 | **Claim Reference & Reporting** | Reference numbers, analytics, CSV/PDF export |
| 7 | **Permit Issuance & Certification** | Permit PDF generation, QR codes, printing, status updates |

---

## 📦 Prerequisites

### Minimum Requirements

| Tool | Version | Check Command |
|------|---------|---------------|
| **Node.js** | ≥ 18.x (22.x recommended) | `node --version` |
| **npm** | ≥ 9.x | `npm --version` |
| **PostgreSQL** | ≥ 15.x | `psql --version` |

### Optional (but recommended)

| Tool | Purpose | Install |
|------|---------|---------|
| **Docker Desktop** | One-command setup of all services | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Redis** | Caching, rate limiting, job queues | Included in Docker setup |
| **MinIO** | S3-compatible file storage | Included in Docker setup |
| **k6** | Performance/load testing | [k6.io](https://k6.io/docs/get-started/installation/) |

---

## 🚀 Quick Start (5 minutes)

The fastest way to get running:

```bash
# 1. Clone / navigate to the project
cd ONLINE-BUSINESS-PERMIT

# 2. Start infrastructure (PostgreSQL + Redis + MinIO)
docker compose up -d postgres redis minio

# 3. Navigate to the web app
cd web

# 4. Install dependencies (if not already done)
npm install

# 5. Copy environment file
cp .env.example .env
#    (The defaults work with the Docker services above)

# 6. Generate Prisma client
npx prisma generate

# 7. Push schema to database & seed test data
npx prisma db push
npm run db:seed

# 8. Start the dev server
npm run dev
```

### ✅ Open your browser to **http://localhost:3000**

Login with: **`admin@lgu.gov.ph`** / **`Password123!`**

---

## 🔧 Detailed Setup Options

### Option A: Docker (Recommended)

This spins up the **entire stack** (PostgreSQL, Redis, MinIO, and the app) with one command:

```bash
# From the project root (ONLINE-BUSINESS-PERMIT/)
docker compose up -d
```

**Services started:**

| Service | URL | Credentials |
|---------|-----|-------------|
| **App** | http://localhost:3000 | See [Test Accounts](#-test-accounts--login) |
| **PostgreSQL** | localhost:5432 | `postgres` / `postgres_password` |
| **Redis** | localhost:6379 | No auth |
| **MinIO Console** | http://localhost:9001 | `minioadmin` / `minioadmin123` |
| **MinIO API** | http://localhost:9000 | Same as above |

> **Note:** The Docker app build requires the database to be healthy first. On first run, you may need to run migrations separately — see [Database Setup](#-database-setup).

To stop all services:
```bash
docker compose down
```

To stop and **delete all data**:
```bash
docker compose down -v
```

---

### Option B: Manual Local Setup

If you prefer running services locally without Docker:

#### 1. Install PostgreSQL

- **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql@16`
- **Ubuntu:** `sudo apt install postgresql-16`

Create the database:
```sql
CREATE DATABASE business_permit;
```

#### 2. Install Redis (optional)

- **Windows:** Use [Memurai](https://www.memurai.com/) or WSL
- **macOS:** `brew install redis && brew services start redis`
- **Ubuntu:** `sudo apt install redis-server`

> The app gracefully falls back to **in-memory caching** if Redis is unavailable.

#### 3. Set up the web app

```bash
cd web

# Install Node.js dependencies
npm install

# Copy and edit environment file
cp .env.example .env
# Edit .env — update DATABASE_URL with your PostgreSQL credentials

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed test data
npm run db:seed

# Start development server
npm run dev
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` in the `web/` directory. Here's what each section controls:

### Required (for basic operation)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/business_permit?schema=public` |
| `AUTH_SECRET` | NextAuth.js signing secret (min 32 chars) | Must change in production |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` |

### App Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public-facing URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `Online Business Permit System` |
| `NODE_ENV` | Environment | `development` |
| `LGU_NAME` | Name of your LGU | `City of Sample` |
| `LGU_MAYOR_NAME` | Mayor's name (appears on permits) | `Hon. Juan Dela Cruz` |
| `LGU_BPLO_HEAD` | BPLO head name (appears on permits) | `Maria Santos` |

### Optional Services

| Variable | Description | When Needed |
|----------|-------------|-------------|
| `REDIS_URL` | Redis connection | Caching, queues, rate limiting |
| `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` | S3/MinIO config | Document storage |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email SMTP | Email notifications |
| `SMS_PROVIDER`, `SEMAPHORE_API_KEY` | SMS gateway | OTP via SMS |
| `PAYMONGO_SECRET_KEY`, `PAYMONGO_PUBLIC_KEY` | PayMongo | Online payments |
| `GOV_API_MOCK` | Mock government API calls | Set to `"true"` in dev |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking | Error monitoring |
| `METRICS_TOKEN` | Prometheus metrics auth token | `/api/metrics` endpoint |
| `TOTP_ISSUER` | 2FA app display name | `BizPermit LGU` |

> 💡 **Tip:** In development, `GOV_API_MOCK="true"` is set by default so you don't need real DTI/BIR/SEC API keys.

---

## 🗄️ Database Setup

### Schema Management

```bash
cd web

# Push schema to database (development — no migration files)
npx prisma db push

# OR create formal migration files (production)
npx prisma migrate dev --name init

# Seed the database with test data
npm run db:seed

# Open Prisma Studio (visual database browser)
npm run db:studio
# → Opens at http://localhost:5555
```

### Database Schema Overview

The system uses **16 models** organized across the 7 modules:

| Model | Purpose |
|-------|---------|
| `User` | Accounts with roles (ADMINISTRATOR, REVIEWER, STAFF, APPLICANT) |
| `Session` | Active user sessions |
| `OtpToken` | OTP codes for login/verification |
| `ActivityLog` | Audit trail of all user actions |
| `Application` | Business permit applications |
| `ApplicationHistory` | Status change history for each application |
| `ReviewAction` | Reviewer decisions (approve/reject/return) |
| `Document` | Uploaded files linked to applications |
| `ClaimSchedule` | Available dates for permit claiming |
| `TimeSlot` | Time windows within a schedule date |
| `SlotReservation` | Applicant bookings for a time slot |
| `ClaimReference` | Generated reference numbers for claiming |
| `Permit` | Issued permits with validity periods |
| `PermitIssuance` | Issuance records and printing status |
| `SystemSetting` | Configurable system parameters |

---

## 👤 Test Accounts & Login

After running `npm run db:seed`, these accounts are available:

| Role | Email | Password | Status |
|------|-------|----------|--------|
| 🔴 **Administrator** | `admin@lgu.gov.ph` | `Password123!` | Active |
| 🟠 **Reviewer** | `reviewer@lgu.gov.ph` | `Password123!` | Active |
| 🟡 **Staff** | `staff@lgu.gov.ph` | `Password123!` | Active |
| 🟢 **Applicant** | `juan@example.com` | `Password123!` | Active |
| 🟢 **Applicant** | `pedro@example.com` | `Password123!` | Active |
| ⚪ **Pending** | `ana@example.com` | `Password123!` | Pending Verification |

### How to Login

1. Go to **http://localhost:3000/login**
2. Enter email and password
3. Click **"Sign In"**

> 🔒 **Two-Factor Authentication (2FA):** Staff and admin accounts can enable TOTP-based 2FA from their profile settings. Use any authenticator app (Google Authenticator, Authy, Microsoft Authenticator).

---

## 🎯 App Walkthrough by Role

### Applicant (Business Owner)

Login as **`juan@example.com`** / **`Password123!`**

#### What you can do:

| Action | Where | Description |
|--------|-------|-------------|
| **View Dashboard** | `/dashboard` | See your applications, statuses, and notifications |
| **Create New Application** | `/dashboard/applications/new` | Fill out business details, upload documents |
| **View Applications** | `/dashboard/applications` | List all your applications with current status |
| **Upload Documents** | `/dashboard/documents` | Manage uploaded documents (DTI cert, barangay clearance, etc.) |
| **Track Status** | `/dashboard/tracking` | Real-time tracking of application progress |
| **Schedule Claim** | `/dashboard/claims` | Book a time slot to claim your approved permit |
| **View Claim Reference** | `/dashboard/claim-reference` | Get your claim reference number with QR code |
| **Download Permit** | `/dashboard/applications` | Download PDF permit (after approval) |
| **Edit Profile** | `/dashboard/profile` | Update personal info, enable 2FA |

#### Typical Applicant Workflow:

```
1. Register at /register
2. Verify email/OTP
3. Login → Dashboard
4. Click "New Application"
5. Fill business information:
   - Business name, type, address
   - DTI/SEC registration number
   - TIN number
   - Capital investment, employees
6. Upload required documents:
   - DTI/SEC Certificate
   - Barangay Clearance
   - Fire Safety Certificate
   - Sanitary Permit
   - Lease contract / Land title
7. Submit application
8. Wait for review (track in real-time)
9. If returned: fix issues, resubmit
10. If approved: schedule claim date
11. Go to LGU with reference number → claim permit
```

---

### Staff (BPLO Clerk)

Login as **`staff@lgu.gov.ph`** / **`Password123!`**

#### What you can do:

| Action | Where | Description |
|--------|-------|-------------|
| **View Dashboard** | `/dashboard` | Overview of pending tasks and statistics |
| **Verify Documents** | `/dashboard/verify-documents` | Verify uploaded documents for authenticity |
| **Manage Applications** | `/dashboard/applications` | View all submitted applications |
| **Manage Schedules** | `/dashboard/schedule` | Create/manage claim schedule time slots |
| **Process Claims** | `/dashboard/claims` | Handle walk-in claims, verify reference numbers |
| **Issue Permits** | `/dashboard/issuance` | Generate and print permits |
| **View Documents** | `/dashboard/documents` | Access all uploaded documents |

#### Typical Staff Workflow:

```
1. Login → Dashboard (see pending items)
2. Go to "Verify Documents"
3. Review each document: Verify ✓ or Reject ✗
4. Once all docs verified, application moves to reviewer
5. After approval, manage claim schedules
6. When applicant arrives: verify reference number
7. Print and issue permit
8. Mark as claimed
```

---

### Reviewer (BPLO Officer)

Login as **`reviewer@lgu.gov.ph`** / **`Password123!`**

#### What you can do:

| Action | Where | Description |
|--------|-------|-------------|
| **Review Applications** | `/dashboard/review` | Review applications that passed document verification |
| **Approve/Reject/Return** | `/dashboard/review` | Make final decision on applications |
| **View Reports** | `/dashboard/claim-reference` | Access claim references and reports |
| **View Tracking** | `/dashboard/tracking` | Monitor all application statuses |

#### Typical Reviewer Workflow:

```
1. Login → Dashboard
2. Go to "Review Applications"
3. Open an application under review
4. Check business details + verified documents
5. Decision:
   - APPROVE → Application proceeds to permit generation
   - RETURN → Send back with notes for applicant to fix
   - REJECT → Deny with reason
6. Application history is automatically updated
```

---

### Administrator

Login as **`admin@lgu.gov.ph`** / **`Password123!`**

#### What you can do:

| Action | Where | Description |
|--------|-------|-------------|
| **Full Dashboard** | `/dashboard` | System-wide statistics and overview |
| **Manage Users** | `/dashboard/admin/users` | Create, edit, deactivate user accounts |
| **System Settings** | `/dashboard/admin/settings` | Configure system parameters |
| **Manage Schedules** | `/dashboard/admin/schedules` | Manage claim schedule templates |
| **View Reports** | `/dashboard/admin/reports` | Generate and export reports |
| **All Staff/Reviewer Functions** | Various | Full access to all system features |
| **Analytics** | `/dashboard` | View system analytics and metrics |

---

## 📘 Core Modules Guide

### Module 1: User & Access Management

- **Four roles:** ADMINISTRATOR, REVIEWER, STAFF, APPLICANT
- **Permission-based access** using CASL.js — each role has specific abilities
- **OTP Login:** Email-based one-time passwords
- **2FA/TOTP:** Time-based one-time passwords (Google Authenticator compatible)
  - Enable at: Dashboard → Profile → Security → Enable 2FA
  - Scan QR code with authenticator app
  - Enter 6-digit code to confirm
- **Session timeout:** 30 minutes of inactivity
- **Rate limiting:** Login (10/min), API (100/min), OTP (5/15min)
- **Activity logging:** Every action is logged for audit trail

### Module 2: Permit Application Management

- **Application types:** NEW, RENEWAL
- **Status lifecycle:**
  ```
  DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → FOR_CLAIMING → CLAIMED
                                    ↘ RETURNED (fix & resubmit)
                                    ↘ REJECTED (with reason)
  ```
- **Auto-generated application numbers:** `BP-YYYY-NNNNNN`
- **Government API verification:** DTI, BIR, SEC registration validation (mocked in dev)

### Module 3: Digital Document Management

- **Supported formats:** PDF, JPEG, PNG, WebP (configurable)
- **Max file size:** 10 MB (configurable)
- **Virus scanning:** ClamAV integration (optional)
- **Document types:** DTI Certificate, Barangay Clearance, Fire Safety, Sanitary Permit, Lease Contract, Tax Clearance, and more
- **Verification workflow:** UPLOADED → PENDING_VERIFICATION → VERIFIED / REJECTED
- **Version control:** Document history maintained on re-upload

### Module 4: Application & Renewal Tracking

- **Real-time updates** via Server-Sent Events (SSE) at `/api/events`
- **Visual timeline** showing every status change with timestamps
- **Dashboard widgets** showing counts by status
- **Email/SMS notifications** on status changes (when configured)

### Module 5: Claim Scheduling Management

- **Admin creates schedules** with date + time slots
- **Each slot has capacity limits** (default: 10 per slot)
- **Applicants book a slot** after approval
- **Rescheduling** allowed before the scheduled date
- **Walk-in handling** for staff

### Module 6: Claim Reference & Reporting

- **Auto-generated reference numbers:** `CLM-YYYYMMDD-XXXXXX`
- **QR codes** on reference slips for quick verification
- **Reports:** Application summary, monthly permits, revenue (exportable)
- **CSV/PDF export** for all reports

### Module 7: Permit Issuance & Certification

- **PDF permit generation** with LGU branding, QR verification code
- **Permit numbers:** `PERMIT-YYYY-NNNNNN`
- **Validity tracking** with expiry dates
- **Print management** — mark as printed, track issuance
- **QR code verification** — scan to verify permit authenticity

---

## 🔌 API Reference

All API routes are under `/api/`. Authentication is required unless noted.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/callback/credentials` | Login with email/password |
| POST | `/api/auth/2fa/setup` | Setup 2FA (returns QR code) |
| POST | `/api/auth/2fa/verify` | Verify 2FA code |

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List applications (filtered by role) |
| POST | `/api/applications` | Create new application |
| GET | `/api/applications/[id]` | Get application details |
| PATCH | `/api/applications/[id]` | Update application |
| POST | `/api/applications/verify-registration` | Verify DTI/BIR/SEC registration |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List documents |
| POST | `/api/documents` | Upload document |
| PATCH | `/api/documents/[id]` | Update/verify document |

### Schedules & Claims

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedules` | List claim schedules |
| POST | `/api/schedules` | Create schedule (admin/staff) |
| GET | `/api/claims` | List claims |
| POST | `/api/claims` | Book a claim slot |

### Permits & Issuance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permits/[id]/pdf` | Download permit PDF |
| POST | `/api/issuance` | Record permit issuance |
| PATCH | `/api/issuance/[id]` | Update issuance status |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | SSE stream for real-time updates |
| GET | `/api/analytics` | Dashboard analytics data (admin) |
| GET | `/api/metrics` | Prometheus metrics (token auth) |
| GET | `/api/profile` | Get current user profile |
| PATCH | `/api/profile` | Update profile |
| POST | `/api/payments` | Create payment session |
| POST | `/api/payments/webhook` | Payment gateway webhook |
| POST | `/api/privacy/data` | Data privacy request (RA 10173) |

---

## 🧪 Running Tests

### Unit Tests (Vitest)

```bash
cd web

# Run all 81 unit tests
npm test

# Run in watch mode (re-runs on file changes)
npx vitest --watch

# Run with UI (opens browser-based test runner)
npm run test:ui

# Run with coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
cd web

# Make sure the dev server is running first!
npm run dev  # in another terminal

# Run all E2E tests
npm run test:e2e

# Run only accessibility tests (WCAG 2.1 AA)
npm run test:a11y

# Run visual regression tests
npm run test:visual

# Update visual regression snapshots
npm run test:visual:update
```

### Performance Tests (k6)

```bash
# Install k6 first: https://k6.io/docs/get-started/installation/
k6 run tests/performance/load-test.js
```

### Security Tests (OWASP ZAP)

```bash
# Windows (PowerShell)
npm run test:security

# Linux/macOS
bash tests/security/run-zap-scan.sh
```

---

## 📁 Project Structure

```
ONLINE-BUSINESS-PERMIT/
├── START_HERE.md              ← You are here!
├── PROJECT-PLAN.md            ← Full 756-line project plan
├── docker-compose.yml         ← PostgreSQL + Redis + MinIO + App
├── .github/
│   └── workflows/
│       ├── ci.yml             ← CI pipeline (lint, test, build)
│       └── security.yml       ← Security scanning pipeline
│
└── web/                       ← Next.js application
    ├── package.json           ← Dependencies & scripts
    ├── next.config.js         ← Next.js config (security headers, etc.)
    ├── middleware.ts           ← Route protection, rate limiting, RBAC
    ├── tsconfig.json           ← TypeScript config
    ├── vitest.config.ts        ← Unit test config
    ├── playwright.config.ts    ← E2E test config
    ├── .env.example            ← Environment template (30+ vars)
    ├── Dockerfile              ← Production Docker image
    │
    ├── prisma/
    │   ├── schema.prisma       ← Database schema (16 models)
    │   └── seed.js             ← Test data seeder
    │
    ├── public/
    │   ├── robots.txt          ← SEO robots file
    │   ├── manifest.json       ← PWA manifest
    │   ├── sw.js               ← Service worker (offline support)
    │   └── offline.html        ← Offline fallback page
    │
    └── src/
        ├── middleware.ts       ← Auth + rate limiting middleware
        │
        ├── lib/                ← Core business logic (19 files)
        │   ├── auth.ts         ← NextAuth v5 configuration
        │   ├── prisma.ts       ← Database client
        │   ├── validations.ts  ← Zod schemas for all forms
        │   ├── permissions.ts  ← CASL.js RBAC rules
        │   ├── payments.ts     ← GCash/Maya/PayMongo integration
        │   ├── sms.ts          ← Semaphore/Globe Labs SMS
        │   ├── email.ts        ← Nodemailer email sending
        │   ├── storage.ts      ← S3/MinIO file storage + ClamAV
        │   ├── pdf.ts          ← Permit PDF generation + QR
        │   ├── two-factor.ts   ← TOTP 2FA (otplib)
        │   ├── rate-limit.ts   ← Sliding window rate limiter
        │   ├── queue.ts        ← BullMQ job queues
        │   ├── government-api.ts ← DTI/BIR/SEC verification
        │   ├── sse.ts          ← Server-Sent Events
        │   ├── i18n.ts         ← Filipino/English i18n
        │   ├── stores.ts       ← Zustand state management
        │   ├── cache.ts        ← Redis + in-memory caching
        │   ├── monitoring.ts   ← Sentry + Prometheus metrics
        │   └── utils.ts        ← Utility functions
        │
        ├── components/
        │   ├── ui/             ← 13 reusable UI components
        │   │   ├── button.tsx, input.tsx, textarea.tsx
        │   │   ├── select.tsx, badge.tsx, modal.tsx
        │   │   ├── file-upload.tsx, card.tsx, data-table.tsx
        │   │   ├── loading.tsx, alert.tsx, empty-state.tsx
        │   │   └── language-switcher.tsx
        │   ├── dashboard/      ← Sidebar, header, verify actions
        │   ├── privacy/        ← Cookie consent (RA 10173)
        │   ├── seo/            ← JSON-LD structured data
        │   ├── pwa/            ← Service worker registration
        │   └── providers/      ← React Query provider
        │
        ├── messages/           ← i18n translations
        │   ├── en.json         ← English
        │   └── fil.json        ← Filipino
        │
        ├── app/
        │   ├── layout.tsx      ← Root layout (providers, SEO, PWA)
        │   │
        │   ├── (public)/       ← 7 public pages
        │   │   ├── contact/
        │   │   ├── data-privacy/
        │   │   ├── faqs/
        │   │   ├── how-to-apply/
        │   │   ├── privacy/
        │   │   ├── requirements/
        │   │   └── terms/
        │   │
        │   ├── (auth)/         ← 4 auth pages
        │   │   ├── login/
        │   │   ├── register/
        │   │   ├── forgot-password/
        │   │   └── verify-otp/
        │   │
        │   ├── (dashboard)/dashboard/  ← 18+ dashboard pages
        │   │   ├── page.tsx            ← Main dashboard
        │   │   ├── applications/       ← Application CRUD
        │   │   ├── documents/          ← Document management
        │   │   ├── tracking/           ← Real-time tracking
        │   │   ├── review/             ← Reviewer queue
        │   │   ├── verify-documents/   ← Staff doc verification
        │   │   ├── schedule/           ← Schedule management
        │   │   ├── claims/             ← Claim processing
        │   │   ├── claim-reference/    ← Reference numbers
        │   │   ├── issuance/           ← Permit issuance
        │   │   ├── profile/            ← User profile + 2FA
        │   │   └── admin/              ← Admin-only pages
        │   │       ├── users/
        │   │       ├── settings/
        │   │       ├── schedules/
        │   │       └── reports/
        │   │
        │   └── api/            ← 13 API route groups
        │       ├── auth/
        │       ├── applications/
        │       ├── documents/
        │       ├── schedules/
        │       ├── claims/
        │       ├── permits/
        │       ├── issuance/
        │       ├── payments/
        │       ├── events/
        │       ├── analytics/
        │       ├── metrics/
        │       ├── profile/
        │       └── privacy/
        │
        └── __tests__/          ← 81 unit tests (6 files)
            ├── setup.ts
            ├── lib/            ← Lib function tests
            └── components/     ← Component tests

    ├── e2e/                    ← Playwright E2E tests
    │   ├── app.spec.ts         ← Core flow tests
    │   ├── accessibility.spec.ts ← WCAG 2.1 AA
    │   └── visual-regression.spec.ts
    │
    └── tests/
        ├── performance/        ← k6 load tests
        │   └── load-test.js
        └── security/           ← OWASP ZAP config
            ├── zap-config.conf
            ├── run-zap-scan.sh
            └── run-zap-scan.ps1
```

---

## 📜 Available Scripts

Run these from the `web/` directory:

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run typecheck` | TypeScript type checking |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to DB (dev) |
| `npm run db:migrate` | Create & run migrations (production) |
| `npm run db:seed` | Seed test data (6 users, 5 apps, permits, schedules) |
| `npm run db:studio` | Open Prisma Studio GUI (http://localhost:5555) |

### Testing

| Command | Description |
|---------|-------------|
| `npm test` | Run all unit tests (81 tests) |
| `npm run test:ui` | Open Vitest browser UI |
| `npm run test:coverage` | Tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:a11y` | Accessibility tests (WCAG 2.1 AA) |
| `npm run test:visual` | Visual regression tests |
| `npm run test:visual:update` | Update visual snapshots |
| `npm run test:security` | OWASP ZAP security scan |
| `npm run test:perf` | Performance test info |

---

## 🚢 Deployment

### Production Deployment with Docker

```bash
# 1. Set production environment variables
cp web/.env.example web/.env
# Edit .env with production values (real SMTP, API keys, etc.)

# 2. Build and start
docker compose up -d --build

# 3. Run migrations
docker compose exec app npx prisma migrate deploy

# 4. Seed initial admin account (first time only)
docker compose exec app npm run db:seed
```

### Production Environment Checklist

- [ ] Change `AUTH_SECRET` to a strong random value (≥ 32 chars)
- [ ] Set `NODE_ENV=production`
- [ ] Configure real SMTP credentials for email
- [ ] Configure SMS provider (Semaphore recommended for PH)
- [ ] Set up PayMongo for payments (if applicable)
- [ ] Set `GOV_API_MOCK=false` and configure real DTI/BIR/SEC API keys
- [ ] Configure a proper domain for `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`
- [ ] Set up Sentry for error tracking
- [ ] Update LGU information variables
- [ ] Enable `require_2fa_staff` in system settings
- [ ] Set up SSL/TLS (HTTPS) via reverse proxy (Nginx/Caddy)
- [ ] Configure backup strategy for PostgreSQL and MinIO

### Hosting Recommendations for Philippine LGUs

| Option | Cost | Best For |
|--------|------|----------|
| **DICT Cloud** | Free/Low | Government agencies |
| **AWS/GCP (Singapore)** | Medium | Low-latency for PH users |
| **DigitalOcean SGP1** | Low | Small LGUs |
| **On-premise** | Variable | LGUs with existing infrastructure |

---

## ❓ Troubleshooting

### Common Issues

#### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker compose ps

# If using Docker, ensure the service is healthy
docker compose logs postgres

# Verify DATABASE_URL in .env matches your setup
```

#### "Prisma client not generated"
```bash
cd web
npx prisma generate
```

#### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Or start on a different port
npm run dev -- -p 3001
```

#### "Redis connection refused" (non-critical)
The app works without Redis — it falls back to in-memory caching. If you want Redis:
```bash
docker compose up -d redis
```

#### "npm install fails"
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### "Seed fails with unique constraint"
```bash
# The seed script cleans existing data, but if it fails:
npx prisma db push --force-reset
npm run db:seed
```

#### "Build error: serverExternalPackages"
Ensure you're using Next.js 16+. The `next.config.js` uses the `serverExternalPackages` option.

---

## 📚 Further Reading

| Resource | Link |
|----------|------|
| **PROJECT-PLAN.md** | Full project plan with architecture, security, and SEO strategy |
| **Next.js Docs** | https://nextjs.org/docs |
| **Prisma Docs** | https://www.prisma.io/docs |
| **NextAuth.js** | https://authjs.dev |
| **CASL.js (RBAC)** | https://casl.js.org |
| **Tailwind CSS v4** | https://tailwindcss.com/docs |
| **RA 10173 (Data Privacy)** | https://privacy.gov.ph/data-privacy-act/ |
| **Philippine DICT Standards** | https://dict.gov.ph |

---

## 🇵🇭 Compliance

This system is designed to comply with:

- **RA 11032** — Ease of Doing Business and Efficient Government Service Delivery Act
- **RA 10173** — Data Privacy Act of 2012 (cookie consent, data privacy page, data export)
- **DICT Government Cloud** — Compatible hosting requirements
- **WCAG 2.1 AA** — Web accessibility standards
- **NBCP** — National Building Code requirements for fire safety documents

---

> **Built with ❤️ for Philippine LGUs** | Next.js 16 · React 19 · PostgreSQL 16 · Prisma 7 · TypeScript 5
