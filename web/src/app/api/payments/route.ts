/**
 * POST /api/payments
 * GET /api/payments?id={paymentId}
 * P4.0: Payment Creation & Status
 */

import { NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processPayment, generateReceiptNumber } from "@/lib/payments";
import { calculateFees } from "@/lib/payments";
import { rateLimitPayment } from "@/lib/rate-limit";
import { captureException } from "@/lib/monitoring";
import { sendPaymentConfirmationEmail } from "@/lib/email";
import { broadcastPaymentInitiated } from "@/lib/sse";
import { paymentSchema } from "@/lib/validations";
import { toNumber, toDecimalString, serializePayment } from "@/lib/serialization";


// POST /api/payments - Initiate a payment
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 5 requests per minute per user
    const rateLimitResult = rateLimitPayment(session.user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validated = paymentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { applicationId, method } = validated.data;

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true, permit: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify ownership (APPLICANT can only pay for their own apps)
    if (
      session.user.role === "APPLICANT" &&
      application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check application status — must be ENDORSED to pay
    if (application.status !== "ENDORSED") {
      return NextResponse.json(
        {
          error: "Application not ready for payment",
          message: `Application status is ${application.status}. Only ENDORSED applications can proceed to payment.`,
        },
        { status: 400 }
      );
    }

    // Calculate fee based on application type and business type (DFD P5.0)
    const feeInfo = calculateFees({
      applicationType: application.type || "NEW",
      businessType: application.businessType || undefined,
      businessName: application.businessName,
      lineOfBusiness: application.lineOfBusiness || undefined,
      grossSales: application.grossSales ? { toDecimal: () => application.grossSales!.toNumber() } : null,
      paymentFrequency: "ANNUAL",
    });

    if (!feeInfo || feeInfo.totalAmount <= 0) {
      return NextResponse.json(
        {
          error: "Fee not configured",
          message: "Unable to calculate application fee",
        },
        { status: 402 }
      );
    }

    // Validate payment method
    const validMethods = ["GCASH", "MAYA", "BANK_TRANSFER", "OTC", "CASH"];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        {
          error: "Invalid payment method",
          message: `Supported methods: ${validMethods.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create payment record
    const referenceNumber = generateReceiptNumber();

    // CRITICAL FIX #2: Convert Decimal to number, then wrap in Decimal constructor
    const amountAsNumber = typeof feeInfo.totalAmount === "number"
      ? feeInfo.totalAmount
      : toNumber(feeInfo.totalAmount) || 0;

    const payment = await prisma.payment.create({
      data: {
        applicationId,
        payerId: session.user.id,
        amount: new Decimal(amountAsNumber), // Wrap in Decimal constructor
        method: method as any,
        status: "PENDING",
        referenceNumber,
        metadata: {
          businessName: application.businessName,
          applicationType: application.type,
          businessType: application.businessType,
          permitFee: toDecimalString(feeInfo.permitFee) ?? "0.00",
          processingFee: toDecimalString(feeInfo.processingFee) ?? "0.00",
          filingFee: toDecimalString(feeInfo.filingFee) ?? "0.00",
        } as any, // JSON field accepts any serializable value
      },
    });

    // Process payment (dispatch to appropriate gateway)
    const paymentResult = await processPayment({
      applicationId,
      amount: amountAsNumber,
      method: method as any,
      description: `Business Permit Application Payment - ${application.applicationNumber}`,
    });

    if (!paymentResult.success) {
      // Update payment to FAILED
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          metadata: {
            ...((payment.metadata as Record<string, unknown>) || {}),
            errorMessage: paymentResult.error,
          } as any,
        },
      });

      return NextResponse.json(
        {
          error: "Payment processing failed",
          message: paymentResult.error,
        },
        { status: 503 }
      );
    }

    // Update payment with gateway info
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentResult.status as any,
        transactionId: paymentResult.transactionId || null,
        metadata: {
          ...((payment.metadata as Record<string, unknown>) || {}),
          checkoutUrl: paymentResult.checkoutUrl,
        } as any,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "PAYMENT_INITIATED",
        entity: "Payment",
        entityId: payment.id,
        details: {
          applicationId,
          amount: amountAsNumber,
          method,
          referenceNumber,
        },
      },
    });

    // Send confirmation email with properly serialized amount
    await sendPaymentConfirmationEmail(application.applicant.email, {
      businessName: application.businessName,
      amount: amountAsNumber,
      referenceNumber,
      checkoutUrl: paymentResult.checkoutUrl,
    });

    // Broadcast SSE event with properly serialized amount
    await broadcastPaymentInitiated(session.user.id, applicationId, {
      referenceNumber,
      amount: amountAsNumber,
      method,
    });

    return NextResponse.json(
      {
        payment: {
          id: payment.id,
          referenceNumber,
          amount: amountAsNumber,  // NOW a proper number, not {}
          method,
          status: paymentResult.status,
          checkoutUrl: paymentResult.checkoutUrl,
        },
        message: `Payment initiated. Reference: ${referenceNumber}`,
      },
      { status: 201 }
    );
  } catch (error) {
    captureException(error, { route: "POST /api/payments" });
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}


// GET /api/payments?id={paymentId} - Get payment details
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { application: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Verify access (own payment or staff)
    if (
      session.user.role === "APPLICANT" &&
      payment.application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // CRITICAL FIX #2: Serialize payment before returning
    return NextResponse.json({
      payment: serializePayment(payment),
    });
  } catch (error) {
    captureException(error, { route: "GET /api/payments" });
    console.error("Get payment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}
