# 📋 MISSING_REQUIREMENTS.md — Online Business Permit System

> **Generated:** March 3, 2026
> **Status:** Development / Local Testing

---

## 🔴 Summary

| Category | Status | Impact |
|----------|--------|--------|
| PostgreSQL Database | ✅ Connected & Working | Core app works |
| Email (SMTP) | ❌ Missing API Keys | OTP emails won't send |
| SMS (Semaphore) | ❌ Missing API Key | OTP texts won't send |
| File Storage (MinIO) | ❌ Not Running | Document uploads will fail |
| Redis | ❌ Not Running | Caching/queues won't work |
| Payment (PayMongo) | ❌ Missing API Keys | Payments won't process |
| Government APIs | ⚠️ Mock Mode | Uses fake data (OK for dev) |
| Docker Desktop | ❌ Not Running | MinIO/Redis depend on it |
| Monitoring (Sentry) | ⚠️ Optional | Error tracking disabled |
| PWA Push Notifications | ⚠️ Optional | VAPID keys not generated |
| AUTH_SECRET | ⚠️ Placeholder | Must change for production |

---

## 1. ❌ Email (SMTP) — OTP & Notifications Won't Send

### What's Missing
```env
SMTP_USER=""    ← Empty
SMTP_PASS=""    ← Empty
```

### Impact
- Registration OTP emails won't send (code only appears in terminal console)
- Password reset emails won't send
- Application status notifications won't send
- Claim confirmation emails won't send

### What To Do (Gmail — Easiest)
1. Go to your Google Account → [Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **"Other"** → name it `Business Permit System` → click **Generate**
5. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)
6. Update your `.env` file:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-actual-email@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"
SMTP_FROM="your-actual-email@gmail.com"
```

### Alternative (Resend — Free 100 emails/day)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Update `.env`:
```env
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_PASS="re_your_api_key_here"
SMTP_FROM="onboarding@resend.dev"
```

### Workaround (No API Key)
The system logs OTP codes to the terminal console during development:
```
[DEV] OTP for user@email.com: 123456
```
You can read the OTP from the terminal where `npm run dev` is running.

---

## 2. ❌ SMS (Semaphore) — Text Messages Won't Send

### What's Missing
```env
SEMAPHORE_API_KEY=""    ← Empty
```

### Impact
- SMS OTP codes won't be sent to phone numbers
- Application status SMS notifications won't work
- Claim reminder texts won't send

### What To Do
1. Sign up at [semaphore.co](https://semaphore.co) (Philippine SMS gateway)
2. They provide **free test credits** on sign-up
3. Go to your Dashboard → **API** section
4. Copy your API key
5. Update `.env`:

```env
SEMAPHORE_API_KEY="your-semaphore-api-key"
SEMAPHORE_SENDER_NAME="BIZPERMIT"
```

### Alternative (Globe Labs — Free for Globe/TM subscribers)
1. Sign up at [developer.globelabs.com.ph](https://developer.globelabs.com.ph)
2. Create an app and get your credentials
3. Update `.env`:
```env
SMS_PROVIDER="globe_labs"
GLOBE_LABS_APP_ID="your-app-id"
GLOBE_LABS_APP_SECRET="your-app-secret"
GLOBE_LABS_SHORT_CODE="your-short-code"
```

### Workaround (No API Key)
Same as email — OTP codes appear in the terminal console:
```
[DEV SMS] To: +639171234567, Message: Your OTP is 123456
```

---

## 3. ❌ File Storage (MinIO) — Document Uploads Will Fail

### What's Missing
MinIO (S3-compatible storage) is **not running**. It requires Docker.

### Impact
- Applicants cannot upload documents (DTI certificate, barangay clearance, etc.)
- Document download will fail
- The entire document management module is non-functional

### What To Do

#### Option A — Start Docker Desktop + MinIO (Recommended)
1. Open **Docker Desktop** from your Start Menu
2. Wait for it to fully start (whale icon in taskbar turns green)
3. Run in terminal:
```powershell
cd C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT
docker compose up -d minio
```
4. MinIO Console will be at: **http://localhost:9001**
   - Username: `minioadmin`
   - Password: `minioadmin123`
5. Create a bucket named `permits-documents` in the MinIO Console

#### Option B — Use Local File System (No Docker needed)
If you don't want to use Docker, the storage module can be modified to save files locally. This requires code changes to `src/lib/storage.ts`.

### Current `.env` Settings (Already Correct)
```env
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="permits-documents"
S3_REGION="ap-southeast-1"
```
> ⚠️ Note: The Docker Compose file uses password `minioadmin123` but your `.env` says `minioadmin`. Update `.env` to match:
> `S3_SECRET_KEY="minioadmin123"`

---

## 4. ❌ Redis — Caching & Queues Won't Work

### What's Missing
Redis is **not running**. It requires Docker.

### Impact
- Rate limiting won't work (uses in-memory fallback)
- Background job queues (BullMQ) won't process
- Caching layer is disabled
- **The app still works** — these are performance features, not critical

### What To Do

#### Option A — Start Docker Desktop + Redis
1. Open **Docker Desktop**
2. Run in terminal:
```powershell
cd C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT
docker compose up -d redis
```
3. Redis will be available at `localhost:6379`

#### Option B — Install Redis for Windows
1. Download from [github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. Install and start the Redis service
3. No `.env` changes needed — it defaults to `localhost:6379`

### Workaround
The app runs fine without Redis. Features like caching and queues are currently dead code (not wired in yet per `tasks.md`).

---

## 5. ❌ Payment Gateways — Payments Won't Process

### What's Missing
```env
PAYMONGO_SECRET_KEY=""    ← Empty
PAYMONGO_PUBLIC_KEY=""    ← Empty
PAYMAYA_SECRET_KEY=""     ← Empty
PAYMAYA_PUBLIC_KEY=""     ← Empty
```

### Impact
- Business permit fee payments cannot be processed
- GCash/Maya payment integration is disabled
- Payment status cannot be verified

### What To Do (PayMongo — Recommended for PH)
1. Sign up at [paymongo.com](https://paymongo.com)
2. Toggle to **Test Mode** in the dashboard
3. Go to **Developers** → **API Keys**
4. Copy the test keys
5. Update `.env`:

```env
PAYMONGO_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxx"
PAYMONGO_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxx"
PAYMONGO_WEBHOOK_SECRET="whsk_xxxxxxxxxxxxxxxx"
```

### Test Card Numbers (PayMongo Sandbox)
| Card Number | Result |
|-------------|--------|
| 4343 4343 4343 4345 | ✅ Successful payment |
| 4571 7360 0000 0007 | ❌ Declined |

### Workaround
The payment module UI page is not yet built (Phase 2, Task #23 in `tasks.md`). You can skip this for now.

---

## 6. ⚠️ Government APIs — Using Mock Mode

### Current Setting
```env
GOV_API_MOCK="true"    ← Uses fake responses
```

### What This Means
- DTI business name verification returns **mock data**
- BIR TIN verification returns **mock data**
- SEC company verification returns **mock data**
- This is **perfectly fine for development and testing**

### What To Do (Only for Production)
Contact the respective agencies:
- **DTI eBNRS:** [bnrs.dti.gov.ph](https://bnrs.dti.gov.ph) — Apply for API access
- **BIR eServices:** [bir.gov.ph](https://www.bir.gov.ph) — Request TIN verification API
- **SEC eFAST:** [efast.sec.gov.ph](https://efast.sec.gov.ph) — Apply for company lookup API

### Recommendation
**Keep `GOV_API_MOCK="true"` for now.** These government APIs require formal LGU partnership agreements and take weeks/months to get approved.

---

## 7. ⚠️ AUTH_SECRET — Must Change for Production

### Current Setting
```env
AUTH_SECRET="your-super-secret-key-change-in-production-min-32-chars"
```

### Impact
- This is a **placeholder** — insecure for production
- OK for local development

### What To Do (Before Production)
Generate a secure random secret:
```powershell
cd C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and replace the `AUTH_SECRET` value in `.env`.

---

## 8. ⚠️ Monitoring (Sentry) — Optional

### What's Missing
```env
NEXT_PUBLIC_SENTRY_DSN=""    ← Empty
SENTRY_ORG=""                ← Empty
SENTRY_PROJECT=""            ← Empty
```

### Impact
- No error tracking in production
- No performance monitoring
- **Does not affect development**

### What To Do (When Ready for Production)
1. Sign up at [sentry.io](https://sentry.io) (free tier available)
2. Create a Next.js project
3. Copy the DSN and org/project values to `.env`

### Recommendation
**Skip for now.** Only needed when deploying to production.

---

## 9. ⚠️ PWA Push Notifications — Optional

### What's Missing
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""    ← Empty
VAPID_PRIVATE_KEY=""              ← Empty
```

### Impact
- Browser push notifications won't work
- Users won't get real-time alerts on their devices

### What To Do
Generate VAPID keys (no sign-up needed):
```powershell
cd C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web
npx web-push generate-vapid-keys
```
Copy the output into your `.env` file.

### Recommendation
**Skip for now.** Push notifications are a nice-to-have feature (Phase 4 in `tasks.md`).

---

## 10. ❌ Docker Desktop — Not Running

### What's Missing
Docker Desktop is **installed** but **not running**.

### Impact
- MinIO (file storage) cannot start
- Redis (caching) cannot start
- Full Docker Compose environment is unavailable

### What To Do
1. Open **Docker Desktop** from the Start Menu
2. Wait for it to fully initialize (whale icon turns solid in taskbar)
3. Then start the services you need:

```powershell
# Start only MinIO and Redis (recommended for development)
cd C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT
docker compose up -d minio redis

# Or start everything including the app
docker compose up -d
```

### Recommendation
You only need Docker if you want **document uploads** (MinIO) or **caching** (Redis). The core app works without Docker.

---

## 🏁 Priority Actions — What To Do First

### 🔴 Must Do (App won't fully work without these)

| # | Action | Time | Difficulty |
|---|--------|------|------------|
| 1 | Start Docker Desktop → `docker compose up -d minio redis` | 2 min | Easy |
| 2 | Get Gmail App Password → fill `SMTP_USER` and `SMTP_PASS` | 5 min | Easy |
| 3 | Generate AUTH_SECRET | 1 min | Easy |

### 🟡 Should Do (For full testing)

| # | Action | Time | Difficulty |
|---|--------|------|------------|
| 4 | Sign up for Semaphore → fill `SEMAPHORE_API_KEY` | 10 min | Easy |
| 5 | Sign up for PayMongo → fill payment keys | 15 min | Easy |
| 6 | Generate VAPID keys | 1 min | Easy |

### 🟢 Can Skip (For development)

| # | Action | Reason |
|---|--------|--------|
| 7 | Government API keys | Mock mode is enabled |
| 8 | Sentry monitoring | Only needed in production |
| 9 | ClamAV virus scanning | Only needed in production |

---

## ✅ What's Already Working

| Service | Status | Details |
|---------|--------|---------|
| PostgreSQL | ✅ Connected | `localhost:5432`, database `business_permit`, 15 tables, 6 users seeded |
| Next.js App | ✅ Running | `http://localhost:3000` |
| Authentication | ✅ Working | Login/Register works, OTP logged to console |
| Database Seed | ✅ Complete | 6 users, 5 applications, 1 permit, schedules, settings |
| Government APIs | ✅ Mock Mode | Fake data returned for DTI/BIR/SEC |

---

## 📂 Files That Need Updates

| File | What To Change |
|------|---------------|
| `web/.env` | Add SMTP_USER, SMTP_PASS, SEMAPHORE_API_KEY, AUTH_SECRET |
| `web/.env` | Fix S3_SECRET_KEY to `minioadmin123` (match Docker Compose) |

---

## 🧪 Quick Test After Setup

After filling in the API keys, restart the app and test:

```powershell
# Restart the app
cd C:\Users\Administrator\Desktop\ONLINE-BUSINESS-PERMIT\web
npm run dev
```

1. Open **http://localhost:3000/register** → Register a new account → Check if email arrives
2. Open **http://localhost:3000/login** → Login with `admin@lgu.gov.ph` / `Password123!`
3. Try uploading a document (requires MinIO running)
4. Check terminal console for any errors
