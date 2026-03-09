# Fee Structure Management

## Overview

HoardNest uses a 5-tier commission and service fee structure for marketplace transactions. This skill covers fee calculation, tier management, and revenue breakdown.

## Fee Tiers

| Tier | Order Range      | Commission | Service Fee | Rider Earnings |
| ---- | ---------------- | ---------- | ----------- | -------------- |
| 1    | < ₱625           | 0%         | ₱85 fixed   | ₱60 fixed      |
| 2    | ₱625 – ₱2,500    | 20%        | ₱0          | 8% (min ₱80)   |
| 3    | ₱2,501 – ₱7,500  | 15%        | ₱0          | 10% (min ₱150) |
| 4    | ₱7,501 – ₱20,000 | 10%        | ₱0          | 12% (min ₱300) |
| 5    | > ₱20,000        | 5%         | ₱0          | 15% (min ₱500) |

## Key Files

| File                                          | Purpose                                          |
| --------------------------------------------- | ------------------------------------------------ |
| `src/services/feeService.ts`                  | Core fee calculation logic, tiered fee functions |
| `src/components/rider/EarningsTracker.tsx`    | Rider earnings display using fee tiers           |
| `src/components/RevenueBreakdown.tsx`         | Revenue breakdown component                      |
| `src/config/environment.ts`                   | Business config (min/max order amounts)          |
| `src/pages/admin/FinancialManagementPage.tsx` | Admin financial overview                         |

## Commands

### Calculate fees for a given order amount

```
/fee-structure calculate <amount>
```

### Show current tier structure

```
/fee-structure show-tiers
```

### Update tier thresholds

```
/fee-structure update-tier <tier> <min> <max> <commission>
```

## Calculation Formula

### For Tier 1 (< ₱625):

- **Buyer pays**: Item Price + ₱85 service fee
- **Seller receives**: Item Price (100%)
- **Platform revenue**: ₱85 service fee
- **Rider earnings**: ₱60 fixed

### For Tiers 2–5 (≥ ₱625):

- **Buyer pays**: Item Price (no additional fee)
- **Seller receives**: Item Price - (Item Price × Commission Rate)
- **Platform revenue**: Item Price × Commission Rate
- **Rider earnings**: Item Price × Rider Rate (with minimum guarantee)

## Validation Rules

- Minimum order: ₱100 (`config.business.minOrderAmount`)
- Maximum order: ₱50,000 (`config.business.maxOrderAmount`)
- COD fee: configurable via `REACT_APP_COD_FEE_PERCENTAGE`
- Payment processing fee: 3% (for online payments)
- Cancellation fee: ₱50

## Related Functions

```typescript
// Core calculation functions in feeService.ts
calculateRevenueWithTieredFees(price, feeStructure); // Tiered commission
calculateRevenueWithFees(price, feeStructure); // Legacy flat rate
calculateOutstandingRiderEarnings(orderValue, tier, commission); // Basic rider calc
calculateOutstandingRiderEarningsImproved(orderValue, tier, commission); // Enhanced rider calc
getFeeStructure(); // Get current fee config
getFormattedFeeStructure(feeStructure); // Display formatting
```
