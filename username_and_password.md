# Test Credentials — OBPS Seeded Users

All test accounts have the same password: `Password123!`

## Administrator

| Email | Password | Role | Status |
|-------|----------|------|--------|
| `admin@lgu.gov.ph` | `Password123!` | ADMINISTRATOR | ACTIVE |

## Reviewer

| Email | Password | Role | Status |
|-------|----------|------|--------|
| `reviewer@lgu.gov.ph` | `Password123!` | REVIEWER | ACTIVE |

## Staff

| Email | Password | Role | Status |
|-------|----------|------|--------|
| `staff@lgu.gov.ph` | `Password123!` | STAFF | ACTIVE |

## Applicants (Active)

| Email | Password | Role | Status |
|-------|----------|------|--------|
| `juan@example.com` | `Password123!` | APPLICANT | ACTIVE |
| `pedro@example.com` | `Password123!` | APPLICANT | ACTIVE |
| `maria@example.com` | `Password123!` | APPLICANT | ACTIVE |

## Applicants (Pending Verification)

| Email | Password | Role | Status |
|-------|----------|------|--------|
| `ana@example.com` | `Password123!` | APPLICANT | PENDING_VERIFICATION |

---

## Quick Reference (Copy-Paste)

```
Admin:      admin@lgu.gov.ph       / Password123!
Reviewer:   reviewer@lgu.gov.ph    / Password123!
Staff:      staff@lgu.gov.ph       / Password123!
Applicant:  juan@example.com       / Password123!
Applicant:  pedro@example.com      / Password123!
Applicant:  maria@example.com      / Password123!
Pending:    ana@example.com        / Password123!
```

---

## Notes

- All passwords are: **`Password123!`**
- Ana's account (`ana@example.com`) is in **PENDING_VERIFICATION** status — cannot login until email is verified
- All other accounts are **ACTIVE** and ready to use
- For seeding, run: `npm run db:seed`
- Source file: `web/prisma/seed.js` (lines 594-601)
