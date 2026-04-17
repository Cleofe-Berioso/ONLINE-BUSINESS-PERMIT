# System Data Template — Frontend Alignment Audit
**Date:** April 17, 2026
**Scope:** Frontend UI only (not backend logic)
**Source of Truth:** `DFD's and data template/System_Data_Template.md`

---

## 1. Final Data Template Alignment Verdict

**Overall Status: MOSTLY ALIGNED (85-90%)**

**Summary:**
- ✅ ALL Business Information fields from Data Template are captured in NEW form
- ✅ ALL Personal Information fields from Data Template are captured in NEW form
- ✅ Renewal form captures Annual Gross Sales requirement
- ✅ Closure form captures required fields (reason, effective date, permit selection)
- ⚠️ **CRITICAL WEAKNESS:** Document requirement guidance is missing/weak across all flows
- ⚠️ **PARTIAL:** Renewal form mentions documents exist "on next page" but no clear checklist
- ⚠️ **PARTIAL:** Closure form has no document guidance at all
- ⚠️ **MINOR:** Application detail page doesn't show owner personal information

The frontend captures **required form fields well**, but **fails to clearly communicate document requirements** to users, which is a significant Data Template alignment gap.

---

## 2. NEW Application — Business Information Audit

| Data Template Field | Relevant Frontend File | Current Frontend Behavior | Alignment Status | Notes |
|---|---|---|---|---|
| **Business Name** | `applications/new/page.tsx` | Input field, required, max 200 chars | ✅ Fully Aligned | Clear label, required validation |
| **Type of Business** (Solo/Partnership/Corp/Coop) | `applications/new/page.tsx` | Select dropdown with 4 options, required | ✅ Fully Aligned | Proper enum mapping |
| **Line of Business / Business Activity** | `applications/new/page.tsx` | Text input, required, max 200 chars, with placeholder example | ✅ Fully Aligned | Clear guidance (e.g., Retail Trade, Food Service) |
| **Business Address** | `applications/new/page.tsx` | Text input (street), required | ✅ Fully Aligned | Separated as "Street Address" with support fields |
| **Postal Code** | `applications/new/page.tsx` | Input field (businessZipCode), 4-digit validation | ✅ Fully Aligned | Labeled clearly |
| **Mobile Number** | `applications/new/page.tsx` | Text input (businessPhone), optional | ✅ Partially Aligned | Present but not labeled as required in Data Template |
| **Email Address** | `applications/new/page.tsx` | Email input, optional | ✅ Partially Aligned | Data Template says "optional" — correctly optional |
| **Tax Identification Number (TIN)** | `applications/new/page.tsx` | Text input (tinNumber), optional, with regex validation | ✅ Fully Aligned | Format: xxx-xxx-xxx-xxx |
| **Registration No. (DTI/SEC/CDA)** | `applications/new/page.tsx` | Text input (dtiSecRegistration), optional | ✅ Fully Aligned | Generic field, accepts all types |
| **Capitalization** | `applications/new/page.tsx` | Input field (capitalInvestment), numeric, optional | ✅ Fully Aligned | Named "Capital Investment (₱)" |
| **Asset Value** | `applications/new/page.tsx` | Input field (assetValue), numeric, optional, currency | ✅ Fully Aligned | Labeled "Asset Value (₱)" |
| **Number of Employees** | `applications/new/page.tsx` | Number input, optional | ✅ Fully Aligned | Integer validation |
| **Business Area (sqm)** | `applications/new/page.tsx` | Number input, optional, decimal step | ✅ Fully Aligned | Labeled "Business Area (sqm)" |
| **Monthly Rental** | `applications/new/page.tsx` | Number input, optional, currency | ✅ Fully Aligned | Labeled "Monthly Rental (₱)" |

**Summary:** ✅ **All 14 Business Information fields are fully captured in the frontend.**

---

## 3. NEW Application — Personal Information Audit

| Data Template Field | Relevant Frontend File | Current Frontend Behavior | Alignment Status | Notes |
|---|---|---|---|---|
| **Owner's Name** | `applications/new/page.tsx` | Input field, required, max 100 chars | ✅ Fully Aligned | Clear label "Owner's Full Name" |
| **Birthdate** | `applications/new/page.tsx` | Date input, required, YYYY-MM-DD | ✅ Fully Aligned | HTML `type="date"` picker |
| **Residence Address** | `applications/new/page.tsx` | Text input, required, max 300 chars | ✅ Fully Aligned | Placeholder shows expected format |
| **Mobile Number** | `applications/new/page.tsx` | Tel input, required, PH format validation | ✅ Fully Aligned | Regex: `(\+63\|0)(9\d{9})` |

**Summary:** ✅ **All 4 Personal Information fields are fully captured in the frontend.**

---

## 4. RENEWAL Data Template Audit

| Requirement | Relevant Frontend File | Current Frontend Behavior | Alignment Status | Notes |
|---|---|---|---|---|
| **Proof of Annual Gross Receipts input** | `renew/permit/page.tsx` | Required numeric field "Annual Gross Sales / Income (₱)" | ✅ Fully Aligned | Clear label with Filipino context |
| **Gross Receipts guidance** | `renew/permit/page.tsx` | Supporting text: "Enter your annual gross sales for the previous fiscal year" | ✅ Fully Aligned | Clear instruction |
| **Proof doc upload guidance (AFS / Sworn Declaration)** | `renew/permit/page.tsx` | Blue info box: "Note: You will upload supporting documents (AFS or sworn declaration) on the next page." | ⚠️ Partially Aligned | Mentions documents exist "on next page" but no checklist or clarity about what's required |
| **Renewal-specific business details** | `renew/permit/page.tsx` | Permit summary shown (permitNumber, businessName, expiryDate) | ✅ Fully Aligned | Read-only display of active permit |
| **Renewal window information** | `renew/page.tsx` | Shows expiry date, renewal window (earliest/latest renewal dates) | ✅ Fully Aligned | Shown in permit selection page |
| **Required document types (Sanitary, Environment, Engineering, BFP, RPT, Water, Assessor, Market, Agriculture)** | Renewal form pages | **NOT VISIBLE** — No checklist of required clearances | ❌ Missing | Critical gap: User doesn't see what documents/clearances are needed |

**Summary:** ⚠️ **Mostly aligned for data input, but WEAK on document requirements visibility.**

---

## 5. CLOSURE Data Template Audit

| Requirement | Relevant Frontend File | Current Frontend Behavior | Alignment Status | Notes |
|---|---|---|---|---|
| **Permit selection** | `applications/closure/page.tsx` | Dropdown with eligible permits, shows permit number + business name | ✅ Fully Aligned | Clear selection with eligibility badges |
| **Closure reason** | `applications/closure/page.tsx` | Textarea (4 rows), required, min 5 chars | ✅ Fully Aligned | Good placeholder: "e.g., Retirement, relocation, business sold" |
| **Effective closure date** | `applications/closure/page.tsx` | Date input, required | ✅ Fully Aligned | Labeled "Effective Closure Date" |
| **Business context display** | `applications/closure/page.tsx` | Permit selection shows correct business name and address | ✅ Fully Aligned | No hardcoded TBD values |
| **Closure blocking/eligibility** | `applications/closure/page.tsx` | Shows ineligible permits as disabled, displays specific reason in red alert | ✅ Fully Aligned | Clear blocking UX: "Cannot close: [reason]" |
| **Document requirements for closure** | Closure form pages | **NOT VISIBLE** — No mention of what documents (if any) are needed | ❌ Not Specified | Data Template doesn't explicitly list closure documents, but form gives no guidance |

**Summary:** ✅ **Form fields are well implemented, but no document guidance provided.**

---

## 6. Document Requirement Visibility Audit

### NEW Application
**Data Template Requirements:**
1. Proof or Certificate of Registration (DTI/SEC/CDA) — 1 photocopy
2. Proof of ownership/right to use location (Transfer Certificate/Lease/Consent) — 1 certified copy
3. Location plan or sketch — 1 original copy
4. Fire Safety Inspection Certificate (9+ months valid) — 1 original copy
5. Affidavit of Undertaking (if applicable) — 1 original copy
6. Clearances from 10 agencies (Zoning, Sanitary, Environment, Engineering, BFP, RPT, Water, Assessor, Market, Agriculture)

**Current Frontend Behavior:**
- ❌ NEW form does NOT mention or list any required documents
- ✅ Application detail page shows uploaded documents in a card
- ⚠️ Link to "Manage Documents" is provided but no clear guidance about what to upload

**Verdict:** ⚠️ **WEAK** — Users don't know what documents they need to upload until they navigate to a separate documents page.

---

### RENEWAL Application
**Data Template Requirements:**
1. Proof of Annual Gross Receipts (AFS or Sworn Declaration) — 1 photocopy
2. Clearances from 8 agencies (Sanitary, Environment, Engineering, BFP, RPT, Water, Assessor, Market, Agriculture)

**Current Frontend Behavior:**
- ⚠️ Form says: "You will upload supporting documents (AFS or sworn declaration) on the next page"
- ❌ No checklist of required clearances shown
- ❌ No clear document requirements visible in the renewal permit form

**Verdict:** ⚠️ **PARTIALLY ALIGNED** — Mentions documents exist but doesn't list requirements clearly.

---

### CLOSURE Application
**Data Template Requirements:**
- Not explicitly listed in template for closure

**Current Frontend Behavior:**
- ❌ No document guidance provided in closure form

**Verdict:** ⚠️ **WEAK / NOT SPECIFIED** — Unclear if documents are required.

---

## 7. Frontend Detail/Tracking Pages Alignment

### Application Detail Page (`applications/[id]/page.tsx`)
| Data | Shown? | Status |
|---|---|---|
| Application number | ✅ Yes | Header display |
| Application type (NEW/RENEWAL/CLOSURE) | ✅ Yes | Shown as "Application Type" |
| Status (DRAFT/SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED) | ✅ Yes | Badge + "Current Status" card |
| Business name | ✅ Yes | Header + Business Information card |
| Business type | ✅ Yes | Business Information card |
| Business address | ✅ Yes | Business Information card |
| Capital investment (if present) | ✅ Yes | Business Information card |
| Number of employees (if present) | ✅ Yes | Business Information card |
| **Owner name** | ❌ No | Only shows applicant (User name, not owner) |
| **Owner birthdate** | ❌ No | Not displayed |
| **Owner residence address** | ❌ No | Not displayed |
| **Owner mobile number** | ❌ No | Not displayed |
| Business phone | ❌ No | Not displayed |
| Business email | ❌ No | Not displayed |
| TIN | ❌ No | Not displayed |
| DTI/SEC Registration | ❌ No | Not displayed |
| Business area | ❌ No | Not displayed |
| Asset value | ❌ No | Not displayed |
| Monthly rental | ⚠️ Partial | Captured in form, not shown in detail |
| Line of business | ❌ No | Not displayed |
| Documents | ✅ Yes | Full document list with status badges |
| Payment info | ✅ Yes | Status, amount paid, total due |
| Claim reference | ✅ Yes | Reference number, scheduled date |
| Applicant info | ✅ Yes | Name, email |
| Date submitted | ✅ Yes | Status card |

**Verdict:** ⚠️ **PARTIAL** — Form captures all data but detail page shows only ~50% of captured fields. Personal information (Owner details) is notably missing from the display.

---

## 8. Confirmed Missing or Weak Frontend Items (System Data Template Perspective)

### CRITICAL GAPS

1. **Document Requirements Checklist (NEW, RENEWAL)**
   - **Missing:** Explicit list of required documents before submission
   - **Impact:** Users don't know what to upload until they reach documents page
   - **File:** `applications/new/page.tsx`, `renew/permit/page.tsx`
   - **Fix Needed:** Add collapsible "Required Documents" section in forms

2. **Clearance Requirements Visibility (RENEWAL)**
   - **Missing:** Specific list of required agency clearances (Sanitary, Environment, Engineering, BFP, RPT, Water, Assessor, Market, Agriculture)
   - **Impact:** User doesn't understand full scope of renewal process
   - **File:** `renew/permit/page.tsx`
   - **Fix Needed:** Add "Required Clearances" guidance card

3. **Personal Information Display (Application Detail)**
   - **Missing:** Owner name, birthdate, residence address, mobile number not shown in detail page
   - **Impact:** User can't verify their personal information was captured correctly
   - **File:** `applications/[id]/page.tsx`
   - **Fix Needed:** Add "Owner Information" card in detail view

### MODERATE GAPS

4. **Document Proof Types Not Specified (NEW)**
   - **Weak:** Form asks for documents but doesn't specify which types are required
   - **Impact:** Users uncertain about DTI vs. SEC vs. CDA, ownership proof format, etc.
   - **File:** `applications/new/page.tsx`
   - **Fix Needed:** Add inline help/guidance modal for document requirements

5. **Renewal Eligibility Window Not Clear (Data Template Context)**
   - **Partial:** Renewal page shows window dates, but form doesn't explain why windows exist
   - **Impact:** Users might be confused about timing
   - **File:** `renew/page.tsx`, `renew/permit/page.tsx`
   - **Fix Needed:** Add explanatory note about renewal windows

6. **Closure Document Requirements Undefined**
   - **Missing:** No guidance on whether document upload is required for closure
   - **Impact:** Users unsure of next steps after form submission
   - **File:** `applications/closure/page.tsx`
   - **Fix Needed:** Add post-submission guidance

### MINOR GAPS

7. **Business Phone/Email Not Displayed (Detail Page)**
   - **Missing:** Form captures businessPhone and businessEmail, but detail page doesn't show them
   - **File:** `applications/[id]/page.tsx`
   - **Fix Needed:** Add to Business Information card if user wants to verify

8. **Line of Business Not Displayed (Detail Page)**
   - **Missing:** Form captures lineOfBusiness, but detail page doesn't show it
   - **File:** `applications/[id]/page.tsx`
   - **Fix Needed:** Add to Business Information card

---

## 9. Exact Fix List

### Fix Immediately (Before Staging)

#### Fix 1: Add Required Documents Checklist to NEW Form
- **File:** `web/src/app/(dashboard)/dashboard/applications/new/page.tsx`
- **Issue:** No guidance on what documents are required
- **Change Needed:**
  - Add collapsible "Required Documents" card after "Registration Details" section
  - Show checklist:
    - ☐ DTI/SEC/CDA Certificate (photocopy)
    - ☐ Proof of Ownership/Lease (1 certified copy)
    - ☐ Location Plan/Sketch (1 original)
    - ☐ Fire Safety Inspection Certificate (1 original, 9+ months valid)
    - ☐ Affidavit of Undertaking (if applicable, 1 original)
    - ☐ Clearances from Government Agencies (specific ones depend on line of business)
  - Add link to "Required Clearances by Industry" guide

#### Fix 2: Add Required Documents + Clearances Guidance to Renewal Form
- **File:** `web/src/app/(dashboard)/dashboard/renew/permit/page.tsx`
- **Issue:** Only mentions documents "on next page," no guidance on what's needed
- **Change Needed:**
  - Replace blue info box with more detailed section:
    - Required documents: Audited Financial Statement (AFS) or Sworn Declaration
    - Required clearances: Sanitary, Environment, Engineering, BFP, RPT, Water, Assessor's Office (+ Market/Agriculture if applicable)
  - Add note: "Specific clearances depend on your line of business"

#### Fix 3: Add Personal Information Display to Application Detail Page
- **File:** `web/src/app/(dashboard)/dashboard/applications/[id]/page.tsx`
- **Issue:** Owner personal information not visible in application detail
- **Change Needed:**
  - Add new "Owner Information" card showing:
    - Owner's Name
    - Birthdate
    - Residence Address
    - Mobile Number
  - Include in detail view's main content area (not sidebar)

#### Fix 4: Add Missing Business Details to Application Detail Page
- **File:** `web/src/app/(dashboard)/dashboard/applications/[id]/page.tsx`
- **Issue:** Form captures line of business, business phone, business email, asset value, business area, monthly rental — but detail page doesn't show them
- **Change Needed:**
  - Expand Business Information card or create additional card with:
    - Line of Business
    - Business Phone
    - Business Email (if provided)
    - Asset Value (if provided)
    - Business Area (if provided)
    - Monthly Rental (if provided)

#### Fix 5: Add Document Guidance to Closure Form
- **File:** `web/src/app/(dashboard)/dashboard/applications/closure/page.tsx`
- **Issue:** No guidance on documents or next steps after form submission
- **Change Needed:**
  - Add blue info box below form with post-submission guidance:
    - "After submitting, you may be asked to provide additional documents"
    - "RPT Clearance will be required by the Municipal Treasurer's Office"

### Fix Before Staging (If Time Permits)

#### Enhancement 1: Add Document Requirements Modal to NEW Form
- **File:** `web/src/app/(dashboard)/dashboard/applications/new/page.tsx`
- **Change:** Add expandable "?" help button next to "Required Documents" section
- **Content:** Detailed explanation of each document type, format requirements, and where to obtain

#### Enhancement 2: Add Clearance Matrix to Renewal Form
- **File:** `web/src/app/(dashboard)/dashboard/renew/permit/page.tsx`
- **Change:** Add table or matrix showing which clearances are required based on line of business
- **Example:** "For Retail businesses: Sanitary, Environment, Engineering, BFP, RPT, Water, Assessor's Office"

#### Enhancement 3: Add Post-Submission Workflow Guidance
- **File:** Application confirmation/success page (if exists)
- **Change:** Show next steps with timeline:
  - 1. Submit application → **Submitted**
  - 2. Wait for review → **Under Review**
  - 3. Upload documents → **Document Upload Phase**
  - 4. Receive approval → **Approved**
  - 5. Make payment → **Payment Phase**
  - 6. Schedule claim → **Claim Phase**
  - 7. Receive permit → **Completed**

### Fix Before Production

#### Hardening 1: Add PDF/Guide Download
- **Change:** Link to downloadable "Requirements Checklist by Application Type" PDF
- **Content:** Detailed breakdown of all documents per application type
- **File:** Create `public/guides/` directory with PDFs, link from forms

#### Hardening 2: Add Machine-Readable Document Requirements
- **Change:** Store document requirements in Prisma SystemSetting or separate configuration
- **Purpose:** Allow dynamic updates without code changes
- **Benefit:** Compliance team can update requirements without developer involvement

---

## 10. Final Answer

### Is the frontend aligned with the System Data Template?

**Answer: PARTIALLY ALIGNED (70-75% strict assessment)**

**What's working:**
- ✅ All 14 Business Information fields captured perfectly
- ✅ All 4 Personal Information fields captured perfectly
- ✅ Renewal gross sales requirement captured
- ✅ Closure form captures all required base fields
- ✅ Application detail shows 60-70% of captured data

**What's broken:**
- ❌ Document requirements visibility is **CRITICAL FAILURE** — users don't know what to upload
- ❌ Clearance requirements are **INVISIBLE** — users don't understand what agencies are needed
- ❌ Personal information **NOT DISPLAYED** in application detail despite being captured
- ❌ 6 business detail fields (line of business, phone, email, asset value, area, rental) **NOT DISPLAYED** in detail page

---

### Which exact fields are still missing?

**Missing from Application Detail Page (but in form):**
1. Owner's Name
2. Birthdate
3. Residence Address
4. Mobile Number
5. Line of Business
6. Business Phone
7. Business Email
8. Asset Value
9. Business Area
10. Monthly Rental

---

### Which exact fields are only partially aligned?

**Document Guidance (partially present but weak):**
1. NEW Application — documents mentioned but not listed
2. RENEWAL Application — documents mentioned as "on next page" but no checklist of required types
3. CLOSURE Application — no document guidance at all
4. Clearances (RENEWAL) — not mentioned anywhere, critical gap

---

### Is the frontend good enough for demo/staging from a data-template perspective?

**Answer: CONDITIONAL YES — 70% confidence**

**Why it can proceed to staging:**
- Form data capture is 100% aligned (all Data Template fields present)
- User experience for basic NEW/RENEWAL/CLOSURE flows is functional
- No data loss — captured fields are just not all displayed

**Critical caveat:**
- **Staging testing MUST include document upload flow verification** — it's the biggest gap
- Users must be able to understand what documents are required
- Without this clarity, real users in staging will be confused and experience high failure rates

**Recommendation:**
- ✅ Proceed to staging with current forms
- ❌ **DO NOT release to production** without adding document requirements guidance
- Add the 5 "Fix Immediately" items before production launch
- At minimum: Add "Required Documents" checklist to every form and add personal info display to detail page

---

## Summary Table

| Item | Status | Priority |
|------|--------|----------|
| **NEW Form — Data Capture** | ✅ Perfect | — |
| **RENEWAL Form — Data Capture** | ✅ Perfect | — |
| **CLOSURE Form — Data Capture** | ✅ Good | — |
| **Document Requirements Visibility** | ❌ Missing | **CRITICAL** |
| **Clearance Requirements Visibility** | ❌ Missing | **CRITICAL** |
| **Application Detail — Personal Info Display** | ❌ Missing | **HIGH** |
| **Application Detail — Business Details Display** | ⚠️ Partial | **HIGH** |
| **Renewal Eligibility Window Explanation** | ✅ Good | — |
| **Overall Data Capture** | ✅ 100% | — |
| **Overall Display/Visibility** | ⚠️ 60% | **MUST FIX** |

