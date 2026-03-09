# Backend Service — OBPS Next.js API Route Generator

## Purpose

Create, modify, and debug Next.js App Router API routes for the Online Business Permit System. Handles route handlers, Prisma queries, Zod validation, NextAuth session checks, and RBAC enforcement.

## Usage

```
/backend-service <description-of-what-to-build>
```

## Context

- **Framework**: Next.js 16 App Router (route handlers in `src/app/api/`)
- **ORM**: Prisma 7 with `@prisma/adapter-pg` (PrismaPg adapter)
- **Validation**: Zod 4 schemas in `src/lib/validations.ts`
- **Auth**: NextAuth v5 — `auth()` for server, Edge-safe config split
- **RBAC**: CASL.js in `src/lib/permissions.ts` (4 roles × 10 actions × 10 subjects)
- **Database**: PostgreSQL 16 — schema in `web/prisma/schema.prisma`
- **Cache**: Redis (ioredis) with in-memory Map fallback (`src/lib/cache.ts`)
- **Queue**: BullMQ for background jobs (`src/lib/queue.ts`)

## Architecture Rules

1. All API routes must be in `src/app/api/<resource>/route.ts` or `src/app/api/<resource>/[id]/route.ts`
2. Every route handler must start with session check: `const session = await auth()`
3. Use Zod schemas for ALL request body validation — never trust client input
4. Use Prisma transactions for multi-model writes
5. Return standardized JSON responses: `{ data, error, message }`
6. Apply rate limiting via `src/lib/rate-limit.ts` for sensitive endpoints
7. Sanitize user input via `src/lib/sanitize.ts` before storage
8. Log operations via `src/lib/logger.ts` (Winston)
9. Use try/catch with NextResponse error responses (400, 401, 403, 404, 500)

## API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  // define fields
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = bodySchema.parse(body);

    // Prisma operation
    const result = await prisma.model.create({
      data: { ...validated, userId: session.user.id },
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logger.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

## Existing API Route Groups

| Path                   | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `/api/auth/*`          | NextAuth endpoints + register, verify-otp, forgot-password |
| `/api/applications/*`  | CRUD, submit, verify-registration                          |
| `/api/documents/*`     | Upload, download, verify documents                         |
| `/api/payments/*`      | Create checkout, webhook, OTC recording                    |
| `/api/schedules/*`     | Create slots, reserve, reschedule                          |
| `/api/claims/*`        | Process claims, verify references                          |
| `/api/permits/*`       | Generate, download, verify permits                         |
| `/api/issuance/*`      | Manage permit issuance lifecycle                           |
| `/api/admin/*`         | Users CRUD, settings, reports                              |
| `/api/analytics/*`     | Dashboard analytics data                                   |
| `/api/events`          | SSE real-time event stream                                 |
| `/api/notifications/*` | In-app notification management                             |
| `/api/cron/*`          | Scheduled tasks (expire holds/permits)                     |
| `/api/public/*`        | Unauthenticated endpoints (verify-permit, track)           |

## Prisma Models (16 total)

User, Application, ApplicationHistory, Document, Payment, Permit, PermitIssuance, ClaimSchedule, TimeSlot, SlotReservation, ClaimReference, ReviewAction, SystemSetting, Notification, AuditLog, VerificationToken

## Checklist

- [ ] Route file placed in correct `src/app/api/` directory
- [ ] Session check with `auth()` at route start
- [ ] Role-based access check where needed
- [ ] Zod schema validation for all inputs
- [ ] Prisma query with proper `select`/`include` (no over-fetching)
- [ ] Error handling with appropriate HTTP status codes
- [ ] Input sanitization for user-generated content
- [ ] Rate limiting for sensitive operations
- [ ] Logger calls for audit trail
- [ ] TypeScript strict — no `any` types
