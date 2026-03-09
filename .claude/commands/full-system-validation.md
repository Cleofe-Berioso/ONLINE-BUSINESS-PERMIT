# Full System Validation — OBPS Complete System Health Check

## Purpose

Run a comprehensive validation of the entire Online Business Permit System — database connectivity, auth flow, all API routes, UI pages, file storage, payments, and external integrations.

## Usage

```
/full-system-validation
```

## Validation Steps

### Step 1: Environment Check

```bash
# Verify .env.local exists and has required variables
node -e "
  const required = ['DATABASE_URL', 'AUTH_SECRET', 'AUTH_URL'];
  const missing = required.filter(k => !process.env[k]);
  console.log(missing.length ? 'Missing: ' + missing.join(', ') : 'All required vars set');
"
```

### Step 2: Database Connectivity

```bash
npx prisma db pull --print    # Can connect and read schema
npx prisma migrate status     # Migrations in sync
node web/check-db.js           # Custom connectivity check
```

### Step 3: Docker Services

```bash
docker-compose ps               # All containers running
docker-compose logs --tail=20   # No crash loops
```

Expected services: `postgres`, `redis`, `minio`, `app`

### Step 4: Build Verification

```bash
cd web
npx tsc --noEmit              # Type check passes
npm run build                  # Production build succeeds
npm run lint                   # Lint passes
```

### Step 5: Unit Tests

```bash
cd web
npm test -- --run              # All Vitest tests pass
```

### Step 6: Auth Flow Validation

Verify each step:

1. Register → POST `/api/auth/register` → returns 201
2. Verify OTP → POST `/api/auth/verify-otp` → returns 200
3. Login → POST `/api/auth/callback/credentials` → returns session
4. Session → GET `auth()` returns user with role
5. Protected route → unauthorized user gets 401

### Step 7: API Route Smoke Test

| Route                       | Method | Expected         |
| --------------------------- | ------ | ---------------- |
| `/api/auth/register`        | POST   | 201 or 400       |
| `/api/applications`         | GET    | 200 (with auth)  |
| `/api/applications`         | POST   | 201 (with auth)  |
| `/api/documents/upload`     | POST   | 201 (with auth)  |
| `/api/payments`             | POST   | 201 (with auth)  |
| `/api/schedules`            | GET    | 200 (with auth)  |
| `/api/admin/users`          | GET    | 200 (ADMIN only) |
| `/api/analytics`            | GET    | 200 (ADMIN only) |
| `/api/events`               | GET    | SSE stream       |
| `/api/public/verify-permit` | GET    | 200 (no auth)    |

### Step 8: Page Load Verification

| Page            | Route                         | Auth Required   |
| --------------- | ----------------------------- | --------------- |
| Landing         | `/`                           | No              |
| Login           | `/login`                      | No              |
| Register        | `/register`                   | No              |
| Dashboard       | `/dashboard`                  | Yes             |
| New Application | `/dashboard/applications/new` | Yes (APPLICANT) |
| Review Queue    | `/dashboard/review`           | Yes (REVIEWER)  |
| Admin Users     | `/dashboard/admin/users`      | Yes (ADMIN)     |
| Track (Public)  | `/track`                      | No              |
| Verify Permit   | `/verify-permit`              | No              |
| FAQs            | `/faqs`                       | No              |

### Step 9: Storage Validation

```bash
# Check MinIO/S3 connectivity
node -e "
  const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
  const client = new S3Client({ endpoint: process.env.S3_ENDPOINT });
  client.send(new ListBucketsCommand({})).then(r => console.log('Buckets:', r.Buckets));
"
```

### Step 10: E2E Tests

```bash
cd web
npx playwright test            # All E2E tests pass
```

## Health Score

| Component  | Weight | Pass Criteria                    |
| ---------- | ------ | -------------------------------- |
| Database   | 20%    | Connected, migrations current    |
| Auth       | 20%    | Login/register/session works     |
| API Routes | 20%    | All return expected status codes |
| UI Pages   | 15%    | All load without errors          |
| Build      | 15%    | TypeScript + build + lint clean  |
| Tests      | 10%    | Unit + E2E pass                  |

## Quick Commands

```bash
# Full validation (quick)
npm run build && npm test -- --run && npx playwright test

# Database only
npx prisma migrate status && npx prisma studio

# Docker health
docker-compose ps && docker-compose logs --tail=5
```
