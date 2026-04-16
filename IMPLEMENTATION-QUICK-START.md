# OBPS Implementation Quick Start — Critical Gaps

**Priority**: Start these 5 tasks in order (2-3 weeks total)

---

## TASK 1: Add MAYOR Role to System (2 hours)

### Why Critical
- Current: Permits issue WITHOUT Mayor signature (illegal)
- Required: Mayor must sign all NEW/RENEWAL permits
- Impact: Blocking all production deployment

### What to Change

**File 1: `web/prisma/schema.prisma`** (Line ~30)
```diff
enum Role {
  APPLICANT
  STAFF
  REVIEWER
  ADMINISTRATOR
+ MAYOR
}
```

**File 2: `web/src/lib/permissions.ts`** (Line ~160, add case in switch)
```typescript
case 'MAYOR':
  can('read', 'Permit', { permitStatus: 'PENDING_SIGNATURE' });
  can('update', 'Permit', { permitStatus: 'PENDING_SIGNATURE' });
  can('read', 'PermitIssuance');
  break;
```

**File 3: `web/src/middleware.ts`** (Line ~40, update route protection)
```typescript
// Get existing rate limit lines, add:
const mayorRoutes = ['/dashboard/mayor'];
if (mayorRoutes.some(r => pathname.startsWith(r))) {
  return handleRateLimiting(request, 'mayor', 30); // 30/min
}
```

**File 4: `web/src/lib/auth.ts`** (Line ~120, update session callback)
```typescript
// Role case already handled; just ensure MAYOR is recognized:
const allowedRoles = ['APPLICANT', 'STAFF', 'REVIEWER', 'ADMINISTRATOR', 'MAYOR'];
```

### After Change, Run:
```bash
cd web
npx prisma migrate dev --name add_mayor_role
npm run typecheck  # Should have 0 errors
npm run db:seed    # Update seed to create mayor user
```

---

## TASK 2: Create CLOSURE Application Type Validation (4 hours)

### Why Critical
- Current: CLOSURE enum exists but has zero logic
- Required: Validate pending payments before closure
- Impact: CLOSURE applications bypass payment checks

### What to Create/Change

**File 1: Create `web/src/lib/closure-helpers.ts`** (NEW FILE)
```typescript
import prisma from './prisma';
import { Application } from '@prisma/client';

/**
 * Validate if applicant can proceed with CLOSURE
 * DFD Process 2.1: "check pending payments exist"
 */
export async function validateClosureApplication(
  applicationId: string,
  applicantId: string
): Promise<{ isValid: boolean; reason?: string }> {
  // Check 1: User has an active permit
  const permit = await prisma.permit.findFirst({
    where: {
      applicationId: {
        in: (await prisma.application.findMany({
          where: { applicantId },
          select: { id: true }
        })).map(a => a.id)
      },
      permitStatus: 'ACTIVE'
    }
  });

  if (!permit) {
    return {
      isValid: false,
      reason: 'No active permit found to close'
    };
  }

  // Check 2: No pending payments (DFD Process 2.1 requirement)
  const pendingPayment = await prisma.payment.findFirst({
    where: {
      applicationId,
      status: { in: ['PENDING', 'PROCESSING'] }
    }
  });

  if (pendingPayment) {
    return {
      isValid: false,
      reason: 'Cannot proceed with closure while payments are pending. Please complete all payments first.'
    };
  }

  // Check 3: Application is in a valid state for closure
  const app = await prisma.application.findUnique({
    where: { id: applicationId }
  });

  if (app?.status === 'CANCELLED') {
    return {
      isValid: false,
      reason: 'This application has been cancelled'
    };
  }

  return { isValid: true };
}

/**
 * Get CLOSURE-specific document requirements
 * DFD: Much fewer docs than NEW (3 vs 12)
 */
export function getClosureDocumentRequirements() {
  return [
    'CURRENT_PERMIT',        // Must have active permit
    'AFFIDAVIT_OF_CLOSURE',  // Sworn statement of closure
    'TAX_CLEARANCE'          // No tax issues from BIR
  ];
}

/**
 * Calculate closure fee
 * DFD Process 5.0, 5.3: "Closure Fee Check"
 */
export function calculateClosureFee(_businessType: string): {
  amount: number;
  description: string;
} {
  // Closure is flat fee (administrative cost only)
  return {
    amount: 500, // ₱500 administrative fee
    description: 'Administrative Closure Fee'
  };
}
```

**File 2: Update `web/src/lib/application-helpers.ts`** (Line ~80)
```diff
import { validateClosureApplication, getClosureDocumentRequirements } from './closure-helpers';

export async function validateApplicationType(
  type: ApplicationType,
  userId: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    switch (type) {
      case 'NEW':
        // Existing validation
        break;
      case 'RENEWAL':
        // Existing validation
        break;
      case 'CLOSURE':
+       const { isValid, reason } = await validateClosureApplication(userId, userId);
+       if (!isValid) {
+         return { valid: false, error: reason };
+       }
        break;
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: String(error) };
  }
}
```

**File 3: Update `web/src/app/api/applications/route.ts`** (Line ~50)
```diff
// In POST handler, when creating application:
const validation = await validateApplicationType(applicationData.type, user.id);
if (!validation.valid) {
  return NextResponse.json(
    { error: validation.error },
    { status: 400 }
  );
}
```

### After Change, Run:
```bash
cd web
npm run typecheck  # Should have 0 new errors
npm test -- --include='**/application**'  # Test application creation
```

---

## TASK 3: Add D3 Requirements Model (4 hours)

### Why Critical
- Current: Document requirements hardcoded in code
- Required: LGU can configure requirements dynamically
- Impact: Cannot customize for different municipalities

### What to Create/Change

**File 1: Update `web/prisma/schema.prisma`** (Add after ApplicationHistory)
```prisma
// D3 — Requirements Record (DFD Data Store)
// Defines which documents are required for each application type
model RequirementDefinition {
  id String @id @default(cuid())

  // Identification
  name String                    // e.g., "DTI Certificate"
  documentType String            // e.g., "DTI_CERTIFICATE" (enum)
  description String?

  // Applicability
  applicableTypes ApplicationType[] // Which app types need this
  businessTypes String[]?           // Optional: only for these types

  // Metadata
  requirementOrder Int              // Display order (1, 2, 3...)
  isOptional Boolean @default(false) // Can be waived?
  maxFileSizeMb Int @default(10)
  allowedMimeTypes String[]          // JSON: ["application/pdf", "image/jpeg"]

  // Versioning
  version Int @default(1)
  isActive Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([documentType])
  @@index([applicableTypes])
}

// D3.1 — Requirement Waiver (for when STAFF waives requirement)
model RequirementWaiver {
  id String @id @default(cuid())
  applicationId String
  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  requirementId String
  requirement RequirementDefinition @relation(fields: [requirementId], references: [id])
  waiverReason String
  waivedBy String  // Staff ID
  waivedAt DateTime @default(now())

  @@index([applicationId])
  @@unique([applicationId, requirementId]) // Only one waiver per requirement
}
```

**File 2: Update `web/src/lib/document-helpers.ts`** (Replace hardcoded enum)
```typescript
import prisma from './prisma';
import { ApplicationType } from '@prisma/client';

/**
 * Get requirements from database (not hardcoded)
 * DFD Data Store D3
 */
export async function getRequirementsByType(
  type: ApplicationType
): Promise<RequirementDefinition[]> {
  return prisma.requirementDefinition.findMany({
    where: {
      applicableTypes: {
        has: type
      },
      isActive: true
    },
    orderBy: { requirementOrder: 'asc' }
  });
}

/**
 * Remove old hardcoded export, replace with:
 */
// DO NOT USE: DOCUMENT_REQUIREMENTS (deprecated, moved to database)
```

**File 3: Create migration**
```bash
cd web
npx prisma migrate dev --name add_requirements_model
```

**File 4: Create seed data** (update `web/prisma/seed.js`)
```javascript
// Add after existing seeds:
const requirements = await prisma.requirementDefinition.createMany({
  data: [
    // NEW application requirements (12 items)
    {
      name: 'DTI Certificate of Registration',
      documentType: 'DTI_CERTIFICATE',
      applicableTypes: ['NEW', 'RENEWAL'],
      requirementOrder: 1,
      isOptional: false
    },
    {
      name: 'Affidavit of Closure',
      documentType: 'AFFIDAVIT_OF_CLOSURE',
      applicableTypes: ['CLOSURE'],
      requirementOrder: 1,
      isOptional: false
    },
    // ... add all requirements
  ]
});
```

### After Change, Run:
```bash
cd web
npm run db:seed
npm run typecheck  # Should have 0 errors
```

---

## TASK 4: Add Conditional Clearance Routing (D5) (3 hours)

### Why Critical
- Current: All applications route to same 8 offices
- Required: RENEWAL → 6 offices, CLOSURE → MTO only
- Impact: Safety apps going through unnecessary clearances

### What to Change

**File 1: Update `web/prisma/schema.prisma`** (Update Clearance model)
```prisma
model Clearance {
  // ... existing fields ...

  // Add routing metadata
  departmentCode String  // e.g., 'SANITARY', 'FIRE', 'ZONING'
  isRequiredForType ApplicationType[] // Which types require this office?

  @@index([departmentCode, isRequiredForType])
}
```

**File 2: Create `web/src/lib/clearance-routing.ts`** (NEW FILE)
```typescript
import { ApplicationType } from '@prisma/client';

/**
 * DFD Process 3.0, 3.2: Conditional Clearance Office Dispatch
 * Different application types require different clearance offices
 */
export const CLEARANCE_ROUTING: Record<ApplicationType, string[]> = {
  NEW: [
    'SANITARY',        // Health/sanitation check
    'FIRE',           // Fire safety
    'ZONING',         // Land use compliance
    'BFP',            // Bureau of Fire Protection
    'ENVIRONMENTAL',  // Environmental compliance
    'BUSINESS',       // Business registration verification
    'TAX',            // Tax compliance (BIR)
    'POLICE'          // PNP security check
  ],
  RENEWAL: [
    'SANITARY',       // Renewed sanitary permit
    'FIRE',           // Renewed fire safety check
    'ZONING',         // Zoning still valid
    'TAX',            // Tax compliance check
    'BUSINESS'        // Business still valid
    // Reduced from 8 to 5 offices (faster for renewals)
  ],
  CLOSURE: [
    'TAX'             // Only MTO checks for outstanding balance
    // Go directly to permit revocation
  ]
};

export function getClearanceOfficesForType(type: ApplicationType): string[] {
  return CLEARANCE_ROUTING[type] ?? [];
}
```

**File 3: Update clearance creation** (`web/src/app/api/applications/[id]/clearances/route.ts`)
```typescript
import { getClearanceOfficesForType } from '@/lib/clearance-routing';

// In POST handler:
const officeList = getClearanceOfficesForType(application.type);

const clearances = await prisma.clearance.createMany({
  data: officeList.map(office => ({
    applicationId: application.id,
    departmentCode: office,
    status: 'PENDING'
  }))
});
```

### After Change, Run:
```bash
cd web
npm run typecheck
npm test -- --include='**/clearance**'
```

---

## TASK 5: Add Permit Signature Fields (1 hour)

### Why Critical
- Current: Permit has no signature fields
- Required: Track Mayor's signature + timestamp
- Impact: Legal audit trail missing

### What to Change

**File: Update `web/prisma/schema.prisma`** (Permit model, Line ~300)
```prisma
model Permit {
  // ... existing fields ...

+  // Mayoral Signature (DFD Process 7.0, 7.2)
+  permitStatus 'ACTIVE' | 'PENDING_SIGNATURE' | 'REJECTED' @default('PENDING_SIGNATURE')
+  signedBy String?                    // Mayor ID who signed
+  signatureDate DateTime?              // When Mayor signed
+  signatureProofUrl String?            // S3 URL to signed document
+  signatureVerificationHash String?    // SHA256 hash for verification
+  rejectionReason String?              // If Mayor rejected

  // Track who prepared for signature
  preparedBy String?
  preparedAt DateTime?
}
```

**Migration**:
```bash
cd web
npx prisma migrate dev --name add_permit_signature_fields
npm run typecheck
```

---

## TASK CHECKLIST (In Order)

### Week 1
- [ ] TASK 1: Add MAYOR role (2 hours)
  - [ ] Update schema enum
  - [ ] Update permissions
  - [ ] Update middleware
  - [ ] Run `npm run db:seed`

- [ ] TASK 2: CLOSURE validation (4 hours)
  - [ ] Create `closure-helpers.ts`
  - [ ] Update application validation
  - [ ] Test with new CLOSURE app

- [ ] TASK 3: D3 Requirements model (4 hours)
  - [ ] Add schema
  - [ ] Update document-helpers
  - [ ] Seed requirements
  - [ ] Test with multiple requirements

### Week 2
- [ ] TASK 4: Clearance routing (3 hours)
  - [ ] Create routing rules
  - [ ] Update clearance creation
  - [ ] Test NEW vs RENEWAL vs CLOSURE routing

- [ ] TASK 5: Permit signatures (1 hour)
  - [ ] Add signature fields
  - [ ] Run migration
  - [ ] TypeCheck

- [ ] **BONUS**: Create Mayor dashboard (if time)
  - [ ] `src/app/(dashboard)/dashboard/mayor/index.tsx`
  - [ ] Show permits pending signature
  - [ ] [Sign] [Reject] buttons

---

## Files to Create Summary

```
NEW FILES (5):
✅ web/src/lib/closure-helpers.ts (150 lines)
✅ web/src/lib/clearance-routing.ts (80 lines)
✅ web/src/app/(dashboard)/dashboard/mayor/index.tsx (300 lines) [BONUS]
✅ Database migrations (automatic via Prisma)

UPDATED FILES (5):
✅ web/prisma/schema.prisma (add Role, models)
✅ web/src/lib/permissions.ts (add MAYOR case)
✅ web/src/lib/application-helpers.ts (add closure validation)
✅ web/src/lib/document-helpers.ts (remove hardcoded)
✅ web/src/middleware.ts (add mayor rate limiting)
```

---

## Validation Checklist After Each Task

```bash
# After TASK 1:
npx prisma migrate dev
npm run typecheck          # Should have 0 errors
npm run db:seed

# After TASK 2:
npm test -- --include='**/application**'
npm run typecheck

# After TASK 3:
npm run db:seed            # Populate requirements
npm run typecheck

# After TASK 4:
npm test -- --include='**/clearance**'
npm run typecheck

# After TASK 5:
npx prisma migrate dev
npm run typecheck          # Should have 0 errors
npm run build              # Must have 0 build errors
```

---

## Expected Outcomes After These 5 Tasks

| Process | Before | After |
|---------|--------|-------|
| MAYOR signature | ❌ Bypassed | ✅ Required workflow |
| CLOSURE validation | ❌ No checks | ✅ Payment blocking |
| Requirements config | ❌ Hardcoded | ✅ Database-driven |
| Clearance routing | ⚠️ All same | ✅ Type-specific |
| Permit signatures | ❌ No fields | ✅ Full audit trail |
| TypeScript errors | TBD | 0 errors |
| DFD Compliance | 70% | 85%+ |

---

Ready to start? Would you like me to implement TASK 1 now?
