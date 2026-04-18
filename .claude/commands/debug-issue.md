# Debug Issue Skill (`/debug-issue`)

**Purpose**: Diagnose and fix issues across the Next.js 15 full-stack application.

## Common Issues & Solutions

### Authentication Issues

**Problem**: "Unauthorized" (401) on protected routes
**Solutions**:
1. Check `src/middleware.ts` - role routing rules
2. Verify `src/lib/auth.ts` - NextAuth Credentials provider config
3. Check session encoding/decoding in `auth.config.ts`
4. Inspect browser: Application tab → Cookies for auth session
5. Verify user role matches route protection

**Problem**: Session not persisting after login
**Solutions**:
1. Check NextAuth callback in `auth.ts` - JWT encoding
2. Verify `callbackUrl` redirect in login form
3. Check `maxAge: 30 * 60` (30 minutes) in session config
4. Ensure `NEXTAUTH_SECRET` env var is set
5. Check `src/app/(auth)/login/page.tsx` - uses `signIn()` from `next-auth/react`

**Problem**: "Account locked" after failed login attempts
**Solutions**:
1. Database check: `SELECT * FROM "User" WHERE email = 'user@email.com'`
2. Update lockout: `UPDATE "User" SET lockedUntil = NULL WHERE email = 'user@email.com'`
3. Check rate limiting in `src/lib/rate-limit.ts` - 5 attempts per 15 minutes

**Problem**: OTP code not working
**Solutions**:
1. Check `src/lib/two-factor.ts` - TOTP time tolerance
2. Verify server time is synced (NTP)
3. Check `OtpToken` table - expiry time `expiresAt`
4. Resend OTP to get fresh code (5-min cooldown)

### API Route Issues

**Problem**: 404 on API endpoint that exists
**Solutions**:
1. Check file path: `/api/applications/[id]/route.ts`
2. Verify `export async function GET(...)` exists
3. Check `src/middleware.ts` - not blocking route
4. Rebuild: `npm run build`
5. Check Next.js console for route registration errors

**Problem**: 500 Internal Server Error
**Solutions**:
1. Check server logs for console.error()
2. Verify Prisma connection: `DATABASE_URL` env var
3. Check Zod validation - might be rejecting input
4. Verify required Prisma fields in schema
5. Check for unhandled promise rejections

**Problem**: Prisma "UNIQUE constraint failed"
**Solutions**:
1. Check unique fields in schema (e.g., `applicationNumber`)
2. Verify uniqueness constraint violations
3. Query existing data: `SELECT * FROM application WHERE applicationNumber = 'APP-001'`
4. Drop and reseed if needed: `npm run db:migrate:reset`

**Problem**: Prisma connection timeout
**Solutions**:
1. Verify PostgreSQL is running: `docker compose ps`
2. Check `DATABASE_URL` has correct port (5432)
3. Check connection pool exhaustion: `SELECT count(*) FROM pg_stat_activity`
4. Restart PostgreSQL: `docker compose restart postgres`
5. Verify `@prisma/adapter-pg` is installed

### Frontend Issues

**Problem**: Component not rendering, blank page
**Solutions**:
1. Check browser console for JavaScript errors
2. Verify page component exists: `dashboard/applications/page.tsx`
3. Check middleware not blocking access
4. Verify server component returning valid JSX
5. Check `error.tsx` and `global-error.tsx` implementations
6. Run `npm run typecheck` for TypeScript errors

**Problem**: Form submission failing silently
**Solutions**:
1. Check network tab in DevTools - API response
2. Verify Zod schema in `src/lib/validations.ts` matches form fields
3. Check error handling in API route
4. Inspect toast notifications (sonner) for error messages
5. Verify payload matches schema: `safeParse(body)`

**Problem**: Loading states stuck/infinite
**Solutions**:
1. Check API route returns response properly
2. Verify `setLoading(false)` in all code paths
3. Check for unhandled promise rejections
4. Verify no infinite loops in `useEffect`
5. Check React Query/SWR cache invalidation

### SSE (Real-time) Issues

**Problem**: SSE events not reaching client
**Solutions**:
1. Check `src/hooks/use-sse.ts` - connection established
2. Verify `src/api/events` endpoint returns proper headers: `Content-Type: text/event-stream`
3. Check browser DevTools → Network tab for EventSource
4. Verify `broadcast()` called in `src/lib/sse.ts`
5. Check for middleware blocking event stream

**Problem**: SSE connection closes unexpectedly
**Solutions**:
1. Check for unhandled errors in `/api/events`
2. Verify heartbeat interval (30 seconds)
3. Check nginx/load balancer timeout settings
4. Verify cleanup in `useEffect` return
5. Check browser memory for leak - reopen connection continuously

### Database Issues

**Problem**: Migration fails during deployment
**Solutions**:
1. Run locally first: `npm run db:migrate:dev`
2. Check for down migrations blocking
3. Verify no conflicting migrations in git
4. Review migration file for syntax errors
5. Test with `npx prisma migrate resolve --rolled-back [migration]`

**Problem**: "Cannot find module '@prisma/client'"
**Solutions**:
1. Regenerate Prisma client: `npx prisma generate`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check `schema.prisma` for syntax errors
4. Verify `@prisma/client` in package.json

### Payment Issues

**Problem**: PayMongo webhook not triggering
**Solutions**:
1. Verify webhook URL in PayMongo dashboard
2. Check `src/app/api/payments/webhook/route.ts` endpoint
3. Test with PayMongo test mode
4. Verify webhook signature in `src/lib/payments.ts`
5. Check `WebhookLog` table for failed events

**Problem**: Payment stuck in PENDING
**Solutions**:
1. Check PayMongo status: `GET payments/:id`
2. Verify webhook was received and processed
3. Check database for webhook processing errors
4. Manually update status if webhook lost: `UPDATE payment SET status='PAID'`
5. Check Nodemailer queue for email notifications

### Performance Issues

**Problem**: API response slow (>1s)
**Solutions**:
1. Check Prisma query: remove unnecessary includes
2. Add index: `@@index([userId, createdAt])`
3. Check N+1 queries - use `include:` not separate queries
4. Enable Redis caching: `src/lib/cache.ts`
5. Check database indexes: `\d table_name` in psql

**Problem**: Build time slow
**Solutions**:
1. Check bundle size: `npm run build` → analyze
2. Remove large dependencies
3. Use dynamic imports for admin pages
4. Check TypeScript compilation time
5. Verify no large images in public/

### File Upload Issues

**Problem**: File upload fails with "413 Payload Too Large"
**Solutions**:
1. Check nginx body_max_size (if behind reverse proxy)
2. Check Next.js `httpServer.maxHeaderSize` config
3. Verify file size < 10MB (typical limit)
4. Check S3/MinIO bucket permissions

**Problem**: File not accessible after upload
**Solutions**:
1. Verify S3/MinIO presigned URL generation
2. Check CORS configuration
3. Verify file permissions in storage
4. Check local upload directory: `./uploads/`
5. Verify magic bytes validation passed

### Email/SMS Issues

**Problem**: Emails not being sent
**Solutions**:
1. Check Nodemailer config in `src/lib/email.ts`
2. Verify SMTP credentials in `.env.local`
3. Check BullMQ queue: `await queue.count()`
4. Verify email template files exist
5. Test with `npm run dev` - check console for queue processing

**Problem**: SMS not delivering
**Solutions**:
1. Check Semaphore API key in `.env`
2. Verify SMS rate limits (Semaphore: 10/min)
3. Check phone number format (with +63 prefix)
4. Test with test mode first
5. Check SMS gateway quota/balance

## Debugging Tools

**TypeScript**:
```bash
npm run typecheck  # Check all TS errors
```

**Prisma**:
```bash
npm run db:studio  # Visual database explorer (port 5555)
npx prisma validate  # Check schema syntax
```

**Network**:
```bash
curl -X POST http://localhost:3000/api/applications -d '{...}'
```

**Database**:
```bash
psql -U postgres -d obps_db
SELECT * FROM "Application" LIMIT 5;
```

**Logs**:
- Browser console: `F12` → Console tab
- Server logs: terminal running `npm run dev`
- Application activity: `ActivityLog` table

