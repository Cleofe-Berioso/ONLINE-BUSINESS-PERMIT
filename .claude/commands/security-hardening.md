# Security Hardening Skill (`/security-hardening`)

**Purpose**: Security audit and hardening following OWASP Top 10.

## Audit Areas

### 1. Authentication & Secrets
- NextAuth v5 configured with Credentials provider
- JWT: `maxAge: 30 * 60` (30 minutes)
- `NEXTAUTH_SECRET` set in .env
- No hardcoded API keys
- Password hashing: bcryptjs
- 2FA: TOTP with backup codes
- Account lockout: 5 failed attempts

**Check**: `grep -r "PASSWORD\|API_KEY\|SECRET" src/` (should be none in code)

### 2. Input Validation
- All forms use Zod schemas
- File uploads validated with magic bytes
- Virus scanning with ClamAV
- SQL injection prevented with Prisma
- XSS prevented with React sanitization

**Check**: Every `req.json()` followed by `schema.safeParse()`

### 3. Headers & CSP
- Content-Security-Policy set
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: HSTS
- Referrer-Policy: strict-no-referrer

**See**: `next.config.js` security headers section

### 4. Rate Limiting
- Auth routes: 10 per minute
- OTP routes: 5 per 15 minutes
- API routes: 100 per minute (authenticated)
- Implemented in `src/middleware.ts`

### 5. Data Privacy
- User passwords sanitized from responses
- Sensitive fields excluded with Prisma `select:`
- Activity logs for audit trail
- Data export endpoint (GDPR compliance)
- API responses don't leak user IDs of other users

**Pattern**:
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, firstName: true } // exclude password
});
```

### 6. Database Security
- Cascading deletes prevent orphaned data
- Unique constraints prevent duplicates
- Foreign keys reference enforcement
- Parameterized queries (Prisma)
- No direct SQL queries

### 7. Payment Security
- PayMongo HMAC-SHA256 signature verification
- Webhook idempotency with WebhookLog
- Test API key in dev, production key in prod
- No payment processing logs with sensitive data

### 8. File Upload Security
- Magic bytes validation (not just extension)
- File size limits (10 MB max)
- Virus scanning before storage
- Presigned URLs with 15-min expiry
- No direct file path exposure

## Hardening Checklist

- [ ] No console.log exposing data
- [ ] All API errors sanitized
- [ ] SQL injection prevented (use Prisma)
- [ ] XSS prevented (React escaping)
- [ ] CSRF tokens on forms
- [ ] Rate limiting on auth
- [ ] Headers set correctly
- [ ] Secrets in .env not code
- [ ] Database doesn't expose passwords
- [ ] File uploads validated

## Commands

```bash
# Check env usage
grep -r "process.env\." src/ | grep -v ".env"

# Find SQL injection risks
grep -r "prisma.$queryRaw\|sql\`" src/

# Check hardcoded secrets
grep -r "password\|secret\|token\|key" src/ | grep "=.*['\"]"
```

