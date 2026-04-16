# Phase 4: Payment & Fees Implementation Plan

**Status**: 🟡 IN PROGRESS - MOCK IMPLEMENTATION (No Real API Required)
**Last Updated**: 2026-04-15
**Estimated Effort**: 3-4 days (mock) + 1 day (real API integration later)
**Priority**: P1 (Critical for permit issuance workflow)
**Approach**: Build with mock payments first, integrate real PayMongo when credentials available

---

## 📋 Overview

Phase 4 implements the payment processing system for approved business permit applications. This phase enables applicants to pay permit fees through multiple methods with full UI/UX, database persistence, and mock payment processing. Real PayMongo integration can be added later without code restructuring.

### Key Dependencies
- Phase 3: ✅ Clearance & Approval workflow complete
- Phase 4A (Mock): ✅ NO external API required - uses local mock processing
- Phase 4B (Real): PayMongo credentials (can be added anytime)
- Fee structure: Already configured in `SystemSetting` model

### Why Mock First?
✅ Build & test full UI/UX without waiting for API credentials
✅ Test complete workflow locally (no network dependencies)
✅ Frontend ready for integration testing
✅ Easy migration: Just replace mock with real PayMongo SDK
✅ Deliver faster: 3 days vs 6-8 days

---

## 🎯 Objectives

**Phase 4A: Mock Implementation (Days 1-3)** ✅
1. **Payment UI Components** — React components for payment method selection & form
2. **Fee Calculation** — Dynamic fee calculations (₱4,000 + ₱1,500 + ₱1,000)
3. **Local Payment Processing** — Mock payment handler (immediate success/failure)
4. **Payment Tracking** — Database persistence & payment history
5. **Email Notifications** — Payment confirmation emails
6. **Real-Time Updates** — SSE events for payment status
7. **Admin Dashboard** — View & manage payments

**Phase 4B: Real Integration (Day 4+)** 🔄
1. **PayMongo Integration** — Replace mock with real SDK (1 day)
2. **Webhook Handler** — Real webhook processing from PayMongo
3. **Signature Verification** — Webhook security validation
4. **No Code Restructuring** — Same interfaces, just new implementation

---

## 📊 Sub-Phases & Tasks

### Phase 4A: Frontend Components (1 day)

#### Task 4A.1: React Components
**Directory**: `src/components/dashboard/payment/`

```
├── PaymentMethodSelector.tsx    (GCash, Maya, Bank, OTC, Cash buttons)
├── PaymentForm.tsx              (Amount, application details, submit)
├── FeeBreakdown.tsx             (Display: Base + Processing + Filing)
├── PaymentStatus.tsx            (Status indicator: Pending/Processing/Paid/Failed)
├── PaymentHistory.tsx           (List past payments for application)
└── PaymentConfirmation.tsx      (Success/failure modal with receipt)
```

**Component Functions** (Copy-Paste Ready):
```typescript
// PaymentMethodSelector.tsx
export function PaymentMethodSelector({
  methods: ["GCASH", "MAYA", "BANK_TRANSFER", "OTC", "CASH"],
  onSelect: (method: PaymentMethod) => void,
  selectedMethod?: string
})

// FeeBreakdown.tsx
export function FeeBreakdown({
  permitFee: 4000,
  processingFee: 1500,
  filingFee: 1000,
  totalAmount: 6500
})

// PaymentStatus.tsx
export function PaymentStatus({
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED",
  amount: number,
  method: string
})
```

#### Task 4A.2: Forms & Validation Hooks
```typescript
// hooks/usePaymentForm.ts
export function usePaymentForm(applicationId: string) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fee, setFee] = useState<FeeBreakdown>();

  const submitPayment = async (method: PaymentMethod) => {
    // Calls mock API
  };

  return { selectedMethod, fee, isProcessing, submitPayment };
}
```

---

### Phase 4B: Mock Payment Logic (1 day)

#### Task 4B.1: Mock Payment Handler
**File**: `src/lib/paymentMock.ts` (NEW)

```typescript
/**
 * LOCAL MOCK IMPLEMENTATION
 * Replace with real PayMongo SDK when credentials available
 */

export async function createMockPayment(data: {
  applicationId: string;
  method: PaymentMethod;
  amount: number;
}) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock implementation - always succeeds for now
  return {
    id: generatePaymentId(),                    // "pay-xxx"
    referenceNumber: generateReference(),       // "REF-GCH-20260415-001"
    amount: data.amount,
    method: data.method,
    status: "PROCESSING" as const,              // PROCESSING → PAID after 3-5s
    checkoutUrl: `mock://payment/${data.applicationId}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };
}

export async function simulatePaymentSuccess(
  paymentId: string,
  delayMs: number = 3000
) {
  // Simulate webhook arriving after delay
  setTimeout(() => {
    // Update database
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", paidAt: new Date() }
    });

    // Broadcast SSE
    broadcastPaymentSucceeded(paymentId);
  }, delayMs);
}

export async function simulatePaymentFailure(
  paymentId: string,
  reason: string = "Insufficient funds"
) {
  prisma.payment.update({
    where: { id: paymentId },
    data: { status: "FAILED", failureReason: reason }
  });

  broadcastPaymentFailed(paymentId, reason);
}

export function generateReference(): string {
  const method = `GCH|MAY|BNK|OTC|CSH`[(Math.random() * 5) | 0];
  const date = format(new Date(), "yyyyMMdd");
  const seq = String(Math.random() * 1000 | 0).padStart(3, "0");
  return `REF-${method}-${date}-${seq}`;
}
```

#### Task 4B.2: Mock Fee Calculator
**File**: `src/lib/payments.ts` (UPDATE)

```typescript
export function calculateApplicationFee(method: PaymentMethod) {
  const PERMIT_FEE = 4000;
  const PROCESSING_FEE = 1500;
  const FILING_FEE = 1000;

  const fees = {
    permitFee: PERMIT_FEE,
    processingFee: PROCESSING_FEE,
    filingFee: FILING_FEE,
  };

  return {
    breakdown: fees,
    total: PERMIT_FEE + PROCESSING_FEE + FILING_FEE, // ₱6,500
  };
}
```

#### Task 4B.3: Zustand Store
**File**: `src/lib/stores.ts` (UPDATE)

```typescript
export const usePaymentStore = create<PaymentStore>((set) => ({
  payments: [],
  selectedPaymentId: null,

  addPayment: (payment) => set((state) => ({
    payments: [...state.payments, payment]
  })),

  updatePaymentStatus: (id, status) => set((state) => ({
    payments: state.payments.map(p =>
      p.id === id ? { ...p, status } : p
    )
  })),

  selectPayment: (id) => set({ selectedPaymentId: id }),
}));
```

---

### Phase 4C: Database & Models (0.5 days)

#### Task 4C.1: Verify Payment Model
```prisma
// Already exists - verify structure:
model Payment {
  id                String    @id @default(cuid())
  applicationId     String    @unique
  amount            Decimal(15, 2)
  method            PaymentMethod
  status            PaymentStatus  @default(PENDING)
  paymongoIntentId  String?
  paymongoRefId     String?
  paidAt            DateTime?
  expiresAt         DateTime?
  failureReason     String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  application       Application    @relation(fields: [applicationId], references: [id])

  @@index([applicationId])
  @@index([paymongoIntentId])
  @@map("payments")
}

enum PaymentMethod {
  GCASH
  MAYA
  BANK_TRANSFER
  OTC
  CASH
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  CANCELLED
  REFUNDED
}
```

#### Task 4C.2: Fee Structure Configuration
Create system settings for fee configuration:
```prisma
// Enhance SystemSetting model
model SystemSetting {
  key         String  @unique
  value       Json    // Can store fee structure as JSON
  description String?
  isPublic    Boolean @default(false)

  // Example fee structure:
  // {
  //   "NEW": { "base": 2500, "additional_per_item": 500 },
  //   "RENEWAL": { "base": 2000, "additional_per_item": 400 },
  //   "CLOSURE": { "base": 1500 }
  // }
}
```

#### Task 4C.3: PaymentHistory Model (Optional)
Create payment history for audit trail:
```prisma
model PaymentHistory {
  id           String    @id @default(cuid())
  paymentId    String
  previousStatus PaymentStatus
  newStatus     PaymentStatus
  reason        String?
  recordedBy    String    // User who triggered change
  createdAt     DateTime  @default(now())

  payment      Payment   @relation(fields: [paymentId], references: [id])
}
```

---

### Phase 4D: Helper Functions (0.5 days)

#### File: `src/lib/payments.ts` (UPDATE)

**Functions to implement:**

```typescript
/**
 * Calculate fee for application based on type and business type
 */
export async function calculateApplicationFee(
  applicationType: ApplicationType,
  businessType: string
): Promise<{ amount: number; breakdown: Record<string, number> }>

/**
 * Create PayMongo payment intent for approved application
 */
export async function createPaymentIntent(
  applicationId: string,
  amount: number,
  method: PaymentMethod,
  description?: string
): Promise<{
  success: boolean;
  paymentIntentId?: string;
  clientKey?: string;
  checkoutUrl?: string;
  error?: string;
}>

/**
 * Verify PayMongo webhook signature
 */
export function verifyPaymongoSignature(
  payload: string,
  signature: string
): boolean

/**
 * Process successful payment - create payment record and trigger permit generation
 */
export async function processPaymentSuccess(
  applicationId: string,
  paymongoRefId: string,
  amount: number
): Promise<{ success: boolean; permitId?: string }>

/**
 * Handle payment failure
 */
export async function processPaymentFailure(
  applicationId: string,
  paymongoIntentId: string,
  failureReason: string
): Promise<{ success: boolean }>

/**
 * Get payment status for application
 */
export async function getPaymentStatus(
  applicationId: string
): Promise<Payment | null>

/**
 * Get fee structure from system settings
 */
export async function getFeeStructure(): Promise<Record<string, any>>
```

---

### Phase 4E: Zod Validation (0.5 days)

**Add to `src/lib/validations.ts`:**

```typescript
export const createPaymentSchema = z.object({
  applicationId: z.string().cuid(),
  method: z.enum(["GCASH", "MAYA", "BANK_TRANSFER", "OTC", "CASH"]),
  remarks: z.string().optional(),
});

export const paymentWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    id: z.string(),
    status: z.enum(["succeeded", "failed", "disputed", "awaiting_payment_method"]),
    amount: z.number(),
    currency: z.string(),
    description: z.string().optional(),
    metadata: z.object({
      applicationId: z.string(),
    }).optional(),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
```

---

### Phase 4F: API Routes (2 days)

#### Route 4F.1: Create Payment (Mock)
**Endpoint**: `POST /api/payments`

**Implementation**: Mock (immediate, no external API)

**Access**: APPLICANT (on own endorsed application), REVIEWER/ADMIN (on any)

**Request**:
```json
{
  "applicationId": "cuid",
  "method": "GCASH|MAYA|BANK_TRANSFER|OTC|CASH",
  "remarks": "Optional"
}
```

**Response** (Success - 201):
```json
{
  "message": "Payment intent created",
  "payment": {
    "id": "...",
    "applicationId": "...",
    "amount": 2500.00,
    "method": "GCASH",
    "status": "PENDING",
    "checkoutUrl": "https://paymon.go/checkout/...",
    "expiresAt": "2026-04-22T..."
  },
  "nextSteps": "Proceed to payment link or wait for payment notification"
}
```

**Features**:
- ✅ Fetch endorsed application
- ✅ Calculate fee (₱4,000 + ₱1,500 + ₱1,000 = ₱6,500)
- ✅ Create mock payment (no external API call)
- ✅ Store in database with Payment record
- ✅ Return checkout URL (mock)
- ✅ Send email with payment details
- ✅ Broadcast SSE event: `payment_initiated`
- ✅ Log activity: `PAYMENT_INITIATED`

**Error Cases**:
- Application not found (404)
- Application not ENDORSED (409)
- Invalid payment method (400)
- User not authenticated (401)
- Already has active payment (409)
- Duplicate payment check (idempotency)

---

#### Route 4F.2: Get Payment Status
**Endpoint**: `GET /api/payments?applicationId={id}`

**Access**: APPLICANT, REVIEWER, ADMIN

**Response** (200):
```json
{
  "payment": {
    "id": "...",
    "applicationId": "...",
    "amount": 2500.00,
    "method": "GCASH",
    "status": "PAID|PENDING|FAILED|CANCELLED",
    "paidAt": "2026-04-16T...",
    "failureReason": "Optional if status is FAILED"
  },
  "nextSteps": "..."
}
```

**Features**:
- ✅ Check if payment exists
- ✅ Fetch latest payment status
- ✅ Determine next workflow step

---

#### Route 4F.3: Payment Webhook Handler (Phase 4B - Real Integration)
**Endpoint**: `POST /api/payments/webhook`

**Access**: Public (will be PayMongo in prod) - currently skip signature verification (dev mode)

**Note**: Implement payment status update logic, integrate real PayMongo webhook when credentials available

**Current Features** (Mock):
- ✅ Parse webhook payload
- ✅ Update Payment record with status
- ✅ Handle success: Update payment to PAID, trigger permit generation
- ✅ Handle failure: Update payment to FAILED, log reason
- ✅ Send notification email
- ✅ Broadcast SSE event
- ✅ Log activity

**Future Features** (Phase 4B - Real PayMongo):
- ✅ Verify PayMongo webhook signature
- ✅ Idempotency check (prevent duplicate processing)
- ✅ Rate limiting on endpoint

---

#### Route 4F.4: Refund Payment (Future Enhancement)
**Endpoint**: `POST /api/payments/{id}/refund`

**Access**: REVIEWER/ADMIN only

**Features**:
- ✅ Call PayMongo refund API
- ✅ Update payment status to REFUNDED
- ✅ Create refund record
- ✅ Revert application to APPROVED status
- ✅ Send email notification

---

### Phase 4G: Email Templates (0.5 days)

Add to `src/lib/email.ts`:

```typescript
export async function sendPaymentLinkEmail(
  to: string,
  applicantName: string,
  applicationNumber: string,
  amount: number,
  checkoutUrl: string,
  expiresAt: string
): Promise<void>

export async function sendPaymentConfirmationEmail(
  to: string,
  applicantName: string,
  applicationNumber: string,
  amount: number,
  paymentMethod: string,
  paidAt: string
): Promise<void>

export async function sendPaymentFailureEmail(
  to: string,
  applicantName: string,
  applicationNumber: string,
  failureReason: string
): Promise<void>
```

---

### Phase 4H: SSE Events (0.5 days)

Add to `src/lib/sse.ts`:

```typescript
export type SSEEventType = ... | 'payment_intent_created' | 'payment_succeeded' | 'payment_failed' | ...

export function broadcastPaymentCreated(
  userId: string,
  applicationId: string,
  amount: number,
  checkoutUrl: string
): void

export function broadcastPaymentSucceeded(
  userId: string,
  applicationId: string,
  amount: number,
  paymentMethod: string
): void

export function broadcastPaymentFailed(
  userId: string,
  applicationId: string,
  failureReason: string
): void
```

---

### Phase 4I: Admin Routes (0.5 days)

#### Route 4I.1: Payment Dashboard View
**Endpoint**: `GET /api/admin/payments?filter=...`

**Features**:
- ✅ List all payments (paginated)
- ✅ Filter by status (PENDING, PROCESSING, PAID, FAILED)
- ✅ Filter by date range
- ✅ Search by application/reference number
- ✅ Calculate stats: Total revenue, pending amount, success rate

#### Route 4I.2: Payment Details Export (Future)

---

## 🔑 Key Configuration

### Phase 4A: Mock Implementation (NO API required)
**Environment Variables** (`.env.local`):
```env
NEXT_PUBLIC_MOCK_PAYMENT=true    # Enable mock mode
PAYMENT_MODE=mock                 # Or "production" later
```

**No additional configuration needed** - uses local mock logic only.

### Phase 4B: Real PayMongo Integration (When credentials available)
**Environment Variables** (`.env.local`):
```env
PAYMONOGO_PUBLIC_KEY=pk_test_...
PAYMONOGO_SECRET_KEY=sk_test_...
PAYMONOGO_WEBHOOK_SECRET=whsec_...
PAYMONOGO_API_URL=https://api.paymongo.com/v1
PAYMENT_MODE=production
```

**Webhook Setup**:
- Register endpoint: `https://yourdomain.com/api/payments/webhook`
- Subscribe to events:
  - `payment.succeeded` (from mock simulation)
  - `payment.failed`

### Migration from Mock to Real
Simply update `PAYMENT_MODE` environment variable:
```javascript
// src/lib/payments.ts - Single place to swap implementations
if (process.env.PAYMENT_MODE === 'production') {
  // Use real PayMongo SDK
  const payment = await createPaymongoPayment(...);
} else {
  // Use mock
  const payment = await createMockPayment(...);
}
```

---

## ✅ Testing Strategy

### Phase 4A: Mock Testing (Fully testable locally)

**Unit Tests** (2 tests)
```
✅ calculateApplicationFee() - Verify ₱6,500 total
✅ generateReference() - Verify format REF-XXX-YYYYMMDD-###
```

**Integration Tests** (4 tests)
```
✅ Create payment (mock) workflow
✅ Handle payment success (mock simulation)
✅ Handle payment failure (mock simulation)
✅ Payment history retrieval
```

**Component Tests** (3 tests)
```
✅ PaymentMethodSelector - User selection
✅ FeeBreakdown display - Correct amounts
✅ PaymentStatus indicator - Show pending/paid/failed/processing
```

**E2E Tests** (1 test)
```
✅ Complete payment flow (applicant initiates → receives confirmation)
```

### Phase 4B: Real API Testing (When PayMongo credentials available)

**Security Tests** (Add later)
```
- Webhook signature verification
- HTTPS only for payment routes
- Rate limiting on webhook endpoint
- Idempotent webhook processing
```

---

## 🚀 Implementation Sequence

### Phase 4A: Mock Implementation (Days 1-3) — NO API REQUIRED

1. **Day 1** (1 day):
   - Create React components (PaymentMethodSelector, PaymentForm, FeeBreakdown, PaymentStatus, PaymentHistory)
   - Create Zustand store for payment state
   - Implement fee calculation logic

2. **Day 2** (1 day):
   - Implement mock payment handler (src/lib/paymentMock.ts)
   - Create POST /api/payments route (use mock)
   - Create GET /api/payments route (retrieve payment status)
   - Add email templates for payment confirmation
   - Add SSE events for payment updates

3. **Day 3** (1 day):
   - Create admin dashboard route (GET /api/admin/payments)
   - Write unit tests + integration tests
   - Manual testing + UI/UX polish
   - Document Phase 4A implementation

**Result**: Full payment system working with mock payments, ready for real integration

### Phase 4B: Real PayMongo Integration (1 day) — When credentials available

1. **Day 4+**:
   - Add PayMongo SDK to dependencies
   - Update src/lib/payments.ts with real implementation
   - Implement webhook handler (POST /api/payments/webhook)
   - Add webhook signature verification
   - Add idempotency checks
   - Test with PayMongo sandbox
   - Deploy to production

**No code restructuring needed** - same API, just new implementation

---

## 📝 Acceptance Criteria

### Phase 4A: Mock Implementation (Ready for Phase 4A Completion)
- [ ] All React components implemented and working
- [ ] Mock payment logic creates payments in database
- [ ] Fee calculation correct: ₱6,500 (₱4,000 + ₱1,500 + ₱1,000)
- [ ] POST /api/payments route working with mock
- [ ] GET /api/payments route retrieving payment status
- [ ] Email notifications sent on payment creation
- [ ] SSE events broadcast payment updates
- [ ] Payment history displayed correctly
- [ ] Admin dashboard shows payment list & stats
- [ ] Mock success/failure simulation working
- [ ] TypeScript compilation: 0 errors
- [ ] Unit tests: ≥80% coverage
- [ ] All manual test scenarios passing

### Phase 4B: Real PayMongo Integration (Future - After Phase 4A)
- [ ] PayMongo webhook handler implemented
- [ ] Webhook signature verification secure
- [ ] Real payment processing from PayMongo
- [ ] Idempotency check prevents duplicates
- [ ] Security audit passed
- [ ] E2E tests with real gateway

---

## 🔄 Workflow Integration Points

**Before Payment** (Phase 3):
- Application must be ENDORSED (from clearance workflow)

**During Payment** (Phase 4A - Mock):
- Payment creation → PENDING status (mock processing)
- Mock success → Updates Payment to PAID, creates Permit
- Mock failure → Updates Payment to FAILED

**During Payment** (Phase 4B - Real PayMongo):
- Webhook success from PayMongo → Creates Permit, updates Payment to PAID
- Email notification sent within 2 minutes

**After Payment** (Phase 5):
- Trigger PermitIssuance workflow
- Generate permit PDF
- Schedule permit claiming

---

## 📌 Implementation Notes

### Phase 4A: Mock Implementation
1. **No API credentials needed** - Use local mock logic
2. **Database-driven** - All data persists to PostgreSQL
3. **Full UI/UX** - React components fully functional
4. **Testing ready** - Can write all tests without external dependency
5. **Mock success simulation** - Can trigger success/failure for testing

### Phase 4B: PayMongo Integration (When Ready)
1. **Get credentials**: https://paymon.go/dashboard
2. **Install SDK**: `npm install @paymongo/sdk`
3. **Update src/lib/payments.ts** - Just change implementation, keep API same
4. **Register webhook** - Point to `/api/payments/webhook`
5. **Test with sandbox first** - Use PayMongo test mode

### Key Design Decisions
- **Mock first**: Deliver UI & functionality immediately
- **Abstact payment logic**: Easy swap from mock to real
- **Database-driven**: All payments persisted for testing
- **No env dependencies**: Phase 4A works without API keys
- **Clear migration path**: Phase 4B just replaces implementation

### Testing Mock Payments
```javascript
// Simulate payment success after 3 seconds
await simulatePaymentSuccess(paymentId, 3000);

// Simulate payment failure
await simulatePaymentFailure(paymentId, "Card declined");

// Creates realistic SSE events & database updates
```

---

## 🎯 Success Metrics

### Phase 4A: Mock Implementation
- **Timeline**: Complete in 3-4 days (not blocked by external API)
- **Performance**: Payment creation < 100ms
- **Database**: All payments persist correctly
- **UI**: All components render + function properly
- **Testing**: ≥80% code coverage
- **User Experience**: Applicant can create & view payments locally

### Phase 4B: Real Integration (Future)
- **PayMongo**: Integrate + test within 1 day
- **Webhook**: Success rate ≥99.9%
- **Email**: Notification within 2 minutes of payment
- **Security**: 0 payment security issues

---

**Next Phase**: Phase 5 (Permits & Issuance - depends on Phase 4A completion, not Phase 4B)

**Phase 4 Timeline**:
- Phase 4A (Mock): Days 1-3 → Ready for manual testing
- Phase 4B (Real): Day 4+ → When PayMongo credentials available

**Ready to implement Phase 4A now?** ✅ YES - No external dependencies!

