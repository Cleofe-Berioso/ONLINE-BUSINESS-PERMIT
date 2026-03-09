# OBPS: COWORK Scenario-Based Validation and Multi-Agent Testing

## Context

The Online Business Permit System has unit tests (Vitest), E2E tests (Playwright), and accessibility tests (axe-core), but lacks coordinated multi-agent scenario validation that exercises full user journeys end-to-end across all 4 roles. This plan uses Claude Code Agent Teams (COWORK) to parallelize validation.

## 1. COWORK Team Structure

### Team 1: Auth and Access Validation

- Focus: Registration, OTP, Login, Session, Role enforcement
- Validate all 4 test accounts can login
- Verify RBAC: APPLICANT cannot access /dashboard/admin/\*
- Test session expiration (30-minute JWT timeout)
- Test account lockout after failed attempts

### Team 2: Application Lifecycle Validation

- Focus: DRAFT to SUBMITTED to UNDER_REVIEW to APPROVED to PERMIT
- Create application as APPLICANT
- Upload all required documents
- Verify STAFF can see in verification queue
- Verify REVIEWER can approve/reject
- Confirm ApplicationHistory records at each step
- Verify SSE notifications fire on status change

### Team 3: Scheduling and Claims Validation

- Focus: Schedule creation, Slot reservation, Claim processing
- ADMIN creates claim schedule with time slots
- APPLICANT reserves a slot
- Concurrency test: two users attempt same slot
- STAFF processes walk-in claim

### Team 4: Payment and Permit Issuance Validation

- Focus: Fee calculation, Payment, Permit generation, Issuance
- Verify fee calculation for NEW vs RENEWAL
- Test PayMongo checkout creation (test mode)
- Simulate webhook callback and status update
- Confirm permit PDF generated with QR code
- Test public permit verification

### Team 5: Cross-Cutting Concerns

- Rate limiting enforcement on login endpoint
- CSP headers present on all responses
- Redis cache hit/miss verification
- File upload validation (type, size, magic bytes)
- Input sanitization (XSS payloads rejected)
- i18n toggle between English and Filipino

## 2. Scenario Definitions

### Scenario 1: Happy Path - New Business Permit

Roles: APPLICANT, STAFF, REVIEWER

Steps:

1. APPLICANT registers and verifies email (OTP)
2. APPLICANT logs in, creates new application
3. APPLICANT uploads DTI, BIR, Barangay Clearance, etc.
4. APPLICANT submits application
5. STAFF verifies all documents
6. REVIEWER reviews and approves application
7. System generates permit PDF with QR code
8. APPLICANT pays via GCash (PayMongo test mode)
9. STAFF prepares and issues permit
10. APPLICANT claims permit

Validation:

- Application status: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED
- ApplicationHistory has 4 records
- Permit record exists with valid permitNumber and QR
- Payment record exists with status PAID
- PermitIssuance: PREPARED, ISSUED, RELEASED
- Notifications sent at steps 5, 6, 8, 9

### Scenario 2: Application Rejection and Resubmission

Steps:

1. APPLICANT submits application with missing document
2. REVIEWER returns application with notes
3. APPLICANT receives notification with rejection reason
4. APPLICANT uploads missing document and resubmits
5. REVIEWER approves on second review

Validation:

- ReviewAction records exist for both reviews
- Status flow: SUBMITTED, UNDER_REVIEW, REJECTED, SUBMITTED, APPROVED

### Scenario 3: Permit Renewal

Steps:

1. APPLICANT with existing permit starts renewal
2. System pre-fills business info from previous permit
3. Reduced document requirements for renewal
4. Renewal fee calculated (lower than new permit)

### Scenario 4: Concurrent Slot Reservation

Steps:

1. ADMIN creates schedule with 1 remaining slot
2. Two APPLICANTs attempt to reserve simultaneously
3. One succeeds, one gets "slot unavailable" error

Validation:

- Only 1 SlotReservation created
- No double-booking in database

### Scenario 5: Public Permit Verification

Steps:

1. Scan QR code from issued permit (no auth required)
2. System displays permit validity
3. Valid permit shows VALID, expired shows EXPIRED

## 3. Satisfaction Scorecard

### Grading Thresholds

| Score    | Grade | Meaning                               |
| -------- | ----- | ------------------------------------- |
| 95-100   | A+    | Production-ready, all scenarios pass  |
| 90-94    | A     | Minor issues, all critical paths pass |
| 80-89    | B+    | Some non-critical failures            |
| 70-79    | B     | Multiple failures, needs attention    |
| Below 70 | C/F   | Critical failures, do not deploy      |

### Scoring Weights

| Category              | Weight | Measures                            |
| --------------------- | ------ | ----------------------------------- |
| Auth and Access       | 20%    | Login, RBAC, session, lockout       |
| Application Lifecycle | 25%    | CRUD, status transitions, history   |
| Document Management   | 15%    | Upload, verify, storage             |
| Payment Processing    | 15%    | Checkout, webhook, OTC              |
| Scheduling and Claims | 10%    | Slots, reservations, claims         |
| Permit Issuance       | 10%    | PDF, QR, verification               |
| Cross-Cutting         | 5%     | Security headers, rate limits, i18n |

## 4. Running COWORK Validation

### Quick Start

```bash
# Start all services
docker-compose up -d

# Seed test data
cd web && npx prisma db seed

# Run unit tests
npm test -- --run

# Run E2E tests
npx playwright test
```

### COWORK Command

```
/cowork Validate the OBPS using the scenario definitions in CLAUDE-COWORK.md.
Assign teams as defined. Each team validates their scenarios and reports back.
Produce the satisfaction scorecard.
```

### Test Accounts (from seed.js)

| Role          | Email              | Password  |
| ------------- | ------------------ | --------- |
| APPLICANT     | applicant@test.com | Test1234! |
| STAFF         | staff@test.com     | Test1234! |
| REVIEWER      | reviewer@test.com  | Test1234! |
| ADMINISTRATOR | admin@test.com     | Test1234! |

### Key File References

| Area         | Files                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| Auth         | src/lib/auth.ts, src/lib/auth.config.ts, src/middleware.ts               |
| Applications | src/app/api/applications/_, src/app/(dashboard)/dashboard/applications/_ |
| Documents    | src/app/api/documents/\*, src/lib/storage.ts                             |
| Payments     | src/lib/payments.ts, src/app/api/payments/\*                             |
| Scheduling   | src/app/api/schedules/\*, prisma/schema.prisma (ClaimSchedule, TimeSlot) |
| Permits      | src/lib/pdf.ts, src/app/api/permits/_, src/app/(public)/verify-permit/_  |
| SSE          | src/lib/sse.ts, src/hooks/use-sse.ts, src/app/api/events/\*              |
| RBAC         | src/lib/permissions.ts                                                   |
| Testing      | vitest.config.ts, playwright.config.ts, src/**tests**/_, e2e/_           |
