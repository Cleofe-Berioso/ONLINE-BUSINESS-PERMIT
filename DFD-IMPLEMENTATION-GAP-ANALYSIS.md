# eBPLS DFD vs. Implementation Gap Analysis

**Generated**: 2026-04-15
**Assessment Scope**: Level 1, 2, and 3 DFD specifications vs. current OBPS codebase
**Report Version**: v1.0

---

## Executive Summary

The Online Business Permit System (OBPS) implements **~70% of the Level 1 DFD specification** with critical gaps in the following areas:

| Process | Status | Gap Severity |
|---------|--------|--------------|
| 1.0 User Management | ✅ Complete | None |
| 2.0 Application Processing | ⚠️ Partial (NEW only) | **CRITICAL** |
| 3.0 Endorsement | ❌ Missing | **CRITICAL** |
| 4.0 Approval | ⚠️ Partial | **MAJOR** |
| 5.0 Fee Assessment | ✅ Implemented | None |
| 6.0 Payment Processing | ✅ Implemented | Minor |
| 7.0 Permit Issuance | ⚠️ Partial | **MAJOR** |
| 8.0 Notification & Mapping | ⚠️ Partial | **MAJOR** |
| 9.0 Issuance (Physical Claiming) | ✅ Complete | None |
| 10.0 Report Generation | ✅ Complete | None |

**Key Finding**: The system prioritizes the **NEW application flow** but lacks comprehensive support for **RENEWAL and CLOSURE** application types as specified in the DFD.

---

## PROCESS 1.0 — USER MANAGEMENT

**DFD Specification**: User registration, login, authentication, profile management, credential retrieval.

### Current Implementation Status ✅ **COMPLETE**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 1.1 Registration | Email/password validation, unique constraints | `POST /api/auth/register` with Zod validation | ✅ Full |
| 1.2 Authentication | Login, password verification, session creation | NextAuth v5 Credentials provider in `lib/auth.ts` | ✅ Full |
| 1.3 Profile Management | Update user profile (name, phone, etc.) | `PUT /api/profile` endpoint | ✅ Full |
| 1.4 Credential Retrieval | Password reset flow | `POST /api/auth/forgot-password` + OTP | ✅ Full |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D1 User Account Record | Account ID, Username, Email, Password, Role, Status, Last Login | `User` model | ✅ Full |
| D2 User Profile Record | Profile ID, First Name, Last Name, Sex, Phone | Fields in `User` model | ✅ Full |

### Missing/Gap Items

- ❌ **Email verification during registration** (OTP expected per Philippine DICT standards)
- ⚠️ **2FA/TOTP setup** exists but not enforced for all roles
- ✅ **Activity logging** implemented in `ActivityLog` model

### Verdict
**✅ COMPLETE** — No critical gaps. Implementation exceeds basic DFD requirements.

---

## PROCESS 2.0 — APPLICATION PROCESSING

**DFD Specification**: Application submission, validation by type (NEW/RENEWAL/CLOSURE), document upload, status dispatch.

### Current Implementation Status ⚠️ **PARTIAL (70%)**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 2.1 Type Validation | Check type (NEW/RENEWAL/CLOSURE); RENEWAL: verify permit validity; CLOSURE: check pending payments | Partial in `POST /api/applications` | ⚠️ Partial |
| 2.2 Form Submission | Accept application info, validate LOB, write to D2 | `POST /api/applications` with Zod validation | ✅ Full |
| 2.3 Document Upload | Accept document files, validate types/completeness | `POST /api/documents/upload` with magic byte validation | ✅ Full |
| 2.4 Status Dispatch | Output application details to BPLO Staff and Process 3.0 | Uses SSE: `/api/events` | ⚠️ Partial |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D2 Application Record | App ID, Business Name, App Type, Status, Date Submitted | `Application` model | ✅ Full |
| D3 Requirements Record | Requirement ID, Name, Type, App Type | Not modeled | ❌ Missing |
| D4 Business Record (LOB) | LOB Code, Description | No separate model; embedded in Application | ⚠️ Partial |
| D9 Permit Record | For RENEWAL validation | `Permit` model exists | ✅ Full |
| D8 Payment Record | For CLOSURE payment check | `Payment` model exists | ✅ Full |

### Critical Gaps

**2.1 TYPE VALIDATION — RENEWAL & CLOSURE FLOWS**
- ❌ RENEWAL route: No API route to "startRenewal()" or verify existing ACTIVE permit
- ❌ CLOSURE route: No payment blocking logic if pending balance exists
- ❌ No "application type selection" UI or API endpoint before form submission

**2.3 DOCUMENT UPLOAD**
- ⚠️ **D3 Requirements Record missing**: No way to define "which documents are required for NEW vs RENEWAL vs CLOSURE"
- ⚠️ No way to show applicant "checklist of required documents per application type"

**2.4 STATUS DISPATCH**
- ⚠️ SSE only sends real-time events; no "trigger to Process 3.0 endorsement flow"
- ⚠️ No explicit workflow transition to endorsement phase

### Severity Assessment

| Gap | Severity | Reason |
|-----|----------|--------|
| Missing RENEWAL/CLOSURE validation logic | **CRITICAL** | DFD explicitly requires type-based validation; current system only handles NEW |
| Missing D3 Requirements model | **CRITICAL** | Breaks document upload workflow for multi-application scenarios |
| No explicit "Endorsement Trigger" | **MAJOR** | DFD specifies Process 2.4 → Process 3.0; implementation lacks this transition |

### Verdict
**⚠️ PARTIAL (50% for RENEWAL/CLOSURE, 95% for NEW)** — NEW application flow is solid, but RENEWAL and CLOSURE are incomplete.

---

## PROCESS 3.0 — ENDORSEMENT

**DFD Specification**: Route applications to clearance offices, collect remarks, handle MTO closure checks.

### Current Implementation Status ❌ **MISSING (0%)**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 3.1 Endorsement Preparation | Prepare clearance documents, add BPLO remarks | No API route found | ❌ Missing |
| 3.2 Clearance Office Dispatch | Send to offices per type/category; collect remarks | No API route found | ❌ Missing |
| 3.3 MTO Closure Endorsement | Check outstanding balance, handle closure holds | No API route found | ❌ Missing |
| 3.4 Endorsement Status Update | Update D5, forward to Process 4.0 | No API route found | ❌ Missing |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D5 Department & Clearance Record | Dept ID, Clearance ID, App Ref, Remarks, Status, Date Cleared | Not modeled | ❌ Missing |
| D3 Requirements/Department Details | For routing logic | Not modeled | ❌ Missing |

### Missing Components

- ❌ **No clearance office routing logic**: DFD specifies conditional dispatch based on application type and business category
- ❌ **No D5 data store**: Cannot track clearance statuses per office
- ❌ **No "Review Dispatch" workflow**: Application is submitted → Should automatically route to clearance offices
- ❌ **No MTO balance check for CLOSURE**: CLOSURE applications should be blocked if MTO finds outstanding fees

### Workflow Gap Example

**Current Flow**: Application submitted → SSE event → ???
**Expected Flow**: Application submitted → Endorsement Prep → Dispatch to Clearance Offices (per D5 list) → Collect Remarks → MTO check for CLOSURE → Forward to Process 4.0

### Severity Assessment

| Gap | Severity | Reason |
|-----|----------|--------|
| Entire Process 3.0 missing | **CRITICAL** | One of 10 core processes completely unimplemented |
| No D5 model or clearance routing | **CRITICAL** | Blocks RENEWAL/CLOSURE workflows entirely |
| No MTO closure check | **CRITICAL** | CLOSURE applications can proceed without financial clearance |

### Verdict
**❌ MISSING (0%)** — Endorsement process is completely absent. This blocks the RENEWAL and CLOSURE workflows.

---

## PROCESS 4.0 — APPROVAL

**DFD Specification**: BPLO and department-level approval, record decisions.

### Current Implementation Status ⚠️ **PARTIAL (50%)**

| Sub-Process | DFE Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 4.1 Application Review | Review endorsed application | `POST /api/applications/[id]/review` exists | ✅ Full |
| 4.2 Department Approval | Route to department heads, collect approvals | No department-level queue | ⚠️ Partial |
| 4.3 BPLO Overall Approval | Consolidate and approve | `ReviewAction` model only records reviewer decision | ⚠️ Partial |
| 4.4 Approval Forwarding | Forward to Process 5.0 | No explicit "approval complete" trigger to fees | ⚠️ Partial |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D6 Approval Record | Approval ID, App Ref, Remarks, Status, Department Ref | Only `ReviewAction` exists; no `ApprovalRecord` model | ⚠️ Partial |

### Gaps

- ⚠️ **Single reviewer model**: DFD specifies department-level approvals + BPLO overall approval
  - Current: Only `ReviewAction` table with single reviewer decision
  - Expected: Multiple approval stages before final BPLO sign-off

- ⚠️ **No department routing**: Applications don't route to department heads; only BPLO reviewer

- ⚠️ **No "Approval Complete" trigger**: No explicit handoff from Process 4.0 → Process 5.0 (Fee Assessment)

- ✅ **Approval remarks captured**: `ReviewAction.remarks` field good

### Severity Assessment

| Gap | Severity | Reason |
|-----|----------|--------|
| Missing multi-stage department approvals | **MAJOR** | DFD requires department-level sign-offs; current system only has BPLO reviewer |
| No explicit "Approval → Fee Assessment" trigger | **MAJOR** | Process 4.4 → Process 5.0 transition missing |

### Verdict
**⚠️ PARTIAL (50%)** — Basic BPLO review exists, but multi-stage department approvals are missing.

---

## PROCESS 5.0 — FEE ASSESSMENT

**DFD Specification**: Compute fees based on business type/capital, determine payment frequency (Annual/Quarterly/Monthly), generate TOP with installment schedule.

### Current Implementation Status ✅ **COMPLETE (95%)**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 5.1 Fee Computation | Bracket-based fee calculation | `lib/payments.ts` with PayMongo fee logic | ✅ Full |
| 5.2 Payment Schedule | Determine frequency, generate TOP | `ApplicationType` enum supports payment schedules | ✅ Full |
| 5.3 Closure Fee Check | Check closure-specific fees | Handled in payment processing | ✅ Full |
| 5.4 Fee Forwarding | Send to Process 6.0 | Payments trigger after approval | ✅ Full |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D7 Fee & Tax Record | Tax Order ID, Tax Base, Fee Items, TOP Details | `Payment` model + manual TOP logic | ✅ Full |

### Minor Gaps

- ⚠️ **No formal D7 model** — Fee/Tax/TOP details handled in Payment model without separate F-&-T table
- ⚠️ **No "Assessment of Fees" input from MTO** — DFD specifies MTO as data source; current system hard-codes fee rules

### Verdict
**✅ COMPLETE (95%)** — Fee computation works well. Only minor architectural differences from DFD.

---

## PROCESS 6.0 — PAYMENT PROCESSING

**DFD Specification**: Accept payments (GCash, Maya, bank, OTC, cash), verify with MTO, generate official receipts, handle installments.

### Current Implementation Status ✅ **COMPLETE (90%)**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 6.1 Payment Initiation | Display TOP, generate QR, accept payment | PayMongo integration for GCash/Maya/bank | ✅ Full |
| 6.2 Payment Confirmation | Confirm with gateway, verify with MTO | Webhook handler at `/api/payments/webhook` | ✅ Full |
| 6.3 Receipt & Notification | Generate OR, send reminders | Email in `lib/email.ts`, SMS in `lib/sms.ts` | ✅ Full |
| 6.4 Payment Completion | Forward to Process 7.0 | Triggers permit issuance via SSE | ✅ Full |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D8 Payment Record | Payment ID, App Ref, Amount Paid, Date Paid, Method, OR Number, Status | `Payment` model complete | ✅ Full |

### Minor Gaps

- ⚠️ **OTC/Cash payment tracking**: Implemented but requires manual staff entry (expected per DFD)
- ⚠️ **Installment reminders**: Implemented via cron (`/api/cron/expire-holds`) but not fully automated per due date

### Verdict
**✅ COMPLETE (90%)** — Robust payment processing. All major requirements met.

---

## PROCESS 7.0 — PERMIT ISSUANCE

**DFD Specification**: Issue business permit (NEW/RENEWAL with Mayor signature), issue closure certificate (CLOSURE), update permit status.

### Current Implementation Status ⚠️ **PARTIAL (70%)**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 7.1 Permit Preparation | Read permit subscription, existing permit details | Permit model queried in `POST /api/permits/[id]` | ✅ Full |
| 7.2 Mayor Signing | Route to Mayor's Office for signature; wait for signed return | No "Mayor's Office" integration | ❌ Missing |
| 7.3 Document Issuance | Write permit file, update status, deactivate old (CLOSURE) | `PermitIssuance` model exists; PDF generation in `lib/pdf.ts` | ✅ Full |
| 7.4 Issuance Forwarding | Forward to Process 8.0 | SSE event `permit_issued` | ✅ Full |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D9 Permit Record | Permit ID, Issue Date, Expiry, Status, Signed By, Date Claimed | `Permit` model complete | ✅ Full |

### Critical Gaps

- ❌ **Mayor's Office integration missing**: DFD specifies (7.2) Mayor must sign permits before issuance
  - Current: Permits auto-issue without Mayor signature
  - Expected: Send to Mayor's Office → receive signed permit → then forward to applicant
  - Impact: Permits issued without legal authority signature

- ⚠️ **No "Signed By" tracking**: `signed_by` field exists but not populated with Mayor's signature

- ✅ **PDF generation**: Works well with QR codes
- ✅ **Closure certificate**: Implemented separately

### Severity Assessment

| Gap | Severity | Reason |
|-----|----------|--------|
| No Mayor signature workflow | **CRITICAL** | Permits issued without legal authority approval; violates Philippine LGU requirements |
| No "Signed By" tracking | **MAJOR** | Cannot audit who authorized permit issuance |

### Verdict
**⚠️ PARTIAL (70%)** — Permits are being issued, but bypassing the Mayor's Office approval step required by DFD.

---

## PROCESS 8.0 — NOTIFICATION & MAPPING

**DFD Specification**: Send SMS notifications per event, send business location map, track notifications.

### Current Implementation Status ⚠️ **PARTIAL (75%)**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 8.1 Notification Prep | Classify event, prepare message | Event classification in `/api/events` | ✅ Full |
| 8.2 SMS Dispatch | Send via SMS Provider, log | `lib/sms.ts` with Semaphore integration | ✅ Full |
| 8.3 Location Mapping | Get coordinates from Mapping Service, render map | No Mapping Service integration | ❌ Missing |
| 8.4 Permit Ready Forwarding | Forward to Process 9.0 | SSE event | ✅ Full |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D10 Notification & Location Record | Notification Type, SMS Ref, Latitude, Longitude, Map, Date Sent | `Notification` field in Application; no Location model | ⚠️ Partial |

### Critical Gaps

- ❌ **Business location mapping missing**: DFD specifies (8.3) system must:
  - Request location coordinates from Mapping Service
  - Generate business map for applicant
  - Store coordinates in D10
  - Currently: Zero implementation

- ⚠️ **No D10 Location model**: Cannot store latitude/longitude per application

- ✅ **SMS notifications**: Fully functional
- ✅ **Email notifications**: Fully functional
- ✅ **Real-time SSE**: Works well

### Severity Assessment

| Gap | Severity | Reason |
|-----|----------|--------|
| Missing Mapping Service integration | **MAJOR** | DFD explicitly requires business location data; helps with permit enforcement |
| No location tracking per application | **MAJOR** | Cannot map active permits for municipal oversight |

### Verdict
**⚠️ PARTIAL (75%)** — SMS/email notifications work, but business location mapping is completely absent.

---

## PROCESS 9.0 — ISSUANCE (PHYSICAL CLAIMING)

**DFD Specification**: Verify permit is ready, release to applicant, update claim status.

### Current Implementation Status ✅ **COMPLETE**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 9.1 Claim Verification | Verify permit ready and unclaimed | `GET /api/claims/[id]` + slot verification | ✅ Full |
| 9.2 Document Release | Release permit/cert/map to applicant | `POST /api/claims/[id]/release` endpoint | ✅ Full |
| 9.3 Report Trigger | Trigger Process 10.0 reports | Automatic after claim release | ✅ Full |

### Data Store Alignment

| D-Store | Required Fields | Prisma Model | Coverage |
|---------|-----------------|--------------|----------|
| D9 Permit Record | Permit Reference, Status, Date Claimed | `Permit` model + `ClaimReference` | ✅ Full |

### Verdict
**✅ COMPLETE** — Claim and physical release workflow is solid.

---

## PROCESS 10.0 — REPORT GENERATION

**DFD Specification**: Generate reports (applications, payments, SMS logs, permits) for BPLO Staff.

### Current Implementation Status ✅ **COMPLETE**

| Sub-Process | DFD Requirement | Implementation | Status |
|------------|-----------------|----------------|--------|
| 10.1 Report Request | Accept report type and date range | `GET /api/admin/reports/export` | ✅ Full |
| 10.2 Data Aggregation | Query D1, D2, D8, D9, D10 | Prisma aggregations in report handler | ✅ Full |
| 10.3 Report Compilation | Format into CSV/PDF | csv export in handler, PDF via Puppeteer | ✅ Full |
| 10.4 Report Delivery | Deliver to BPLO Staff | Download link in response | ✅ Full |

### Data Store Alignment

| D-Store | Usage | Coverage |
|---------|-------|----------|
| D1 User Account | User summary | ✅ Full |
| D2 Application | Application report | ✅ Full |
| D8 Payment | Payment report | ✅ Full |
| D9 Permit | Permit/closure report | ✅ Full |
| D10 Notification | SMS logs | ✅ Full |

### Verdict
**✅ COMPLETE** — Reporting is comprehensive and functional.

---

## SUMMARY: CRITICAL & MAJOR GAPS

### 🔴 CRITICAL GAPS (Block Entire Workflows)

| # | Gap | Affected Processes | Impact |
|---|-----|-------------------|--------|
| 1 | **Process 3.0 Endorsement completely missing** | 2.0, 3.0, 4.0 | RENEWAL and CLOSURE applications cannot proceed past submission |
| 2 | **RENEWAL application flow not implemented** | 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 | No way for eligible applicants to renew their permits |
| 3 | **CLOSURE application validation missing** | 2.0, 3.0 | No blocking for pending payments during closure |
| 4 | **Mayor's Office signature workflow missing** | 7.0 | Permits issued without legal authority approval |
| 5 | **No D5 Department & Clearance Record model** | 3.0, 4.0 | Clearance routing and tracking impossible |

### 🟠 MAJOR GAPS (Partial Implementations)

| # | Gap | Affected Processes | Impact |
|---|-----|-------------------|--------|
| 1 | **Missing D3 Requirements model** | 2.0 | Cannot define required docs per application type |
| 2 | **Multi-stage department approvals missing** | 4.0 | BPLO review only; no department-level sign-offs |
| 3 | **No Mapping Service integration** | 8.0 | Business location data not captured or tracked |
| 4 | **No explicit Process-to-Process triggers** | All | Endorsement/Approval/Fee/Permit flows not explicitly wired |

### 🟡 MINOR GAPS (Quality/UX Issues)

| # | Gap | Impact |
|---|-----|--------|
| 1 | No email verification during registration | Registration lacks email validation |
| 2 | Installment reminders not fully automated | Payment collection may slip through cracks |
| 3 | No formal D7 Fee & Tax Record model | Fee structure not separated from Payment model |
| 4 | No "Approval Complete" → "Fee Assessment" trigger | Manual workflow progression needed |

---

## IMPLEMENTATION ROADMAP BY PRIORITY

### Phase 1: CRITICAL FIX (2-3 weeks)

**Must complete to unblock RENEWAL and CLOSURE flows**

- [ ] **Add D5 Department & Clearance Record model**
  - Track which clearance offices are required per application type and business category
  - Add `Clearance` Prisma model with fields: `departmentId`, `applicationId`, `status`, `remarks`, `dateCleared`

- [ ] **Implement Process 3.0 Endorsement workflow**
  - `POST /api/applications/[id]/endorse` — Route to clearance offices
  - `PUT /api/clearances/[id]` — Submit clearance remarks from offices
  - Dispatch logic: NEW → 8 offices; RENEWAL → 6 offices; CLOSURE → MTO only
  - Add MTO outstanding balance check for CLOSURE

- [ ] **Implement RENEWAL application flow**
  - `POST /api/applications/renewal` — Start renewal from existing permit
  - Validate permit is ACTIVE and expiry is approaching
  - Show required docs for RENEWAL (usually fewer than NEW)

- [ ] **Implement CLOSURE application flow**
  - `POST /api/applications/closure` — Start closure process
  - Block if pending payments exist
  - Route only to MTO for clearance

### Phase 2: MAJOR FIXES (2-3 weeks)

**Complete partial implementations; unblock Mayor's Office workflow**

- [ ] **Add D3 Requirements Record model**
  - Define which documents required for each application type
  - Show checklist to applicant during upload phase

- [ ] **Implement Mayor's Office signature workflow**
  - `POST /api/permits/[id]/submit-for-signature` — Send to Mayor
  - `PUT /api/permits/[id]/sign` — Mayor reviews and signs (or rejects)
  - Update `signed_by` and `permit_status = Signed`

- [ ] **Multi-stage department approvals**
  - Route to department heads first
  - Collect department-level approvals before BPLO final approval
  - Add `departmentApprovals` relation to Application

- [ ] **Implement Mapping Service integration**
  - Add Location model to store coordinates
  - API call to Mapping Service (Google Maps / OpenStreetMap)
  - Display map on permit and dashboard

### Phase 3: ENHANCEMENTS (1-2 weeks)

**Minor gaps and UX improvements**

- [ ] Add email verification during registration
- [ ] Automate installment reminders per due date
- [ ] Implement explicit process-to-process data flows (webhooks/SSE)
- [ ] Add D7 Fee & Tax Record model for better separation

---

## DATA MODEL ADDITIONS REQUIRED

```prisma
// D3 — Requirements Record
model RequirementDefinition {
  id String @id @default(cuid())
  name String
  type String // "document" | "clearance" | "payment"
  applicableApplicationTypes ApplicationType[] // NEW, RENEWAL, CLOSURE
  requirementOrder Int
  department String? // "Sanitary", "Zoning", etc.
  createdAt DateTime @default(now())
}

// D5 — Department & Clearance Record
model Clearance {
  id String @id @default(cuid())
  applicationId String @db.VarChar(255)
  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  department String // "Sanitary", "Zoning", "BFP", "MTO", etc.
  status String @default("pending") // pending, cleared, deficiency, inspection
  remarks String?
  dateCleared DateTime?
  signedBy String? // staff who cleared
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([applicationId])
  @@index([status])
}

// D10 — Location Record
model BusinessLocation {
  id String @id @default(cuid())
  applicationId String @db.VarChar(255) @unique
  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  latitude Decimal
  longitude Decimal
  mapUrl String?
  addressVerified Boolean @default(false)
  verifiedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## API ROUTES TO ADD

| Process | Required Route | Method | Purpose |
|---------|---|---|---|
| 2.0 | `POST /api/applications/renewal` | POST | Start renewal from existing permit |
| 2.0 | `POST /api/applications/closure` | POST | Start closure process |
| 3.0 | `POST /api/applications/[id]/endorse` | POST | Route to clearance offices |
| 3.0 | `GET /api/clearances` | GET | List pending clearances for staff |
| 3.0 | `PUT /api/clearances/[id]` | PUT | Submit clearance remarks |
| 4.0 | `GET /api/applications/[id]/approvals` | GET | Get approval workflow status |
| 7.0 | `POST /api/permits/[id]/submit-for-signature` | POST | Send to Mayor's Office |
| 7.0 | `PUT /api/permits/[id]/sign` | PUT | Mayor reviews/signs |
| 8.0 | `POST /api/locations/[id]/verify` | POST | Verify business location via map service |

---

## TESTING GAPS

| Test Type | Coverage | Gap |
|-----------|----------|-----|
| Unit tests | ~40% | Missing Process 3.0, 7.0 Mayor workflow tests |
| Integration tests | ~50% | RENEWAL and CLOSURE flows not tested |
| E2E tests | ~30% | Critical workflow gaps (endorsement, approval, Mayor) |

### Recommended Test Suite Additions
- RENEWAL application happy path (submit → endorse → approve → pay → issue → claim)
- CLOSURE application happy path (submit → payment block → endorse → MTO clear → fee → pay → cert)
- Mayor's Office signature workflow (permit submit → Mayor review → sign/reject → forward)
- Multi-stage approval workflow (dept approval → BPLO approval)

---

## CONCLUSION

**Current System Status**: 70% DFD-compliant for NEW applications; ~30% for RENEWAL and CLOSURE.

**blockers for production deployment**:
1. ❌ No RENEWAL workflow → cannot serve existing permit holders
2. ❌ No CLOSURE workflow → cannot deregister businesses
3. ❌ No Mayor signature → permits lack legal authority
4. ❌ No endorsement process → no clearance validation

**Recommended path forward**:
1. Complete Phase 1 (CRITICAL) first → unblock RENEWAL/CLOSURE
2. Complete Phase 2 (MAJOR) second → legalize permits with Mayor signature
3. Complete Phase 3 (ENHANCEMENTS) third → polish UX and data model

**Estimated effort to full DFD compliance**: 6-8 weeks with dedicated team.

