# Payment Integration — OBPS PayMongo & Payment Processing

## Purpose

Implement, debug, and maintain payment processing flows for the Online Business Permit System using PayMongo (GCash, Maya, bank transfer) and OTC cash recording.

## Usage

```
/payment-integration <description-of-payment-task>
```

## Context

- **Gateway**: PayMongo API v1 (`src/lib/payments.ts`)
- **Methods**: GCash, Maya (PayMaya), Bank Transfer, Cash/OTC
- **Webhook**: `/api/payments/webhook/route.ts` — signature-verified
- **Model**: Payment (in `prisma/schema.prisma`)
- **Status Flow**: PENDING → PAID | FAILED | EXPIRED | REFUNDED

## Payment Architecture

```
Applicant → [Pay Now Button] → POST /api/payments
  → PayMongo.createCheckout() → Redirect to GCash/Maya
  → User completes payment on gateway
  → PayMongo sends webhook → POST /api/payments/webhook
  → Verify signature → Update Payment.status = PAID
  → Update Application → Send notification (SSE + email)

Staff → [Record OTC] → POST /api/payments (method: CASH)
  → Create Payment record (status: PAID)
  → Update Application → Log in AuditLog
```

## Key Files

| File                                          | Purpose                                                 |
| --------------------------------------------- | ------------------------------------------------------- |
| `src/lib/payments.ts`                         | PayMongo client wrapper (createCheckout, verifyWebhook) |
| `src/app/api/payments/route.ts`               | Create payment, list payments                           |
| `src/app/api/payments/webhook/route.ts`       | Handle PayMongo webhook events                          |
| `src/app/api/payments/[id]/route.ts`          | Get payment details, refund                             |
| `src/components/dashboard/pay-now-button.tsx` | Client payment trigger                                  |

## PayMongo Integration

### Create Checkout Session

```typescript
import { createCheckoutSession } from "@/lib/payments";

const checkout = await createCheckoutSession({
  amount: application.totalFee * 100, // PayMongo uses centavos
  currency: "PHP",
  description: `Business Permit - ${application.businessName}`,
  paymentMethodTypes: ["gcash", "paymaya", "bank_transfer"],
  metadata: {
    applicationId: application.id,
    userId: session.user.id,
  },
  successUrl: `${process.env.AUTH_URL}/dashboard/applications/${application.id}?payment=success`,
  cancelUrl: `${process.env.AUTH_URL}/dashboard/applications/${application.id}?payment=cancelled`,
});
```

### Webhook Handler

```typescript
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("paymongo-signature");

  // Verify webhook signature
  const event = verifyWebhookSignature(rawBody, signature!);

  if (event.type === "checkout_session.payment.paid") {
    const { applicationId, userId } = event.data.attributes.metadata;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { checkoutSessionId: event.data.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      // Update application status if needed
    });
  }

  return NextResponse.json({ received: true });
}
```

## Payment Enums

```prisma
enum PaymentMethod {
  GCASH
  MAYA
  BANK_TRANSFER
  CASH
  OTHER
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  EXPIRED
}
```

## Environment Variables

```
PAYMONGO_SECRET_KEY=sk_test_...    # PayMongo secret key
PAYMONGO_PUBLIC_KEY=pk_test_...    # PayMongo public key
PAYMONGO_WEBHOOK_SECRET=whsk_...   # Webhook signing secret
```

## Testing Payments

1. Use PayMongo **test mode** keys (`sk_test_*`, `pk_test_*`)
2. Use test card numbers / test GCash numbers from PayMongo docs
3. For webhook testing locally: use ngrok (`UPDATE-NGROK-URL.bat`)
4. Test OTC recording as STAFF role

## Fee Calculation

- Fees defined in SystemSetting model or hardcoded per application type
- NEW application: Base fee + document processing fee
- RENEWAL: Reduced base fee
- Late renewal: Penalty surcharge

## Checklist

- [ ] PayMongo API keys in `.env.local`
- [ ] Webhook endpoint registered in PayMongo dashboard
- [ ] Webhook signature verification implemented
- [ ] Amount in centavos (multiply by 100)
- [ ] Idempotency: webhook can be received multiple times safely
- [ ] Payment status updates are transactional with application updates
- [ ] OTC payment requires STAFF or ADMINISTRATOR role
- [ ] Receipt generation after successful payment
- [ ] Audit log entry for all payment operations
