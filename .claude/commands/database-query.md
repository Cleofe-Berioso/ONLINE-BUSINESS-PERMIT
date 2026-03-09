# Database Query — OBPS Prisma & PostgreSQL Operations

## Purpose

Write, optimize, and debug Prisma queries, migrations, and schema changes for the Online Business Permit System's PostgreSQL 16 database.

## Usage

```
/database-query <description-of-data-operation>
```

## Context

- **ORM**: Prisma 7 with `@prisma/adapter-pg` (PrismaPg driver adapter)
- **Database**: PostgreSQL 16 (via Docker or hosted)
- **Schema**: `web/prisma/schema.prisma` (~500 lines, 16 models, 11 enums)
- **Client**: `src/lib/prisma.ts` — singleton instance with `$extends`
- **Config**: `web/prisma.config.ts` — Prisma config with PrismaPg adapter

## Schema Overview

### Core Models

| Model              | Key Fields                                         | Relations                                     |
| ------------------ | -------------------------------------------------- | --------------------------------------------- |
| User               | id, email, role (enum), status, password           | applications, documents, notifications        |
| Application        | id, userId, status (enum), businessName, type      | documents, payments, history, reviews, permit |
| ApplicationHistory | id, applicationId, status, changedBy               | application, user                             |
| Document           | id, applicationId, type (enum), status, filePath   | application, user                             |
| Payment            | id, applicationId, amount, method (enum), status   | application                                   |
| Permit             | id, applicationId, permitNumber, qrCode, expiresAt | application                                   |
| PermitIssuance     | id, permitId, status (enum)                        | permit                                        |

### Scheduling Models

| Model           | Key Fields                                   |
| --------------- | -------------------------------------------- |
| ClaimSchedule   | id, date, maxSlots                           |
| TimeSlot        | id, scheduleId, startTime, endTime, capacity |
| SlotReservation | id, slotId, userId, status                   |
| ClaimReference  | id, applicationId, referenceNumber, status   |

### System Models

| Model             | Key Fields                                    |
| ----------------- | --------------------------------------------- |
| ReviewAction      | id, applicationId, reviewerId, action, notes  |
| SystemSetting     | id, key, value, description                   |
| Notification      | id, userId, type, title, message, read        |
| AuditLog          | id, userId, action, entity, entityId, details |
| VerificationToken | id, identifier, token, expires, used          |

### Key Enums

- `UserRole`: APPLICANT, STAFF, REVIEWER, ADMINISTRATOR
- `UserStatus`: ACTIVE, INACTIVE, SUSPENDED, PENDING
- `ApplicationStatus`: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED
- `ApplicationType`: NEW, RENEWAL
- `DocumentType`: DTI, BIR, SEC, BARANGAY_CLEARANCE, ZONING, FIRE_SAFETY, LEASE, CEDULA, ID_PHOTO, OTHER
- `DocumentStatus`: PENDING, VERIFIED, REJECTED
- `PaymentMethod`: GCASH, MAYA, BANK_TRANSFER, CASH, OTHER
- `PaymentStatus`: PENDING, PAID, FAILED, REFUNDED, EXPIRED
- `IssuanceStatus`: PREPARED, ISSUED, RELEASED, COMPLETED

## Common Query Patterns

### Pagination with cursor

```typescript
const applications = await prisma.application.findMany({
  where: { userId: session.user.id, status: { not: "DRAFT" } },
  orderBy: { createdAt: "desc" },
  take: limit + 1,
  cursor: cursor ? { id: cursor } : undefined,
  include: { documents: true, payments: true },
});
```

### Aggregate queries

```typescript
const stats = await prisma.application.groupBy({
  by: ["status"],
  _count: { id: true },
  where: { createdAt: { gte: startDate } },
});
```

### Transaction for multi-model write

```typescript
const result = await prisma.$transaction(async (tx) => {
  const application = await tx.application.update({
    where: { id },
    data: { status: "APPROVED" },
  });
  await tx.applicationHistory.create({
    data: { applicationId: id, status: "APPROVED", changedById: reviewerId },
  });
  const permit = await tx.permit.create({
    data: {
      applicationId: id,
      permitNumber: generatePermitNumber(),
      expiresAt: oneYearFromNow,
    },
  });
  return { application, permit };
});
```

### Optimistic concurrency

```typescript
const updated = await prisma.slotReservation.updateMany({
  where: { id: reservationId, status: "PENDING" }, // ensure status hasn't changed
  data: { status: "CONFIRMED" },
});
if (updated.count === 0) throw new Error("Slot already claimed");
```

## Migration Commands

```bash
# Generate migration from schema changes
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## Performance Guidelines

1. Always use `select` or `include` — never fetch entire models when only a few fields are needed
2. Add database indexes for frequently filtered/sorted columns
3. Use `prisma.$transaction()` for atomic multi-model operations
4. Leverage Redis caching (`src/lib/cache.ts`) for frequently read, rarely written data
5. Use cursor-based pagination for large datasets (not offset)
6. Use `@@index` in schema for composite query patterns
7. Monitor with `prisma.$on('query')` in development

## Checklist

- [ ] Schema change reflected in `prisma/schema.prisma`
- [ ] Migration generated and tested (`npx prisma migrate dev`)
- [ ] Proper `select`/`include` to avoid over-fetching
- [ ] Transactions for multi-model writes
- [ ] Error handling for unique constraint violations
- [ ] Indexes for query patterns that do full-table scans
- [ ] Seed data updated in `prisma/seed.js` if needed
