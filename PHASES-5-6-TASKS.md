# Phases 5 & 6 Implementation Tasks

**Status**: In Progress
**Start Date**: 2026-04-15
**Target Completion**: 2026-04-18
**Effort**: 4-4.5 days

---

## PHASE 0: System Configuration (0.5 days)

### Task 0.1: Add SystemSetting records from data-for-system.md
- **Status**: ✅ COMPLETED
- **Files Modified**:
  - `web/prisma/seed.js` - Added 17 business categories + fee schedule JSON
  - `web/prisma/seed.js` - Added fee calculation brackets (asset + worker)
  - `web/prisma/seed.js` - Added application fees (processing + filing)
- **Details**:
  - Loaded mayors_permit_fees (17 categories)
  - Loaded fee_calculation_brackets (asset and worker ranges)
  - Loaded application_fees (processing + filing)
- **Verification**: `npm run db:seed` will load all SystemSetting records

### Task 0.2: Verify admin/settings route exists
- **Status**: ✅ COMPLETED
- **Files Reviewed**: `web/src/app/api/admin/settings/route.ts`
- **Details**:
  - GET endpoint: Retrieves all settings (caching enabled via CacheKeys)
  - PUT endpoint: Updates multiple settings with ADMIN auth
  - Activity logging: UPDATE_SETTINGS logged
  - No changes needed - already fully implemented

---

## PHASE 5: Permit Issuance (Task 5.1 - 5.5)

### Task 5.1: GET /api/permits - List all permits
- **Status**: ✅ COMPLETED
- **File Created/Modified**: `web/src/app/api/permits/route.ts`
- **Features**:
  - ✅ Pagination (page, limit params, defaults: page=1, limit=20)
  - ✅ Filtering (status: ACTIVE|EXPIRED|REVOKED|RENEWED)
  - ✅ Search (permitNumber, businessName, businessAddress - case insensitive)
  - ✅ RBAC (STAFF, REVIEWER, ADMINISTRATOR only)
  - ✅ Response includes: permits array + pagination metadata
  - ✅ Error handling with Zod validation
  - ✅ Activity logging (optional comment)
  - ✅ Monitoring integration (captureException)
- **Testing Checklist**:
  - [ ] Test without auth → 401
  - [ ] Test as APPLICANT → 403
  - [ ] Test as STAFF → 200 with permits list
  - [ ] Test pagination: page=1, limit=10
  - [ ] Test status filter: ?status=ACTIVE
  - [ ] Test search filter: ?search=PERMIT-2026

### Task 5.2: GET /api/permits/[id]/prefill - Renewal prefilling
- **Status**: ⏳ REVIEW REQUIRED
- **File Reviewed**: `web/src/app/api/permits/[id]/prefill/route.ts`
- **Current Implementation**: ✅ Exists and looks good
- **Features**:
  - ✅ Auth check (APPLICANT, STAFF, ADMIN)
  - ✅ RBAC: APPLICANT can only access own permit
  - ✅ Business logic: Pre-fill renewal form with existing permit data
  - ✅ Status validation: Only ACTIVE or EXPIRED permits
  - ✅ Activity logging: PERMIT_PREFILL_INITIATED
- **Response**: Permit details + application pre-filled data
- **Testing Checklist**:
  - [ ] Test as APPLICANT on own permit → 200
  - [ ] Test as APPLICANT on other's permit → 403
  - [ ] Test on REVOKED permit → 400
  - [ ] Verify all fields returned correctly for form prefilling

### Task 5.3: POST /api/permits/[id]/print - Print tracking
- **Status**: ⏳ NOT STARTED
- **File to Create**: `web/src/app/api/permits/[id]/print/route.ts`
- **Features Required**:
  - [ ] Auth check (STAFF, ADMINISTRATOR only)
  - [ ] Fetch PermitIssuance record
  - [ ] Update status: ISSUED → RELEASED (if applicable)
  - [ ] Add printedAt timestamp (new Date())
  - [ ] Log activity: action = "PERMIT_PRINTED"
  - [ ] Broadcast SSE event: broadcastPermitPrinted
  - [ ] Return confirmation with updated issuance data
  - [ ] Error handling + monitoring
- **Response Template**:
  ```json
  {
    "success": true,
    "message": "Permit marked as printed",
    "issuance": {
      "id": "...",
      "status": "RELEASED",
      "printedAt": "2026-04-16T10:30:00Z"
    }
  }
  ```
- **Testing Checklist**:
  - [ ] Test without auth → 401
  - [ ] Test as APPLICANT → 403
  - [ ] Test as STAFF on ISSUED permit → 200, status = RELEASED
  - [ ] Test printedAt timestamp is set
  - [ ] Test activity log created
  - [ ] Test SSE event broadcast

### Task 5.4: Fix IssuanceClient handlers - Print and download
- **Status**: ⏳ NOT STARTED
- **File to Modify**: `web/src/components/dashboard/IssuanceClient.tsx`
- **Changes Required**:
  - [ ] Replace handlePrint console.log stub with real implementation:
    - Calls POST /api/permits/[id]/print
    - Shows loading state
    - Handles error with toast notification
    - Refreshes local state on success
  - [ ] Replace handleDownload console.log stub with real implementation:
    - Calls GET /api/permits/[id]/pdf
    - Fetches blob response
    - Triggers browser download via <a> element
    - Handles errors
- **Pattern** (from existing code):
  ```typescript
  const handlePrint = async (permitId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/permits/${permitId}/print`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Print failed');
      // Show success toast + refresh
      notify.success('Permit marked as printed');
      // Refetch permits list
    } catch (error) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  ```
- **Testing Checklist**:
  - [ ] Print button calls API and updates issuance status
  - [ ] Download button fetches PDF and starts download
  - [ ] Loading states appear during requests
  - [ ] Error messages show if API calls fail
  - [ ] Success toasts appear

### Task 5.5: POST /api/cron/expire-permits - Permit expiry automation
- **Status**: ⏳ NOT STARTED
- **File to Create**: `web/src/app/api/cron/expire-permits/route.ts`
- **Features Required**:
  - [ ] Cron trigger validation (check X-Cron-Secret header)
  - [ ] Query permits: expiryDate < now() & status != EXPIRED
  - [ ] Update status: current → EXPIRED for each
  - [ ] Send email notification: sendPermitExpiryEmail() for each
  - [ ] Broadcast SSE: broadcastPermitExpired for admin dashboard
  - [ ] Log activity: action = "PERMIT_EXPIRED_AUTO"
  - [ ] Return metrics: count of expired permits processed
  - [ ] Error handling + monitoring
- **Trigger Mechanism**:
  - Deploy to Vercel: Use Vercel Cron
  - Local dev: Manual curl or scheduled test
  - Rate limiting: Should be safe (runs once daily)
- **Response Template**:
  ```json
  {
    "success": true,
    "expiredCount": 5,
    "message": "5 permits marked as expired",
    "timestamp": "2026-04-16T00:00:00Z"
  }
  ```
- **Testing Checklist**:
  - [ ] Manually curl endpoint with X-Cron-Secret header
  - [ ] Create test permit with expiryDate = yesterday
  - [ ] Verify status changes to EXPIRED
  - [ ] Verify email sent to permit owner
  - [ ] Verify SSE broadcast to admins
  - [ ] Verify activity log created

---

## PHASE 5 Helpers

### Task 5.6: Add email functions to lib/email.ts
- **Status**: ⏳ NOT STARTED
- **Function Required**: `sendPermitExpiryReminderEmail()`
- **Template**:
  ```typescript
  export async function sendPermitExpiryReminderEmail(
    to: string,
    details: { permitNumber: string; businessName: string; expiryDate: Date }
  ): Promise<void> {
    await emailTransport.sendMail({
      from: EMAIL_FROM,
      to,
      subject: 'Business Permit Expired',
      html: emailLayout({
        title: 'Permit Expiration Notice',
        body: `Your permit ${details.permitNumber} expired on ${details.expiryDate.toLocaleDateString()}`
      })
    }).catch(err => console.error('Email error:', err));
  }
  ```
- **Testing**:
  - [ ] Verify email sends when permit expires
  - [ ] Check email template formatting (htmlContent looks correct)

### Task 5.7: Add SSE event to lib/sse.ts
- **Status**: ⏳ NOT STARTED
- **Function Required**: `broadcastPermitExpired()`
- **Template**:
  ```typescript
  export function broadcastPermitExpired(
    userId: string,
    permitNumber: string,
    businessName: string
  ): void {
    sseBroadcaster.sendToUser(userId, createSSEEvent('permit_expired', {
      permitNumber,
      businessName,
      timestamp: new Date().toISOString()
    }, userId));
  }
  ```
- **Testing**:
  - [ ] Verify SSE event broadcast when permit expires
  - [ ] Admin dashboard updates in real-time

---

## PHASE 6: Claims & Reporting (Task 6.1 - 6.5)

### Task 6.1: GET /api/claims/[id]/check-in - Applicant check-in
- **Status**: ⏳ NOT STARTED
- **File to Create**: `web/src/app/api/claims/[id]/check-in/route.ts`
- **Features Required**:
  - [ ] No auth required (public or minimal) or lightweight verification
  - [ ] Fetch SlotReservation by ID
  - [ ] Verify status == CONFIRMED
  - [ ] Update reservation.checkedInAt = now()
  - [ ] Update issuance: RELEASED → COMPLETED
  - [ ] Log activity: action = "CLAIM_CHECKED_IN"
  - [ ] Broadcast SSE: broadcastClaimCompleted for staff
  - [ ] Return permit details (for check-in confirmation)
  - [ ] Error handling + monitoring
- **Response Template**:
  ```json
  {
    "success": true,
    "message": "Check-in successful",
    "permit": {
      "id": "...",
      "permitNumber": "PERMIT-2026-ABC123",
      "businessName": "Juan's Sari-Sari Store",
      "expiryDate": "2027-01-15"
    },
    "issuance": {
      "id": "...",
      "status": "COMPLETED"
    }
  }
  ```
- **Testing Checklist**:
  - [ ] Test without auth (if public) → 200
  - [ ] Test on CONFIRMED reservation → 200, status = COMPLETED
  - [ ] Test on non-existent reservation → 404
  - [ ] Verify reservation.checkedInAt timestamp set
  - [ ] Verify issuance status updated
  - [ ] Verify activity log created
  - [ ] Verify SSE broadcast to staff

### Task 6.2: GET /api/public/verify-permit - Public permit verification
- **Status**: ⏳ NOT STARTED
- **File to Create**: `web/src/app/api/public/verify-permit/route.ts`
- **Features Required**:
  - [ ] No auth required (public)
  - [ ] Query params: ?reference=CLM-xxx OR ?qrCode=xxx
  - [ ] Fetch Permit + ClaimReference
  - [ ] Return safe public data only (no personal info):
    - permitNumber, businessName, issueDate, expiryDate, status
  - [ ] Rate limiting: 100 req/min per IP (use middleware/header logic)
  - [ ] Return 404 if not found
  - [ ] Error handling + monitoring
- **Response Template**:
  ```json
  {
    "valid": true,
    "permitNumber": "PERMIT-2026-ABC123",
    "businessName": "Juan's Sari-Sari Store",
    "issueDate": "2026-01-15",
    "expiryDate": "2027-01-15",
    "status": "ACTIVE"
  }
  ```
- **Testing Checklist**:
  - [ ] Test with valid reference → 200, valid = true
  - [ ] Test with invalid reference → 404, valid = false
  - [ ] Verify no sensitive data returned (no owner name, address, etc)
  - [ ] Test rate limiting (100 req/min)
  - [ ] Verify works for both ?reference and ?qrCode params

### Task 6.3: GET /api/admin/reports/analytics - Dashboard analytics
- **Status**: ⏳ NOT STARTED
- **File to Create**: `web/src/app/api/admin/reports/analytics/route.ts`
- **Features Required**:
  - [ ] Auth check (ADMIN only)
  - [ ] Optional query params: ?from=2026-01-01&to=2026-04-15 (dateRange)
  - [ ] Metrics to calculate:
    - [ ] Total applications (by status: total, APPROVED, REJECTED, PENDING)
    - [ ] Total payments (by status: total, PAID, PENDING, FAILED) + total revenue
    - [ ] Total claims (by status: total, COMPLETED, SCHEDULED)
    - [ ] Average processing time (days between submit → approve)
    - [ ] Slot utilization % (booked slots / total slots)
    - [ ] Top applicants by permit count
  - [ ] Caching: 2 min TTL via cacheGet/cacheSet
  - [ ] Return structured JSON for charts
  - [ ] Error handling + monitoring
- **Response Template**:
  ```json
  {
    "period": { "from": "2026-01-01", "to": "2026-04-15" },
    "summary": {
      "applications": {
        "total": 150,
        "approved": 120,
        "rejected": 10,
        "pending": 20
      },
      "payments": {
        "total": 120,
        "paid": 100,
        "pending": 15,
        "failed": 5,
        "totalRevenue": 450000
      },
      "claims": {
        "total": 120,
        "completed": 110,
        "scheduled": 10
      },
      "avgProcessingDays": 8.5,
      "slotUtilization": 0.78
    },
    "timeline": [
      {
        "date": "2026-04-01",
        "applicationsCount": 15,
        "paymentsCount": 12,
        "revenue": 36000
      }
    ]
  }
  ```
- **Testing Checklist**:
  - [ ] Test without auth → 401
  - [ ] Test as STAFF → 403
  - [ ] Test as ADMIN → 200 with metrics
  - [ ] Verify cache key used (CacheKeys.analytics())
  - [ ] Verify dateRange filter works
  - [ ] Verify all metrics calculated correctly
  - [ ] Test with no data → handles gracefully

### Task 6.4: GET /api/admin/reports/export - CSV/PDF export
- **Status**: ⏳ ENHANCEMENT REQUIRED
- **File Reviewed/Enhanced**: `web/src/app/api/admin/reports/export/route.ts`
- **Features to Verify/Add**:
  - [ ] Auth check (ADMIN only) - verify exists
  - [ ] Query params: ?format=csv|pdf&dataType=applications|payments|claims
  - [ ] Date range filtering (optional)
  - [ ] CSV generation with proper headers
  - [ ] PDF generation (if needed)
  - [ ] Content-Disposition: attachment header
  - [ ] Rate limiting: 5 req/min per user
  - [ ] Activity logging: action = "REPORT_EXPORTED"
  - [ ] Error handling + monitoring
- **Response**:
  - application/csv or application/pdf
  - File download triggered
- **Testing Checklist**:
  - [ ] Test CSV export for applications
  - [ ] Test CSV export for payments
  - [ ] Test CSV export for claims
  - [ ] Test PDF export (if implemented)
  - [ ] Verify rate limiting (5 req/min)
  - [ ] Verify activity log created
  - [ ] Verify Content-Disposition header set

### Task 6.5: RescheduleButton component - Missing component
- **Status**: ⏳ NOT STARTED
- **File to Create**: `web/src/components/dashboard/RescheduleButton.tsx`
- **Features Required**:
  - [ ] Props: reservationId, applicantId, currentDate, onSuccess callback
  - [ ] Button UI: "Reschedule" text
  - [ ] Modal dialog on click:
    - [ ] Show calendar with available dates (next 30-90 days from ClaimSchedule)
    - [ ] Show time slots for selected date
    - [ ] Submit: PUT /api/schedules with { reservationId, newScheduleId, newSlotId }
    - [ ] Show confirmation message
    - [ ] Call onSuccess callback on success
    - [ ] Handle errors with toast
  - [ ] Loading states during API calls
  - [ ] Validation (prevent past dates)
  - [ ] Responsive design (mobile + desktop)
- **Integration**: Used in `/dashboard/claim-reference/page.tsx`
- **Testing Checklist**:
  - [ ] Button renders correctly
  - [ ] Modal opens on click
  - [ ] Calendar shows available dates
  - [ ] Time slots load for selected date
  - [ ] Reschedule API call succeeds
  - [ ] Success callback fired
  - [ ] Error handling shows toast

---

## Helper Functions & Validation

### Task 6.6: Add Zod schemas to lib/validations.ts
- **Status**: ⏳ NOT STARTED
- **Schemas to Add**:
  - [ ] `permitListSchema` - pagination, filtering, search
  - [ ] `reportExportSchema` - format, dataType, dateRange
  - [ ] `checkInSchema` - reservationId validation (if needed)
  - [ ] `verifyPermitSchema` - reference or qrCode
- **Testing**:
  - [ ] All schemas parse valid data successfully
  - [ ] All schemas reject invalid data with meaningful errors

### Task 6.7: Update database seed data (seed.js)
- **Status**: ⏳ IN PROGRESS - SystemSetting ✅, may need test permits
- **Updates Needed**:
  - [ ] Verify SystemSetting records load correctly
  - [ ] Create additional test permits if needed for cron testing
  - [ ] Create test claims for check-in testing
  - [ ] Ensure slot reservations exist for reschedule testing
- **Testing**: `npm run db:seed` → all records created without errors

---

## Testing & Validation

### Task 7.1: Write unit tests
- **Status**: ⏳ NOT STARTED
- **Test Files to Create**:
  - [ ] `web/src/__tests__/api/permits/list.test.ts` - GET /api/permits
  - [ ] `web/src/__tests__/api/claims/check-in.test.ts` - GET /api/claims/[id]/check-in
  - [ ] `web/src/__tests__/api/public/verify-permit.test.ts` - GET /api/public/verify-permit
  - [ ] `web/src/__tests__/api/admin/reports/analytics.test.ts` - GET /api/admin/reports/analytics
- **Each test file should cover**:
  - [ ] Auth validation (no auth, wrong role, correct role)
  - [ ] Happy path (valid request → correct response)
  - [ ] Error cases (404, 400, 403)
  - [ ] Pagination (if applicable)
  - [ ] Filtering (if applicable)

### Task 7.2: Write E2E tests with Playwright
- **Status**: ⏳ NOT STARTED
- **E2E Scenarios**:
  - [ ] Complete permit lifecycle: Payment → Issuance → Print → Expiry
  - [ ] Complete claim lifecycle: Schedule booking → Check-in → Verification
  - [ ] Public permit verification flow
  - [ ] Admin analytics dashboard + export
- **Test File**: `web/e2e/phases-5-6.spec.ts` (new)
- **Each test should verify**:
  - [ ] User actions trigger correct API calls
  - [ ] UI updates after API responses
  - [ ] Error states handled gracefully
  - [ ] Workflows complete end-to-end

### Task 7.3: Run TypeScript type check
- **Status**: ⏳ NOT STARTED
- **Command**: `npm run typecheck`
- **Success Criteria**: 0 TypeScript errors
- **If errors**: Fix all errors before proceeding

### Task 7.4: Run ESLint
- **Status**: ⏳ NOT STARTED
- **Command**: `npm run lint`
- **Success Criteria**: 0 linting errors
- **Auto-fix**: Use `npm run lint -- --fix` if needed

---

## Final Steps

### Task 8.1: Manual E2E testing
- **Status**: ⏳ NOT STARTED
- **Setup**:
  ```bash
  cd web
  npm run db:seed  # Load test data
  npm run dev      # Start dev server (localhost:3000)
  ```
- **Test Scenarios**:
  - [ ] Login as admin@lgu.gov.ph → /dashboard/issuance
  - [ ] View permit list → GET /api/permits works
  - [ ] Click print button → POST /api/permits/[id]/print works
  - [ ] Click download button → GET /api/permits/[id]/pdf works
  - [ ] Verify expiry cron (manual trigger with curl)
  - [ ] Login as applicant → /dashboard/schedule
  - [ ] Book time slot → POST /api/schedules works
  - [ ] Check-in via /api/claims/[id]/check-in
  - [ ] View analytics → /dashboard/admin/reports
  - [ ] Export report → CSV/PDF download works
  - [ ] Reschedule slot via RescheduleButton component
  - [ ] Public verify permit → /api/public/verify-permit?reference=xxx
- **Issues Found**: Log and fix before marking complete

### Task 8.2: Update PROGRESS-REPORT.md
- **Status**: ⏳ NOT STARTED
- **Updates**:
  - [ ] Mark Phase 5: Permit Issuance → 100% COMPLETE
  - [ ] Mark Phase 6: Claims & Reporting → 100% COMPLETE
  - [ ] Update overall project progress percentage
  - [ ] Add completion timestamps per phase
  - [ ] Add manual testing sign-off
  - [ ] Add deployment readiness checklist

### Task 8.3: Update MEMORY.md
- **Status**: ⏳ NOT STARTED
- **Memory Entries**:
  - [ ] Add Phase 5 & 6 completion summary
  - [ ] Note any architectural patterns learned
  - [ ] Document any issues encountered + solutions
  - [ ] Update project status (ready for Phase 4 or Phase 7)

---

## Completion Checklist

- [ ] All 9 API routes implemented and tested (✅ 1/9: Task 5.1)
- [ ] 1 React component created (RescheduleButton)
- [ ] All helper functions added (email, SSE)
- [ ] All Zod schemas added
- [ ] SystemSetting records loaded from data-for-system.md ✅
- [ ] 0 TypeScript errors
- [ ] All unit tests passing (4 test files)
- [ ] All E2E tests passing
- [ ] ESLint compliance (0 errors)
- [ ] Manual E2E testing completed
- [ ] PROGRESS-REPORT.md updated
- [ ] MEMORY.md updated
- [ ] Ready for deployment ✅

---

## Notes

- **Blocked by Nothing**: All dependencies available, database schema complete
- **Quick Wins**: Tasks 5.1, 5.2, 0.1, 0.2 completed quickly (no complex logic)
- **Most Time**: Task 6.5 (RescheduleButton component - UI complexity)
- **Testing**: Safety-critical paths (claims, payments, expiry) need thorough testing
- **Rate Limiting**: Apply to public endpoint (6.2) and export endpoint (6.4)
