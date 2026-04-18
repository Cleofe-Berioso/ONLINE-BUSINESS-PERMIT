# Workflow Definitions Skill (`/workflow-definitions`)

**Purpose**: Document and analyze OBPS application workflows.

## Application Lifecycle

```
DRAFT → SUBMITTED → ENDORSED → UNDER_REVIEW → APPROVED → Permit Issued
                              with REJECTED path
```

- **DRAFT**: Editable by applicant
- **SUBMITTED**: Sent to BPLO
- **ENDORSED**: Forwarded to reviewer
- **UNDER_REVIEW**: Reviewer evaluating
- **APPROVED**: Ready for permit issuance
- **REJECTED**: Did not meet requirements

## Document Workflow

```
UPLOADED → PENDING_VERIFICATION → VERIFIED or REJECTED
```

## Claim Scheduling

```
User books slot → Reservation CONFIRMED → Claim day → Check-in → Complete
```

## Permit Issuance

```
PREPARED → ISSUED (Mayor sign) → RELEASED (Pickup) → COMPLETED
```

## Payment Workflow

```
PENDING → PROCESSING (PayMongo) → PAID (auto-issue permit)
                                if FAILED or REFUNDED
```

## Clearance (per office)

```
REQUIRED → OBTAINED (approval)
        if NOT_REQUIRED
```

## Key Models

- Application (status: DRAFT-REJECTED)
- ApplicationHistory (audit trail)
- Document (status, verification)
- Payment (status, webhook)
- Permit (issued, expiry)
- Clearance (office-specific)
- TimeSlot / SlotReservation (scheduling)

## Multi-role Workflow

| Role | Can | Cannot |
|------|-----|--------|
| APPLICANT | Submit, edit DRAFT | Review/approve |
| STAFF | Verify documents | Approve/issue |
| REVIEWER | Review, approve/reject | Issue permits |
| ADMIN | All functions | Apply for permits |

## Email Triggers

- SUBMITTED → notify staff
- VERIFIED → notify applicant
- APPROVED → auto-generate permit
- PAID → mark APPROVED
- Ready for pickup → notify applicant

## Integrations

- DTI/SEC verification
- PayMongo payments
- Email notifications
- SSE real-time updates
- PDF generation with QR codes

