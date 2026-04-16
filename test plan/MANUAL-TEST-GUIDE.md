# 🧪 Manual Testing Guide - Path A Implementation

**Date**: 2026-04-15
**Status**: ✅ Ready for Testing
**Routes Tested**: 4 (Payments, Payment Webhooks, Schedules, Claims)

---

## 📋 Quick Start

### Database Setup
```bash
cd web
npm run db:seed              # Generates all test data
npm run dev                  # Start dev server on http://localhost:3000
```

### Test Credentials
| Role      | Email                  | Password     | Status |
|-----------|------------------------|--------------|--------|
| Admin     | admin@lgu.gov.ph       | Password123! | ACTIVE |
| Reviewer  | reviewer@lgu.gov.ph    | Password123! | ACTIVE |
| Staff     | staff@lgu.gov.ph       | Password123! | ACTIVE |
| Applicant | juan@example.com       | Password123! | ACTIVE |
| Applicant | pedro@example.com      | Password123! | ACTIVE |
| Applicant | maria@example.com      | Password123! | ACTIVE |
| Pending   | ana@example.com        | Password123! | PENDING_VERIFICATION |

---

## 🧪 Test Route 1: `/api/payments` (Payment Creation)

### Scenario 1A: Initiate GCash Payment
**Setup**: Juan (applicant) with ENDORSED application

**Steps**:
1. **Login as Juan** (`juan@example.com` / `Password123!`)
2. **Navigate to Dashboard → Applications**
3. **Click on "Quick Print Solutions"** (BP-2026-000007, status: ENDORSED)
4. **Click "Proceed to Payment"**
5. **Select Method**: GCash
6. **Expected Output**:
   - ✅ Amount: ₱6,500.00 displayed
   - ✅ Payment reference generated (REF-XXXX-XXXX-XXX)
   - ✅ Checkout URL returned
   - ✅ Status: PENDING

**Expected HTTP Response** (201 Created):
```json
{
  "payment": {
    "id": "...",
    "referenceNumber": "REF-GCH-...",
    "amount": 6500,
    "method": "GCASH",
    "status": "PROCESSING",
    "checkoutUrl": "https://..."
  },
  "message": "Payment initiated. Reference: REF-GCH-..."
}
```

**Activity Log**: Should show `PAYMENT_INITIATED` with details

---

### Scenario 1B: Try Payment Without ENDORSED Status (Error Test)
**Setup**: Pedro with DRAFT application

**Steps**:
1. **Login as Pedro** (`pedro@example.com`)
2. **Try to pay for "Garcia Hardware"** (BP-2026-000004, status: DRAFT)
3. **Expected Error** (400 Bad Request):
```json
{
  "error": "Application not ready for payment",
  "message": "Application status is DRAFT. Only ENDORSED applications can proceed to payment."
}
```

---

### Scenario 1C: Multiple Payment Methods
**Test as Juan with both ENDORSED applications**:
- **GCash** (BP-2026-000007) ✅
- **Maya** (use second application if needed)
- **Bank Transfer** (BP-2026-000008 - Fresh Groceries)
- **Cash/OTC** (test for non-online methods)

**Expected**: Each method returns correct fee breakdown:
- Permit Fee: ₱4,000
- Processing Fee: ₱1,500
- Filing Fee: ₱1,000
- **Total**: ₱6,500

---

## 🔗 Test Route 2: `/api/payments/webhook` (PayMongo Webhook)

### Scenario 2A: Payment Success Webhook
**Setup**: Simulated PayMongo webhook for pending payment

**Manual Test Steps**:
1. **Create pending payment** (already seeded: transactionId `TXN-TEST-WEBHOOK-001`)
2. **Send webhook POST to `/api/payments/webhook`**

**Request Body**:
```json
{
  "type": "payment.succeeded",
  "id": "webhook-123",
  "data": {
    "id": "TXN-TEST-WEBHOOK-001",
    "attributes": {
      "reference_number": "REF-TEST-MAYA-001",
      "amount": 650000,
      "status": "paid"
    }
  }
}
```

**Expected Outcomes**:
- ✅ Payment status → `PAID`
- ✅ Application status → `APPROVED`
- ✅ **Auto-generates Permit** (PERMIT-2026-000004)
- ✅ Creates `PermitIssuance` record
- ✅ Sends permit email to applicant
- ✅ Broadcasts SSE event `permit_issued`
- ✅ Creates activity log: `PERMIT_GENERATED`

**Expected HTTP Response** (202 Accepted):
```json
{
  "status": "processed"
}
```

---

### Scenario 2B: Payment Failed Webhook
**Request Body**:
```json
{
  "type": "payment.failed",
  "id": "webhook-456",
  "data": {
    "id": "TXN-FAIL-001",
    "attributes": {
      "reference_number": "REF-FAIL-001",
      "failure_message": "Insufficient funds"
    }
  }
}
```

**Expected Outcomes**:
- ✅ Payment status → `FAILED`
- ✅ Application status → unchanged
- ✅ No permit generated
- ✅ HTTP 202 response

---

### Scenario 2C: Payment Disputed Webhook
**Request Body**:
```json
{
  "type": "payment.disputed",
  "id": "webhook-789",
  "data": {
    "id": "TXN-DISPUTE-001",
    "attributes": {
      "reference_number": "REF-DISPUTE-001",
      "dispute_reason": "Unauthorized transaction"
    }
  }
}
```

**Expected**: Payment status → `FAILED`, metadata updated with dispute details

---

### Using cURL for Webhook Testing

```bash
# Test webhook success
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-paymongo-signature: test_signature" \
  -d '{
    "type": "payment.succeeded",
    "id": "webhook-123",
    "data": {
      "id": "TXN-TEST-WEBHOOK-001",
      "attributes": {
        "reference_number": "REF-TEST-MAYA-001"
      }
    }
  }'
```

---

## 📅 Test Route 3: `/api/schedules` (Claim Schedule Management)

### Scenario 3A: View Available Schedules
**Setup**: Any authenticated user

**Request**: `GET /api/schedules?days=30`

**Expected Output** (200 OK):
```json
{
  "schedules": [
    {
      "id": "sched-001",
      "date": "2026-04-16",
      "availableSlots": [
        {
          "id": "slot-001",
          "startTime": "08:00",
          "endTime": "09:00",
          "capacity": 10,
          "reserved": 0,
          "available": 10
        },
        {
          "id": "slot-002",
          "startTime": "09:00",
          "endTime": "10:00",
          "capacity": 10,
          "reserved": 1,
          "available": 9
        },
        ...
      ],
      "isBlocked": false
    },
    ...
  ],
  "message": "Showing X available schedules for next 30 days"
}
```

---

### Scenario 3B: Reserve a Claim Slot
**Setup**: Juan with ENDORSED application (BP-2026-000007)

**Request**: `POST /api/schedules`
```json
{
  "applicationId": "app-endorsed-1",
  "timeSlotId": "slot-003"
}
```

**Expected Output** (201 Created):
```json
{
  "reservation": {
    "id": "res-001",
    "confirmationNumber": "ABC12345",
    "scheduleDate": "2026-04-18",
    "timeSlot": "10:00-11:00",
    "expiresAt": "2026-04-25T14:30:00Z"
  },
  "message": "Schedule reserved successfully"
}
```

**Side Effects**:
- ✅ Email sent to juan@example.com
- ✅ SSE event: `slot_availability_changed`
- ✅ Activity log: `SCHEDULE_RESERVED`
- ✅ TimeSlot.currentCount incremented

---

### Scenario 3C: Reschedule an Existing Reservation
**Request**: `PUT /api/schedules`
```json
{
  "reservationId": "res-001",
  "newTimeSlotId": "slot-004"
}
```

**Expected Output** (200 OK):
```json
{
  "reservation": {
    "id": "res-001",
    "confirmationNumber": "ABC12345",
    "scheduleDate": "2026-04-19",
    "timeSlot": "13:00-14:00",
    "expiresAt": "2026-04-26T14:30:00Z"
  },
  "message": "Schedule rescheduled successfully"
}
```

**Validations**:
- ✅ Cannot reschedule within 24 hours
- ✅ New slot must have capacity
- ✅ Old slot.currentCount decremented
- ✅ New slot.currentCount incremented

---

### Scenario 3D: Rate Limiting (Error Test)
**Try to reserve 11+ slots in an hour**

**Expected** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded. Try again later."
}
```

---

## 🔖 Test Route 4: `/api/claims` (Permit Release & Claim Reference)

### Scenario 4A: Get Today's Claims (Staff View)
**Setup**: Login as Staff (`staff@lgu.gov.ph`)

**Request**: `GET /api/claims/today`

**Expected Output** (200 OK):
```json
{
  "claims": [
    {
      "id": "res-001",
      "reservationId": "res-001",
      "applicantName": "Juan Bautista Dela Cruz",
      "businessName": "Juan's Sari-Sari Store",
      "timeSlot": "09:00 - 10:00",
      "status": "CONFIRMED"
    },
    {
      "id": "res-002",
      "reservationId": "res-002",
      "applicantName": "Maria Gonzales",
      "businessName": "Maria's Beauty Salon",
      "timeSlot": "10:00 - 11:00",
      "status": "CONFIRMED"
    }
  ],
  "total": 2,
  "date": "2026-04-15"
}
```

---

### Scenario 4B: Release Permit & Generate Claim Reference
**Setup**: Staff releasing Juan's permit

**Request**: `POST /api/claims?id=res-001`

**Expected Output** (200 OK):
```json
{
  "claimReference": {
    "id": "clmref-001",
    "referenceNumber": "CLM-20260415-XYZ789",
    "qrCode": "data:image/png;base64,iVBORw0KGgoA...",
    "businessName": "Juan's Sari-Sari Store",
    "permitNumber": "PERMIT-2026-000001"
  },
  "message": "Permit released successfully"
}
```

**Side Effects**:
- ✅ Creates `ClaimReference` with unique number
- ✅ Generates QR code (base64 encoded)
- ✅ Updates `SlotReservation.claimId`
- ✅ Sends email with reference + QR code to juan@example.com
- ✅ SSE broadcast: `notification` event
- ✅ Activity log: `PERMIT_RELEASED`

**QR Code Contents**: `CLM-20260415-XYZ789` (scannable by Claim Verification)

---

### Scenario 4C: Access Control (Error Test)
**Try to release claim as Applicant (Juan)**

**Expected** (403 Forbidden):
```json
{
  "error": "Forbidden"
}
```

**Only Staff/Admin can release permits**

---

### Scenario 4D: Permit Not Found Error
**Request**: `POST /api/claims?id=res-999` (non-existent)

**Expected** (404 Not Found):
```json
{
  "error": "Reservation not found"
}
```

---

## 📊 End-to-End Workflow Test

### Complete Flow: Payment → Permit → Claim Release

```
1. Juan (Applicant)
   └─ Application: BP-2026-000007 (Quick Print Solutions, ENDORSED)

2. Juan initiates payment
   POST /api/payments
   ├─ Status: PROCESSING → PENDING
   ├─ Reference: REF-GCH-20260415-001
   └─ Email: Payment confirmation

3. PayMongo webhook (simulated)
   POST /api/payments/webhook
   ├─ Payment: PAID
   ├─ Application: APPROVED
   ├─ Permit: Generated (PERMIT-2026-000005)
   ├─ Email: Permit issued
   └─ SSE: permit_issued event

4. Juan books claim slot
   POST /api/schedules
   ├─ Reservation: CONFIRMED
   ├─ Confirmation: ABC12345
   ├─ Email: Schedule confirmation
   └─ SSE: slot_availability_changed

5. Staff releases permit
   POST /api/claims?id=[reservationId]
   ├─ Claim Reference: CLM-20260415-XYZ789
   ├─ QR Code: Generated
   ├─ Email: Claim release notification
   └─ SSE: notification event

6. Juan shows QR code at BPLO
   └─ Permit claimed in person
```

---

## 🔍 Verification Checklist

### Payment Route
- [ ] ENDORSED application can initiate payment
- [ ] Non-ENDORSED applications blocked
- [ ] All 5 payment methods supported (GCash, Maya, Bank, OTC, Cash)
- [ ] Fee breakdown correct (₱4000 + ₱1500 + ₱1000 = ₱6500)
- [ ] Reference number generated
- [ ] Email sent to applicant
- [ ] Activity log created
- [ ] Rate limit enforced (5 req/min per user)

### Webhook Route
- [ ] `payment.succeeded` → Payment PAID + Auto-permit generated
- [ ] `payment.failed` → Payment FAILED
- [ ] `payment.disputed` → Payment FAILED
- [ ] Idempotent (webhook can be replayed without duplicates)
- [ ] Application status updated correctly
- [ ] PermitIssuance record created
- [ ] Email sent with permit details
- [ ] SSE event broadcasted

### Schedule Route
- [ ] GET shows available schedules
- [ ] POST reserves slot for ENDORSED app
- [ ] PUT reschedules existing reservation
- [ ] Cannot reschedule within 24 hours
- [ ] Cannot book full slots
- [ ] Rate limit enforced (10 req/hour per user)
- [ ] Confirmation email sent
- [ ] Slot counts updated correctly
- [ ] Blocked dates excluded

### Claims Route
- [ ] GET claims/today shows staff view only
- [ ] POST releases permit with QR code
- [ ] Claim reference generated & unique
- [ ] Applicants cannot release (403 Forbidden)
- [ ] Email sent with reference + QR
- [ ] Activity log created
- [ ] SSE event broadcasted

---

## 🛠️ Troubleshooting

### Payment not initiated
**Check**:
- Application status is ENDORSED
- Payment method is valid (GCash/Maya/Bank/OTC/Cash)
- User is authenticated
- Rate limit not exceeded

### Webhook not processing
**Check**:
- Webhook signature valid (if checking)
- Payment with matching transactionId exists
- Request body has correct structure

### Schedule reservation failed
**Check**:
- Application status is ENDORSED (not just APPROVED)
- TimeSlot has available capacity
- User is authenticated
- Not rate limited

### Claim release failed
**Check**:
- User is STAFF or ADMIN (not APPLICANT)
- Reservation exists & confirmed
- Permit exists for application
- Reservation has valid permit relation

---

## 📊 Sample API Calls

### Using Postman/Insomnia

**1. Get Auth Token**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**2. Create Payment**
```
POST http://localhost:3000/api/payments
Authorization: Bearer [token]
Content-Type: application/json

{
  "applicationId": "app-endorsed-1",
  "method": "GCASH"
}
```

**3. List Schedules**
```
GET http://localhost:3000/api/schedules?days=30
Authorization: Bearer [token]
```

**4. Reserve Schedule**
```
POST http://localhost:3000/api/schedules
Authorization: Bearer [token]
Content-Type: application/json

{
  "applicationId": "app-endorsed-1",
  "timeSlotId": "slot-003"
}
```

**5. Get Today's Claims** (Staff only)
```
GET http://localhost:3000/api/claims/today
Authorization: Bearer [token-of-staff@lgu.gov.ph]
```

**6. Release Permit**
```
POST http://localhost:3000/api/claims?id=res-001
Authorization: Bearer [token-of-staff@lgu.gov.ph]
```

---

## ✅ Test Completion

When all scenarios pass:
1. Mark route as "Production Ready"
2. Document any edge cases found
3. Update BUGS-FOUND.md if issues discovered
4. Create commit: "test: Verify Path A implementation with manual testing"

---

**Last Updated**: 2026-04-15
**Test Data Status**: ✅ Complete (8 apps, 7 payments, 4+ reservations)
**Ready for**: Functional testing, UA testing, deployment
