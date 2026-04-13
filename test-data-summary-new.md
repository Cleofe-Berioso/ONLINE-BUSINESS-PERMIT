# OBPS Test Data Summary

**Generated**: 2026-04-13
**Status**: ✅ Complete and Ready for Testing
**Test Database**: PostgreSQL (Docker: `obps-postgres`)

---

## Quick Start

### Test Account Credentials

All accounts use password: **`Password123!`**

| Role | Email | Status | Can Login |
|------|-------|--------|-----------|
| Administrator | `admin@lgu.gov.ph` | ACTIVE | ✅ Yes |
| Reviewer | `reviewer@lgu.gov.ph` | ACTIVE | ✅ Yes |
| Staff | `staff@lgu.gov.ph` | ACTIVE | ✅ Yes |
| Applicant | `juan@example.com` | ACTIVE | ✅ Yes |
| Applicant | `pedro@example.com` | ACTIVE | ✅ Yes |
| Applicant | `maria@example.com` | ACTIVE | ✅ Yes |
| Applicant | `ana@example.com` | PENDING_VERIFICATION | ❌ No (email unverified) |

**Quick Login Copy-Paste:**
```
admin@lgu.gov.ph / Password123!
reviewer@lgu.gov.ph / Password123!
staff@lgu.gov.ph / Password123!
juan@example.com / Password123!
pedro@example.com / Password123!
maria@example.com / Password123!
ana@example.com / Password123! (cannot login)
```

---

## 1. Users (7 Total)

### System Users (3)

| ID | Email | Name | Role | Status | 2FA | Email Verified |
|----|-------|------|------|--------|-----|-----------------|
| 1 | admin@lgu.gov.ph | System Administrator | ADMINISTRATOR | ACTIVE | ❌ No | ✅ Yes |
| 2 | reviewer@lgu.gov.ph | Maria Santos | REVIEWER | ACTIVE | ❌ No | ✅ Yes |
| 3 | staff@lgu.gov.ph | Jose Reyes | STAFF | ACTIVE | ❌ No | ✅ Yes |

### Applicants (4)

| ID | Email | Name | Role | Status | 2FA | Email Verified | Phone |
|----|-------|------|------|--------|-----|-----------------|-------|
| 4 | juan@example.com | Juan Bautista Dela Cruz | APPLICANT | ACTIVE | ❌ No | ✅ Yes | 09201234567 |
| 5 | pedro@example.com | Pedro Garcia | APPLICANT | ACTIVE | ❌ No | ✅ Yes | 09211234567 |
| 6 | ana@example.com | Ana Reyes | APPLICANT | PENDING_VERIFICATION | ❌ No | ❌ Null | 09221234567 |
| 7 | maria@example.com | Maria Gonzales | APPLICANT | ACTIVE | ❌ No | ✅ Yes | 09231234567 |

---

## 2. Applications (6 Total)

### Approved Applications (2)

#### App 1: Juan's Sari-Sari Store ✅ APPROVED
```
Application Number: BP-2026-000001
Type: NEW
Status: APPROVED
Applicant: Juan Bautista Dela Cruz (juan@example.com)
Business Name: Juan's Sari-Sari Store
Business Type: Retail - General Merchandise
Address: 123 Rizal Street, Barangay 1, Quezon City, Metro Manila 1100
DTI Reg: DTI-2026-001234
TIN: 123-456-789-000
Employees: 3
Capital: ₱250,000
Gross Sales: ₱500,000
Submitted: 2026-01-15
Reviewed: 2026-01-20
Approved: 2026-01-20
Phone: 09201234567
Email: juanstore@example.com
Documents: 3 (all verified)
Payment: COMPLETED (GCash - ₱5,000)
Permit: ISSUED (PERMIT-2026-000001)
Claim Reference: CLM-20260120-ABC123 (CLAIMED)
```

#### App 6: Maria's Beauty Salon ✅ APPROVED (RENEWAL)
```
Application Number: BP-2026-000006
Type: RENEWAL
Status: APPROVED
Applicant: Maria Gonzales (maria@example.com)
Business Name: Maria's Beauty Salon
Business Type: Service - Beauty & Wellness
Address: 555 Ortigas Avenue, Barangay 7, Quezon City, Metro Manila 1103
DTI Reg: DTI-2025-003456
TIN: 456-789-012-000
Employees: 4
Capital: ₱300,000
Gross Sales: ₱800,000
Submitted: 2026-02-05
Reviewed: 2026-02-10
Approved: 2026-02-10
Phone: 09231234567
Email: maria.salon@example.com
Documents: 3 (all verified)
Payment: COMPLETED (Maya - ₱3,500)
Permit: ISSUED (PERMIT-2026-000002)
Claim Reference: CLM-20260215-DEF456 (GENERATED - Pending Claim)
```

### Under Review Application (1)

#### App 2: JDC Computer Shop 🔄 UNDER_REVIEW
```
Application Number: BP-2026-000002
Type: NEW
Status: UNDER_REVIEW
Applicant: Juan Bautista Dela Cruz (juan@example.com)
Business Name: JDC Computer Shop
Business Type: Service - Internet Cafe
Address: 456 Mabini Street, Barangay 5, Quezon City, Metro Manila 1101
DTI Reg: DTI-2026-005678
TIN: 123-456-789-111
Employees: 5
Capital: ₱500,000
Gross Sales: ₱750,000
Submitted: 2026-02-01
Phone: 09201111111
Email: jdc.shop@example.com
Documents: 2 (1 pending verification, 1 uploaded)
Payment: PENDING (Bank Transfer - ₱5,000)
Review Status: Awaiting reviewer approval
```

### Submitted Application (1)

#### App 3: Pedro's Auto Repair 📋 SUBMITTED
```
Application Number: BP-2026-000003
Type: NEW
Status: SUBMITTED
Applicant: Pedro Garcia (pedro@example.com)
Business Name: Pedro's Auto Repair
Business Type: Service - Automotive
Address: 789 Bonifacio Avenue, Barangay 10, Quezon City, Metro Manila 1105
DTI Reg: DTI-2026-009012
TIN: 987-654-321-000
Employees: 8
Capital: ₱1,000,000
Gross Sales: ₱1,200,000
Submitted: 2026-02-15
Phone: 09211111111
Email: pedro.repair@example.com
Documents: 1 (uploaded, awaiting verification)
Payment: Not yet made
Review Status: Awaiting initial document verification
```

### Draft Application (1)

#### App 4: Garcia Hardware & Construction ✏️ DRAFT
```
Application Number: BP-2026-000004
Type: NEW
Status: DRAFT
Applicant: Pedro Garcia (pedro@example.com)
Business Name: Garcia Hardware & Construction
Business Type: Retail - Hardware
Address: 321 Luna Street, Barangay 12, Quezon City, Metro Manila 1106
Employees: 12
Capital: ₱2,000,000
Gross Sales: ₱3,000,000
Phone: 09211111112
Email: garcia.hardware@example.com
Documents: None
Payment: Not applicable
Status: In-progress application, not yet submitted
```

### Rejected Application (1)

#### App 5: Garcia Food Cart ❌ REJECTED
```
Application Number: BP-2026-000005
Type: NEW
Status: REJECTED
Applicant: Pedro Garcia (pedro@example.com)
Business Name: Garcia Food Cart
Business Type: Food - Street Food
Address: Market Area, Barangay 3, Quezon City, Metro Manila
Employees: 2
Capital: ₱50,000
Submitted: 2026-01-10
Reviewed: 2026-01-18
Rejected: 2026-01-18
Rejection Reason: Incomplete documentary requirements. Missing Barangay Clearance and Fire Safety Certificate.
Review Status: Application rejected, resubmission needed
```

---

## 3. Documents (9 Total)

### For App 1 (Juan's Sari-Sari Store) - All Verified ✅

| Document | Type | Status | Uploaded | Verified By | Verified At |
|----------|------|--------|----------|-------------|-------------|
| DTI Certificate.pdf | DTI_CERTIFICATE | VERIFIED | 2026 | Jose Reyes (staff) | 2026-01-19 |
| Barangay Clearance.pdf | BARANGAY_CLEARANCE | VERIFIED | 2026 | Jose Reyes (staff) | 2026-01-19 |
| Fire Safety Certificate.pdf | FIRE_SAFETY_CERTIFICATE | VERIFIED | 2026 | Jose Reyes (staff) | 2026-01-19 |

### For App 2 (JDC Computer Shop) - Mixed Status

| Document | Type | Status | Uploaded |
|----------|------|--------|----------|
| DTI Certificate.pdf | DTI_CERTIFICATE | PENDING_VERIFICATION | 2026 |
| Barangay Clearance.pdf | BARANGAY_CLEARANCE | UPLOADED | 2026 |

### For App 3 (Pedro's Auto Repair) - Uploaded

| Document | Type | Status | Uploaded |
|----------|------|--------|----------|
| DTI Registration.pdf | DTI_CERTIFICATE | UPLOADED | 2026 |

### For App 6 (Maria's Beauty Salon) - All Verified ✅

| Document | Type | Status | Uploaded | Verified By | Verified At |
|----------|------|--------|----------|-------------|-------------|
| DTI Renewal Certificate.pdf | DTI_CERTIFICATE | VERIFIED | 2026 | Jose Reyes (staff) | 2026-02-09 |
| Barangay Clearance Renewal.pdf | BARANGAY_CLEARANCE | VERIFIED | 2026 | Jose Reyes (staff) | 2026-02-09 |
| Fire Safety Certificate Renewal.pdf | FIRE_SAFETY_CERTIFICATE | VERIFIED | 2026 | Jose Reyes (staff) | 2026-02-09 |

---

## 4. Permits & Issuance (2 Total)

### Permit 1: Juan's Sari-Sari Store
```
Permit Number: PERMIT-2026-000001
Application: BP-2026-000001 (APPROVED)
Business: Juan's Sari-Sari Store
Owner: Juan Bautista Dela Cruz
Address: 123 Rizal Street, Barangay 1, Quezon City
Issue Date: 2026-01-20
Expiry Date: 2027-01-20 (Valid for 365 days)
Status: ACTIVE ✅
Issuance Status: ISSUED
Issued By: Jose Reyes (staff)
Issued At: 2026-01-20
```

### Permit 2: Maria's Beauty Salon
```
Permit Number: PERMIT-2026-000002
Application: BP-2026-000006 (APPROVED - RENEWAL)
Business: Maria's Beauty Salon
Owner: Maria Gonzales
Address: 555 Ortigas Avenue, Barangay 7, Quezon City
Issue Date: 2026-02-11
Expiry Date: 2027-02-11 (Valid for 365 days)
Status: ACTIVE ✅
Issuance Status: ISSUED
Issued By: Jose Reyes (staff)
Issued At: 2026-02-11
```

---

## 5. Claim References (2 Total)

### Claim Ref 1: Juan's Sari-Sari Store - CLAIMED ✅
```
Reference Number: CLM-20260120-ABC123
Application: BP-2026-000001
Applicant Name: Juan Bautista Dela Cruz
Business Name: Juan's Sari-Sari Store
Application Status: APPROVED
Claim Status: CLAIMED
Generated By: Juan Bautista Dela Cruz
Generated At: 2026 (auto-generated at approval)
Claim Schedule Date: 2026-01-25
Claim Schedule Time: 09:00 - 10:00
Verified At: 2026-01-25
Claimed At: 2026-01-25 (Permit physically collected)
QR Code: Generated (for verification)
```

### Claim Ref 2: Maria's Beauty Salon - PENDING ⏳
```
Reference Number: CLM-20260215-DEF456
Application: BP-2026-000006
Applicant Name: Maria Gonzales
Business Name: Maria's Beauty Salon
Application Status: APPROVED
Claim Status: GENERATED (Pending physical claim)
Generated By: Maria Gonzales
Generated At: 2026 (auto-generated at approval)
Claim Schedule Date: 2026-02-28
Claim Schedule Time: 10:00 - 11:00
Verified At: (pending)
Claimed At: (pending)
QR Code: Generated (for verification)
```

---

## 6. Claim Schedules (10+ Total)

### Schedule Overview
- **Open Dates**: Next 10 business days from seeding date
- **Time Slots per Day**: 6 slots (08:00-09:00, 09:00-10:00, 10:00-11:00, 13:00-14:00, 14:00-15:00, 15:00-16:00)
- **Max Capacity per Slot**: 10 persons
- **Blocked Dates**: 2 (system maintenance & holiday)

### Available Time Slots
- Morning: 08:00-09:00, 09:00-10:00, 10:00-11:00 (10 pax each)
- Afternoon: 13:00-14:00, 14:00-15:00, 15:00-16:00 (10 pax each)
- **Weekends Excluded** (Sat/Sun skipped)

### Current Reservations
- **Slot 1 (09:00-10:00)**: Juan Bautista Dela Cruz (App BP-2026-000001) - CONFIRMED
- **Slot 2 (10:00-11:00)**: Maria Gonzales (App BP-2026-000006) - CONFIRMED

---

## 7. Slot Reservations (2 Total)

### Reservation 1: Juan's Sari-Sari Store
```
Application: BP-2026-000001
User: Juan Bautista Dela Cruz (juan@example.com)
Time Slot: 09:00 - 10:00 (First available schedule)
Status: CONFIRMED ✅
Confirmed At: 2026
Capacity: 1/10 available
```

### Reservation 2: Maria's Beauty Salon
```
Application: BP-2026-000006
User: Maria Gonzales (maria@example.com)
Time Slot: 10:00 - 11:00 (First available schedule)
Status: CONFIRMED ✅
Confirmed At: 2026
Capacity: 1/10 available
```

---

## 8. OTP Tokens (2 Total)

### OTP Token 1: Email Verification
```
Email: test.otp@example.com
Token: 123456
Type: EMAIL_VERIFICATION
Created: 2026-04-13 (seeding date)
Expires At: +15 minutes from creation
Status: Testing email verification flows
Use Case: Test OTP verification in auth flows
```

### OTP Token 2: Password Reset
```
Email: password.reset@example.com
Token: 654321
Type: PASSWORD_RESET
Created: 2026-04-13 (seeding date)
Expires At: +30 minutes from creation
Status: Testing password reset flows
Use Case: Test forgot password functionality
```

---

## 9. Payments (3 Total)

### Payment 1: Juan's Sari-Sari Store - COMPLETED ✅
```
Payment ID: PAY-2026-000001
Application: BP-2026-000001
Applicant: Juan Bautista Dela Cruz (juan@example.com)
Amount: ₱5,000.00
Method: GCash
Status: COMPLETED ✅
Reference Number: REF-GCH-20260120-001
Payment Gateway: PayMongo (mock)
Transaction ID: GCH001
Paid At: 2026-01-20
Timeline: Processed after application approval
```

### Payment 2: Maria's Beauty Salon - COMPLETED ✅
```
Payment ID: PAY-2026-000002
Application: BP-2026-000006 (RENEWAL)
Applicant: Maria Gonzales (maria@example.com)
Amount: ₱3,500.00
Method: Maya
Status: COMPLETED ✅
Reference Number: REF-MAY-20260211-001
Payment Gateway: PayMongo (mock)
Transaction ID: MAY001
Paid At: 2026-02-11
Timeline: Processed after renewal approval
```

### Payment 3: JDC Computer Shop - PENDING ⏳
```
Payment ID: PAY-2026-000003
Application: BP-2026-000002
Applicant: Juan Bautista Dela Cruz (juan@example.com)
Amount: ₱5,000.00
Method: Bank Transfer
Status: PENDING ⏳
Reference Number: REF-BNK-20260215-001
Payment Gateway: PayMongo (awaiting verification)
Transaction ID: (pending)
Timeline: Awaiting payment while app is under review
```

---

## 10. Review Actions (3 Total)

### Review 1: Juan's Sari-Sari Store ✅
```
Application: BP-2026-000001
Reviewer: Maria Santos (reviewer@lgu.gov.ph)
Action: APPROVE
Comment: "All requirements complete. Business is in proper zone. Approved."
Created At: 2026-01-20
```

### Review 2: Garcia Food Cart ❌
```
Application: BP-2026-000005
Reviewer: Maria Santos (reviewer@lgu.gov.ph)
Action: REJECT
Comment: "Missing Barangay Clearance and Fire Safety Certificate. Please re-submit."
Created At: 2026-01-18
```

### Review 3: Maria's Beauty Salon ✅
```
Application: BP-2026-000006 (RENEWAL)
Reviewer: Maria Santos (reviewer@lgu.gov.ph)
Action: APPROVE
Comment: "Renewal documents verified and complete. Business maintains compliance."
Created At: 2026-02-10
```

---

## 11. Application History (12 Total)

### App 1 Workflow (4 entries)
```
1. DRAFT → Initial creation (Juan)
2. DRAFT → SUBMITTED (Juan)
3. SUBMITTED → UNDER_REVIEW (Jose - staff)
4. UNDER_REVIEW → APPROVED (Maria - reviewer) - "All requirements met"
```

### App 2 Workflow (2 entries)
```
1. SUBMITTED → Initial submission (Juan)
2. SUBMITTED → UNDER_REVIEW (Jose - staff)
```

### App 3 Workflow (1 entry)
```
1. SUBMITTED → Initial submission (Pedro)
```

### App 5 Workflow (2 entries)
```
1. SUBMITTED → Initial submission (Pedro)
2. SUBMITTED → REJECTED (Maria - reviewer) - "Incomplete requirements"
```

### App 6 Workflow (3 entries)
```
1. SUBMITTED → Initial submission (Maria)
2. SUBMITTED → UNDER_REVIEW (Jose - staff)
3. UNDER_REVIEW → APPROVED (Maria - reviewer) - "All documents verified"
```

---

## 12. Activity Logs (26 Total)

### User Actions (7)
- admin: LOGIN
- juan: REGISTER, LOGIN, PROFILE_UPDATED
- pedro: REGISTER
- maria: REGISTER

### Application Actions (8)
- juan: CREATE_APPLICATION (x2), SUBMIT_APPLICATION (x2)
- pedro: CREATE_APPLICATION, SUBMIT_APPLICATION
- maria: CREATE_APPLICATION

### Document Actions (4)
- juan: UPLOAD_DOCUMENTS (x2)
- pedro: UPLOAD_DOCUMENTS
- maria: UPLOAD_DOCUMENTS

### Review Actions (2)
- jose: DOCUMENT_VERIFIED (x2)
- maria: REVIEW_APPROVE (x2)

### Claim & Permit Actions (5)
- juan: CLAIM_REFERENCE_GENERATED, SLOT_RESERVED
- maria: CLAIM_REFERENCE_GENERATED, SLOT_RESERVED
- jose: PERMIT_ISSUED (x2)

### Admin Actions (1)
- admin: ADMIN_UPDATE_USER

---

## 13. System Settings (11 Total)

| Setting | Value | Type |
|---------|-------|------|
| **LGU Configuration** | | |
| lgu_name | City of Quezon | string |
| lgu_address | Quezon City Hall, Elliptical Road, Diliman, Quezon City | string |
| lgu_phone | (02) 8988-4242 | string |
| lgu_email | bplo@quezoncity.gov.ph | string |
| **Business Rules** | | |
| permit_validity_days | 365 | number |
| max_file_size_mb | 10 | number |
| otp_expiry_minutes | 15 | number |
| session_timeout_minutes | 30 | number |
| **Security** | | |
| require_2fa_staff | true | boolean |
| maintenance_mode | false | boolean |
| **Upload Configuration** | | |
| allowed_file_types | ["application/pdf", "image/jpeg", "image/png", "image/webp"] | json |

---

## Testing Scenarios

### ✅ Scenario 1: Complete Workflow (Approved → Permit → Claim)
- **Test User**: juan@example.com
- **Application**: BP-2026-000001 (APPROVED)
- **Flow**: Application → Documents → Review → Permit → Claim Reference → Slot Reservation → Collection
- **Status**: ✅ Complete end-to-end
- **Payment**: Completed (GCash)

### 🔄 Scenario 2: In-Progress Review
- **Test User**: juan@example.com (secondary app)
- **Application**: BP-2026-000002 (UNDER_REVIEW)
- **Flow**: Application → Documents (partial) → Review (in progress)
- **Status**: 🔄 Waiting for approval
- **Payment**: Pending (Bank Transfer)

### 📋 Scenario 3: Initial Submission
- **Test User**: pedro@example.com (primary app)
- **Application**: BP-2026-000003 (SUBMITTED)
- **Flow**: Application → Documents → Awaiting verification
- **Status**: 📋 Initial phase
- **Payment**: Not yet required

### ✏️ Scenario 4: Draft State
- **Test User**: pedro@example.com (secondary app)
- **Application**: BP-2026-000004 (DRAFT)
- **Flow**: Incomplete application
- **Status**: ✏️ In-progress, not submitted
- **Payment**: N/A

### ❌ Scenario 5: Rejected Application
- **Test User**: pedro@example.com (tertiary app)
- **Application**: BP-2026-000005 (REJECTED)
- **Flow**: Application → Rejection → Requires revision
- **Status**: ❌ Rejected - resubmission needed
- **Reason**: Missing documents

### 🔄 Scenario 6: Renewal Process
- **Test User**: maria@example.com
- **Application**: BP-2026-000006 (RENEWAL - APPROVED)
- **Flow**: Renewal submission → Verification → Approval → New Permit
- **Status**: ✅ Renewal completed
- **Payment**: Completed (Maya)
- **Claim**: Pending collection

### 🔐 Scenario 7: Pending Verification User
- **Test User**: ana@example.com
- **Status**: Cannot login (email not verified)
- **Use Case**: Test email verification and account activation flow

---

## Data Relationships Summary

```
Users (7)
├── Admin: System Administrator
├── Staff: Jose Reyes (document verification)
├── Reviewer: Maria Santos (application approval)
└── Applicants (4)
    ├── Juan (2 applications + 1 active claim)
    ├── Pedro (2 applications)
    ├── Maria (1 application + 1 active claim)
    └── Ana (pending verification)

Applications (6)
├── APPROVED (2)
│   ├── App 1: Juan's Store (complete workflow)
│   └── App 6: Maria's Salon (renewal)
├── UNDER_REVIEW (1)
│   └── App 2: JDC Computer (documents pending)
├── SUBMITTED (1)
│   └── App 3: Pedro's Repair (initial phase)
├── DRAFT (1)
│   └── App 4: Garcia Hardware (incomplete)
└── REJECTED (1)
    └── App 5: Garcia Food Cart (missing docs)

Documents (9)
├── App 1: 3 verified
├── App 2: 2 mixed status (1 pending, 1 uploaded)
├── App 3: 1 uploaded
└── App 6: 3 verified

Permits (2) - All ACTIVE
├── Permit 1: Juan's (issued 2026-01-20, expires 2027-01-20)
└── Permit 2: Maria's (issued 2026-02-11, expires 2027-02-11)

Claim References (2)
├── Ref 1: Juan's (CLAIMED)
└── Ref 2: Maria's (GENERATED - pending claim)

Slot Reservations (2) - Both CONFIRMED
├── Juan: 09:00-10:00
└── Maria: 10:00-11:00

Payments (3)
├── Payment 1: Juan's (COMPLETED - GCash ₱5,000)
├── Payment 2: Maria's (COMPLETED - Maya ₱3,500)
└── Payment 3: JDC (PENDING - Bank Transfer ₱5,000)
```

---

## How to Use This Test Data

### 1. Seeding the Database
```bash
cd web
npm run db:seed
```

### 2. Login Examples

**Admin Dashboard:**
```
Email: admin@lgu.gov.ph
Password: Password123!
→ Access: All features + user management
```

**Reviewer Workflow:**
```
Email: reviewer@lgu.gov.ph
Password: Password123!
→ Access: Review queue (App 2), Approve/Reject decisions
```

**Staff Operations:**
```
Email: staff@lgu.gov.ph
Password: Password123!
→ Access: Document verification, Schedule management, Claim processing
```

**Applicant Journey:**
```
Email: juan@example.com
Password: Password123!
→ Access: Dashboard, View applications (1 & 2), Track status, Download permit
```

### 3. Testing Workflows

#### Test Document Verification
- Login as staff: `staff@lgu.gov.ph`
- Go to "Verify Documents"
- App 2 has documents pending: `PENDING_VERIFICATION` status

#### Test Application Review
- Login as reviewer: `reviewer@lgu.gov.ph`
- Go to "Review Queue"
- App 2 is awaiting approval (UNDER_REVIEW status)

#### Test Payment Processing
- App 1 & 6: COMPLETED (review payment history)
- App 2: PENDING (test pending payment handling)

#### Test Claim Scheduling
- Login as juan: `juan@example.com`
- App 1 has active claim reference: `CLM-20260120-ABC123`
- View claim details and schedule confirmation

#### Test Complete Workflow
- Follow App 1 from approval → permit issuance → claim → collection
- All related documents, payments, and schedules are connected

---

## Notes & Caveats

1. **OTP Tokens**: Test tokens expire 15-30 minutes after seeding. For production, implement proper OTP generation.

2. **Dates**: All dates are from 2026 for testing consistency. Adjust as needed for current date comparisons.

3. **Claim Schedules**: Generated for next 10 business days from seeding. Update if testing beyond that period.

4. **Passwords**: All accounts use `Password123!`. Change in production environments.

5. **Payment Mock**: PayMongo responses are mocked. Configure real gateway for production testing.

6. **Anna's Account**: Cannot login initially. Test account activation via email verification flow.

7. **Payment Status**: PAY-2026-000003 stays PENDING for testing webhook/callback flows.

---

## File Locations

- **Seed Script**: `web/prisma/seed.js`
- **Schema**: `web/prisma/schema.prisma`
- **Test Credentials**: `username_and_password.md` (in project root)
- **This Document**: `test-data-summary-new.md`

---

## Statistics

| Category | Count |
|----------|-------|
| Users | 7 |
| Applications | 6 |
| Documents | 9 |
| Permits | 2 |
| Claim References | 2 |
| Claim Schedules | 10+ |
| Time Slots | 60+ |
| Slot Reservations | 2 |
| OTP Tokens | 2 |
| Payments | 3 |
| Review Actions | 3 |
| Application History Entries | 12 |
| Activity Logs | 26 |
| System Settings | 11 |
| **Total Records** | **~155+** |

---

**Last Updated**: 2026-04-13
**Status**: Ready for testing
**Next Steps**: Run `npm run db:seed` and start testing with provided credentials
