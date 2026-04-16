# OBPS Remaining Tasks Roadmap

**Status**: Post-Critical/High Priority Fixes
**Current Date**: 2026-04-15
**Completed**: 4 CRITICAL + 5 HIGH bugs (9/10 code issues)
**Remaining**: 1 MEDIUM + DFD Features (Phases 5-6+)

---

## 📋 Phase Overview

| Phase | Title | Status | Timeline | Effort | Priority |
|-------|-------|--------|----------|--------|----------|
| **P0** | Critical Bug Fixes | ✅ DONE | 2 sessions | 6-8 hrs | CRITICAL |
| **P1** | High Priority Fixes | ✅ DONE | 1 session | 5-6 hrs | HIGH |
| **P2** | Medium Priority Fix | ⏳ PENDING | Week 2 | 30 min | MEDIUM |
| **P3** | DFD: Mayor Signature | ⏳ PENDING | Week 3 | 4-5 hrs | FEATURE |
| **P4** | DFD: Closure Workflow | ⏳ PENDING | Week 3-4 | 3-4 hrs | FEATURE |
| **P5** | DFD: D3 Requirements | ⏳ PENDING | Week 4 | 2-3 hrs | FEATURE |
| **P6** | Clearance Routing | ⏳ PENDING | Week 4 | 2-3 hrs | FEATURE |

---

## 🟡 MEDIUM Priority Issue (Week 2)

### ISSUE #10: Renewal Route Access Check Deferred to Page Level

**Location**: `web/src/middleware.ts` + `web/src/app/(dashboard)/dashboard/renew/page.tsx`
**Severity**: 🟡 **MEDIUM** — Inconsistent security pattern
**Impact**: Soft eligibility checks happen at page level instead of hard constraints at middleware
**Estimated Effort**: 30 minutes
**Status**: ⏳ PENDING

#### Problem

Currently, renewal route access control is split:
- **Middleware** (`middleware.ts`): No hard constraints
- **Page** (`dashboard/renew/page.tsx`): Soft eligibility message (why they can't access)

This is backwards. Hard constraints (who CAN access) should be at middleware. Soft messages (why they can't) should be at page level.

#### Solution

1. **Add Hard Constraint to Middleware**:
   ```typescript
   // middleware.ts
   if (pathname.startsWith("/dashboard/renew")) {
     // Only applicants with active permits can access
     const permits = await prisma.permit.findMany({
       where: {
         application: {
           applicant: { id: session.user.id }
         },
         status: "ACTIVE"
       },
       select: { id: true }
     });

     if (permits.length === 0) {
       return NextResponse.redirect(new URL("/dashboard", request.url));
     }
   }
   ```

2. **Move Eligibility Check to Page Level**:
   - Keep the "You don't have active permits" message at page level
   - This becomes a UX enhancement, not security

#### Testing

- ✅ User with NO permits → blocked at middleware → redirect to dashboard
- ✅ User with ACTIVE permits → allowed to access renewal section
- ✅ Clear error message shown on dashboard why renewal is unavailable

---

## 🚀 Phase 3-6: DFD (Data Flow Diagram) Features

DFD Implementation represents the core government workflow features. These are comprehensive features that touch multiple modules.

---

### Phase 3A: Mayor Signature & Permit Issuance (Week 3, 4-5 hours)

**Feature**: Face-to-face mayor signature workflow with photo verification

#### Current State
- Permits generated automatically on payment
- No mayor signature step
- Not aligned with Philippine government workflow

#### Required Changes

**1. Add Mayor Signature Step to Workflow**:
```prisma
model PermitSignature {
  id String @id @default(cuid())
  permitId String @unique
  status String @default("PENDING_SIGNATURE")  // PENDING_SIGNATURE, SIGNED, REJECTED
  scheduledDate DateTime?
  signedDate DateTime?
  signedBy String?  // Mayor user ID
  photoUrl String?  // Photo of mayor signing
  notes String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  permit Permit @relation(fields: [permitId], references: [id])
  mayor User? @relation(fields: [signedBy], references: [id])
}
```

**2. Permit Status Lifecycle**:
- `ISSUED` → `PENDING_SIGNATURE` (after payment, before mayor signs)
- `PENDING_SIGNATURE` → `SIGNED` (after mayor signs + photo verification)
- `SIGNED` → `ACTIVE` (when applicant claims with check-in)

**3. API Endpoints** (4 new routes):
- `POST /api/permits/[id]/schedule-signature` - Schedule mayor signature
- `POST /api/permits/[id]/sign` - Mayor signs with photo upload
- `GET /api/permits/[id]/signature-status` - Check signature status
- `GET /api/admin/pending-signatures` - List permits awaiting signature

**4. Mayor Signing Portal** (new page):
- `GET /dashboard/admin/permits/pending-signature` - Queue view
- Show permit details + upload photo field
- One-click sign action

**5. Email Notifications**:
- Notify applicant when signature scheduled
- Notify applicant when permit signed + ready for claim

#### Files to Modify/Create
- `web/prisma/schema.prisma` — PermitSignature model
- `web/src/app/api/permits/[id]/sign/route.ts` — NEW
- `web/src/app/api/admin/pending-signatures/route.ts` — NEW
- `web/src/app/(dashboard)/dashboard/admin/permits/signature/page.tsx` — NEW
- `web/src/app/(dashboard)/dashboard/admin/permits/signature/[id]/page.tsx` — NEW
- `web/src/lib/email.ts` — Add signature notification templates

---

### Phase 3B: Closure Application Workflow (Week 3-4, 3-4 hours)

**Feature**: Business closure permit applications (END OF OPERATIONS)

#### Current State
- Only NEW and RENEWAL application types
- No closure workflow

#### Required Changes

**1. Add CLOSURE Application Type**:
```typescript
enum ApplicationType {
  NEW
  RENEWAL
  CLOSURE  // NEW
}
```

**2. Closure-Specific Fields**:
```prisma
model Application {
  // ... existing fields ...

  // Closure-specific fields (optional, only for type=CLOSURE)
  closureReason String?        // Business ceased, relocation, etc.
  closureDate DateTime?        // When business closed
  finalAccountSettlement Json? // Outstanding debts, clearances
}
```

**3. Closure Workflow**:
- Submit closure application
- Staff verifies all clearances received
- Mayor approves closure
- Issue closure permit (final document)
- Archive business record

**4. API Endpoints** (4 new routes):
- `POST /api/applications/closure` - Submit closure app
- `POST /api/applications/[id]/verify-closure` - Verify clearances
- `POST /api/applications/[id]/approve-closure` - Mayor approval
- `GET /api/applications/[id]/closure-status` - Check progress

**5. Closure Dashboard**:
- New page: `/dashboard/applications/closure/new`
- Form requires: closure reason, date, settlement details
- Shows clearance requirements specific to closure

#### Files to Modify/Create
- `web/prisma/schema.prisma` — Add closure fields to Application
- `web/src/lib/validations.ts` — Add closure validation schema
- `web/src/app/api/applications/closure/route.ts` — NEW
- `web/src/app/(dashboard)/dashboard/applications/closure/page.tsx` — NEW
- `web/src/app/(dashboard)/dashboard/applications/[id]/closure/page.tsx` — NEW
- `web/src/lib/application-helpers.ts` — Add closure-specific logic

---

### Phase 4A: D3 Requirements (Department/Division/Destination) Routing (Week 4, 2-3 hours)

**Feature**: Route clearance requirements to appropriate government departments

#### Current State
- Clearance offices are static
- No dynamic routing based on business type
- No D3 (Department/Division/Destination) mapping

#### Required Changes

**1. D3 Configuration Model**:
```prisma
model D3Department {
  id String @id @default(cuid())
  code String @unique           // "DTI", "BIR", "SEC", "LGU_FIRE", etc.
  name String                   // Full name
  division String?              // Subdivision if applicable
  region String?                // Geographic region
  contactEmail String?
  contactPhone String?

  businessTypes String          // JSON array of applicable business types
  requiredDocuments String       // JSON array of required document types
  estimatedTurnaroundDays Int?   // How long approval typically takes

  isActive Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  clearances Clearance[]

  @@index([code])
  @@map("d3_departments")
}
```

**2. Update Clearance Model**:
```prisma
model Clearance {
  // ... existing fields ...
  d3DepartmentId String?        // Link to D3 routing
  d3Department D3Department? @relation(fields: [d3DepartmentId], references: [id])
}
```

**3. Dynamic Routing Logic**:
```typescript
// In generateClearancePackages
function getRequiredClearances(applicationType: ApplicationType, businessType: string) {
  // Query D3Department table
  // Match applicationTypes and businessTypes
  // Return filtered list of required departments
}
```

**4. Admin Interface for D3 Configuration**:
- New page: `/dashboard/admin/d3-departments`
- List D3 departments with edit capability
- Configure which business types require which departments
- Set estimated turnaround times

#### Files to Modify/Create
- `web/prisma/schema.prisma` — D3Department model
- `web/src/app/api/admin/d3-departments/route.ts` — NEW (CRUD)
- `web/src/app/(dashboard)/dashboard/admin/d3-departments/page.tsx` — NEW
- `web/src/lib/application-helpers.ts` — getRequiredClearances()

---

### Phase 4B: Clearance Office Routing & Tracking (Week 4, 2-3 hours)

**Feature**: Route applications to appropriate clearance offices + track progress

#### Current State
- Clearance offices exist as ClearanceOffice model
- No routing based on application characteristics
- No tracking of which applications are sent to which offices

#### Required Changes

**1. Clearance Request Model**:
```prisma
model ClearanceRequest {
  id String @id @default(cuid())
  clearanceId String
  sentDate DateTime?
  receivedDate DateTime?
  completedDate DateTime?

  status String @default("PENDING")  // SENT, RECEIVED, PROCESSING, COMPLETED, DENIED
  notes String?

  clearance Clearance @relation(fields: [clearanceId], references: [id])

  @@index([clearanceId])
  @@map("clearance_requests")
}
```

**2. Clearance Tracking Workflow**:
- When application ENDORSED → auto-send requests to all required offices
- Build email/SMS notifications to offices
- Provides dashboard showing which clearances are pending/completed

**3. Staff Clearance Review**:
- New page: `/dashboard/admin/clearance-tracking`
- Shows all applications waiting for clearances
- Track which offices have replied
- Automated reminders to slow offices

**4. Integration with Mayor Signature**:
- Mayor can only sign permits once ALL clearances are received
- Prevents premature signature

#### Files to Modify/Create
- `web/prisma/schema.prisma` — ClearanceRequest model
- `web/src/app/api/admin/clearance-tracking/route.ts` — NEW
- `web/src/app/(dashboard)/dashboard/admin/clearance-tracking/page.tsx` — NEW
- `web/src/lib/email.ts` — Clearance request notification templates
- `web/src/lib/sms.ts` — SMS notifications to clearance offices (if applicable)

---

## 📅 Recommended Timeline

### Week 2 (Immediately After Current Sprint)
**MEDIUM Issue Fix** (30 min)
- [ ] Issue #10: Renewal route access check
- [ ] Verify middleware + page layer separation
- [ ] Test access control

### Week 3 (Phase 3)
**Mayor Signature System** (4-5 hrs)
- [ ] Add PermitSignature model
- [ ] Create signing API endpoints
- [ ] Build mayor signing portal
- [ ] Test complete workflow

**Closure Workflow** (3-4 hrs)
- [ ] Add CLOSURE application type
- [ ] Create closure application form
- [ ] Implement closure-specific clearances
- [ ] Test submission → approval flow

### Week 4 (Phase 4)
**D3 Requirements Routing** (2-3 hrs)
- [ ] Create D3Department configuration
- [ ] Build D3 admin settings page
- [ ] Implement dynamic clearance routing

**Clearance Office Integration** (2-3 hrs)
- [ ] Create ClearanceRequest tracking
- [ ] Build clearance progress dashboard
- [ ] Implement office notification emails
- [ ] Test end-to-end workflow

---

## 🎯 Implementation Priorities

### Must-Have (Blocking Features)
1. ✅ **CRITICAL Bugs** - Complete (security/data integrity)
2. ✅ **HIGH Priority Bugs** - Complete (performance/auth)
3. ⏳ **Mayor Signature** - Required for permit validity
4. ⏳ **Closure Workflow** - Required for business end-of-operations

### Should-Have (Important)
5. ⏳ **D3 Requirements** - Better organization/routing
6. ⏳ **Clearance Tracking** - Better staff visibility

### Nice-to-Have (Enhancement)
7. ⏳ **Advanced D3 Analytics** - Department performance metrics
8. ⏳ **Automated Reminders** - Push notifications to slow offices

---

## 📊 Effort Summary

| Category | Hours | Status |
|----------|-------|--------|
| **CRITICAL Fixes** | 6-8 | ✅ COMPLETE |
| **HIGH Priority Fixes** | 5-6 | ✅ COMPLETE |
| **MEDIUM Issues** | 0.5 | ⏳ Week 2 |
| **Mayor Signature** | 4-5 | ⏳ Week 3 |
| **Closure Workflow** | 3-4 | ⏳ Week 3-4 |
| **D3 Routing** | 2-3 | ⏳ Week 4 |
| **Clearance Tracking** | 2-3 | ⏳ Week 4 |
| **TOTAL REMAINING** | **18-24 hrs** | **2-3 weeks** |

---

## ✅ Pre-Implementation Checklist

Before starting each phase:

### MEDIUM Priority Fix (Week 2)
- [ ] Read CLAUDE.md security patterns
- [ ] Review `middleware.ts` current implementation
- [ ] Understand renewal eligibility rules
- [ ] Test middleware-level access control
- [ ] Verify page-level fallback messages

### Mayor Signature (Week 3)
- [ ] Design PermitSignature model relationships
- [ ] Plan photo upload/storage mechanism
- [ ] Define signature status transitions
- [ ] Create email notification templates
- [ ] Plan mayor signing portal UI

### Closure Workflow (Week 3)
- [ ] Define closure-specific document requirements
- [ ] Design closure application form fields
- [ ] Plan final settlement/accounting logic
- [ ] Create closure permit template
- [ ] Plan archive/read-only mode for closed businesses

### D3 Requirements (Week 4)
- [ ] Map Philippine government departments
- [ ] Define business type → D3 mapping rules
- [ ] Create D3 configuration UI design
- [ ] Plan dynamic clearance query optimization
- [ ] Test routing accuracy

### Clearance Tracking (Week 4)
- [ ] Design tracking dashboard mockup
- [ ] Plan notification templates
- [ ] Define escalation rules (auto-reminders)
- [ ] Create office SLA definitions
- [ ] Plan integration with mayor signature

---

## 🔗 Related Documentation

- **Code Quality**: See `CLAUDE.md` > Code Quality Standards
- **Critical Bugs**: See `CRITICAL-FIXES-SUMMARY.md`
- **High Priority Bugs**: See `HIGH-PRIORITY-FIXES-SUMMARY.md`
- **API Standards**: See `CLAUDE.md` > API Routes & Authentication
- **Database**: See `CLAUDE.md` > Database Schema

---

## 📝 Notes

- All remaining tasks require database migrations
- Run `npx prisma generate` after schema changes
- Run `npm run typecheck` to verify all changes compile
- Create comprehensive test cases for each workflow
- Update API documentation when adding new routes
- Consider performance implications of new queries (N+1 prevention!)

---

**Last Updated**: 2026-04-15
**Next Priority**: MEDIUM Issue #10 (Renewal route access) - Week 2
**Follow-Up**: Mayor Signature System - Week 3
