# eBOSS Data Requirements
## Municipality of E.B. Magalona — Business Permit System

---

## 🤖 AI PROMPT (Use this when asking AI about this system)

```
You are a systems analyst helping design the database and system architecture for the 
eBOSS (Electronic Business One-Stop Shop) of the Municipality of E.B. Magalona, 
Negros Occidental, Philippines.

The system is based on the eGov App platform and handles three types of transactions:
1. NEW Business Permit Application
2. RENEWAL of Business Permit
3. CLOSURE of Business (Closure Certificate)

The system involves the following offices/actors:
- Business Owner (applicant)
- BPLO (Business Permits and Licensing Office) — main office
- MTO (Municipal Treasury Office) — handles payment and assessment
- Mayor's Office / LCE — signs and approves permit
- Clearance Offices: Zoning (MPDO), Sanitary (MHO), Environment, Engineering, 
  BFP (Bureau of Fire Protection), RPT, Water Bill, Assessor's Office, 
  Market Clearance (EBO/Barangay), Agriculture Office
- SMS Provider — sends notifications
- Payment Gateway — GCash, Maya, Landbank, Bank Transfer

Key rules:
- NEW permit requires 10 clearances; RENEWAL requires 9 (no Zoning)
- Mayor's Permit Fee is based on Business Type (Micro/Cottage/Small/Medium/Large) 
  AND Asset Size OR Number of Workers (whichever yields the higher fee)
- Payment can be done online (GCash/Maya/Landbank) or manually at MTO
- Closure requires computation of business tax up to date of closure + PHP 100 certification fee
- The system generates an eSOA (Electronic Statement of Account) before payment
- After payment, permit is processed, signed by Mayor, and released to client
- If applied fully online (no appearance), permit is released without office visit

When answering questions about this system, refer to the data stores, fields, 
and business rules documented below. Always consider all three transaction types 
(New, Renewal, Closure) when designing tables, forms, or processes.
```

---

## 📋 Overview

**System Name:** eBOSS — Electronic Business One-Stop Shop  
**LGU:** Municipality of E.B. Magalona, Negros Occidental  
**Platform:** eGov App  
**Governing Law:** Republic Act No. 11032 (Ease of Doing Business Act)  
**Office in Charge:** Business Permits and Licensing Office (BPLO)  
**Service Hours:** Monday–Friday, 8:00 AM – 5:00 PM  
**Location:** 2nd Floor, Saravia Commercial Building (Saravia Mall)  

---

## 👥 Organizational Structure (BPLO)

| Name | Position |
|---|---|
| Jona P. Diploma | Local Treasury Operation Officer-I / BPLO-Designate |
| Leny N. Barcinal | Administrative Aide IV |
| Jesille N. Miramende | Job Order |
| Ferry Grace M. Locsin | Job Order |
| Cecille T. Yorac | Job Order |
| John Timothy R. Valenzuela | Job Order |
| John Joshua T. Gomez | Job Order |

---

## 🔄 eBOSS Agency Action Flow

```
Online Registration → Evaluation of Documents → Assessment
       (Submission & Checking)    (Endorsed to Clearance Offices)
                                                    ↓
Releasing of Permit ← Mayor's Signature ← Fire FSIC ← MTO Payment
```

---

## 👣 Client Steps (3 Modes)

### Mode 1 — Appeared at Office, Pay Manually
> Step 1: Apply online using kiosk at BPLO → Step 2: Payment at MTO → Step 3: Receive Permit

### Mode 2 — Appeared at Office, Pay Online
> Step 1: Apply online using kiosk at BPLO → Step 2: Receive Permit

### Mode 3 — Did Not Appear, Applied & Paid Online
> Step 1: Receive Permit (fully remote, no office visit required)

---

## 🗄️ Data Store: D0 — User Accounts

> Stores all registered users of the eGov App.

| Field | Description | Source |
|---|---|---|
| user_id | Unique system identifier | Auto-generated |
| full_name | First, Middle, Last name | eGov Registration |
| email_address | For login and OTP | eGov Registration |
| mobile_number | For SMS notifications | eGov Registration |
| password_hash | Encrypted password | eGov Registration |
| otp_code | One-time password for verification | eGov System |
| valid_id_type | National ID / Passport / Driver's License / PhilSys / NBI / Postal ID | eGov Verification |
| valid_id_photo | Uploaded photo of valid ID | eGov Verification |
| selfie_photo | Live selfie for identity verification | eGov Verification |
| account_status | Verified / Unverified / Suspended | System |
| date_registered | Timestamp of registration | System |
| date_updated | Timestamp of last update | System |

---

## 🗄️ Data Store: D1 — Application Records

> Stores all business permit applications: New, Renewal, and Closure.

### General Application Fields

| Field | Description | Source |
|---|---|---|
| application_id | Unique application identifier | Auto-generated |
| user_id | Linked to applicant account | D0 |
| application_type | New / Renewal / Closure | Applicant |
| business_name | Registered name of business | Applicant |
| business_registration_type | Sole Proprietorship / Partnership / Corporation / Cooperative | Applicant |
| registration_number | DTI / SEC / CDA number | DTI/SEC/CDA |
| business_nature | Retail / Services / Manufacturing / etc. | Applicant |
| business_address | Full address of business location | Applicant |
| barangay | Barangay where business is located | Applicant |
| application_status | Pending / Under Evaluation / Endorsed / Approved / Rejected | System |
| remarks | Evaluator notes from BPLO | BPLO |
| date_filed | Timestamp of application submission | System |
| date_updated | Timestamp of last status change | System |

### NEW Business Permit — Additional Fields

| Field | Description | Source |
|---|---|---|
| location_ownership_type | Owned / Not Owned | Applicant |
| location_proof_document | TCT / Tax Declaration / Lease / MOA / Written Consent | Client/ROD |
| location_plan_sketch | Uploaded sketch/plan of business location | Applicant |
| fsic_certificate_number | Fire Safety Inspection Certificate number | BFP |
| fsic_validity_date | Expiry date of FSIC (must be at least 9 months valid) | BFP |
| affidavit_of_undertaking | For applicants with valid FSIC for occupancy | Applicant |
| nga_clearance | NGA clearance depending on business sector | NGA |

### RENEWAL — Additional Fields

| Field | Description | Source |
|---|---|---|
| previous_permit_number | Permit number from previous year | Applicant |
| gross_annual_sales | Gross receipts for the previous year | Applicant |
| afs_type | Audited / Unaudited Financial Statement | Applicant |
| sworn_declaration | Sworn declaration of gross sales or ITR | Applicant |
| income_tax_return | BIR income tax return | Applicant |

### CLOSURE — Additional Fields

| Field | Description | Source |
|---|---|---|
| letter_of_intent | Letter requesting closure addressed to BPLO | Applicant |
| brgy_certification | Barangay certification for closure | Barangay Hall |
| latest_permit_copy | Copy of most recent permit issued | Applicant |
| closure_date | Date business officially closes | Applicant |

### If Filed Through Representative

| Field | Description | Source |
|---|---|---|
| is_representative | Yes / No | Applicant |
| authorization_letter | Authorization letter (1 original) | Client |
| special_power_of_attorney | SPA photocopy | Client |
| owner_valid_id | Photocopy of owner's ID with 3 specimen signatures | Client |
| representative_name | Full name of representative | Client |
| representative_valid_id | Photocopy of representative's ID with 3 specimen signatures | Client |

---

## 🗄️ Data Store: D2 — Clearance Records

> Tracks the status of each required clearance per application.

| Field | Description |
|---|---|
| clearance_id | Unique clearance record ID |
| application_id | Linked to D1 |
| clearance_type | See list below |
| issuing_office | Office responsible |
| clearance_status | Pending / Cleared / Not Cleared / Requires Action |
| issued_by | Name of officer who issued clearance |
| date_issued | Date clearance was given |
| remarks | Notes from the clearance office |

### Clearances Required — NEW Business Permit (10 Clearances)

| # | Clearance | Office |
|---|---|---|
| 1 | Zoning Clearance | MPDO (Zoning Staff) |
| 2 | Sanitary / Health Clearance | MHO (Health Staff) |
| 3 | Environmental Clearance | Environment Office (Menro Staff) |
| 4 | Engineering Clearance | Engineering Office / OBO Staff |
| 5 | Fire Safety (FSIC) | BFP (Personnel/BFP) |
| 6 | Real Property Tax Clearance | MTO (MTO Staff) |
| 7 | Water Bill Clearance | MTO (MTO Staff) |
| 8 | Assessor's Clearance | Assessor's Office |
| 9 | Market Clearance | EBO / Barangay (Market Staff) |
| 10 | Agriculture Clearance | Agriculture Office Staff |

### Clearances Required — RENEWAL Business Permit (9 Clearances)
*(Same as above except No. 1 Zoning Clearance is NOT required)*

---

## 🗄️ Data Store: D3 — Fees & Assessment Records

> Stores the assessed fees and eSOA generated by the system.

| Field | Description | Source |
|---|---|---|
| assessment_id | Unique ID | Auto-generated |
| application_id | Linked to D1 | System |
| business_type | Micro / Cottage / Small / Medium / Large | Applicant |
| industry_category | Banks / Manufacturers / Hotels / Restaurants / Contractors / etc. | Applicant |
| asset_size | Capital investment bracket | Applicant |
| number_of_workers | Worker count for fee computation | Applicant |
| gross_sales | Gross sales (for renewal) | Applicant |
| mayors_permit_fee | Computed Mayor's Permit Fee | BPLO |
| clearance_fees | Fees per clearance office | Per Office |
| total_amount_due | Total of all fees | System |
| esoa_number | Electronic Statement of Account number | System |
| esoa_date_generated | Timestamp of eSOA generation | System |
| top_number | Tax Order of Payment number (Closure) | MTO |
| business_tax_closure | Business tax computed up to closure date | MTO |
| certification_fee | PHP 100.00 (for Closure Certificate) | MTO |

### Mayor's Permit Fee Computation Rules

**Based on Asset Size (Capital):**

| Asset Size | Fee |
|---|---|
| Below ₱100,000 | ₱100.00 |
| ₱100,000 – ₱250,000 | ₱200.00 |
| ₱250,000 – ₱500,000 | ₱400.00 |
| ₱500,000 – ₱2 Million | ₱650.00 |
| ₱2M – ₱5 Million | ₱1,800.00 |
| ₱5M – ₱20 Million | ₱3,000.00 |
| Over ₱20 Million | ₱4,000.00–₱6,000.00 |

> ⚠️ **Rule:** Fee is based on Asset Size OR Number of Workers — whichever yields the **higher fee**.

---

## 🗄️ Data Store: D4 — Payment Records

> Stores all payment transactions made by applicants.

| Field | Description | Source |
|---|---|---|
| payment_id | Unique payment ID | Auto-generated |
| application_id | Linked to D1 | System |
| user_id | Payer | D0 |
| assessment_id | Linked to D3 | System |
| amount_paid | Total amount paid | MTO/Gateway |
| payment_method | GCash / Maya / Landbank / Bank Transfer / Manual (Cash) | Applicant |
| payment_mode | Online / Over-the-Counter | Applicant |
| official_receipt_number | OR number issued by MTO | MTO Cashier |
| reference_number | Online payment reference number | Payment Gateway |
| e_receipt | Digital copy of receipt | System |
| payment_status | Paid / Pending / Failed | System |
| date_paid | Timestamp of payment | System |

---

## 🗄️ Data Store: D5 — Business Permit Records

> Stores all issued Mayor's Permits and Closure Certificates.

| Field | Description | Source |
|---|---|---|
| permit_id | Unique permit ID | Auto-generated |
| application_id | Linked to D1 | System |
| payment_id | Linked to D4 | System |
| business_name | Name on permit | BPLO |
| permit_number | Official permit number | BPLO |
| permit_type | New / Renewal / Closure Certificate | System |
| date_issued | Date permit was issued | BPLO |
| expiry_date | December 31 of current year | System |
| signed_by | Mayor / LCE name | Mayor's Office |
| brgy_clearance_attached | Yes / No | BPLO Staff |
| permit_status | Active / Expired / Revoked | System |
| date_claimed | Date client received the permit | BPLO |
| logbook_signed | Yes / No (client signs logbook upon release) | BPLO |

---

## 🗄️ Data Store: D6 — SMS / Notification Logs

> Tracks all SMS notifications sent through the SMS Provider.

| Field | Description |
|---|---|
| sms_id | Unique notification ID |
| user_id | Recipient (linked to D0) |
| application_id | Related application |
| notification_type | Approval / Assessment / Payment Confirmation / Claim Schedule / Renewal Reminder / Payment Frequency |
| message_content | Text of the SMS sent |
| status | Sent / Failed / Pending |
| date_sent | Timestamp |

---

## 🗄️ Data Store: D7 — Business Location Records

> Stores mapped GPS coordinates of registered businesses.

| Field | Description |
|---|---|
| location_id | Unique location ID |
| business_id | Linked to D5 |
| business_name | For map display |
| latitude | GPS coordinate |
| longitude | GPS coordinate |
| full_address | Complete business address |
| barangay | Barangay location |
| business_category | For map filtering |
| date_mapped | Timestamp |

---

## 🔗 Process-to-Data Store Mapping

| Process | Data Stores Used |
|---|---|
| 1.0 Registration | D0 |
| 2.0 Authentication | D0 |
| 3.0 Application (New/Renewal/Closure) | D1 |
| 4.0 Evaluation | D1 |
| 5.0 Endorsement to Clearance Offices | D1, D2 |
| 6.0 Approval Notification | D6 (SMS Logs) |
| 7.0 Assessment of Fees | D3 |
| 8.0 Payment | D4 |
| 9.0 Permit Issuance | D5 |
| 10.0 Claim Notification | D6 |
| 11.0 Releasing of Permit | D5 |
| 12.0 Business Mapping | D7 |
| 13.0 Renewal Notification | D6 |
| 14.0 Payment Frequency Notification | D4, D6 |

---

## ⚠️ Important Business Rules

1. **NEW permit** requires **10 clearances**; **RENEWAL** requires **9** (no Zoning).
2. Mayor's Permit Fee is computed based on **Asset Size OR Number of Workers — whichever is higher**.
3. **Closure** requires: Letter of Intent + Brgy. Certification + Latest Permit + business tax payment up to closure date + PHP 100 certification fee.
4. **eSOA** must be generated before payment can proceed.
5. Client signs a **logbook** upon receiving the permit at BPLO.
6. **FSIC** (Fire Safety Inspection Certificate) must be at least **9 months valid** for new applicants.
7. eBOSS also covers **Tricycle, Trisikad, and Fishing Permits** (separate process).
8. **JIT (Joint Inspection Team)** conducts inspections twice a year:
   - **April–May**: Post-eBOSS check on permits
   - **October–November**: Pre-eBOSS assessment of gross income and distribution of requirements
9. If filed through a **representative**, additional documents (SPA, IDs, Authorization Letter) are required and must be stored.
10. Payment deadline for renewal: **January 5–20** (no penalties within this period).

---

## 📁 Document Checklist Reference

### NEW Business Permit Documents
- Proof/Certificate of Registration (DTI/SEC/CDA)
- Proof of Location Ownership (TCT or Lease/MOA)
- Location Plan or Sketch (1 original)
- FSIC for Occupancy (at least 9 months valid)
- Affidavit of Undertaking (if with valid FSIC)
- NGA Clearance (depending on business sector)

### RENEWAL Business Permit Documents
- AFS or Unaudited AFS / Sworn Declaration / ITR
- NGA Clearance (depending on sector)

### CLOSURE Certificate Documents
- Barangay Certification
- Letter of Intent for Closure (addressed to BPLO)
- Latest Permit Issued (1 original copy)

### If Filed Through Representative (All Transaction Types)
- Authorization Letter (1 original)
- Special Power of Attorney (1 photocopy)
- Owner's Valid ID with 3 specimen signatures
- Representative's Valid ID with 3 specimen signatures

---

*Document prepared based on official BPLO documents of E.B. Magalona, Negros Occidental.*  
*Source materials: Standard Documentary Requirements, Citizen's Charter, Local Revenue Code (Chapter III), Office Clearances list, eBOSS Agency Action Flowchart, and BPLO Yearly Program.*
