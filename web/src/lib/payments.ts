/**
 * Payment Integration Module
 * Supports GCash, Maya, bank transfer, and OTC payment recording
 */

export type PaymentMethod = 'GCASH' | 'MAYA' | 'BANK_TRANSFER' | 'OTC' | 'CASH';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface PaymentRequest {
  applicationId: string;
  amount: number;
  method: PaymentMethod;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  referenceNumber?: string;
  checkoutUrl?: string;
  error?: string;
  status: PaymentStatus;
}

export interface PaymentReceipt {
  receiptNumber: string;
  transactionId: string;
  applicationId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  paidBy: string;
  businessName: string;
  description: string;
}

// ============================================================================
// GCash Integration (via PayMongo)
// ============================================================================

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || '';
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

async function paymongoRequest(endpoint: string, method: string, body?: unknown) {
  const response = await fetch(`${PAYMONGO_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString('base64')}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.detail || 'PayMongo API error');
  }

  return response.json();
}

export async function createGCashPayment(request: PaymentRequest): Promise<PaymentResult> {
  try {
    if (!PAYMONGO_SECRET_KEY) {
      // Dev mode: simulate payment
      return {
        success: true,
        transactionId: `GCASH-DEV-${Date.now()}`,
        referenceNumber: `GC${Date.now()}`,
        status: 'PENDING',
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/simulate?amount=${request.amount}`,
      };
    }

    const source = await paymongoRequest('/sources', 'POST', {
      data: {
        attributes: {
          amount: Math.round(request.amount * 100), // Convert to centavos
          currency: 'PHP',
          type: 'gcash',
          redirect: {
            success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications/${request.applicationId}?payment=success`,
            failed: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications/${request.applicationId}?payment=failed`,
          },
          billing: {
            name: request.description,
          },
        },
      },
    });

    return {
      success: true,
      transactionId: source.data.id,
      referenceNumber: source.data.id,
      checkoutUrl: source.data.attributes.redirect.checkout_url,
      status: 'PENDING',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'GCash payment failed',
      status: 'FAILED',
    };
  }
}

// ============================================================================
// Maya (PayMaya) Integration
// ============================================================================

export async function createMayaPayment(request: PaymentRequest): Promise<PaymentResult> {
  try {
    const MAYA_PUBLIC_KEY = process.env.MAYA_PUBLIC_KEY || '';
    const MAYA_BASE_URL = process.env.MAYA_BASE_URL || 'https://pg-sandbox.paymaya.com/checkout/v1';

    if (!MAYA_PUBLIC_KEY) {
      // Dev mode: simulate payment
      return {
        success: true,
        transactionId: `MAYA-DEV-${Date.now()}`,
        referenceNumber: `MY${Date.now()}`,
        status: 'PENDING',
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/simulate?amount=${request.amount}`,
      };
    }

    const response = await fetch(`${MAYA_BASE_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${MAYA_PUBLIC_KEY}:`).toString('base64')}`,
      },
      body: JSON.stringify({
        totalAmount: {
          value: request.amount,
          currency: 'PHP',
        },
        requestReferenceNumber: request.applicationId,
        redirectUrl: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications/${request.applicationId}?payment=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications/${request.applicationId}?payment=failed`,
          cancel: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications/${request.applicationId}?payment=cancelled`,
        },
      }),
    });

    if (!response.ok) throw new Error('Maya checkout failed');
    const data = await response.json();

    return {
      success: true,
      transactionId: data.checkoutId,
      referenceNumber: data.checkoutId,
      checkoutUrl: data.redirectUrl,
      status: 'PENDING',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Maya payment failed',
      status: 'FAILED',
    };
  }
}

// ============================================================================
// Bank Transfer Integration
// ============================================================================

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  referenceNumber: string;
  amount: number;
  instructions: string;
}

export function generateBankTransferDetails(request: PaymentRequest): BankTransferDetails {
  const referenceNumber = `BT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return {
    bankName: process.env.BANK_NAME || 'Land Bank of the Philippines',
    accountName: process.env.BANK_ACCOUNT_NAME || 'LGU Business Permits',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0000-0000-0000',
    referenceNumber,
    amount: request.amount,
    instructions: `Please deposit ₱${request.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} to the account above. Use reference number ${referenceNumber} as your deposit slip reference. Upload proof of payment in your application.`,
  };
}

// ============================================================================
// OTC (Over-the-Counter) Payment Recording
// ============================================================================

export interface OTCPaymentRecord {
  receiptNumber: string;
  orNumber: string; // Official Receipt number
  amount: number;
  paidBy: string;
  receivedBy: string;
  paymentDate: Date;
  method: 'CASH' | 'CHECK' | 'MONEY_ORDER';
}

export function generateReceiptNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `OR-${dateStr}-${seq}`;
}

// ============================================================================
// Payment Gateway Factory
// ============================================================================

export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  switch (request.method) {
    case 'GCASH':
      return createGCashPayment(request);
    case 'MAYA':
      return createMayaPayment(request);
    case 'BANK_TRANSFER': {
      const details = generateBankTransferDetails(request);
      return {
        success: true,
        transactionId: details.referenceNumber,
        referenceNumber: details.referenceNumber,
        status: 'PENDING',
      };
    }
    case 'OTC':
    case 'CASH':
      // OTC payments are recorded manually by staff
      return {
        success: true,
        transactionId: generateReceiptNumber(),
        referenceNumber: generateReceiptNumber(),
        status: 'COMPLETED',
      };
    default:
      return {
        success: false,
        error: 'Unsupported payment method',
        status: 'FAILED',
      };
  }
}

// ============================================================================
// Receipt Generation
// ============================================================================

export function generateReceipt(data: {
  transactionId: string;
  applicationId: string;
  amount: number;
  method: PaymentMethod;
  paidBy: string;
  businessName: string;
  description: string;
}): PaymentReceipt {
  return {
    receiptNumber: generateReceiptNumber(),
    transactionId: data.transactionId,
    applicationId: data.applicationId,
    amount: data.amount,
    method: data.method,
    paidAt: new Date(),
    paidBy: data.paidBy,
    businessName: data.businessName,
    description: data.description,
  };
}

// ============================================================================
// Payment Verification (Webhook Handlers)
// ============================================================================

export function verifyPayMongoWebhook(payload: string, signature: string): boolean {
  const crypto = require('crypto');
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET || '';
  const computedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  return computedSignature === signature;
}

export function calculateFees(applicationType: string, businessType: string): {
  permitFee: number;
  processingFee: number;
  filingFee: number;
  totalAmount: number;
} {
  // Fee schedule based on Philippine LGU typical rates
  const fees: Record<string, { permit: number; processing: number; filing: number }> = {
    NEW: { permit: 500, processing: 100, filing: 50 },
    RENEWAL: { permit: 300, processing: 75, filing: 50 },
  };

  const typeFees = fees[applicationType] || fees.NEW;

  // Business type multipliers
  const multipliers: Record<string, number> = {
    SOLE_PROPRIETORSHIP: 1.0,
    PARTNERSHIP: 1.5,
    CORPORATION: 2.0,
    COOPERATIVE: 0.8,
  };

  const multiplier = multipliers[businessType] || 1.0;

  const permitFee = typeFees.permit * multiplier;
  const processingFee = typeFees.processing;
  const filingFee = typeFees.filing;

  return {
    permitFee,
    processingFee,
    filingFee,
    totalAmount: permitFee + processingFee + filingFee,
  };
}
