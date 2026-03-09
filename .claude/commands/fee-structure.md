# Fee Structure — OBPS Business Permit Fee Management

## Purpose

Manage and configure the business permit fee structure for the Online Business Permit System, including base fees, document processing fees, renewal discounts, and late penalties.

## Usage

```
/fee-structure <task-or-question>
```

## Fee Architecture

Fees are stored in the `SystemSetting` model and calculated at application submission and payment time.

### Fee Types

| Fee                  | Description                      | Configurable        |
| -------------------- | -------------------------------- | ------------------- |
| Base Permit Fee      | Core business permit fee         | Yes (SystemSetting) |
| Document Processing  | Per-document processing charge   | Yes                 |
| Renewal Discount     | Reduced rate for permit renewals | Yes                 |
| Late Renewal Penalty | Surcharge for late renewals      | Yes                 |
| Mayor's Permit Fee   | Municipal permit component       | Yes                 |
| Fire Safety Fee      | Fire department clearance        | Fixed               |
| Sanitary Permit Fee  | Health department clearance      | Fixed               |

### Fee Calculation

```typescript
// src/lib/services/fee-calculator.ts
export function calculateTotalFee(application: {
  type: ApplicationType;
  businessSize: string;
  isLateRenewal: boolean;
}): number {
  const settings = await getSystemSettings("fee_*");

  let total = 0;
  // Base fee
  total +=
    application.type === "NEW" ? settings.fee_new_permit : settings.fee_renewal;

  // Size multiplier
  const sizeMultiplier =
    {
      MICRO: 0.5,
      SMALL: 1.0,
      MEDIUM: 1.5,
      LARGE: 2.0,
    }[application.businessSize] ?? 1.0;
  total *= sizeMultiplier;

  // Late penalty
  if (application.isLateRenewal) {
    total += total * (settings.fee_late_penalty_percent / 100);
  }

  return Math.round(total * 100) / 100; // Round to centavos
}
```

### System Settings Keys

```
fee_new_permit = 500.00
fee_renewal = 300.00
fee_document_processing = 50.00
fee_late_penalty_percent = 25
fee_mayors_permit = 200.00
```

### Admin Configuration

- Fees managed via **Admin → Settings** page
- Changes to `SystemSetting` model
- Audit logged when fees are modified
- API: `PATCH /api/admin/settings`

## Payment Methods

| Method        | Gateway  | Implementation          |
| ------------- | -------- | ----------------------- |
| GCash         | PayMongo | Online checkout         |
| Maya          | PayMongo | Online checkout         |
| Bank Transfer | PayMongo | Online checkout         |
| Cash (OTC)    | Manual   | Staff records in system |

## Checklist

- [ ] Fee settings stored in SystemSetting (not hardcoded)
- [ ] Fee calculation function is tested
- [ ] Admin can modify fees via settings page
- [ ] Fee changes are audit-logged
- [ ] Payment receipt shows fee breakdown
- [ ] Late renewal penalty correctly calculated
