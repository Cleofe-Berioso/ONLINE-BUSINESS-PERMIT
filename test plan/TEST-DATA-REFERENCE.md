# 🧪 Test Data Reference - Path A Routes

**Generated**: 2026-04-15 via `npm run db:seed`
**Applications**: 8 total (6 original + 2 new ENDORSED)
**Payments**: 7 records
**Schedules**: 7 open + 2 blocked
**Slot Reservations**: 4 confirmed

---

## 👥 Users (7)

| Email | Role | Password | Status | Purpose |
|-------|------|----------|--------|---------|
| admin@lgu.gov.ph | ADMINISTRATOR | Password123! | ACTIVE | Full system access |
| reviewer@lgu.gov.ph | REVIEWER | Password123! | ACTIVE | Review applications |
| staff@lgu.gov.ph | STAFF | Password123! | ACTIVE | Release permits, verify docs |
| juan@example.com | APPLICANT | Password123! | ACTIVE | **Payment + Claim tests** |
| pedro@example.com | APPLICANT | Password123! | ACTIVE | **Payment + Schedule tests** |
| maria@example.com | APPLICANT | Password123! | ACTIVE | Claim reference tests |
| ana@example.com | APPLICANT | Password123! | PENDING_VERIFICATION | Cannot apply yet |

---

## 📋 Applications (8)

### ✅ **APPROVED Apps** (Already have permits + payments)

| ID | Number | Name | Owner | Status | Purpose |
|----|--------|------|-------|--------|---------|
| app1 | BP-2026-000001 | Juan's Sari-Sari Store | Juan | APPROVED | ✅ Existing flow (ref: no changes) |
| app6 | BP-2026-000006 | Maria's Beauty Salon | Maria | APPROVED | ✅ Existing flow (ref: no changes) |

---

### ⭐ **ENDORSED Apps** (NEW - Ready for Payment Tests)

| ID | Number | Name | Owner | Status | Fee | Purpose |
|----|--------|------|-------|--------|-----|---------|
| appEndorsed1 | BP-2026-000007 | **Quick Print Solutions** | Juan | **ENDORSED** | ₱6,500 | **Test payment creation** |
| appEndorsed2 | BP-2026-000008 | **Fresh Groceries Mart** | Pedro | **ENDORSED** | ₱6,500 | **Test webhook processing** |

**Testing Instructions**:
- **Juan** (quick-print): Test GCash/Bank payment
- **Pedro** (fresh-groceries): Test webhook auto-approval

---

### 🔄 **Other Apps** (Various states)

| ID | Number | Name | Owner | Status | Purpose |
|----|--------|------|-------|--------|---------|
| app2 | BP-2026-000002 | JDC Computer Shop | Juan | UNDER_REVIEW | Reference only |
| app3 | BP-2026-000003 | Pedro's Auto Repair | Pedro | SUBMITTED | Reference only |
| app4 | BP-2026-000004 | Garcia Hardware | Pedro | DRAFT | Cannot pay (wrong status) |
| app5 | BP-2026-000005 | Garcia Food Cart | Pedro | REJECTED | Cannot pay (rejected) |

---

## 💳 Payments (7)

### ✅ **PAID** (Completed transactions)

| ID | App | Amount | Method | Reference | TransactionID | Purpose |
|----|-----|--------|--------|-----------|---------------|---------|
| pay1 | app1 | ₱5,000 | GCASH | REF-GCH-20260120-001 | TXN-GCH-001 | Reference (historic) |
| pay2 | app6 | ₱3,500 | MAYA | REF-MAY-20260211-001 | TXN-MAY-001 | Reference (historic) |
| pay3 | app2 | ₱5,000 | BANK_TRANSFER | REF-BNK-20260215-001 | (null) | Reference (bank) |

---

### ⏳ **PENDING** (Test data)

| ID | App | Amount | Method | Reference | TransactionID | Purpose |
|----|-----|--------|--------|-----------|---------------|---------|
| testPay1 | appEndorsed1 | ₱6,500 | GCASH | REF-TEST-GCH-001 | (null) | **Test payment creation** |
| testPay2 | appEndorsed2 | ₱6,500 | MAYA | REF-TEST-MAYA-001 | **TXN-TEST-WEBHOOK-001** | **Test webhook success** |
| testPayFail | app3 | ₱6,500 | BANK_TRANSFER | REF-TEST-FAILED-001 | (null) | **Test error handling** |

**Testing Notes**:
- **testPay1**: Use to test POST /api/payments (GCash)
- **testPay2**: Use transactionID `TXN-TEST-WEBHOOK-001` for webhook test
- **testPayFail**: Verify error handling for failed payments

---

## 📅 Schedules (9)

### ✅ **Open Dates** (7 dates, starting tomorrow)

| Date | Day | Slots | Capacity | Reserved | Status |
|------|-----|-------|----------|----------|--------|
| 2026-04-16 | Wed | 6 slots | 60 total | 2 | **AVAILABLE** |
| 2026-04-17 | Thu | 6 slots | 60 total | 0 | **AVAILABLE** |
| 2026-04-18 | Fri | 6 slots | 60 total | 1 | **AVAILABLE** |
| 2026-04-21 | Mon | 6 slots | 60 total | 1 | **AVAILABLE** |
| 2026-04-22 | Tue | 6 slots | 60 total | 0 | **AVAILABLE** |
| 2026-04-23 | Wed | 6 slots | 60 total | 0 | **AVAILABLE** |
| 2026-04-24 | Thu | 6 slots | 60 total | 0 | **AVAILABLE** |

**Time Slots per Day**:
- 08:00-09:00 (capacity 10)
- 09:00-10:00 (capacity 10)
- 10:00-11:00 (capacity 10)
- 13:00-14:00 (capacity 10)
- 14:00-15:00 (capacity 10)
- 15:00-16:00 (capacity 10)

### 🚫 **Blocked Dates** (2)

| Date | Reason | Status |
|------|--------|--------|
| 2026-05-14 | Holiday | BLOCKED |
| 2026-05-12 | System Maintenance | BLOCKED |

---

## 🎫 Slot Reservations (4)

### ✅ **Confirmed** (Ready for claim release)

| ID | App | Applicant | Date | Time | Status | ClaimID | Purpose |
|----|-----|-----------|------|------|--------|---------|---------|
| res1 | app1 | Juan | 2026-04-16 | 09:00-10:00 | CONFIRMED | (existing) | **Schedule test base** |
| res2 | app6 | Maria | 2026-04-16 | 10:00-11:00 | CONFIRMED | (existing) | **Schedule test base** |
| res3 | appEndorsed1 | Juan | 2026-04-17 | 08:00-09:00 | CONFIRMED | (null) | **Test claim release** |
| res4 | appEndorsed2 | Pedro | 2026-04-17 | 09:00-10:00 | CONFIRMED | (null) | **Test claim release** |

**Testing Notes**:
- **res3 & res4**: Use for POST /api/claims route (release permit)
- Can test PUT /api/schedules with these to reschedule
- Cannot reschedule within 24 hours of schedule date

---

## 🔖 Claim References (4)

| Reference Number | App | Applicant | Status | ClaimDate | Purpose |
|------------------|-----|-----------|--------|-----------|---------|
| CLM-20260120-ABC123 | app1 | Juan | CLAIMED | 2026-01-25 | **Reference (historic)** |
| CLM-20260215-DEF456 | app6 | Maria | GENERATED | 2026-02-28 | **Reference (historic)** |
| CLM-TEST-PENDING-001 | appEndorsed1 | Juan | GENERATED | (none) | **Test release flow** |
| CLM-TEST-VERIFIED-002 | appEndorsed2 | Pedro | VERIFIED | (none) | **Test verified flow** |

---

## 🏛️ Permits (4)

### ✅ **Active Permits** (Existing)

| Number | App | Business | Owner | Issued | Expires | Status |
|--------|-----|----------|-------|--------|---------|--------|
| PERMIT-2026-000001 | app1 | Juan's Sari-Sari Store | Juan | 2026-01-20 | 2027-01-20 | ACTIVE |
| PERMIT-2026-000002 | app6 | Maria's Beauty Salon | Maria | 2026-02-11 | 2027-02-11 | ACTIVE |

### 🆕 **Test Auto-Generated** (From webhook)

| Number | App | Business | Owner | Status | Purpose |
|--------|-----|----------|-------|--------|---------|
| PERMIT-2026-000003 | appEndorsed1 | Quick Print Solutions | Juan | ACTIVE | **Test webhook auto-generation** |
| PERMIT-2026-000004 | appEndorsed2 | Fresh Groceries Mart | Pedro | ACTIVE | **Test webhook auto-generation** |

**Note**: Permits 3 & 4 are created directly in seed but would be auto-generated by webhook in production

---

## 🔐 Security Settings

### Rate Limits (Configured)
- **Auth**: 10 requests/minute
- **API**: 100 requests/minute
- **OTP**: 5 requests/15 minutes
- **Upload**: 20 requests/minute
- **Payment**: 5 requests/minute ⭐
- **Schedule Reserve**: 10 requests/hour ⭐

### Configured Fees
| Type | Permit Fee | Processing | Filing | Total |
|------|-----------|-----------|--------|-------|
| NEW | ₱4,000 | ₱1,500 | ₱1,000 | ₱6,500 |
| RENEWAL | ₱3,000 | ₱1,125 | ₱750 | ₱4,875 |

---

## 📊 Activity Log Sample

**Recent entries**:
- PAYMENT_INITIATED (testPay1)
- SCHEDULE_RESERVED (res3, res4)
- PERMIT_GENERATED (permits 3, 4)
- DOCUMENT_VERIFIED (app1, app6)

---

## 🧪 Quick Testing Commands

```bash
# Seed data
npm run db:seed

# Start server
npm run dev

# Run tests
npm test -- --run

# Check typecheck
npm run typecheck

# View database
npm run db:studio  # Open http://localhost:5555
```

---

## 🎯 Test Scenarios at a Glance

| Route | Scenario | User | App | Expected |
|-------|----------|------|-----|----------|
| **POST /api/payments** | Initiate GCash | Juan | BP-2026-000007 | 201 + ref + email |
| **POST /api/payments/webhook** | Success webhook | (system) | BP-2026-000008 | 202 + permit auto-gen |
| **GET /api/schedules** | List available | Juan | (any) | 200 + 7 open dates |
| **POST /api/schedules** | Reserve slot | Juan | BP-2026-000007 | 201 + confirmation |
| **PUT /api/schedules** | Reschedule | Juan | (existing res) | 200 + new date |
| **GET /api/claims/today** | View claims | Staff | (filtered) | 200 + 2-4 claims |
| **POST /api/claims** | Release permit | Staff | res1/res2 | 200 + QR + email |

---

## ✅ Data Validation Checklist

- [x] 8 applications created (6 original + 2 ENDORSED)
- [x] 7 payments with various statuses
- [x] 7 schedule dates with 6 time slots each = 42 slots
- [x] 4 slot reservations (confirmed)
- [x] 4 claims/references
- [x] 4 permits with issuances
- [x] All users have valid roles
- [x] All relations properly linked
- [x] Timestamps reasonable
- [x] Test IDs match seeded values

**Generated**: 2026-04-15 @ 14:30 UTC
**Status**: ✅ READY FOR TESTING
