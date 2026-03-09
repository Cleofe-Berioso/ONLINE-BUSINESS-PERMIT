# City Restriction — OBPS LGU Configuration & Multi-tenancy

## Purpose

Configure the Online Business Permit System for specific Local Government Unit (LGU) requirements — municipality name, jurisdiction boundaries, custom branding, and local regulatory requirements.

## Usage

```
/city-restriction <configuration-task>
```

## LGU Configuration Points

### 1. System Identity

Configured via `SystemSetting` model or environment variables:

```
LGU_NAME = "City of San Fernando"
LGU_PROVINCE = "Pampanga"
LGU_REGION = "Region III"
LGU_LOGO_URL = "/images/lgu-logo.png"
LGU_CONTACT_EMAIL = "bplo@sanfernando.gov.ph"
LGU_CONTACT_PHONE = "(045) 961-2345"
```

### 2. Jurisdiction Validation

- Business addresses validated against LGU boundaries
- Barangay list specific to the municipality
- ZIP code validation for the jurisdiction

### 3. Document Requirements

Different LGUs may require different documents:

```typescript
// Configurable per LGU in SystemSetting
const requiredDocuments = {
  NEW: [
    "DTI",
    "BIR",
    "BARANGAY_CLEARANCE",
    "ZONING",
    "FIRE_SAFETY",
    "LEASE",
    "CEDULA",
    "ID_PHOTO",
  ],
  RENEWAL: ["BIR", "BARANGAY_CLEARANCE", "FIRE_SAFETY", "CEDULA"],
};
```

### 4. Fee Schedule

- Fees vary by municipality (ordinance-based)
- Configured in `SystemSetting` model
- See `/fee-structure` command for details

### 5. Operating Hours

```
LGU_OFFICE_HOURS_START = "08:00"
LGU_OFFICE_HOURS_END = "17:00"
LGU_OFFICE_DAYS = "Monday-Friday"
```

- Claim schedule slots restricted to office hours
- System notifications respect office hours

### 6. Branding

- LGU logo in header and permit PDF
- Municipality name in page titles and emails
- Configurable theme colors (if needed)
- Custom footer with LGU contact info

## Implementation

All LGU-specific values should be:

1. Stored in `SystemSetting` model (database-driven, admin-editable)
2. Cached in Redis for performance
3. Accessible via `getSystemSetting(key)` utility
4. Never hardcoded in components

## Multi-tenancy (Future)

If supporting multiple LGUs:

- Tenant identification via subdomain or URL path
- Separate database per tenant (schema isolation)
- Shared codebase, per-tenant configuration
- Currently: single-tenant design

## Checklist

- [ ] LGU name/contact in SystemSetting
- [ ] Document requirements configurable
- [ ] Fee schedule configurable
- [ ] Barangay list loaded from configuration
- [ ] LGU logo appears in permit PDF
- [ ] Email templates include LGU branding
- [ ] Public pages show correct LGU identity
