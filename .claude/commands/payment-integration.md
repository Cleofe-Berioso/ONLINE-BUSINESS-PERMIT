# Payment Integration Skill (`/payment-integration`)

**Purpose**: PayMongo payment gateway (GCash, Maya, Bank, OTC, Cash).

## Payment Methods

### 1. GCash (PayMongo)
Gateway: PayMongo e-wallet
Flow: Create checkout → Pay on PayMongo → Webhook confirmation

### 2. Maya (PayMongo)
Gateway: PayMongo Maya wallet
Flow: Same as GCash

### 3. Bank Transfer
Manual: User transfers to bank account
Status: Marked PAID when receipt uploaded

### 4. OTC (Over-the-Counter)
Manual: User pays at bank counter
Status: Marked PAID when receipt uploaded

### 5. Cash
Manual: User pays at BPLO office
Status: Marked PAID by STAFF

## PayMongo Integration

**File**: `src/lib/payments.ts`
**API Docs**: https://developers.paymongo.com

### Create Payment

```typescript
import { createGCashPayment } from "@/lib/payments";

const payment = await createGCashPayment(
  applicationId,
  new Decimal("2500.00"),
  returnUrl
);
// Returns: { checkoutUrl: "https://checkout.paymongo.com/..." }
```

### Webhook Handler

File: `src/app/api/payments/webhook/route.ts`

```typescript
// PayMongo sends: { data: { id, status, amount } }
// Verify signature with HMAC-SHA256
// Update Payment status: PAID / FAILED
// Broadcast SSE: 'payment_status_changed'
```

### Status Transitions

```
PENDING → PROCESSING (user pays)
       → PAID (webhook received)
       → FAILED (payment rejected)
       → REFUNDED (manual refund)
       → CANCELLED (user cancelled)
```

## Database

**Model**: `Payment`
```prisma
id          String
applicationId String
amount      Decimal(12,2)
method      PaymentMethod
status      PaymentStatus
referenceNumber String
webhook_received DateTime?
```

**WebhookLog**: Track all webhook events for idempotency
```prisma
id          String
externalId  String  @unique
status      String
processed   Boolean @default(false)
```

## Testing

**Local**: Use PayMongo test API key + test cards
- Card: 4242 4242 4242 4242
- CVV: Any 3 digits
- Expiry: Any future date

**Commands**:
```bash
# Get PayMongo test key
echo $PAYMONGO_SECRET_KEY

# Create test payment
curl -X POST http://localhost:3000/api/payments \
  -d '{ "applicationId": "...", "amount": 2500, "method": "GCASH" }'
```

## Error Handling

- Network error → Retry with exponential backoff
- Invalid payload → Return 400 with error message
- Duplicate webhook → Check WebhookLog, ignore
- Payment failed → Update status, notify user

## Monitoring

**Logs**:
```typescript
console.error(`Payment ${paymentId} webhook processing failed:`, error);
```

**Alerts**: Check Payment table for FAILED status

**Reports**: `/api/admin/reports/analytics` includes payment metrics

