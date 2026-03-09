# Workflow Verificator — OBPS End-to-End Workflow Validation

## Purpose

Verify that complete business workflows function correctly across all layers: UI pages → API routes → Prisma queries → Database state → SSE notifications.

## Usage

```
/workflow-verificator <workflow-name-or-description>
```

## Verification Methodology

1. **Map the flow** — Identify all files involved (page → form → API → lib → DB)
2. **Check data contracts** — Zod schemas match Prisma models match API responses
3. **Verify state transitions** — Status enums flow correctly (e.g., DRAFT → SUBMITTED → UNDER_REVIEW)
4. **Test authorization** — Each step enforces correct role
5. **Confirm side effects** — Notifications sent, history logged, SSE broadcast

## Core Workflows to Verify

### 1. Application Lifecycle

```
Files:
  src/app/(dashboard)/dashboard/applications/new/page.tsx
  src/app/api/applications/route.ts
  src/app/api/applications/[id]/route.ts
  src/lib/validations.ts (applicationSchema)
  prisma/schema.prisma (Application, ApplicationHistory)

Flow: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
Roles: APPLICANT creates → STAFF/REVIEWER reviews → REVIEWER approves
Side effects: ApplicationHistory record, Notification, SSE event
```

### 2. Document Verification

```
Files:
  src/components/ui/file-upload.tsx
  src/app/api/documents/upload/route.ts
  src/app/(dashboard)/dashboard/verify-documents/page.tsx
  src/app/api/documents/[id]/route.ts
  src/lib/storage.ts

Flow: Upload → PENDING → VERIFIED/REJECTED
Roles: APPLICANT uploads → STAFF verifies
Validation: File type whitelist, magic bytes, size limit
```

### 3. Review & Approval

```
Files:
  src/app/(dashboard)/dashboard/review/page.tsx
  src/app/(dashboard)/dashboard/review/[id]/page.tsx
  src/app/api/applications/[id]/route.ts
  prisma/schema.prisma (ReviewAction)

Flow: View queue → Open detail → Check docs → Approve/Reject/Return
Roles: REVIEWER only
Side effects: ReviewAction record, status change, notification to applicant
```

### 4. Claim Scheduling

```
Files:
  src/app/(dashboard)/dashboard/schedule/page.tsx
  src/app/api/schedules/route.ts
  src/app/api/schedules/reserve/route.ts
  prisma/schema.prisma (ClaimSchedule, TimeSlot, SlotReservation)

Flow: Admin creates schedule → Applicant views slots → Reserves → Confirms
Roles: ADMIN/STAFF creates → APPLICANT reserves
Concurrency: Temporary hold to prevent double-booking
```

### 5. Permit Issuance

```
Files:
  src/app/(dashboard)/dashboard/issuance/page.tsx
  src/app/api/issuance/[id]/route.ts
  src/lib/pdf.ts
  prisma/schema.prisma (Permit, PermitIssuance)

Flow: Application APPROVED → Generate permit PDF with QR → PREPARED → ISSUED → RELEASED
Roles: STAFF manages issuance lifecycle
Side effects: PDF generation, QR code, notification to applicant
```

### 6. Payment Processing

```
Files:
  src/components/dashboard/pay-now-button.tsx
  src/app/api/payments/route.ts
  src/app/api/payments/webhook/route.ts
  src/lib/payments.ts

Flow: Create checkout → Redirect to gateway → Webhook confirmation → Status update
Roles: APPLICANT pays online, STAFF records OTC
Verification: Webhook signature, idempotent processing
```

## Verification Checklist Template

For each workflow, verify:

- [ ] All files exist and export correct functions
- [ ] Zod schema matches the form fields
- [ ] API route validates input with Zod
- [ ] API route checks session and role
- [ ] Prisma query matches schema model
- [ ] Status transitions are valid (check enum values)
- [ ] Error cases return appropriate HTTP status codes
- [ ] Side effects fire (notifications, history, SSE)
- [ ] UI handles loading, error, and success states
- [ ] E2E test exists or can be written
