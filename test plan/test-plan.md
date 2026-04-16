# OBPS Comprehensive Test Plan

**Project**: Online Business Permit System (OBPS)
**Status**: Phase 1-3 Complete (Core Implementation) | Phase 4-7 Reserved (Features)
**Test Coverage**: Currently 6% (11/191 artifacts tested)
**Target Coverage**: 50%+ by end of Phase 4
**Updated**: 2026-04-15

---

## 📊 Executive Summary

### Current Testing Landscape

| Category | Count | Tested | Coverage | Priority |
|----------|-------|--------|----------|----------|
| **Lib Modules** | 26 | 7 | 27% | MEDIUM |
| **API Routes** | 62 | 0 | 0% | **CRITICAL** |
| **Components** | 47 | 4 | 8% | **CRITICAL** |
| **Page Files** | 46 | 0 | 0% | HIGH |
| **Database Models** | 18 | Schema-validated | 100% | ✓ |
| **E2E Workflows** | 3 specs | Partial | 15% | HIGH |
| **Total** | 191 | 11 | 6% | — |

### Existing Test Infrastructure

✅ **Unit Tests** (880 lines)
- 7 test files using Vitest
- 170 tests (auth, permissions, rate-limit, 2FA, sanitization, validation)
- 100% passing

✅ **Component Tests** (4 files)
- Basic UI component testing with @testing-library/react
- Limited coverage of complex dashboard components

✅ **E2E Tests** (3 Playwright specs)
- Landing page, login, accessibility
- Basic happy paths only

❌ **API Route Tests** (0 tests)
- No request/response validation
- No error handling verification
- No authentication/authorization testing
- No business logic validation

❌ **Integration Tests** (0 tests)
- No PayMongo webhook simulation
- No file upload to S3/MinIO
- No email delivery verification
- No SSE event streaming
- No database transaction validation

---

## 🎯 Testing Strategy

### Three-Tier Approach

#### Tier 1: Unit Tests (Fast, Isolated)
- Individual functions and business logic
- Mocked external dependencies
- Execution: <100ms per test
- Target: 80%+ function coverage

#### Tier 2: Integration Tests (Medium, Realistic)
- API routes with mocked DB transactions
- External service integration (PayMongo, S3, Email)
- Execution: 100-500ms per test
- Target: All critical paths

#### Tier 3: E2E Tests (Slow, Full-Stack)
- Complete user workflows through browser
- Real database (test instance)
- Execution: 500ms-5s per test
- Target: Core user journeys + admin workflows

---

## 📋 Test Plan by Category

### CATEGORY 1: API ROUTES (62 endpoints, 0 tested)

#### 1A. Authentication Routes (9 endpoints)

**Routes:**
- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/login` - Credentials login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/resend-otp` - Resend OTP code
- `POST /api/auth/forgot-password` - Password reset initiation
- `POST /api/auth/logout` - Session termination
- `POST /api/auth/2fa/setup` - 2FA initialization
- `POST /api/auth/2fa/verify` - 2FA token verification

**Unit Tests** (40 tests)

```
POST /api/auth/register
├─ ✓ Valid registration creates user with PENDING status
├─ ✓ OTP token generated and sent to email
├─ ✗ Reject duplicate email
├─ ✗ Reject weak password
├─ ✗ Reject invalid email format
├─ ✗ Rate limit: 10 req/min
├─ ✗ Return 200 with user ID
└─ ✗ Activity log recorded

POST /api/auth/login
├─ ✗ Accept valid email + password
├─ ✗ Reject invalid password
├─ ✗ Reject PENDING account
├─ ✗ Reject SUSPENDED account
├─ ✗ Update lastLoginAt timestamp
├─ ✗ Create session with JWT
├─ ✗ Return user role in token
├─ ✗ Rate limit: 10 req/min
├─ ✗ Can't brute force (rate limited)
└─ ✗ Activity log recorded

POST /api/auth/verify-otp
├─ ✗ Accept valid OTP code
├─ ✗ Reject expired OTP
├─ ✗ Reject wrong OTP
├─ ✗ Mark user as ACTIVE
├─ ✗ Rate limit: 5 req/15min
├─ ✗ Clean up used OTP
└─ ✗ Return success response

POST /api/auth/2fa/setup
├─ ✗ Generate TOTP secret
├─ ✗ Return QR code data URL
├─ ✗ Return backup codes (8)
├─ ✗ Require auth (role: APPLICANT+)
└─ ✗ Don't enable until verified

POST /api/auth/2fa/verify
├─ ✗ Accept valid TOTP token
├─ ✗ Enable 2FA on account
├─ ✗ Mark backup codes as active
└─ ✗ Clear temp 2FA secret

Subtotal: 40 tests | Est. 2 days
```

#### 1B. Application Routes (8 routes)

**Routes:**
- `POST /api/applications` - Create application
- `GET /api/applications` - List applications
- `GET /api/applications/[id]` - Get application detail
- `POST /api/applications/check-duplicate` - Check existing permits
- `PUT /api/applications/[id]/revise` - Edit draft application
- `POST /api/applications/[id]/submit` - Submit for review
- `GET /api/applications/[id]/review` - Get review status
- `PUT /api/applications/[id]/review` - Post review action (approve/reject)

**Unit Tests** (50 tests)

```
POST /api/applications
├─ ✗ Create NEW application with draft status
├─ ✗ Create RENEWAL application with existing permit
├─ ✗ Create CLOSURE application
├─ ✗ Validate required fields
├─ ✗ Store business info (name, address, type, TIN, etc.)
├─ ✗ Generate application number
├─ ✗ Only APPLICANT can create
├─ ✓ Return 201 with application ID
├─ ✗ Record activity log
├─ ✗ Send confirmation email
└─ ✗ Broadcast SSE event

GET /api/applications
├─ ✗ List all apps for APPLICANT (own only)
├─ ✗ List all apps for STAFF (all)
├─ ✗ Pagination (20 per page)
├─ ✗ Filter by status (DRAFT, SUBMITTED, APPROVED)
├─ ✗ Filter by type (NEW, RENEWAL, CLOSURE)
├─ ✗ Sort by creation date (descending)
└─ ✗ Return applications with timeline

GET /api/applications/[id]
├─ ✗ Return full application detail
├─ ✗ Include timeline (status history)
├─ ✗ Include documents (if uploaded)
├─ ✗ Include clearances (if initiated)
├─ ✗ Include review actions (if reviewed)
├─ ✗ Verify user has access (own app or staff)
└─ ✗ Return 404 for nonexistent app

POST /api/applications/check-duplicate
├─ ✗ Detect NEW app with same business name
├─ ✗ Allow RENEWAL if previous permit ACTIVE
├─ ✗ Allow RENEWAL if expired <6 months
├─ ✗ Block RENEWAL if no valid permit
├─ ✗ Allow CLOSURE
├─ ✗ Return suggested type
└─ ✗ No document required yet (just check)

PUT /api/applications/[id]/revise
├─ ✗ Only edit DRAFT applications
├─ ✗ Update partial fields
├─ ✗ Validate updated fields
├─ ✗ Update updatedAt timestamp
├─ ✗ Record edit in activity log
└─ ✗ Return 403 if not DRAFT

POST /api/applications/[id]/submit
├─ ✗ Require DRAFT status
├─ ✗ Check all required documents present
├─ ✗ Validate all fields populated
├─ ✗ Change status to SUBMITTED
├─ ✗ Create application timeline entry
├─ ✗ Send confirmation email to STAFF
├─ ✗ Broadcast SSE event
├─ ✗ Return 400 if documents missing
└─ ✗ Only applicant can submit

GET /api/applications/[id]/review
├─ ✗ Return review status (ready/pending)
├─ ✗ List pending review actions
├─ ✗ Return reviewer comments
└─ ✗ Return timeline

PUT /api/applications/[id]/review
├─ ✗ Require REVIEWER role
├─ ✗ Accept APPROVE action → status ENDORSED
├─ ✗ Accept REJECT action → needs resubmit
├─ ✗ Accept REQUEST_REVISION → ask for changes
├─ ✗ Store reviewer name and timestamp
├─ ✗ Send decision email to applicant
├─ ✗ Broadcast SSE event
├─ ✗ Create review action record
├─ ✗ Return 403 if not REVIEWER
└─ ✗ Record activity log

Subtotal: 50 tests | Est. 3 days
```

#### 1C. Document Routes (3 routes)

**Routes:**
- `POST /api/documents/upload` - Upload application document
- `GET /api/documents/[id]` - Get document detail
- `PUT /api/documents/[id]/verify` - Verify document (staff action)

**Unit Tests** (30 tests)

```
POST /api/documents/upload
├─ ✗ Accept PDF, JPG, PNG file types
├─ ✗ Validate magic bytes (not just extension)
├─ ✗ Check file size <50MB
├─ ✗ Store in S3/MinIO with random path
├─ ✗ Create Document record
├─ ✗ Associate with application
├─ ✗ Initial status: PENDING
├─ ✗ Generate thumbnail (images)
├─ ✗ Rate limit: 20 uploads/min per user
├─ ✗ Virus scan stub (placeholder)
├─ ✗ Return document ID
├─ ✗ Return presigned URL for download
└─ ✗ Record activity log

Reject Cases:
├─ ✗ Reject JPEG file claiming to be PDF (magic bytes check)
├─ ✗ Reject file >50MB (413 Payload Too Large)
├─ ✗ Reject .exe, .bat, .sh (dangerous types)
├─ ✗ Reject empty file
└─ ✗ Reject missing file

GET /api/documents/[id]
├─ ✗ Return document metadata
├─ ✗ Return status (PENDING/VERIFIED/REJECTED)
├─ ✗ Return presigned download URL (expires in 1h)
├─ ✗ Return verification notes (if any)
├─ ✗ Only applicant (own doc) or staff can view
└─ ✗ Return 404 if not found

PUT /api/documents/[id]/verify
├─ ✗ Require STAFF role
├─ ✗ Accept approval → status VERIFIED
├─ ✗ Accept rejection → status REJECTED with reason
├─ ✗ Add verification notes
├─ ✗ Record verifier name and timestamp
├─ ✗ Send email to applicant (approved/rejected)
├─ ✗ Broadcast SSE event
├─ ✗ Record activity log
└─ ✗ Return 400 if already verified/rejected

Subtotal: 30 tests | Est. 2 days
```

#### 1D. Payment Routes (2 routes)

**Routes:**
- `POST /api/payments` - Create payment intent (PayMongo)
- `POST /api/payments/webhook` - PayMongo webhook handler

**Unit Tests** (40 tests)

```
POST /api/payments
├─ ✗ Load application and calculate fee
├─ ✗ Support 5 methods: GCash, Maya, bank transfer, OTC, cash
├─ ✗ Create PayMongo Checkout Session
├─ ✗ Store payment record (PENDING)
├─ ✗ Generate payment reference number
├─ ✗ Return checkout URL
├─ ✗ Rate limit: 5 req/min per user
├─ ✗ Only applicant can create (own application)
├─ ✗ Application must be ENDORSED status
├─ ✗ Return 402 if fee not configured
└─ ✗ Record activity log

Payment Method Validation:
├─ ✗ GCash: validate GCASH payment type
├─ ✗ Maya: validate MAYA payment type
├─ ✗ Bank: validate BANK_TRANSFER payment type
├─ ✗ OTC: generate OTC reference
└─ ✗ Cash: mark for counter payment

Error Cases:
├─ ✗ Return 404 if app not found
├─ ✗ Return 403 if not ENDORSED
├─ ✗ Return 400 if method unsupported
└─ ✗ Return 503 if PayMongo unreachable

POST /api/payments/webhook
├─ ✗ Verify PayMongo signature (HMAC)
├─ ✗ Accept payment.succeeded event
├─ ✗ Update Payment status to COMPLETED
├─ ✗ Auto-generate Permit (PDF with QR)
├─ ✗ Change Application status to APPROVED
├─ ✗ Send payment confirmation email
├─ ✗ Send permit to applicant
├─ ✗ Broadcast SSE event (permit_issued)
├─ ✗ Record activity log
├─ ✗ Return 202 to skip retries
├─ ✗ Reject duplicate webhook (idempotency)
├─ ✗ Handle failed payment events
└─ ✗ Return 403 if signature invalid

Failure Handling:
├─ ✗ payment.failed: Update status to FAILED
├─ ✗ payment.expired: Update status to EXPIRED
└─ ✗ Refund logic (POST /api/payments/{id}/refund)

Subtotal: 40 tests | Est. 2-3 days
```

#### 1E. Permits, Schedules, Claims Routes (13 routes total)

**Routes:**
- `GET /api/permits/[id]` - Get permit
- `GET /api/permits/[id]/pdf` - Download permit PDF
- `GET /api/permits/[id]/prefill` - Prefill renewal form
- `GET /api/schedules` - List available slots
- `POST /api/schedules/reserve` - Book claim slot
- `PUT /api/schedules/reschedule` - Change reservation
- `GET /api/claims/today` - Staff: today's claims
- `POST /api/claims/[id]/check-in` - Check in claim
- `POST /api/claims/[id]/release` - Release permit to applicant (with ref number + QR)
- `GET /api/public/verify-permit` - Public permit verification

**Unit Tests** (50 tests)

```
GET /api/permits/[id]
├─ ✗ Return permit number, business info, validity
├─ ✗ Return status (ACTIVE/EXPIRED/REVOKED)
├─ ✗ Return issue/expiry dates
├─ ✗ Only owner or STAFF can view
└─ ✗ Return 404 if not found

GET /api/permits/[id]/pdf
├─ ✗ Stream PDF file from S3/MinIO
├─ ✗ include Content-Disposition header
├─ ✗ Verify access rights
├─ ✗ Log download activity
└─ ✗ Return 404 if not found or not generated

GET /api/permits/[id]/prefill
├─ ✗ Get previous permit data
├─ ✗ Auto-fill renewal form
├─ ✗ Return business name, type, address
├─ ✗ Show previous issue/expiry dates
├─ ✗ Only owner can access
└─ ✗ Pre-check renewal eligibility

GET /api/schedules
├─ ✗ List available dates (next 30 days)
├─ ✗ Show time slots for each date
├─ ✗ Show remaining capacity
├─ ✗ Filter out blocked dates
├─ ✗ Only applicants with approved permits can view
├─ ✗ Real-time availability (not cached)
└─ ✗ Return with pagination

POST /api/schedules/reserve
├─ ✗ Verify permit exists and ACTIVE
├─ ✗ Check slot capacity available
├─ ✗ Create SlotReservation record
├─ ✗ Decrement slot capacity
├─ ✗ Generate confirmation number
├─ ✗ Send confirmation email
├─ ✗ Broadcast SSE (slot_availability_changed)
├─ ✗ Allow rescheduling if not within 24h
└─ ✗ Create temporary hold (7-day timeout)

Error Cases:
├─ ✗ 404: Permit not found
├─ ✗ 403: Not owner of permit
├─ ✗ 400: Slot already full
├─ ✗ 400: Slot is blocked
└─ ✗ 400: Already have active reservation

PUT /api/schedules/reschedule
├─ ✗ Cancel old reservation
├─ ✗ Restore old slot capacity
├─ ✗ Create new reservation
├─ ✗ Can't reschedule within 24h
├─ ✗ Send rescheduling email
├─ ✗ Broadcast SSE event
└─ ✗ Record activity log

GET /api/claims/today
├─ ✗ Require STAFF role
├─ ✗ List today's reservations
├─ ✗ Show applicant name, business, time
├─ ✗ Show status (RESERVED/CHECKED_IN/COMPLETED/NO_SHOW)
└─ ✗ Sort by time slot

POST /api/claims/[id]/check-in
├─ ✗ Require STAFF role
├─ ✗ Mark as CHECKED_IN
├─ ✗ Record check-in time
├─ ✗ Broadcast SSE event
└─ ✗ Update status in real-time

POST /api/claims/[id]/release
├─ ✗ Require STAFF role
├─ ✗ Generate claim reference (CLAIM-YYYYMMDD-XXXXXX)
├─ ✗ Generate QR code (encodes reference)
├─ ✗ Mark as COMPLETED
├─ ✗ Create ClaimReference record
├─ ✗ Send email with reference + QR
├─ ✗ Allow for permit pickup
├─ ✗ Broadcast SSE event (permit_released)
├─ ✗ Record activity log
└─ ✗ Return reference for printing

GET /api/public/verify-permit
├─ ✗ Accept reference number or permit number
├─ ✗ Require valid QR code or ref match
├─ ✗ No authentication needed
├─ ✗ Return: businessName, permitNumber, validUntil, status
├─ ✗ Return 404 if not found
└─ ✗ Allow any public user to verify

Subtotal: 50 tests | Est. 3 days
```

#### 1F. Admin Routes (10 routes)

**Routes:**
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user (admin)
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Deactivate user
- `GET /api/admin/schedules` - List schedules
- `POST /api/admin/schedules` - Create schedule
- `PUT /api/admin/schedules/[id]/block` - Block date
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/reports` - Admin reports

**Unit Tests** (30 tests - abbreviated)

```
All admin routes:
├─ ✗ Require ADMINISTRATOR role
├─ ✗ Log all admin actions
├─ ✗ Support pagination
├─ ✗ Support filtering
├─ ✗ Support sorting
└─ ✗ Reference data management (clearance offices, fee structure)

Subtotal: 30 tests | Est. 2 days
```

---

### CATEGORY 2: LIBRARY MODULES (26 files, 257 exports)

#### 2A. Critical Untested Modules (5 high-priority)

**Module: `application-helpers.ts`** (680 lines, 15 exports)
```
Functions to test:
├─ getClearanceRequirements(type, businessType)
├─ validateRenewalPermit(permitId)
├─ checkDuplicateApplication(businessName, type)
├─ generateApplicationNumber()
├─ calculateApplicationFee(type, businessType)
├─ validateApplicationSubmission(appId)
├─ createApplicationTimeline(appId, status)
├─ updateApplicationStatus(appId, newStatus)
├─ checkApprovalReadiness(appId)
├─ getApplicationSummary(appId)
└─ [10+ more]

Tests: 40 unit tests | Est. 2 days
```

**Module: `payments.ts`** (327 lines, 15 exports)
```
Functions to test:
├─ createPaymentIntent(appId, method)
├─ calculateFee(applicationType, businessType)
├─ verifyPaymongoSignature(payload, signature)
├─ processPaymentSuccess(paymentId)
├─ processPaymentFailure(paymentId)
├─ refundPayment(paymentId)
├─ getPaymentStatus(paymentId)
└─ [8+ more]

Tests: 35 unit tests + 10 integration tests | Est. 3 days
```

**Module: `email.ts`** (484 lines, 11 exports)
```
Functions to test:
├─ sendRegistrationEmail(user)
├─ sendApplicationConfirmationEmail(app)
├─ sendApplicationStatusEmail(app, status)
├─ sendDocumentVerificationEmail(app, doc)
├─ sendPermitIssuedEmail(app, permit)
├─ sendPaymentConfirmationEmail(app, payment)
├─ sendClaimConfirmationEmail(app, slot)
└─ [4+ more]

Tests: 30 unit tests (mocked SMTP) | Est. 2 days
```

**Module: `sse.ts`** (333 lines, 16 exports)
```
Functions to test:
├─ broadcastApplicationStatusChanged(userId, appId, status)
├─ broadcastDocumentVerified(userId, appId, docId)
├─ broadcastPermitIssued(userId, permitId)
├─ broadcastClaimScheduled(userId, appointmentId)
├─ broadcastSlotAvailabilityChanged(scheduleId)
├─ broadcastClearanceUpdated(userId, appId)
└─ [10+ more]

Tests: 25 unit tests (mocked client streams) | Est. 2 days
```

**Module: `storage.ts`** (295 lines, 12 exports)
```
Functions to test:
├─ uploadFile(file, path)
├─ downloadFile(path)
├─ generatePresignedUrl(path, expires)
├─ deleteFile(path)
├─ listFiles(prefix)
├─ validateFileSize(file)
├─ validateMimeType(file)
└─ [5+ more]

Tests: 30 unit tests (mocked S3/MinIO) | Est. 2 days
```

---

#### 2B. Medium Priority Modules (6 modules)

**Queue, Cache, SMS, PDF, Schedules, Government API**
```
Tests: 25-30 tests each
Total: ~150 tests | Est. 7-8 days
```

---

### CATEGORY 3: REACT COMPONENTS (47 components)

#### 3A. Critical Dashboard Components (6)

**Priority: HIGH - Large, Complex, User-Facing**

| Component | Lines | Priority | Tests Needed |
|-----------|-------|----------|--------------|
| `permit-application-client.tsx` | 772 | CRITICAL | 25 tests |
| `admin-users-client.tsx` | 562 | HIGH | 20 tests |
| `document-review-dashboard.tsx` | 546 | HIGH | 25 tests |
| `admin-applications-client.tsx` | 272 | HIGH | 15 tests |
| `admin-reports-client.tsx` | 156 | MEDIUM | 12 tests |
| `sidebar.tsx` | 522 | MEDIUM | 15 tests |

**Sample Tests for `permit-application-client.tsx`:**

```
Component: permit-application-client (multi-step form for permit app)

Tests:
├─ ✗ Render form for NEW application type
├─ ✗ Render form for RENEWAL application type
├─ ✗ Render form for CLOSURE application type
├─ ✗ Load existing draft and populate fields
├─ ✗ Validate required field on blur
├─ ✗ Show error message for invalid input
├─ ✗ Enable button only when form valid
├─ ✗ POST to /api/applications on submit
├─ ✗ Show loading spinner while submitting
├─ ✗ Show success toast after submission
├─ ✗ Show error toast on API failure
├─ ✗ Save draft on interval
├─ ✗ Warn before leaving with unsaved changes
├─ ✗ Auto-fill address fields from business lookup
├─ ✗ Support multi-step navigation
├─ ✗ Show business type dropdown options
├─ ✗ Calculate fee preview based on type
├─ ✗ Embed document upload for required docs
├─ ✗ Show/hide form sections based on type
├─ ✗ handle file type validation errors
├─ ✗ Support back/next buttons between steps
├─ ✗ Disable fields for RENEWAL (pre-filled)
├─ ✗ Clear previous draft warning
└─ ✗ Accessibility: (keyboard nav, labels, ARIA)

Total: 25 tests
```

---

#### 3B. Medium Priority Components (20)

**UI: 14 components** (alert, badge, button, card, input, modal, select, textarea, skeleton, loading, data-table, calendar, empty-state, language-switcher)
```
Tests: 2-3 per component (rendering, props, variants)
Total: ~40 tests | Est. 2 days
```

**Dashboard: Other 6 components** (header, shell, tracking client, etc.)
```
Tests: 3-5 per component
Total: ~25 tests | Est. 1-2 days
```

---

### CATEGORY 4: PAGE COMPONENTS (46 pages)

#### 4A. Critical Pages (10 pages)

**Focus: Application flow, admin operations, review workflow**

| Page | Priority | Tests |
|------|----------|-------|
| `/applications/new` | CRITICAL | 15 tests |
| `/applications/[id]` | CRITICAL | 15 tests |
| `/dashboard/admin/users` | HIGH | 10 tests |
| `/dashboard/admin/schedules` | HIGH | 10 tests |
| `/dashboard/admin/reports` | HIGH | 10 tests |
| `/dashboard/review/[id]` | CRITICAL | 15 tests |
| `/dashboard/claim-reference` | HIGH | 10 tests |
| `/login` | HIGH | 8 tests |
| `/register` | HIGH | 8 tests |
| `/dashboard` | MEDIUM | 8 tests |

```
Tests per page:
├─ ✗ Auth protection (redirect if not authenticated)
├─ ✗ Role-based access (APPLICANT/STAFF/REVIEWER/ADMIN)
├─ ✗ Data loading (getServerSideProps or useQuery)
├─ ✗ Error states (404, 500)
├─ ✗ Loading states (skeleton, spinner)
├─ ✗ Empty states (no data returned)
└─ ✗ Accessibility (keyboard nav, screen reader, labels)

Total: ~124 tests across critical pages | Est. 5 days
```

---

### CATEGORY 5: INTEGRATION TESTS

#### 5A. Workflow Integration Tests (15 tests)

**Complete user journeys (multi-step, multi-route)**

```
APPLICANT WORKFLOW (5 tests)
1. Register → Verify email → Login
2. Create application → Upload documents → Submit for review
3. Receive approval → Make payment → Download permit
4. Book claim slot → Check in → Claim permit with reference
5. Download permit PDF → Verify permit publicly

REVIEWER WORKFLOW (5 tests)
1. Login → Review pending applications → Verify documents
2. Approve application → Initiate clearances → Check completion
3. Final approval → Send to payment collection

ADMIN WORKFLOW (5 tests)
1. Login → Create claim schedule → Manage time slots
2. View reports → Export claim analytics
3. Manage users → Configure system settings
4. Block schedule dates → Reopen dates

Tests: 15 integration tests | Est. 3-4 days
```

---

#### 5B. External Service Integration Tests (10 tests)

```
PayMongo Payment Flow
├─ ✗ Create checkout session → Receive session ID
├─ ✗ Simulate successful payment → Webhook received
├─ ✗ Verify permit auto-generated after payment
├─ ✗ Verify application status updated to APPROVED
├─ ✗ Handle failed payment webhook

Email Service
├─ ✗ Capture email in test mailbox
├─ ✗ Verify HTML template rendering
├─ ✗ Verify attachments (PDF permits)
├─ ✗ Verify headers (From, To, Subject)
└─ ✗ Verify bounce handling

File Storage (S3/MinIO)
├─ ✗ Upload file → Return presigned URL
├─ ✗ Download via presigned URL
└─ ✗ Delete file from storage

SSE Event Streaming
├─ ✗ Connect to /api/events
├─ ✗ Broadcast status change
├─ ✗ Verify event received by client
├─ ✗ Test reconnection after disconnect
└─ ✗ Verify heartbeat keeps connection alive

Tests: 10 integration tests (mocked) | Est. 2-3 days
```

---

### CATEGORY 6: E2E TESTS (Playwright)

#### 6A. Critical User Journeys (8 E2E tests)

```
APPLICANT JOURNEYS (3 tests)
1. Register → Create application → Submit → Track status
2. Receive approval → Pay → Download permit
3. Book claim → Claim permit → Verify online

STAFF WORKFLOWS (2 tests)
1. Review applications → Approve → Initiate clearances
2. Process claims → Release permits

ADMIN OPERATIONS (2 tests)
1. Manage users → Configure system
2. Create schedules → View analytics

PUBLIC FLOWS (1 test)
1. Verify permit by reference number

Tests: 8 E2E tests (full browser) | Est. 3-4 days
```

---

### CATEGORY 7: SECURITY TESTS (15 tests)

```
Authentication & Authorization
├─ ✗ CSRF token validation
├─ ✗ XSS prevention (input sanitization)
├─ ✗ SQL injection prevention (parameterized queries)
├─ ✗ Privilege escalation (role boundary testing)
├─ ✗ Session hijacking (secure cookies)
└─ ✗ Password reset token expiry

Rate Limiting & DoS Prevention
├─ ✗ Login rate limit (10/min)
├─ ✗ API rate limit (100/min)
├─ ✗ Upload rate limit (20/min)
└─ ✗ Payment rate limit (5/min)

Data Protection
├─ ✗ Passwords never logged
├─ ✗ Tokens not in URLs
├─ ✗ HTTPS only (no plain HTTP)
├─ ✗ Sensitive data exclusion from responses
├─ ✗ File upload validation (no malware)
└─ ✗ GDPR: Data export functionality

Tests: 15 security-focused tests | Est. 2 days
```

---

### CATEGORY 8: PERFORMANCE TESTS (10 tests)

```
API Response Times
├─ ✗ Application list: <500ms
├─ ✗ Document upload: <2s
├─ ✗ Permit PDF generation: <3s
└─ ✗ Schedule availability query: <300ms

Database Query Optimization
├─ ✗ No N+1 queries in application detail
├─ ✗ Indexed searches on large tables
└─ ✗ Batch operations for bulk updates

Frontend Performance
├─ ✗ Dashboard initial load: <3s
├─ ✗ Form submission: <1s
└─ ✗ Pagination: <500ms

Tests: 10 performance tests (with thresholds) | Est. 1-2 days
```

---

## 🗓️ Implementation Timeline

### Phase 1: Critical APIs (Weeks 1-2)

**Priority:** Applications, Documents, Payments
**Effort:** 130 tests
**Duration:** 2 weeks
**Resources:** 1-2 developers

```
Week 1:
├─ Mon-Tue: Auth routes (40 tests)
├─ Wed-Thu: Application routes (50 tests)
└─ Fri: Document routes (30 tests)

Week 2:
├─ Mon-Tue: Payment routes (40 tests)
├─ Wed-Thu: Permits/Schedule/Claims routes (50 tests)
├─ Fri: Admin routes (30 tests)
└─ Buffer: Fixes & refinement
```

### Phase 2: Critical Components & Workflows (Weeks 3-4)

**Priority:** Dashboard components, lib modules, integration tests
**Effort:** 150 tests
**Duration:** 2 weeks

```
Week 3:
├─ Mon: Lib modules (40 tests: payments, email, SSE, storage)
├─ Tue-Wed: App helper functions (40 tests)
├─ Thu-Fri: Dashboard components (30 tests)

Week 4:
├─ Mon: More dashboard components (20 tests)
├─ Tue-Wed: Integration tests (15 tests)
├─ Thu: E2E tests (8 tests)
└─ Fri: Security & performance tests (25 tests)
```

### Phase 3: Full Coverage & Refinement (Weeks 5-6)

**Priority:** Remaining components, pages, edge cases
**Effort:** 150 tests
**Duration:** 2 weeks

```
Week 5:
├─ Mon-Tue: Page component tests (50 tests)
├─ Wed-Thu: UI component tests (40 tests)
└─ Fri: Edge case & error handling (20 tests)

Week 6:
├─ Mon-Tue: Fix failing tests, improve coverage
├─ Wed: Setup CI/CD pipeline (automated test runs)
├─ Thu-Fri: Documentation & team training
```

---

## 📊 Coverage Goals

### Phase 1-3 Target: 50% Coverage (320 tests)

| Category | Current | Target | New Tests |
|----------|---------|--------|-----------|
| API Routes | 0% (0/62) | 100% (62/62) | 130 |
| Lib Modules | 27% (7/26) | 80% (21/26) | 80 |
| Components | 8% (4/47) | 60% (28/47) | 60 |
| Pages | 0% (0/46) | 30% (14/46) | 35 |
| Integration | 0% (0 flows) | 100% (15 workflows) | 25 |
| E2E | 15% (partial 3/3) | 100% (8/8 journeys) | 8 |
| Security | 0% | 100% | 15 |
| Performance | 0% | 100% | 10 |
| **TOTAL** | **6%** | **50%** | **363 tests** |

---

## 🛠️ Testing Tools & Setup

### Installed & Ready

✅ **Vitest** 2.0.1 - Unit testing
✅ **@testing-library/react** 16.0.0 - Component testing
✅ **Playwright** 1.45.0 - E2E testing
✅ **Zod** 3.23.8 - Schema validation
✅ **supertest** - HTTP testing (optional, for detailed API testing)

### Configuration

```bash
# Unit tests
npm test -- --run                       # Run all tests
npm test -- --run --coverage            # With coverage report
npm test -- --run --watch               # Watch mode

# Component tests
npm test -- --run src/components/       # Test components only

# E2E tests
npm run test:e2e                        # Run Playwright tests

# Accessibility tests
npm run test:a11y                       # WCAG compliance
```

---

## ✅ Acceptance Criteria (By Phase)

### Phase 1 Complete Criteria (Week 2)
- [ ] API route tests: 130 tests passing
- [ ] Coverage: Auth, Application, Document, Payment routes at 100%
- [ ] No failing tests
- [ ] TypeScript: 0 errors
- [ ] All routes tested for happy path + error cases

### Phase 2 Complete Criteria (Week 4)
- [ ] Total: 280 tests (130 + 150)
- [ ] Coverage: 40% of codebase
- [ ] All critical lib modules tested
- [ ] All dashboard components tested
- [ ] 15 integration workflows passing
- [ ] 8 E2E journeys passing

### Phase 3 Complete Criteria (Week 6)
- [ ] Total: 363 tests
- [ ] Coverage: 50% of codebase
- [ ] All pages tested
- [ ] All UI components basic testing
- [ ] Security & performance tests passing
- [ ] CI/CD automated test runs on every commit

---

## 🚀 Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'

      - run: npm ci

      # Unit tests
      - run: npm test -- --run --coverage

      # E2E tests
      - run: npm run test:e2e

      # Type check
      - run: npm run typecheck

      # Coverage report
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 📝 Test Documentation

### For Each Test File

```javascript
/**
 * Tests for [Module Name]
 *
 * Tested Functions:
 * - functionName(params): description
 * - functionName2(params): description
 *
 * Coverage: [X%]
 * Dependencies: [list]
 * Mocked: [list]
 */
```

### For Each Test Suite

```javascript
describe('Category > Feature', () => {
  /**
   * Purpose: Verify specific behavior
   * Related PR: #123
   * Related Issue: #456
   */
  it('should ...')
})
```

---

## 🔍 Test Metrics to Track

1. **Test Count** - Total test cases written
2. **Coverage %** - Code coverage percentage (target: 50%+)
3. **Pass Rate** - % tests passing (target: 100%)
4. **Execution Time** - How long test suite runs (target: <5 min for unit, <10 min for E2E)
5. **Failed Tests** - Track and fix regressions
6. **Code Review Feedback** - P1 issues blocking tests

---

## 📚 References

- **Test Files**: `/web/src/__tests__/`
- **Test Config**: `vitest.config.ts`, `playwright.config.ts`
- **CI Config**: `.github/workflows/test.yml`
- **Coverage Report**: `coverage/coverage-final.json`
- **Test Documentation**: `TEST-COVERAGE-REPORT.md`

---

## 👥 Team Responsibilities

| Role | Responsibilities |
|------|-----------------|
| **Test Lead** | Plan test priorities, review test code, maintain coverage goals |
| **Backend Dev** | Write API route tests, lib module tests, integration tests |
| **Frontend Dev** | Write component & page tests, E2E tests, accessibility tests |
| **QA** | Validate test quality, add edge cases, regression testing |

---

## 🎯 Success Metrics

✅ **By End of Phase 1** (Week 2):
- 130 API route tests passing
- All critical auth/payment paths tested

✅ **By End of Phase 2** (Week 4):
- 280 tests total (40% coverage)
- All critical features tested

✅ **By End of Phase 3** (Week 6):
- 363 tests total (50% coverage)
- CI/CD pipeline automated
- Team confident in code quality

---

**Last Updated**: 2026-04-15
**Status**: READY FOR IMPLEMENTATION
**Next Review**: End of Phase 1 (Week 2)
