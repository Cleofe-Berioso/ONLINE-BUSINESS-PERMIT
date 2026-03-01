/**
 * Government Agency API Integration Module
 * DTI, BIR, SEC verification for Philippine business registrations
 *
 * NOTE: These are mock implementations. In production, integrate with actual
 * government APIs as they become available. The DTI eBNRS API, BIR eServices,
 * and SEC eFAST system may have different endpoints and authentication.
 */

// ============================================================================
// Types
// ============================================================================

export interface VerificationResult {
  verified: boolean;
  source: 'DTI' | 'BIR' | 'SEC';
  registrationNumber: string;
  businessName?: string;
  status?: string;
  expiryDate?: string;
  details?: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

// ============================================================================
// DTI (Department of Trade and Industry) Verification
// ============================================================================

const DTI_API_URL = process.env.DTI_API_URL || '';
const DTI_API_KEY = process.env.DTI_API_KEY || '';

export async function verifyDTIRegistration(
  registrationNumber: string
): Promise<VerificationResult> {
  const timestamp = new Date().toISOString();

  try {
    if (!DTI_API_URL || !DTI_API_KEY) {
      // Mock verification for development
      console.log(`[DEV] DTI verification for: ${registrationNumber}`);

      // Simulate a valid registration for testing
      const isValid = /^\d{7,}$/.test(registrationNumber.replace(/[- ]/g, ''));
      return {
        verified: isValid,
        source: 'DTI',
        registrationNumber,
        businessName: isValid ? 'Sample Business Enterprise' : undefined,
        status: isValid ? 'ACTIVE' : 'NOT_FOUND',
        expiryDate: isValid
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined,
        timestamp,
      };
    }

    // Production: Call DTI eBNRS API
    const response = await fetch(`${DTI_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DTI_API_KEY}`,
      },
      body: JSON.stringify({ registrationNumber }),
    });

    if (!response.ok) {
      throw new Error(`DTI API returned ${response.status}`);
    }

    const data = await response.json();

    return {
      verified: data.status === 'ACTIVE',
      source: 'DTI',
      registrationNumber,
      businessName: data.businessName,
      status: data.status,
      expiryDate: data.expiryDate,
      details: data,
      timestamp,
    };
  } catch (error) {
    console.error('DTI verification error:', error);
    return {
      verified: false,
      source: 'DTI',
      registrationNumber,
      error: error instanceof Error ? error.message : 'DTI verification failed',
      timestamp,
    };
  }
}

// ============================================================================
// BIR (Bureau of Internal Revenue) TIN Verification
// ============================================================================

const BIR_API_URL = process.env.BIR_API_URL || '';
const BIR_API_KEY = process.env.BIR_API_KEY || '';

export async function verifyBIRTIN(tinNumber: string): Promise<VerificationResult> {
  const timestamp = new Date().toISOString();

  try {
    if (!BIR_API_URL || !BIR_API_KEY) {
      // Mock verification for development
      console.log(`[DEV] BIR TIN verification for: ${tinNumber}`);

      // Validate TIN format: xxx-xxx-xxx-xxx
      const isValidFormat = /^\d{3}-\d{3}-\d{3}-\d{3}$/.test(tinNumber);
      return {
        verified: isValidFormat,
        source: 'BIR',
        registrationNumber: tinNumber,
        status: isValidFormat ? 'ACTIVE' : 'INVALID_FORMAT',
        timestamp,
      };
    }

    // Production: Call BIR eServices API
    const response = await fetch(`${BIR_API_URL}/tin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BIR_API_KEY}`,
      },
      body: JSON.stringify({ tin: tinNumber }),
    });

    if (!response.ok) {
      throw new Error(`BIR API returned ${response.status}`);
    }

    const data = await response.json();

    return {
      verified: data.valid === true,
      source: 'BIR',
      registrationNumber: tinNumber,
      businessName: data.registeredName,
      status: data.status,
      details: data,
      timestamp,
    };
  } catch (error) {
    console.error('BIR verification error:', error);
    return {
      verified: false,
      source: 'BIR',
      registrationNumber: tinNumber,
      error: error instanceof Error ? error.message : 'BIR verification failed',
      timestamp,
    };
  }
}

// ============================================================================
// SEC (Securities and Exchange Commission) Verification
// ============================================================================

const SEC_API_URL = process.env.SEC_API_URL || '';
const SEC_API_KEY = process.env.SEC_API_KEY || '';

export async function verifySECRegistration(
  registrationNumber: string
): Promise<VerificationResult> {
  const timestamp = new Date().toISOString();

  try {
    if (!SEC_API_URL || !SEC_API_KEY) {
      // Mock verification for development
      console.log(`[DEV] SEC verification for: ${registrationNumber}`);

      const isValid = registrationNumber.length >= 6;
      return {
        verified: isValid,
        source: 'SEC',
        registrationNumber,
        businessName: isValid ? 'Sample Corporation' : undefined,
        status: isValid ? 'ACTIVE' : 'NOT_FOUND',
        timestamp,
      };
    }

    // Production: Call SEC eFAST API
    const response = await fetch(`${SEC_API_URL}/company/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SEC_API_KEY}`,
      },
      body: JSON.stringify({ secNumber: registrationNumber }),
    });

    if (!response.ok) {
      throw new Error(`SEC API returned ${response.status}`);
    }

    const data = await response.json();

    return {
      verified: data.status === 'ACTIVE',
      source: 'SEC',
      registrationNumber,
      businessName: data.companyName,
      status: data.status,
      expiryDate: data.expiryDate,
      details: data,
      timestamp,
    };
  } catch (error) {
    console.error('SEC verification error:', error);
    return {
      verified: false,
      source: 'SEC',
      registrationNumber,
      error: error instanceof Error ? error.message : 'SEC verification failed',
      timestamp,
    };
  }
}

// ============================================================================
// Combined Verification
// ============================================================================

export async function verifyBusinessRegistration(params: {
  dtiNumber?: string;
  tinNumber?: string;
  secNumber?: string;
}): Promise<VerificationResult[]> {
  const results: Promise<VerificationResult>[] = [];

  if (params.dtiNumber) {
    results.push(verifyDTIRegistration(params.dtiNumber));
  }
  if (params.tinNumber) {
    results.push(verifyBIRTIN(params.tinNumber));
  }
  if (params.secNumber) {
    results.push(verifySECRegistration(params.secNumber));
  }

  return Promise.all(results);
}
