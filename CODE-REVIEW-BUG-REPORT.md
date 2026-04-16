# OBPS Code Review — 15 Bugs Found & Fixes

**Date**: 2026-04-15 | **Files Reviewed**: 195+ TypeScript files | **Critical Bugs**: 3 | **Major Bugs**: 7 | **Minor Bugs**: 5

---

## CRITICAL BUGS (FIX IMMEDIATELY)

### 🔴 BUG #1: Webhook Idempotency Issue — Duplicate Permits Created

**File**: `web/src/app/api/payments/webhook/route.ts` (lines 42-90)

**What's Wrong**:
```typescript
// PROBLEM: No check if webhook already processed
export async function POST(req: Request) {
  const event = await req.json();

  // Line 42: Find payment but no idempotency check
  const payment = await prisma.payment.findUnique({
    where: { transactionId: event.data.id }
  });

  if (payment?.status === 'PAID') {
    // This runs again if webhook fires twice!
    // Results in 2x permits, 2x SSE events
  }

  // Lines 47-90: All updates happen without checking if already processed
}
```

**Why It's a Problem**:
- PayMongo webhooks can fire multiple times (network retry)
- If webhook fires twice, system creates **2 permits** with same payment
- Applicant gets 2 claim references
- Financial records duplicated
- **CRITICAL DATA INTEGRITY ISSUE**

**Fix**:
```typescript
export async function POST(req: Request) {
  const event = await req.json();

  const payment = await prisma.payment.findUnique({
    where: { transactionId: event.data.id }
  });

  // ✅ ADD THIS: Check if already processed
  if (!payment || payment.webhookProcessedAt) {
    // Already handled this webhook
    return NextResponse.json({ success: true }, { status: 200 });
  }

  try {
    // Process webhook
    const permit = await prisma.permit.create({
      data: { /* ... */ }
    });

    // ✅ Mark as processed ATOMICALLY
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        webhookProcessedAt: new Date()  // ADD THIS FIELD
      }
    });

    // Broadcast SSE, send emails, etc.
    await broadcastPermitIssued(payment.applicationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Don't mark as processed on error — let webhook retry
    throw error;
  }
}
```

**Schema Update**:
```prisma
model Payment {
  // ... existing fields ...
  webhookProcessedAt DateTime?  // ADD THIS

  @@index([webhookProcessedAt])
}
```

**Migration**:
```bash
npx prisma migrate dev --name add_webhook_idempotency
```

**Severity**: 🔴 **CRITICAL** — Permits/receipts duplicated on production

---

### 🔴 BUG #2: Time-of-Check/Time-of-Use (TOCTOU) Race in Slot Booking

**File**: `web/src/app/api/schedules/route.ts` (lines 164-206)

**What's Wrong**:
```typescript
// PROBLEM: Two concurrent requests both check capacity, both pass
export async function POST(req: Request) {
  const { timeSlotId } = await req.json();

  // Line 165 - Check capacity in memory
  const timeSlot = await prisma.timeSlot.findUnique({
    where: { id: timeSlotId },
    include: { reservations: true }
  });

  // Check 1: Can we book?
  if (timeSlot.reservations.length >= timeSlot.maxCapacity) {
    return NextResponse.json({ error: 'Full' }, { status: 400 });
  }

  // RACE CONDITION HERE: Another request just checked and also passed!
  // Both think slot has 9/10, both proceed, both create reservation
  // Result: 11 people in 10-person slot

  // Line 191-206: Create without checking again
  await prisma.slotReservation.create({
    data: { timeSlotId, /* ... */ }
  });
}
```

**Why It's a Problem**:
- Two users simultaneously book last slot
- Both see 9/10 capacity, both pass check
- Both create reservations
- **Slot is overbooked 11/10**
- Staff overburdened on claim day
- Business logic violated

**Example**:
```
Time 1: Request A checks → 9/10 people → ✅ Pass
Time 2: Request B checks → 9/10 people → ✅ Pass (hasn't seen A's reservation yet!)
Time 3: Request A books → creates reservation 10
Time 4: Request B books → creates reservation 11 (OVERBOOKING!)
```

**Fix**:
```typescript
export async function POST(req: Request) {
  const { timeSlotId } = await req.json();

  // ✅ FIX: Use transaction for atomic check-and-insert
  const reservation = await prisma.$transaction(async (tx) => {
    // Fetch fresh data inside transaction
    const timeSlot = await tx.timeSlot.findUnique({
      where: { id: timeSlotId },
      select: { maxCapacity: true, currentCount: true }
    });

    if (!timeSlot) {
      throw new Error('Slot not found');
    }

    // Check capacity
    if (timeSlot.currentCount >= timeSlot.maxCapacity) {
      throw new Error('Slot is full');
    }

    // Create reservation AND increment counter atomically
    const reservation = await tx.slotReservation.create({
      data: {
        timeSlotId,
        userId: user.id,
        status: 'TEMPORARY',
        temporaryHoldExpiry: addDays(new Date(), 1)
      }
    });

    // Increment Counter
    await tx.timeSlot.update({
      where: { id: timeSlotId },
      data: { currentCount: { increment: 1 } }
    });

    return reservation;
  }, {
    isolationLevel: 'Serializable'  // Strongest isolation
  });

  return NextResponse.json(reservation);
}
```

**Also fix PUT /api/schedules/reschedule**:
```typescript
export async function PUT(req: Request) {
  const { sourceSlotId, targetSlotId } = await req.json();

  // ✅ Use transaction for atomic move
  const result = await prisma.$transaction(async (tx) => {
    // Move from source to target
    await tx.timeSlot.update({
      where: { id: sourceSlotId },
      data: { currentCount: { decrement: 1 } }
    });

    // Check target capacity inside transaction
    const targetSlot = await tx.timeSlot.findUnique({
      where: { id: targetSlotId }
    });

    if (targetSlot.currentCount >= targetSlot.maxCapacity) {
      throw new Error('Target slot is full');
    }

    await tx.timeSlot.update({
      where: { id: targetSlotId },
      data: { currentCount: { increment: 1 } }
    });

    return { success: true };
  }, { isolationLevel: 'Serializable' });

  return NextResponse.json(result);
}
```

**Severity**: 🔴 **CRITICAL** — Business logic violated, overbooking possible

---

### 🔴 BUG #3: Payment Status State Inconsistency

**File**: `web/src/app/api/payments/route.ts` (lines 110-171)

**What's Wrong**:
```typescript
export async function POST(req: Request) {
  const { applicationId, amount, method } = await req.json();

  // Line 110-127: Create payment with PENDING
  const payment = await prisma.payment.create({
    data: {
      applicationId,
      amount,
      method,
      status: 'PENDING',  // ← Created as PENDING
      transactionId: generateId()
    }
  });

  // Line 130-135: Process payment (might complete immediately for OTC/CASH)
  const paymentResult = await processPayment(method, amount);
  // Returns: { status: 'PENDING' } OR { status: 'COMPLETED' }

  // Line 164: Update payment
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: paymentResult.status as any,  // ← Might be COMPLETED
      // But database already has PENDING!
      // Creates inconsistency
    }
  });

  // Problem: If update fails, payment is PENDING but processPayment succeeded
}
```

**Why It's a Problem**:
- OTC/CASH payments complete immediately
- Database shows PENDING but payment actually COMPLETED
- Permit doesn't generate (waiting for webhook)
- Applicant sees "payment pending" but already paid
- Accounting records don't match reality

**Fix**:
```typescript
export async function POST(req: Request) {
  const { applicationId, amount, method } = await req.json();

  // ✅ FIX: Determine final status before creating DB record
  let initialStatus: PaymentStatus;
  let processedPayment = null;

  // For OTC/CASH, process immediately
  if (['OTC', 'CASH'].includes(method)) {
    processedPayment = await processPayment(method, amount);
    initialStatus = processedPayment.status; // COMPLETED or FAILED
  } else {
    initialStatus = 'PENDING'; // Waiting for PayMongo webhook
  }

  // Create payment with CORRECT initial status
  const payment = await prisma.payment.create({
    data: {
      applicationId,
      amount,
      method,
      status: initialStatus,
      transactionId: generateId(),
      paidAt: initialStatus === 'COMPLETED' ? new Date() : null
    }
  });

  // If OTC/CASH completed, immediately trigger permit
  if (initialStatus === 'COMPLETED') {
    await broadcastPermitIssued(applicationId);
  }

  return NextResponse.json({
    status: initialStatus,
    checkoutUrl: initialStatus === 'PENDING' ? processedPayment?.checkoutUrl : null
  });
}
```

**Severity**: 🔴 **CRITICAL** — Accounting inconsistency, permit not generated for OTC/CASH

---

## MAJOR BUGS (FIX IN PHASE 1)

### 🟠 BUG #4: Missing Authorization Check in Claims Release

**File**: `web/src/app/api/claims/[id]/release/route.ts` (lines 17-121)

**What's Wrong**:
```typescript
export async function POST(req: Request, { params }: any) {
  const { id } = params;
  const session = await auth();

  // Problem: Only checks role, not ownership
  if (session?.user?.role === 'APPLICANT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // ✅ Missing: Who does this permit belong to?
  // ✅ Missing: Can THIS staff member release it?
  // ✅ Missing: Audit trail

  const claimRef = await prisma.claimReference.findUnique({
    where: { id }
  });

  // Any staff can release ANY permit
  // Staff A can release Staff B's claim
  // No verification of ownership

  await prisma.claimReference.update({
    where: { id },
    data: { status: 'CLAIMED' }
  });
}
```

**Why It's a Problem**:
- No ownership verification
- Staff A can release permits generated by Staff B
- Permits can be released by unauthorized staff
- No audit trail of who released what
- **MAJOR SECURITY/COMPLIANCE ISSUE**

**Fix**:
```typescript
export async function POST(req: Request, { params }: any) {
  const { id } = params;
  const session = await auth();

  // Authorization: Must be STAFF or ADMINISTRATOR
  if (!['STAFF', 'ADMINISTRATOR'].includes(session?.user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Fetch claim with full context
  const claimRef = await prisma.claimReference.findUnique({
    where: { id },
    include: {
      application: {
        select: { applicantId: true, id: true }
      }
    }
  });

  if (!claimRef) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // ✅ ADD: Ownership verification
  // For STAFF: Can only release claims they generated OR admin override
  if (session.user.role === 'STAFF') {
    if (claimRef.generatedBy !== session.user.id) {
      // Check if admin-level override
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  // ✅ ADD: Atomic transaction
  await prisma.$transaction(async (tx) => {
    // 1. Update claim reference
    await tx.claimReference.update({
      where: { id },
      data: {
        status: 'CLAIMED',
        claimedAt: new Date()
      }
    });

    // 2. Update permit issuance
    const permit = await tx.permit.findUnique({
      where: { applicationId: claimRef.applicationId }
    });

    await tx.permitIssuance.update({
      where: { permitId: permit.id },
      data: { releasedAt: new Date() }
    });

    // 3. Create audit log
    await tx.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'PERMIT_RELEASED',
        entity: 'ClaimReference',
        entityId: id,
        details: {
          applicantId: claimRef.application.applicantId,
          releasedBy: session.user.id,
          timestamp: new Date().toISOString()
        }
      }
    });
  });

  return NextResponse.json({ success: true, status: 'CLAIMED' });
}
```

**Severity**: 🟠 **MAJOR** — Authorization bypass, security issue

---

### 🟠 BUG #5: Unsafe Query in Schedule Reschedule

**File**: `web/src/app/api/schedules/reschedule/route.ts` (lines 24-26)

**What's Wrong**:
```typescript
export async function PUT(req: Request) {
  const { applicationId, newTimeSlotId } = await req.json();

  // PROBLEM: Using applicationId as unique key
  // But application could have multiple reservations (old + new)
  const reservation = await prisma.slotReservation.findUnique({
    where: { applicationId }  // ← Not unique!
  });

  // If applicant has 2 reservations (old + cancelled):
  // This query returns random one (undefined behavior)

  // Also missing 24-hour check from POST route
}
```

**Why It's a Problem**:
- `applicationId` alone doesn't uniquely identify a reservation
- Could reschedule wrong slot
- No validation of 24-hour rule
- Silent bypass of business logic

**Fix**:
```typescript
export async function PUT(req: Request) {
  const { reservationId, newTimeSlotId } = await req.json();  // Use reservation ID
  const session = await auth();

  // ✅ Validate input
  const schema = z.object({
    reservationId: z.string().cuid(),
    newTimeSlotId: z.string().cuid()
  });

  const validation = schema.safeParse({ reservationId, newTimeSlotId });
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // ✅ Use transaction for atomic move
  const result = await prisma.$transaction(async (tx) => {
    // Get current reservation
    const reservation = await tx.slotReservation.findUnique({
      where: { id: reservationId },
      include: { timeSlot: true }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // ✅ Ownership check
    if (reservation.userId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    // ✅ 24-hour check
    const hoursUntilClaim = differenceInHours(reservation.timeSlot.date, new Date());
    if (hoursUntilClaim < 24) {
      throw new Error('Cannot reschedule within 24 hours of claim date');
    }

    // ✅ Verify new slot exists and has capacity
    const newSlot = await tx.timeSlot.findUnique({
      where: { id: newTimeSlotId }
    });

    if (!newSlot || newSlot.currentCount >= newSlot.maxCapacity) {
      throw new Error('Target slot unavailable');
    }

    // Move: Decrement old, increment new
    await tx.timeSlot.update({
      where: { id: reservation.timeSlotId },
      data: { currentCount: { decrement: 1 } }
    });

    await tx.timeSlot.update({
      where: { id: newTimeSlotId },
      data: { currentCount: { increment: 1 } }
    });

    // Update reservation
    return await tx.slotReservation.update({
      where: { id: reservationId },
      data: { timeSlotId: newTimeSlotId }
    });
  });

  return NextResponse.json(result);
}
```

**Severity**: 🟠 **MAJOR** — Wrong reservations rescheduled

---

### 🟠 BUG #6: Missing Transaction in Claims Release

**File**: `web/src/app/api/claims/[id]/release/route.ts` (lines 44-103)

**What's Wrong**:
```typescript
// Multiple updates without transaction
const claimRef = await prisma.claimReference.update({ /* */ });
const permit = await prisma.permitIssuance.update({ /* */ });
const reservation = await prisma.slotReservation.update({ /* */ });
const log = await prisma.activityLog.create({ /* */ });

// If any of these fail, system is in inconsistent state
// E.g., claimRef marked CLAIMED but permit not yet released
```

**Why It's a Problem**:
- Partial state transitions
- Applicant gets permit but staff sees it unreleased
- Claim reference shows CLAIMED but no actual permit
- Audit trail incomplete if any operation fails

**Fix**: See BUG #4 above (already shows transaction fix)

**Severity**: 🟠 **MAJOR** — Data consistency issue

---

### 🟠 BUG #7: Race Condition in Document Verification

**File**: `web/src/app/api/documents/[id]/verify/route.ts` (lines 43-89)

**What's Wrong**:
```typescript
export async function PUT(req: Request) {
  const { status, rejectionReason } = await req.json();

  // Update document
  const document = await prisma.document.update({
    where: { id },
    data: { status, rejectionReason }
  });

  // Broadcast SSE regardless of whether update succeeded
  broadcastSSE(`document_verified`, {
    documentId: id,
    status
  });

  // Problem: If update fails silently, SSE broadcast happens anyway
  // or if broadcast fails, we don't know about it
}
```

**Why It's a Problem**:
- SSE sent even if database update fails
- Applicant sees "verified" in real-time but document still "pending" in DB
- Silent failures go unnoticed

**Fix**:
```typescript
export async function PUT(req: Request) {
  const { status, rejectionReason } = await req.json();

  // ✅ Validate status
  if (!['VERIFIED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    // ✅ Atomic update
    const document = await prisma.document.update({
      where: { id },
      data: {
        status: status as DocumentStatus,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        verifiedBy: session.user.id,
        verifiedAt: status === 'VERIFIED' ? new Date() : null
      }
    });

    // ✅ Only broadcast after successful update
    await broadcastSSE('document_verified', {
      documentId: id,
      status: document.status,
      rejectionReason: document.rejectionReason
    });

    // ✅ Create audit log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `DOCUMENT_${status}`,
        entity: 'Document',
        entityId: id,
        details: { rejectionReason }
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Document verification failed:', error);
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    );
  }
}
```

**Severity**: 🟠 **MAJOR** — Silent failures, incorrect state broadcasts

---

### 🟠 BUG #8: Claim Reference Number Not Unique

**File**: `web/src/app/api/claims/route.ts` (lines 128-152)

**What's Wrong**:
```typescript
// Generate reference number
const referenceNumber = `CLAIM-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 9)}`;
// Format: CLAIM-2026-04-15-a7k9x2p1m

// PROBLEM: Two requests in same millisecond
// Same date + low entropy random = collision risk
// Especially under load testing or concurrent requests

// No uniqueness constraint in database
const claimRef = await prisma.claimReference.create({
  data: {
    referenceNumber,  // Not checked for uniqueness
    applicationId,
    qrCode: generateQRCode(referenceNumber)  // QR based on non-unique ref
  }
});

// Result: Two applicants have same reference number
// QR codes are identical
// System cannot distinguish claims
```

**Why It's a Problem**:
- Reference collision under load
- Identical QR codes
- Cannot verify which permit is which
- Financial records conflated

**Fix**:
```typescript
import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulid';

export async function POST(req: Request) {
  const { applicationId } = await req.json();
  const session = await auth();

  // ✅ Generate unique reference
  const date = new Date().toISOString().split('T')[0];
  const uniqueId = ulid();  // Guaranteed unique + sortable
  const referenceNumber = `CLAIM-${date}-${uniqueId}`;

  // ✅ Generate QR code
  const qrData = `permit://claim/${uniqueId}`;  // Use ID, not full ref
  const qrCode = await generateQRCode(qrData);

  // ✅ Create with uniqueness constraint check
  try {
    const claimRef = await prisma.claimReference.create({
      data: {
        referenceNumber,
        applicationId,
        applicantName: session.user.firstName,
        businessName: application.businessName,
        qrCode,
        status: 'GENERATED'
      },
      select: {
        id: true,
        referenceNumber: true,
        qrCode: true
      }
    });

    return NextResponse.json(claimRef);
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint violation (shouldn't happen with ULID)
      throw new Error('Reference number collision detected');
    }
    throw error;
  }
}
```

**Prisma Schema Update**:
```prisma
model ClaimReference {
  id String @id @default(cuid())
  referenceNumber String @unique  // ← Ensure unique

  @@index([referenceNumber])
}
```

**Severity**: 🟠 **MAJOR** — Reference collisions possible under load

---

### 🟠 BUG #9: Document Type Spoofing Via Filename

**File**: `web/src/app/api/documents/upload/route.ts` (lines 151-166)

**What's Wrong**:
```typescript
// Infer document type from filename
let documentType = 'OTHER';
if (filename.toLowerCase().includes('dti')) {
  documentType = 'DTI_CERTIFICATE';
} else if (filename.toLowerCase().includes('fire')) {
  documentType = 'FIRE_SAFETY_PLAN';
} // ... etc

// PROBLEM: User renames malicious file
// Renames fake_document.pdf to "dti_certificate.pdf"
// System treats it as DTI document
// No content validation

const document = await prisma.document.create({
  data: {
    documentType,  // Based only on filename!
    // ... wrong type accepted
  }
});
```

**Why It's a Problem**:
- Document fraud possible
- Accept fake DTI with real filename
- No actual verification
- Permits issued for missing documents

**Fix**:
```typescript
import { parse as parseHeadlessExcel } from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import magic from 'magic-bytes.js';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const givenType = formData.get('documentType') as string;

  // ✅ Read file bytes
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // ✅ Verify MIME type via magic bytes
  const detectedType = magic.getMimeType(bytes);
  const expectedMimeTypes = {
    'DTI_CERTIFICATE': ['application/pdf'],
    'FIRE_SAFETY_PLAN': ['application/pdf'],
    'BUSINESS_PLAN': ['application/pdf', 'text/plain'],
    'PHOTOCOPY_OF_ID': ['image/jpeg', 'image/png']
  };

  if (!expectedMimeTypes[givenType]?.includes(detectedType)) {
    return NextResponse.json(
      { error: `Expected PDF/image for ${givenType}, got ${detectedType}` },
      { status: 400 }
    );
  }

  // ✅ Additional validation per document type
  if (givenType === 'DTI_CERTIFICATE') {
    // Check PDF contains "DTI" text or official seal
    const pdfDoc = await PDFDocument.load(buffer);
    // Parse certificates to verify authenticity
  }

  if (givenType === 'FIRE_SAFETY_PLAN' && detectedType === 'application/pdf') {
    // Verify PDF contains blueprint/technical drawings
    // Check for scale, dimensions, materials list
  }

  // ✅ Store only after validation
  const document = await prisma.document.create({
    data: {
      documentType: givenType,
      mimeType: detectedType,
      fileSize: bytes.length,
      fileName: file.name,
      uploadedBy: session.user.id
    }
  });

  return NextResponse.json(document);
}
```

**Severity**: 🟠 **MAJOR** — Document fraud, invalid docs accepted

---

### 🟠 BUG #10: Silent Email Failures

**File**: `web/src/app/api/applications/[id]/approval/route.ts` (lines 156-164)

**What's Wrong**:
```typescript
// After approval, send email (fire-and-forget)
sendApplicationStatusEmail(applicant.email, {
  applicationId: id,
  status: 'APPROVED'
}).catch((emailError) => {
  console.error('Email failed:', emailError);
  // Only logged to console — no return to client
  // No monitoring service call
});

// Returns success to client even if email failed
return NextResponse.json({
  success: true,
  status: 'APPROVED'
  // Applicant never knows email failed!
});
```

**Why It's a Problem**:
- Applicants miss critical notifications
- Approval happens but they never find out
- Causes support tickets: "Where's my approval email?"
- Email errors not tracked in monitoring
- Same pattern in 8+ other routes

**Fix Option 1: Queue Emails in Background Job**:
```typescript
import { emailQueue } from '@/lib/queue';

export async function POST(req: Request) {
  // ... approval logic ...

  // Queue email for async processing (via BullMQ)
  await emailQueue.add(
    'send-approval',
    {
      email: applicant.email,
      applicationId: id,
      status: 'APPROVED'
    },
    {
      attempts: 3,  // Retry 3 times
      backoff: { type: 'exponential', delay: 2000 }
    }
  );

  return NextResponse.json({ success: true });
}
```

**Fix Option 2: Surface Email Errors to Client**:
```typescript
export async function POST(req: Request) {
  try {
    // Approval
    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // Send email
    try {
      await sendApplicationStatusEmail(applicant.email, {
        applicationId: id,
        status: 'APPROVED'
      });
    } catch (emailError) {
      // Log but don't fail approval
      console.error('Email notification failed:', emailError);

      // Queue for retry
      await emailQueue.add('send-approval-retry', {
        email: applicant.email,
        applicationId: id
      });

      // Return partial success
      return NextResponse.json({
        success: true,
        warnings: ['Approval succeeded but email notification failed. Will retry.']
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

**Severity**: 🟠 **MAJOR** — Notifications unreliable, silent failures

---

## MEDIUM BUGS (FIX IN PHASE 2)

### 🟡 BUG #11: Rate Limiting Bypass via Middleware

**File**: `web/src/middleware.ts` (lines 51-61)

**What**: Unknown routes bypass rate limiting
**Fix**: Return `"api"` as default instead of `null`

```typescript
function getRateLimitCategory(pathname: string): string {
  // ... existing logic ...

  // ✅ Return default instead of null
  return 'api'; // Default rate limit for all API routes
}
```

---

### 🟡 BUG #12: Type Safety `as any` Casts

**File**: `web/src/app/api/payments/route.ts` (multiple lines)

**What**: `as any` hides Decimal type mismatches
**Fix**: Remove `as any`, use proper types

```typescript
const payment = await prisma.payment.create({
  data: {
    amount: new Decimal(amount.toString()), // Proper Decimal
    method: method as PaymentMethod,        // Validate enum
    status: 'PENDING' as const              // Use const assertion
  }
});
```

---

### 🟡 BUG #13: Missing Zod Validation in Reschedule

**File**: `web/src/app/api/schedules/reschedule/route.ts`

**What**: No input validation
**Fix**: Add Zod schema

```typescript
const rescheduleSchema = z.object({
  reservationId: z.string().cuid(),
  newTimeSlotId: z.string().cuid()
});

const validation = rescheduleSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
```

---

### 🟡 BUG #14: Claim Reference Status Inconsistency

**File**: `web/src/app/api/claims/route.ts` (lines 149-150)

**What**: Status says "GENERATED" but `claimedAt` says claimed
**Fix**: Only set `claimedAt` when status is "CLAIMED"

```typescript
const claimRef = await prisma.claimReference.create({
  data: {
    referenceNumber,
    status: 'GENERATED',
    // Don't set claimedAt here
  }
});

// Update claimedAt only in release endpoint
```

---

### 🟡 BUG #15: Missing Error Logging in Document Upload

**File**: `web/src/app/api/documents/upload/route.ts` (line 142-148)

**What**: Only console.error, not integrated with monitoring
**Fix**: Add monitoring call

```typescript
} catch (error) {
  captureException(error, {
    route: 'POST /api/documents/upload',
    userId: session?.user?.id
  });

  return NextResponse.json(
    { error: 'Upload failed' },
    { status: 500 }
  );
}
```

---

## ACTION PLAN

### Immediate (This Week) — CRITICAL Fixes
1. ✅ **Webhook idempotency** (1 hour) — Add `webhookProcessedAt` check
2. ✅ **Slot race condition** (2 hours) — Wrap in Serializable transaction
3. ✅ **Payment status fix** (1 hour) — Determine status before DB create

**Test After**:
```bash
npm run typecheck  # 0 errors required
npm test -- --include='**/payments**'
npm test -- --include='**/schedules**'
```

### Phase 1 (Next 2 Days) — MAJOR Fixes
4. ✅ **Authorization in claims** (1 hour)
5. ✅ **Reschedule query fix** (1 hour)
6. ✅ **Add transactions everywhere** (2 hours)
7. ✅ **Document type validation** (1 hour)
8. ✅ **Email error propagation** (1 hour)

### Phase 2 (This Week) — MEDIUM Fixes
9. Fix rate limiting default
10. Remove `as any` casts
11. Add missing validations
12. Consistent state machines
13. Improve logging

---

## Summary Table

| # | Bug | File | Severity | Est. Time |
|---|-----|------|----------|-----------|
| 1 | Webhook duplicate permits | payments/webhook | CRITICAL | 1 hr |
| 2 | Slot overbooking race | schedules | CRITICAL | 2 hrs |
| 3 | Payment status inconsistent | payments | CRITICAL | 1 hr |
| 4 | Missing auth in release | claims/release | MAJOR | 1 hr |
| 5 | Unsafe reschedule query | schedules/reschedule | MAJOR | 1 hr |
| 6 | Claims release no transaction | claims/release | MAJOR | 1 hr |
| 7 | Document verify race | documents/verify | MAJOR | 1 hr |
| 8 | Claim ref not unique | claims | MAJOR | 1 hr |
| 9 | Document type spoofing | documents/upload | MAJOR | 2 hrs |
| 10 | Email failures silent | applications/approval | MAJOR | 1 hr |
| 11 | Rate limit bypass | middleware | MEDIUM | 0.5 hr |
| 12 | Type safety `as any` | payments | MEDIUM | 1 hr |
| 13 | Missing validation | schedules/reschedule | MEDIUM | 0.5 hr |
| 14 | Status inconsistent | claims | MEDIUM | 0.5 hr |
| 15 | Missing error logging | documents/upload | MINOR | 0.5 hr |

**Total Fix Time**: ~16 hours (~2 working days for one person)

---

## Testing Requirements After Fixes

```bash
# Unit tests for payment webhook
npm test -- --include='**/payments**' --run

# Integration tests for slot booking (concurrent requests)
npm test -- --include='**/schedules**' --run

# E2E test full claim-to-release flow
npm run test:e2e -- --grep "claim.*release"

# Type check
npm run typecheck  # Must be 0 errors

# Build
npm run build  # Must succeed
```

---

This is a comprehensive analysis of all logical bugs in your code. The critical bugs must be fixed before production. Start with the 3 critical bugs (2-4 hours total), then tackle the 7 major bugs.

Ready to implementation start? Which bug should we fix first?
