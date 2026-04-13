# Security Hardening — OBPS Web Application Security

## Purpose

Audit and harden the security posture of the Online Business Permit System. Covers authentication, authorization, input validation, CSP headers, rate limiting, and OWASP Top 10 mitigations.

## Usage

```
/security-hardening <area-or-concern-to-audit>
```

## Security Architecture

### Authentication (NextAuth v5)

- **Provider**: Credentials (email + password)
- **Strategy**: JWT (30-minute session, auto-refresh)
- **Password**: bcrypt hashing (salt rounds: 12)
- **2FA**: TOTP via otplib 12.0.1 (Google Authenticator compatible) — `src/lib/two-factor.ts`
- **Account lockout**: Track failed attempts, lock after threshold
- **OTP Verification**: Time-limited tokens in VerificationToken model

### Authorization (CASL.js)

- **RBAC**: 4 roles (APPLICANT, STAFF, REVIEWER, ADMINISTRATOR)
- **Config**: `src/lib/permissions.ts` — defineAbilityFor(role)
- **Enforcement**: Check `ability.can(action, subject)` in API routes
- **Middleware**: `src/middleware.ts` — Edge-safe route protection

### Files to Audit

| File                     | Security Function                          |
| ------------------------ | ------------------------------------------ |
| `src/middleware.ts`      | Route protection, rate limit headers, RBAC |
| `src/lib/auth.ts`        | NextAuth config, callbacks, session        |
| `src/lib/auth.config.ts` | Edge-safe provider config                  |
| `src/lib/permissions.ts` | CASL ability definitions                   |
| `src/lib/rate-limit.ts`  | Sliding window rate limiter                |
| `src/lib/sanitize.ts`    | Input sanitization (XSS prevention)        |
| `src/lib/validations.ts` | Zod schemas for all inputs                 |
| `web/next.config.js`     | Security headers, CSP                      |

### Security Headers (next.config.js)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## OWASP Top 10 Checklist

### A01: Broken Access Control

- [ ] Every API route checks `auth()` session
- [ ] Role-based checks with CASL `ability.can()`
- [ ] Users can only access their own resources (`where: { userId }`)
- [ ] Admin routes protected at middleware level
- [ ] No direct object reference without ownership check

### A02: Cryptographic Failures

- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] AUTH_SECRET is strong and rotated
- [ ] Database connection via SSL in production
- [ ] Sensitive data not logged

### A03: Injection

- [ ] Prisma parameterized queries (no raw SQL)
- [ ] Zod validation on all inputs
- [ ] Input sanitization via `sanitize.ts`
- [ ] No `eval()` or template string injection

### A04: Insecure Design

- [ ] Multi-step application requires all previous steps
- [ ] Payment verification via webhooks (not client-side)
- [ ] Document verification by staff (not auto-approved)

### A05: Security Misconfiguration

- [ ] `.env.local` not in version control
- [ ] Docker containers run as non-root
- [ ] Error messages don't leak stack traces in production
- [ ] Prisma Studio disabled in production

### A06: Vulnerable Components

- [ ] `npm audit` clean or all issues triaged
- [ ] Dependencies pinned to known-good versions
- [ ] Regular update cycle

### A07: Authentication Failures

- [ ] Account lockout after failed attempts
- [ ] Password complexity enforced (Zod schema)
- [ ] OTP expiration enforced
- [ ] Session timeout (30 minutes)

### A08: Data Integrity Failures

- [ ] PayMongo webhook signature verification
- [ ] CSRF protection via NextAuth
- [ ] File upload: magic bytes validation, type whitelisting

### A09: Logging & Monitoring

- [ ] Winston logger captures auth events
- [ ] AuditLog model tracks data mutations
- [ ] Sentry integration for error tracking (optional)
- [ ] Prometheus metrics endpoint (`/api/metrics`)

### A10: SSRF

- [ ] Government API calls use allowlisted URLs only
- [ ] File uploads validated server-side, not fetched by URL

## Rate Limiting

```
Login: 5 attempts per 15 minutes per IP
Registration: 3 per hour per IP
API general: 100 requests per minute per user
File upload: 10 per hour per user
Payment: 5 per hour per user
```

## Audit Commands

```bash
# Dependency audit
npm audit

# Type safety check
npx tsc --noEmit

# Lint security rules
npx eslint . --max-warnings 0

# OWASP ZAP scan
pwsh tests/security/run-zap-scan.ps1

# Check for secrets in code
git log --all --diff-filter=A -- '*.env*'
```

## Security-Related Lib Modules

| Module | Security Focus | Key Responsibility |
|--------|---------------|--------------------|
| `src/lib/auth.ts` | Authentication | NextAuth Credentials provider, bcrypt password hashing |
| `src/lib/auth.config.ts` | Token security | JWT generation, session callbacks, 30-min maxAge |
| `src/lib/permissions.ts` | Authorization (RBAC) | CASL.js ability definitions for 4 roles × 10 actions |
| `src/lib/rate-limit.ts` | DoS prevention | Sliding window rate limiting for auth/API/upload endpoints |
| `src/lib/sanitize.ts` | XSS prevention | Remove sensitive fields, sanitize user input |
| `src/lib/validations.ts` | Input validation | Zod schemas enforce type/length/format on all inputs |
| `src/lib/two-factor.ts` | MFA security | TOTP 2FA via otplib, Google Authenticator compatible |
| `src/lib/payments.ts` | Payment security | PayMongo webhook signature verification, amount validation |
| `src/lib/storage.ts` | File security | Magic bytes validation, type whitelisting, virus scanning |
| `src/lib/logger.ts` | Audit logging | Winston logger for security events, no PII in logs |

