# Database Query Skill (`/database-query`)

**Purpose**: Generate Prisma queries, manage PostgreSQL operations, and handle schema migrations.

## Database Schema (17 Models)

**User & Access**: `User`, `Session`, `OtpToken`, `ActivityLog`
**Applications**: `Application`, `ApplicationHistory`, `ReviewAction`, `Clearance`, `ClearanceOffice`
**Documents**: `Document`
**Scheduling**: `ClaimSchedule`, `TimeSlot`, `SlotReservation`, `CheckInRecord`
**Claims**: `ClaimReference`
**Permits**: `Permit`, `PermitIssuance`
**Financial**: `Payment`, `WebhookLog`
**System**: `BusinessLocation`, `SystemSetting`

## Key Models & Relations

### Application Model
- Fields: `id`, `applicantId`, `businessName`, `applicationNumber`, `type` (NEW/RENEWAL/CLOSURE)
- Status: DRAFT, SUBMITTED, ENDORSED, UNDER_REVIEW, APPROVED, REJECTED
- Relations: applicant (User), documents (Document[]), clearances (Clearance[]), permit (Permit)

### Document Model
- Fields: `id`, `applicationId`, `fileName`, `url`, `status` (UPLOADED/PENDING_VERIFICATION/VERIFIED/REJECTED)
- Relations: application (Application)

### Payment Model
- Fields: `id`, `applicationId`, `amount`, `method` (GCASH/MAYA/BANK/OTC/CASH)
- Status: PENDING, PROCESSING, PAID, FAILED, REFUNDED, CANCELLED
- Relations: application (Application)

### ClaimSchedule & TimeSlot
- Schedule has many TimeSlots
- Slots have many SlotReservations
- Users reserve slots for claim pickup

## Common Queries

### Find Applications
```typescript
const apps = await prisma.application.findMany({
  where: { applicantId: userId, status: "SUBMITTED" },
  include: {
    applicant: { select: { firstName: true, lastName: true, email: true } },
    documents: true,
    clearances: true,
    permit: true,
  },
  orderBy: { createdAt: "desc" },
  take: 10,
});
```

### Create Payment
```typescript
const payment = await prisma.payment.create({
  data: {
    applicationId: appId,
    amount: new Decimal("2500.00"),
    method: "GCASH",
    referenceNumber: generateRefNumber(),
  },
});
```

### Update Application Status
```typescript
await prisma.$transaction([
  prisma.application.update({
    where: { id: appId },
    data: { status: "APPROVED" },
  }),
  prisma.applicationHistory.create({
    data: { applicationId: appId, fromStatus: "UNDER_REVIEW", toStatus: "APPROVED" },
  }),
]);
```

### Aggregate Analytics
```typescript
const stats = await prisma.application.groupBy({
  by: ["status"],
  _count: true,
  where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
});
```

## Transactions
```typescript
const result = await prisma.$transaction(async (tx) => {
  const app = await tx.application.update({ where: { id: appId }, data: { status: "APPROVED" } });
  const permit = await tx.permit.create({ data: { applicationId: appId, validUntil: futureDate } });
  await tx.payment.update({ where: { id: paymentId }, data: { status: "PAID" } });
  return { app, permit };
});
```

## Data Types

**Decimal**: Use for money fields
```typescript
amount: Decimal(12, 2)  // 99,999,999.99
```

**DateTime**: Timestamps
```typescript
createdAt: DateTime @default(now())
updatedAt: DateTime @updatedAt
```

**Enums**: Constrained values
```typescript
status: ApplicationStatus  // DRAFT | SUBMITTED | APPROVED | REJECTED
```

## Indexes
- `@@index([applicationId])` - Common lookups
- `@@unique([applicationNumber])` - Uniqueness
- `@@index([status, createdAt])` - Analytics queries
- `@@index([userId, createdAt])` - User-scoped data

## Migrations

```bash
# Create migration
npx prisma migrate dev --name add_business_type

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Validate schema
npx prisma validate
```

## N+1 Prevention
❌ Bad: Finding users without includes
```typescript
const apps = await prisma.application.findMany();
apps.forEach(app => console.log(app.applicant)); // N+1!
```

✅ Good: Use include or select
```typescript
const apps = await prisma.application.findMany({
  include: { applicant: true },
});
```

## Pagination
```typescript
const page = 1;
const take = 15;
const skip = (page - 1) * take;

const [items, total] = await Promise.all([
  prisma.application.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
  prisma.application.count(),
]);
```

## Performance Tips
1. Always use `include:` to fetch relations in single query
2. Use `select:` to limit returned fields
3. Add indexes on frequently filtered columns
4. Use `take:` for pagination instead of loading all
5. Cache read-heavy queries with Redis
6. Use transactions for consistency

