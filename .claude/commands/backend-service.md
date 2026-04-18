# Backend Service Skill (`/backend-service`)

**Purpose**: Create and modify Next.js 15 API route handlers, server actions, and lib modules for the Online Business Permit System.

## Current API Routes (18 Groups)

### Authentication (`/api/auth/`)
- `POST /auth/login` - Email/password login with lockout
- `POST /auth/register` - User registration
- `POST /auth/logout` - Session termination
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/forgot-password` - Password reset
- `POST /auth/2fa/setup` - TOTP setup
- `POST /auth/2fa/verify` - TOTP verification
- `GET /auth/[...nextauth]` - NextAuth callback

### Applications (`/api/applications/`)
- `GET/POST /applications` - List/create permit applications
- `GET/PUT /applications/[id]` - Retrieve/update application
- `POST /applications/[id]/review` - Submit for review
- `POST /applications/verify-registration` - Verify DTI/SEC
- `POST /applications/renewal` - Renewal applications
- `POST /applications/closure` - Closure applications
- `POST /applications/[id]/clearances` - Manage clearances

### Documents (`/api/documents/`)
- `POST /documents/upload` - Upload with validation
- `GET/POST /documents` - Manage documents
- `GET /documents/[id]` - Retrieve document

### Schedules & Claims (`/api/schedules/`, `/api/renewals/`)
- `GET/POST /schedules` - Manage claim schedules
- `POST /schedules/reserve` - Reserve time slot
- `POST /schedules/reschedule` - Reschedule
- `GET/POST /renewals/claim-schedule` - Renewal claiming
- `GET /renewals/history` - Renewal history
- `POST /renewals/documents` - Renewal documents

### Permits & Issuance (`/api/permits/`, `/api/issuance/`)
- `GET /permits` - List issued permits
- `GET /permits/[id]` - Permit details
- `POST /permits/[id]/print` - Generate permit PDF
- `GET /permits/[id]/prefill` - Prefill renewal
- `GET/POST /issuance` - Issuance workflow

### Payments (`/api/payments/`)
- `POST /payments` - Create payment
- `POST /payments/webhook` - PayMongo webhook
- `GET /payments/receipt/[id]` - Payment receipt

### Admin (`/api/admin/`)
- `GET/POST /admin/users` - User management
- `GET/PUT /admin/users/[id]` - User details
- `GET/POST /admin/locations` - Location mapping
- `DELETE /admin/locations/[id]` - Delete location
- `POST /admin/settings` - System settings
- `GET/POST /admin/reports/analytics` - Analytics
- `POST /admin/reports/export` - Export reports

### Public (`/api/public/`)
- `GET /public/track` - Public tracking
- `GET /public/verify-permit` - Permit verification
- `GET /analytics` - Application analytics
- `GET /profile` - User profile
- `POST /privacy/data` - Data export

### Monitoring
- `GET /api/events` - Server-Sent Events
- `GET /api/health` - Health check
- `GET /api/metrics` - Prometheus metrics

## Core Lib Modules (22 files)

**Authentication & Security**: `auth.ts`, `auth.config.ts`, `permissions.ts`, `two-factor.ts`, `sanitize.ts`, `rate-limit.ts`

**Data & Storage**: `prisma.ts`, `validations.ts`, `serialization.ts`, `storage.ts`

**Communications**: `email.ts`, `sms.ts`, `queue.ts`, `sse.ts`

**Business Logic**: `payments.ts`, `pdf.ts`, `application-helpers.ts`, `renewal.ts`, `locations.ts`, `government-api.ts`

**Infrastructure**: `cache.ts`, `logger.ts`, `monitoring.ts`, `utils.ts`, `i18n.ts`, `stores.ts`

## Best Practices

1. Always validate input with Zod before processing
2. Use Prisma includes to prevent N+1 queries
3. Sanitize user data before sending responses
4. Wrap all DB calls in try-catch blocks
5. Use transactions for multi-table operations
6. Check user role on protected endpoints
7. Return proper HTTP status codes (201, 400, 404, 500)
8. Queue background jobs instead of awaiting
9. Use TypeScript strict mode - no `as any`
10. Cache expensive queries with Redis

## Example: Create Application

```typescript
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const validated = applicationSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
  }

  try {
    const app = await prisma.application.create({
      data: { ...validated.data, applicantId: session.user.id },
      include: { applicant: { select: { id: true, email: true } } },
    });
    
    await queue.add('send-email', { to: app.applicant.email, template: 'created' });
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

## Common Issues

**"Unauthorized" on protected routes**: Check `src/middleware.ts` for role routing

**"N+1 query" performance**: Add Prisma `include:` to fetch relations

**Session not persisting**: Verify NextAuth config in `src/lib/auth.ts`

**PayMongo webhook failing**: Check HMAC-SHA256 signature verification

