/**
 * Payment Webhook Handler
 * Processes PayMongo/Maya payment confirmations
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPayMongoWebhook } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paymongo-signature') || '';

    // Verify webhook signature
    if (process.env.PAYMONGO_WEBHOOK_SECRET) {
      const isValid = verifyPayMongoWebhook(body, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    const event = payload.data?.attributes;

    if (!event) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const eventType = event.type;
    const sourceId = event.data?.id;

    if (eventType === 'source.chargeable') {
      // Payment source is chargeable — create a payment
      console.log(`[Webhook] Source chargeable: ${sourceId}`);

      await prisma.activityLog.create({
        data: {
          action: 'PAYMENT_WEBHOOK_RECEIVED',
          entity: 'Payment',
          entityId: sourceId,
          details: { eventType, sourceId },
        },
      });
    }

    if (eventType === 'payment.paid') {
      console.log(`[Webhook] Payment completed: ${sourceId}`);

      await prisma.activityLog.create({
        data: {
          action: 'PAYMENT_COMPLETED',
          entity: 'Payment',
          entityId: sourceId,
          details: { eventType, amount: event.data?.attributes?.amount },
        },
      });
    }

    if (eventType === 'payment.failed') {
      console.log(`[Webhook] Payment failed: ${sourceId}`);

      await prisma.activityLog.create({
        data: {
          action: 'PAYMENT_FAILED',
          entity: 'Payment',
          entityId: sourceId,
          details: { eventType, reason: event.data?.attributes?.last_payment_error },
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
