# eBOSS Data Requirements — Recommendations

## Municipality of E.B. Magalona — Business Permit System

---

## 📋 Document Overview

This document provides recommendations for implementing the eBOSS (Electronic Business One-Stop Shop) system based on the data requirements analysis. It covers architecture decisions, implementation priorities, security considerations, and best practices for the Online Business Permit System.

---

## 🎯 Executive Summary

The eBOSS data requirements document outlines a comprehensive business permit system that handles:
- **NEW** business permit applications (10 clearances)
- **RENEWAL** of business permits (9 clearances)
- **CLOSURE** certificates (business closure processing)

### Key Recommendations at a Glance

| Priority | Area | Recommendation |
|----------|------|----------------|
| 🔴 Critical | Database Schema | Align Prisma schema with D0-D7 data stores |
| 🔴 Critical | Payment Integration | Implement PayMongo for GCash/Maya, add Landbank |
| 🟡 High | Clearance Workflow | Build 10-office clearance tracking system |
| 🟡 High | Fee Computation | Implement dual-criteria (assets OR workers) fee engine |
| 🟢 Medium | Business Directory | Create barangay-based business directory |
| 🟢 Medium | SMS Provider | Configure Semaphore/Globe Labs for notifications |

---

## 🏗️ Architecture Recommendations

### 1. Database Schema Alignment

The eBOSS document defines 8 data stores (D0-D7). Map these to the existing Prisma schema:

| eBOSS Data Store | Current Model | Recommendation |
|------------------|---------------|----------------|
| D0 — User Accounts | `User` | ✅ Aligned — add `valid_id_type`, `valid_id_photo`, `selfie_photo` |
| D1 — Application Records | `Application` | ⚠️ Extend with closure-specific fields |
| D2 — Clearance Records | ❌ Missing | 🔴 **Create `Clearance` model** with 10 clearance types |
| D3 — Fees & Assessment | ❌ Partial | 🔴 **Create `Assessment` model** for eSOA generation |
| D4 — Payment Records | `Payment` | ✅ Aligned — add `official_receipt_number`, `e_receipt` |
| D5 — Permit Records | `Permit` | ⚠️ Add `signed_by`, `logbook_signed`, `date_claimed` |
| D6 — SMS/Notification Logs | ❌ Missing | 🟡 **Create `NotificationLog` model** |
| D7 — Business Location | ❌ Missing | 🟡 **Create `BusinessLocation` model** with barangay directory |

### 2. Recommended Schema Additions

```prisma
// D2 — Clearance Records
model Clearance {
  id               String           @id @default(cuid())
  applicationId    String
  application      Application      @relation(fields: [applicationId], references: [id])
  clearanceType    ClearanceType
  issuingOffice    String
  status           ClearanceStatus  @default(PENDING)
  issuedBy         String?
  dateIssued       DateTime?
  remarks          String?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}

enum ClearanceType {
  ZONING              // MPDO — Required for NEW only
  SANITARY            // MHO
  ENVIRONMENTAL       // Environment Office
  ENGINEERING         // Engineering Office / OBO
  FIRE_SAFETY         // BFP (FSIC)
  REAL_PROPERTY_TAX   // MTO
  WATER_BILL          // MTO
  ASSESSOR            // Assessor's Office
  MARKET              // EBO / Barangay
  AGRICULTURE         // Agriculture Office
}

enum ClearanceStatus {
  PENDING
  CLEARED
  NOT_CLEARED
  REQUIRES_ACTION
}

// D3 — Assessment Records
model Assessment {
  id                String      @id @default(cuid())
  applicationId     String      @unique
  application       Application @relation(fields: [applicationId], references: [id])
  businessType      BusinessType
  industryCategory  String?
  assetSize         Decimal     @db.Decimal(15, 2)
  numberOfWorkers   Int?
  grossSales        Decimal?    @db.Decimal(15, 2)
  mayorsPermitFee   Decimal     @db.Decimal(12, 2)
  clearanceFees     Json?       // { "ZONING": 100.00, "SANITARY": 150.00, ... }
  totalAmountDue    Decimal     @db.Decimal(12, 2)
  esoaNumber        String      @unique
  esoaDateGenerated DateTime    @default(now())
  topNumber         String?     // Tax Order of Payment (Closure)
  businessTaxClosure Decimal?   @db.Decimal(12, 2)
  certificationFee  Decimal?    @db.Decimal(12, 2) // PHP 100 for closure
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

enum BusinessType {
  MICRO
  COTTAGE
  SMALL
  MEDIUM
  LARGE
}

// D6 — Notification Logs
model NotificationLog {
  id               String           @id @default(cuid())
  userId           String
  user             User             @relation(fields: [userId], references: [id])
  applicationId    String?
  application      Application?     @relation(fields: [applicationId], references: [id])
  notificationType NotificationType
  messageContent   String
  channel          NotificationChannel
  status           NotificationStatus @default(PENDING)
  dateSent         DateTime?
  createdAt        DateTime         @default(now())
}

enum NotificationType {
  APPROVAL
  ASSESSMENT
  PAYMENT_CONFIRMATION
  CLAIM_SCHEDULE
  RENEWAL_REMINDER
  PAYMENT_FREQUENCY
  STATUS_UPDATE
}

enum NotificationChannel {
  SMS
  EMAIL
  IN_APP
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  DELIVERED
}

// D7 — Business Location Directory
model BusinessLocation {
  id               String    @id @default(cuid())
  permitId         String    @unique
  permit           Permit    @relation(fields: [permitId], references: [id])
  businessName     String
  fullAddress      String
  streetName       String?
  barangay         String
  landmark         String?
  businessCategory String?
  zoneClass        ZoneClassification @default(COMMERCIAL)
  dateRegistered   DateTime  @default(now())
}

enum ZoneClassification {
  COMMERCIAL
  RESIDENTIAL
  INDUSTRIAL
  AGRICULTURAL
  MIXED_USE
}
```

---

## 💰 Payment System Recommendations

### 1. Payment Gateway Integration

The eBOSS document specifies 4 payment methods. Current implementation status:

| Payment Method | Current Status | Recommendation |
|----------------|----------------|----------------|
| GCash | ✅ PayMongo | Maintain current implementation |
| Maya | ✅ PayMongo | Maintain current implementation |
| Bank Transfer | ⚠️ Manual | Add manual bank transfer with reference number |
| Manual (Cash/OTC) | ✅ Partial | Add OR number capture, integrate with MTO |

### 2. eSOA (Electronic Statement of Account)

**Recommendation:** Implement automatic eSOA generation before payment:

```typescript
// src/lib/esoa.ts
export async function generateESOA(applicationId: string): Promise<Assessment> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { clearances: true }
  });
  
  // 1. Compute Mayor's Permit Fee based on asset size OR workers (higher wins)
  const assetBasedFee = computeFeeByAssetSize(application.assetSize);
  const workerBasedFee = computeFeeByWorkers(application.numberOfWorkers);
  const mayorsPermitFee = Math.max(assetBasedFee, workerBasedFee);
  
  // 2. Sum clearance fees
  const clearanceFees = await computeClearanceFees(application.clearances);
  
  // 3. Generate unique eSOA number
  const esoaNumber = generateESOANumber(); // Format: ESOA-2026-XXXXX
  
  return prisma.assessment.create({
    data: {
      applicationId,
      businessType: application.businessType,
      assetSize: application.assetSize,
      numberOfWorkers: application.numberOfWorkers,
      mayorsPermitFee,
      clearanceFees,
      totalAmountDue: mayorsPermitFee + Object.values(clearanceFees).reduce((a, b) => a + b, 0),
      esoaNumber,
    }
  });
}
```

### 3. Mayor's Permit Fee Schedule

Implement the fee computation matrix from the document:

```typescript
// src/lib/fee-computation.ts
const ASSET_SIZE_FEES = [
  { min: 0, max: 100_000, fee: 100 },
  { min: 100_000, max: 250_000, fee: 200 },
  { min: 250_000, max: 500_000, fee: 400 },
  { min: 500_000, max: 2_000_000, fee: 650 },
  { min: 2_000_000, max: 5_000_000, fee: 1800 },
  { min: 5_000_000, max: 20_000_000, fee: 3000 },
  { min: 20_000_000, max: Infinity, fee: 4000 }, // Can go up to 6000
];

export function computeFeeByAssetSize(assetSize: number): number {
  const bracket = ASSET_SIZE_FEES.find(b => assetSize >= b.min && assetSize < b.max);
  return bracket?.fee ?? 4000;
}
```

---

## 🔄 Clearance Workflow Recommendations

### 1. Clearance Office Integration

Each clearance office needs its own queue and approval interface:

| Office | Role | System Access |
|--------|------|---------------|
| MPDO (Zoning) | Zoning compliance verification | Reviewer role |
| MHO (Health) | Sanitary permit issuance | Reviewer role |
| Environment | Environmental compliance | Reviewer role |
| Engineering/OBO | Building safety verification | Reviewer role |
| BFP | Fire safety (FSIC) verification | External — upload only |
| MTO | RPT + Water Bill clearance | Staff role + Reviewer |
| Assessor's Office | Property assessment clearance | Reviewer role |
| EBO/Barangay | Market/Barangay clearance | External upload |
| Agriculture | Agricultural business clearance | Reviewer role |

### 2. Recommended Clearance API Routes

```
POST /api/clearances/                    # Create clearance record
GET  /api/clearances/[applicationId]     # Get all clearances for application
PUT  /api/clearances/[clearanceId]       # Update clearance status
GET  /api/clearances/pending             # Get pending clearances for current user's office
POST /api/clearances/[clearanceId]/approve
POST /api/clearances/[clearanceId]/reject
```

### 3. Clearance Status Flow

```
Application Submitted
        ↓
   [10 Clearances Created — PENDING]
        ↓
   Each Office Reviews → CLEARED / NOT_CLEARED / REQUIRES_ACTION
        ↓
   All 10 Cleared? → Assessment Generated → eSOA → Payment
        ↓
   Mayor's Signature → Permit Issued → Releasing
```

---

## 📱 SMS/Notification Recommendations

### 1. Notification Triggers

| Event | Notification Type | Channel |
|-------|-------------------|---------|
| Application submitted | STATUS_UPDATE | SMS + Email |
| Clearance requires action | STATUS_UPDATE | SMS |
| All clearances approved | APPROVAL | SMS + Email |
| eSOA generated | ASSESSMENT | SMS + Email |
| Payment confirmed | PAYMENT_CONFIRMATION | SMS + Email |
| Permit ready for claim | CLAIM_SCHEDULE | SMS + Email |
| Renewal reminder (30 days before expiry) | RENEWAL_REMINDER | SMS + Email |
| Payment deadline approaching | PAYMENT_FREQUENCY | SMS |

### 2. SMS Provider Configuration

The system already has Semaphore/Globe Labs integration. Ensure templates are configured:

```typescript
// src/lib/sms-templates.ts
export const SMS_TEMPLATES = {
  APPLICATION_SUBMITTED: (refNo: string) => 
    `[eBOSS E.B. Magalona] Your application ${refNo} has been submitted. Track status at: ${process.env.NEXT_PUBLIC_APP_URL}/track`,
  
  CLEARANCE_ACTION_REQUIRED: (office: string, refNo: string) => 
    `[eBOSS] Action required: ${office} clearance for ${refNo}. Please visit the office or upload required documents.`,
  
  ESOA_READY: (esoaNo: string, amount: string) => 
    `[eBOSS] Your eSOA ${esoaNo} is ready. Total: PHP ${amount}. Pay online or at MTO.`,
  
  PERMIT_READY: (refNo: string) => 
    `[eBOSS] Your permit ${refNo} is ready for claiming at BPLO, 2nd Floor Saravia Mall. Bring valid ID.`,
  
  RENEWAL_REMINDER: (businessName: string, daysLeft: number) => 
    `[eBOSS] Reminder: ${businessName} permit expires in ${daysLeft} days. Renew online at ${process.env.NEXT_PUBLIC_APP_URL} before Jan 20 to avoid penalties.`,
};
```

---

## 🗺️ Business Directory Recommendations

### 1. Barangay-Based Business Directory

The D7 data store organizes businesses by barangay for easy lookup and reporting:

| Feature | Description | Priority |
|---------|-------------|----------|
| Barangay dropdown | Pre-defined list of E.B. Magalona barangays | 🔴 Critical |
| Business listing | Searchable/filterable list by barangay | 🟡 High |
| Category filter | Filter by business category | 🟡 High |
| Export to PDF/Excel | Generate barangay reports | 🟢 Medium |

### 2. Barangay Master List

```typescript
// src/lib/barangays.ts
export const EB_MAGALONA_BARANGAYS = [
  'Alacaygan',
  'Alicante',
  'Banago',
  'Bi-ao',
  'Canlusong',
  'Consing',
  'Cudangdang',
  'Damgo',
  'Gahit',
  'Latasan',
  'Mabini',
  'Manoling',
  'Mansablay',
  'Masulog',
  'Numan',
  'Poblacion',
  'San Jose',
  'San Juan',
  'San Miguel',
  'Tabigue',
  'Tomongtong',
  'Tuburan',
] as const;

export type Barangay = typeof EB_MAGALONA_BARANGAYS[number];
```

### 3. Simple Business Directory View

```
┌─────────────────────────────────────────────────────────────────┐
│                 BUSINESS DIRECTORY                               │
│                 Municipality of E.B. Magalona                    │
└─────────────────────────────────────────────────────────────────┘

Filter by: [Barangay ▼] [Category ▼] [Zone ▼]   🔍 Search: [________]

┌─────────────────────────────────────────────────────────────────┐
│ BARANGAY POBLACION (45 businesses)                              │
├─────────────────────────────────────────────────────────────────┤
│ #  │ Business Name         │ Category   │ Address              │
│────│───────────────────────│────────────│──────────────────────│
│ 1  │ Juan's Sari-Sari     │ Retail     │ 123 Main St.         │
│ 2  │ Maria's Eatery       │ Food       │ 456 Market Rd.       │
│ 3  │ Pedro Hardware       │ Hardware   │ 789 Commercial Ave.  │
│ 4  │ Ana's Pharmacy       │ Pharmacy   │ Near Municipal Hall  │
│ 5  │ Santos Auto Repair   │ Services   │ Beside BFP Station   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BARANGAY SAN JOSE (28 businesses)                               │
├─────────────────────────────────────────────────────────────────┤
│ #  │ Business Name         │ Category   │ Address              │
│────│───────────────────────│────────────│──────────────────────│
│ 1  │ Reyes Rice Mill      │ Agri-bus   │ National Highway     │
│ 2  │ Gloria's Store       │ Retail     │ Barangay Center      │
│ ...                                                             │
└─────────────────────────────────────────────────────────────────┘

[📥 Export PDF] [📊 Export Excel] [🖨️ Print]
```

### 4. Business Directory API

```typescript
// src/app/api/business-directory/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barangay = searchParams.get('barangay');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  const businesses = await prisma.businessLocation.findMany({
    where: {
      ...(barangay && { barangay }),
      ...(category && { businessCategory: category }),
      ...(search && {
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { fullAddress: { contains: search, mode: 'insensitive' } },
        ]
      }),
    },
    include: {
      permit: {
        select: {
          permitNumber: true,
          status: true,
          expiryDate: true,
        }
      }
    },
    orderBy: [
      { barangay: 'asc' },
      { businessName: 'asc' },
    ],
  });
  
  return NextResponse.json({ businesses });
}
```

### 5. Barangay Summary Report

```
┌─────────────────────────────────────────────────────────────────┐
│           BUSINESS SUMMARY BY BARANGAY                          │
│           As of March 2026                                      │
└─────────────────────────────────────────────────────────────────┘

│ Barangay        │ Total │ Active │ Expired │ Top Category      │
│─────────────────│───────│────────│─────────│───────────────────│
│ Poblacion       │   45  │   42   │    3    │ Retail (18)       │
│ San Jose        │   28  │   26   │    2    │ Agri-business (12)│
│ San Juan        │   22  │   21   │    1    │ Services (9)      │
│ Mabini          │   19  │   18   │    1    │ Retail (8)        │
│ Alicante        │   15  │   14   │    1    │ Manufacturing (6) │
│ ...             │  ...  │  ...   │   ...   │ ...               │
│─────────────────│───────│────────│─────────│───────────────────│
│ TOTAL           │  312  │  295   │   17    │                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Recommendations

### 1. Document Upload Security

The system handles sensitive documents (valid IDs, FSIC, DTI/SEC certificates):

| Document Type | Security Measures |
|---------------|-------------------|
| Valid ID Photos | Encrypt at rest, access logging, auto-delete after verification |
| Selfie Photos | Encrypt at rest, face comparison for identity verification |
| Business Documents | Virus scanning, magic byte validation, access control |
| Financial Statements | Restricted access (applicant + assigned reviewer only) |

### 2. Data Privacy (RA 10173)

```typescript
// Data retention policy
const DATA_RETENTION = {
  VALID_ID_PHOTOS: '90 days after verification',
  SELFIE_PHOTOS: '90 days after verification',
  APPLICATION_RECORDS: '10 years (as per NBCP)',
  PAYMENT_RECORDS: '10 years (as per BIR)',
  NOTIFICATION_LOGS: '1 year',
};
```

### 3. Representative Authorization

When applications are filed through a representative, implement additional verification:

```typescript
// Validate representative authorization documents
async function validateRepresentative(applicationId: string) {
  const docs = await prisma.document.findMany({
    where: {
      applicationId,
      documentType: {
        in: ['AUTHORIZATION_LETTER', 'SPA', 'OWNER_VALID_ID', 'REPRESENTATIVE_VALID_ID']
      }
    }
  });
  
  const requiredDocs = ['AUTHORIZATION_LETTER', 'SPA', 'OWNER_VALID_ID', 'REPRESENTATIVE_VALID_ID'];
  const uploadedTypes = docs.map(d => d.documentType);
  
  return requiredDocs.every(type => uploadedTypes.includes(type));
}
```

---

## 📊 Reporting Recommendations

### 1. Required Reports (per eBOSS document)

| Report | Frequency | Audience |
|--------|-----------|----------|
| Daily Application Summary | Daily | BPLO Staff |
| Clearance Status Dashboard | Real-time | All Offices |
| Payment Collection Report | Daily/Weekly | MTO |
| Permit Issuance Report | Weekly/Monthly | BPLO Head, Mayor's Office |
| Business Registry | Monthly | Planning, DTI |
| JIT Inspection Report | Bi-annual (Apr-May, Oct-Nov) | JIT Team |

### 2. Analytics Dashboard Widgets

```typescript
// src/app/api/analytics/dashboard/route.ts
export async function GET() {
  const [
    totalApplications,
    pendingClearances,
    pendingPayments,
    permitsIssuedThisMonth,
    revenueThisMonth,
    applicationsByBarangay,
    applicationsByType,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.clearance.count({ where: { status: 'PENDING' } }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.permit.count({ 
      where: { 
        dateIssued: { gte: startOfMonth(new Date()) } 
      } 
    }),
    prisma.payment.aggregate({
      where: { 
        status: 'COMPLETED',
        datePaid: { gte: startOfMonth(new Date()) }
      },
      _sum: { amount: true }
    }),
    prisma.application.groupBy({
      by: ['barangay'],
      _count: true
    }),
    prisma.application.groupBy({
      by: ['applicationType'],
      _count: true
    }),
  ]);
  
  return NextResponse.json({
    totalApplications,
    pendingClearances,
    pendingPayments,
    permitsIssuedThisMonth,
    revenueThisMonth: revenueThisMonth._sum.amount,
    applicationsByBarangay,
    applicationsByType,
  });
}
```

---

## 🚀 Implementation Priority

### Phase 1 — Core Alignment (1-2 weeks)

1. ✅ Update Prisma schema with missing models (Clearance, Assessment, NotificationLog, BusinessLocation)
2. ✅ Implement 10-clearance workflow for NEW applications
3. ✅ Implement 9-clearance workflow for RENEWAL applications
4. ✅ Add CLOSURE application type with required fields

### Phase 2 — Payment & Assessment (1-2 weeks)

1. ✅ Implement eSOA generation
2. ✅ Add Mayor's Permit Fee computation (asset size OR workers)
3. ✅ Add Landbank payment option
4. ✅ Implement OR number capture for OTC payments

### Phase 3 — Notifications & Mapping (1 week)

1. ✅ Configure SMS templates for all notification types
2. ✅ Implement renewal reminder cron job (30 days before Dec 31)
3. ✅ Create barangay-based business directory
4. ✅ Add business category filtering

### Phase 4 — Office Integration (2-3 weeks)

1. ✅ Create separate login/queue for each clearance office
2. ✅ Implement office-specific dashboards
3. ✅ Add clearance endorsement workflow
4. ✅ Integrate Mayor's Office for permit signing

### Phase 5 — Advanced Features (2-3 weeks)

1. ✅ JIT inspection scheduling and reporting
2. ✅ Business directory with barangay filtering
3. ✅ Basic analytics and reports
4. ✅ Responsive web design for mobile access

---

## 📝 Application Form Recommendations

### NEW Business Permit Form Sections

```
Section 1: Business Owner Information
├── Full Name (auto-filled from User)
├── Email Address (auto-filled)
├── Mobile Number (auto-filled)
├── Valid ID Type + Upload
└── Selfie Photo (for verification)

Section 2: Business Information
├── Business Name
├── Registration Type (Sole Prop / Partnership / Corporation / Cooperative)
├── Registration Number (DTI / SEC / CDA)
├── Business Nature
├── Industry Category
└── Asset Size / Capitalization

Section 3: Business Location
├── Full Address
├── Street Name / Sitio
├── Barangay (dropdown — required)
├── Nearby Landmark
├── Location Ownership (Owned / Not Owned)
├── Proof of Location (TCT / Lease / MOA)
├── Location Plan/Sketch (upload)
└── Zone Classification (Commercial / Residential / Industrial)

Section 4: Fire Safety
├── FSIC Certificate Number
├── FSIC Validity Date (must be ≥9 months)
├── Affidavit of Undertaking (if applicable)
└── FSIC Document Upload

Section 5: Additional Documents
├── NGA Clearance (if applicable)
└── Other Supporting Documents

Section 6: Representative (if applicable)
├── Filing through representative? (Yes/No)
├── Representative Name
├── Authorization Letter (upload)
├── SPA (upload)
├── Owner Valid ID (upload)
└── Representative Valid ID (upload)
```

### RENEWAL Form Differences

```
- Remove: Location ownership, Location plan, FSIC for occupancy
- Add: Previous Permit Number
- Add: Gross Annual Sales
- Add: AFS Type (Audited / Unaudited / Sworn Declaration)
- Add: ITR Upload
```

### CLOSURE Form

```
Section 1: Business Information (auto-filled from latest permit)
Section 2: Closure Details
├── Closure Date
├── Reason for Closure
├── Letter of Intent (upload)
├── Barangay Certification (upload)
└── Latest Permit Copy (upload)
```

---

## 🔗 External System Integration

| System | Integration Type | Purpose |
|--------|------------------|---------|
| DTI | API / Manual | Verify business registration |
| SEC | API / Manual | Verify corporation registration |
| CDA | Manual | Verify cooperative registration |
| BIR | Manual | Tax verification |
| BFP | Manual upload | FSIC verification |
| LandBank | API | Payment processing |
| PayMongo | API | GCash/Maya payments |
| Semaphore | API | SMS notifications |

---

## ✅ Checklist for eBOSS Compliance

- [ ] Support 3 transaction types: NEW, RENEWAL, CLOSURE
- [ ] Implement 10 clearances for NEW (9 for RENEWAL)
- [ ] Mayor's Permit Fee: Asset Size OR Workers (higher wins)
- [ ] Generate eSOA before payment
- [ ] Support 4 payment methods: GCash, Maya, Landbank, Manual
- [ ] Capture OR number for manual payments
- [ ] Track logbook signature on permit release
- [ ] Send SMS notifications at key milestones
- [ ] Support representative filing with additional documents
- [ ] FSIC must be ≥9 months valid for NEW applications
- [ ] Closure requires business tax computation to closure date + ₱100 fee
- [ ] Store business addresses in directory for reports
- [ ] Generate reports for BPLO, MTO, Mayor's Office

---

## 📚 References

- `eBOSS_Data_Requirements.md` — Source data requirements document
- `PROJECT-PLAN.md` — Project architecture and plan
- `CLAUDE.md` — System technical documentation
- RA 11032 — Ease of Doing Business and Efficient Government Service Delivery Act
- RA 10173 — Data Privacy Act of 2012
- E.B. Magalona Local Revenue Code (Chapter III)
- BPLO Citizen's Charter

---

*Document generated based on eBOSS Data Requirements analysis for the Municipality of E.B. Magalona, Negros Occidental.*
