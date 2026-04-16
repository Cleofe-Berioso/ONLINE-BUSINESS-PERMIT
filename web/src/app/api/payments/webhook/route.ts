/**
<<<<<<< Updated upstream
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
=======
 * POST /api/payments/webhook
 * P4.0 Phase B: PayMongo Webhook Handler
 *
 * Handles PayMongo webhook events:
 * - payment.succeeded → Update payment, generate permit (IDEMPOTENT)
 * - payment.failed → Update status
 * - payment.disputed → Update status
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPayMongoWebhook } from "@/lib/payments";
import { captureException } from "@/lib/monitoring";
import { sendPermitIssuedEmail } from "@/lib/email";
import { broadcastPermitIssued } from "@/lib/sse";

const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  try {
    // Verify webhook signature from PayMongo
    const signature = request.headers.get("x-paymongo-signature") || "";
    const body = await request.text();

    if (!verifyPayMongoWebhook(body, signature)) {
      console.warn("Invalid PayMongo webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const event = JSON.parse(body);
    const webhookId = event.id; // PayMongo's unique webhook ID

    let processed = false;

    // Handle payment.succeeded event
    if (event.type === "payment.succeeded") {
      const transactionId = event.data.id;

      // CRITICAL FIX #1: Check if webhook already processed (IDEMPOTENCY)
      const existingWebhook = await prisma.webhookLog.findUnique({
        where: { paymongoWebhookId: webhookId },
      });

      if (existingWebhook?.status === "PROCESSED") {
        // Webhook already handled successfully
        return NextResponse.json(
          { status: "already_processed", webhookId },
          { status: 200 }
        );
      }

      const payment = await prisma.payment.findUnique({
        where: { transactionId },
        include: { application: { include: { applicant: true } } },
      });

      if (!payment) {
        // Log failed webhook for debugging
        await prisma.webhookLog.create({
          data: {
            paymongoWebhookId: webhookId,
            eventType: event.type,
            status: "FAILED",
            errorMessage: "Payment not found",
          },
        });
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      if (payment.status === "PENDING") {
        // Process in transaction for atomicity
        const result = await prisma.$transaction(
          async (tx) => {
            // Double-check payment status in transaction
            const paymentInTx = await tx.payment.findUnique({
              where: { id: payment.id },
              select: { status: true, id: true },
            });

            if (paymentInTx?.status !== "PENDING") {
              throw new Error("Payment already processed");
            }

            // Update payment status
            const updatedPayment = await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: "PAID",
                paidAt: new Date(),
                metadata: {
                  ...((payment.metadata as Record<string, unknown>) || {}),
                  paymongoId: event.data.id,
                  webhookId: webhookId,
                  completedAt: new Date().toISOString(),
                } as any,
              },
            });

            // Update application status to APPROVED (critical fix #6)
            if (payment.application.status !== "ENDORSED") {
              throw new Error(
                "Application must be ENDORSED before payment approval"
              );
            }

            const updatedApp = await tx.application.update({
              where: { id: payment.applicationId },
              data: { status: "APPROVED", approvedAt: new Date() },
            });

            // Check if permit already exists
            const existingPermit = await tx.permit.findFirst({
              where: {
                applicationId: payment.applicationId,
                status: "ACTIVE", // Only check for active permits (not revoked/expired)
              },
            });

            if (existingPermit) {
              throw new Error("Permit already exists for this application");
            }

            // Generate permit
            const permitNumber = `BP-${Date.now()}`;
            const permit = await tx.permit.create({
              data: {
                applicationId: payment.applicationId,
                permitNumber,
                businessName: payment.application.businessName,
                businessAddress: payment.application.businessAddress,
                ownerName: `${payment.application.applicant.firstName} ${payment.application.applicant.lastName}`,
                status: "ACTIVE",
                issueDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              },
            });

            // Create issuance record
            const issuance = await tx.permitIssuance.create({
              data: {
                permitId: permit.id,
                issuedById: payment.application.applicantId,
                status: "PREPARED",
              },
            });

            // Log activity
            await tx.activityLog.create({
              data: {
                userId: payment.application.applicantId,
                action: "PERMIT_GENERATED_VIA_WEBHOOK",
                entity: "Permit",
                entityId: permit.id,
                details: {
                  paymentId: payment.id,
                  permitNumber: permit.permitNumber,
                  webhookId: webhookId,
                },
              },
            });

            return { permit, issuance, payment: updatedPayment };
          },
          {
            maxWait: 5000,
            timeout: 30000,
          }
        );

        // Record webhook as processed (after transaction succeeds)
        await prisma.webhookLog.create({
          data: {
            paymongoWebhookId: webhookId,
            eventType: event.type,
            status: "PROCESSED",
            result: {
              permitId: result.permit.id,
              issuanceId: result.issuance.id,
              paymentId: result.payment.id,
            },
          },
        });

        // Send permit to applicant
        await sendPermitIssuedEmail(
          payment.application.applicant.email,
          {
            businessName: payment.application.businessName,
            permitNumber: result.permit.permitNumber,
            expiryDate: result.permit.expiryDate,
          }
        );

        // Broadcast SSE event
        await broadcastPermitIssued(
          payment.application.applicantId,
          result.permit.id,
          result.permit.permitNumber
        );

        processed = true;
      }
    }

    // Handle payment.failed event
    if (event.type === "payment.failed") {
      const transactionId = event.data.id;

      const payment = await prisma.payment.findUnique({
        where: { transactionId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            metadata: {
              ...((payment.metadata as Record<string, unknown>) || {}),
              failureReason: event.data.attributes.failure_message,
              failedAt: new Date().toISOString(),
            } as any,
          },
        });

        // Log webhook
        await prisma.webhookLog.create({
          data: {
            paymongoWebhookId: event.id,
            eventType: event.type,
            status: "PROCESSED",
          },
        });

        processed = true;
      }
    }

    // Handle payment.disputed event
    if (event.type === "payment.disputed") {
      const transactionId = event.data.id;

      const payment = await prisma.payment.findUnique({
        where: { transactionId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            metadata: {
              ...((payment.metadata as Record<string, unknown>) || {}),
              disputeReason: event.data.attributes.dispute_reason,
              disputedAt: new Date().toISOString(),
            } as any,
          },
        });

        // Log webhook
        await prisma.webhookLog.create({
          data: {
            paymongoWebhookId: event.id,
            eventType: event.type,
            status: "PROCESSED",
          },
        });

        processed = true;
      }
    }

    // Return 200 OK for successful processing
    return NextResponse.json(
      { status: processed ? "processed" : "unhandled" },
      { status: 200 }
    );
  } catch (error) {
    const event = await request.json().catch(() => ({}));

    captureException(error, {
      route: "POST /api/payments/webhook",
      webhookId: event?.id,
    });

    console.error("Webhook processing error:", error);

    // Log failed webhook
    try {
      if (event?.id) {
        await prisma.webhookLog.create({
          data: {
            paymongoWebhookId: event.id,
            eventType: event.type || "unknown",
            status: "FAILED",
            errorMessage: String(error),
          },
        });
      }
    } catch (logError) {
      console.error("Failed to log webhook error:", logError);
    }

    // Return 202 to prevent infinite retries, but the error is logged
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 202 }
    );
>>>>>>> Stashed changes
  }
}
