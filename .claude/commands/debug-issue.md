# Debug Issue — OBPS Systematic Debugging Guide

## Purpose

Systematically diagnose and fix bugs in the Online Business Permit System. Covers Next.js runtime errors, Prisma query failures, NextAuth session issues, SSE connection problems, and deployment errors.

## Usage

```
/debug-issue <description-of-the-problem>
```

## Debugging Workflow

1. **Reproduce** — Identify exact steps, URL, user role, and expected vs actual behavior
2. **Isolate** — Determine layer: UI → Client JS → API Route → Prisma → Database
3. **Inspect** — Check logs, network tab, terminal, Prisma query output
4. **Fix** — Apply minimal change, verify fix, check for regressions
5. **Prevent** — Add test, improve error handling, or add validation

## Common Issue Categories

### 1. NextAuth / Session Issues

**Symptoms**: 401 errors, redirect loops, `session` is null

```
Check these files:
- src/lib/auth.ts          → authorize() callback, JWT/session callbacks
- src/lib/auth.config.ts   → Edge-safe config (pages, providers)
- src/middleware.ts         → NextAuth Edge middleware, route protection
- .env.local               → AUTH_SECRET, AUTH_URL set correctly?
```

**Common fixes**:

- `AUTH_SECRET` not set → `npx auth secret`
- `AUTH_URL` wrong for dev vs prod
- Edge middleware importing Node.js-only code → use `auth.config.ts` split
- JWT callback not returning `id` or `role` → check callback chain

### 2. Prisma / Database Issues

**Symptoms**: PrismaClientKnownRequestError, empty results, constraint violations

```
Check these files:
- web/prisma/schema.prisma  → Model definitions, relations, indexes
- src/lib/prisma.ts          → Singleton client, connection config
- web/prisma.config.ts       → PrismaPg adapter setup
```

**Debug commands**:

```bash
npx prisma studio            # Visual database browser
npx prisma migrate status    # Check migration state
npx prisma db pull           # Introspect current DB
npx prisma validate          # Validate schema
```

**Common fixes**:

- P2002 (unique violation) → check unique constraints
- P2025 (record not found) → verify ID exists before update
- Connection refused → check DATABASE_URL, Docker running?
- Schema drift → `npx prisma migrate dev`

### 3. API Route Issues

**Symptoms**: 500 errors, wrong response format, CORS errors

```
Check these files:
- src/app/api/<route>/route.ts  → Handler logic
- src/lib/validations.ts        → Zod schema used
- src/lib/rate-limit.ts         → Rate limiter config
```

**Common fixes**:

- Missing `await` on async operations
- Zod validation error not caught → add `z.ZodError` catch
- Rate limit hit → check `rate-limit.ts` window/max settings
- CORS → check `next.config.js` headers

### 4. SSE / Real-time Issues

**Symptoms**: Events not received, connection drops, stale data

```
Check these files:
- src/app/api/events/route.ts  → SSE endpoint
- src/lib/sse.ts               → SSE broadcaster (EventEmitter)
- src/hooks/use-sse.ts         → Client hook (EventSource)
```

**Common fixes**:

- EventSource not reconnecting → check `useSSE` cleanup/retry logic
- Events not broadcasting → verify `sseBroadcaster.emit()` called in mutation
- Middleware blocking `/api/events` → check `middleware.ts` matcher

### 5. File Upload / Storage Issues

**Symptoms**: Upload fails, file not found, presigned URL expired

```
Check these files:
- src/lib/storage.ts     → S3/MinIO client, local fallback
- .env.local             → S3_* variables set?
```

**Common fixes**:

- S3 not configured → falls back to local `./uploads/`
- File size limit → check `next.config.js` body size limit
- MinIO bucket not created → check Docker startup script

### 6. Payment Issues

**Symptoms**: Checkout fails, webhook not received, status not updated

```
Check these files:
- src/lib/payments.ts                → PayMongo client
- src/app/api/payments/webhook/route.ts → Webhook handler
- .env.local                         → PAYMONGO_SECRET_KEY, WEBHOOK_SECRET
```

**Common fixes**:

- Missing API keys → enable PayMongo test mode
- Webhook signature mismatch → check webhook secret
- ngrok URL stale → run `UPDATE-NGROK-URL.bat`

### 7. Build / Deploy Issues

**Symptoms**: Build fails, Docker errors, type errors

```bash
# Type check
npx tsc --noEmit

# Build locally
npm run build

# Docker build
docker-compose build --no-cache

# Check Docker logs
docker-compose logs -f app
```

## Logging

- **Server-side**: `src/lib/logger.ts` (Winston) — logs to console + file
- **Client-side**: Browser console, React DevTools
- **Prisma**: Enable query logging in `prisma.ts` for development
- **Middleware**: `console.log` in `middleware.ts` (Edge runtime)

## Environment Variables Checklist

```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
S3_ENDPOINT=http://localhost:9000
PAYMONGO_SECRET_KEY=sk_test_...
SMTP_HOST / SMTP_USER / SMTP_PASS
SEMAPHORE_API_KEY
SENTRY_DSN (optional)
```

## Checklist

- [ ] Error reproduced consistently
- [ ] Correct layer identified (UI / API / DB / External)
- [ ] Relevant logs checked
- [ ] Fix applied with minimal change
- [ ] No regressions introduced
- [ ] Test added to prevent recurrence
