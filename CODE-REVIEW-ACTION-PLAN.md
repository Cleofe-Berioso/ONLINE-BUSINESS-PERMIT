# OBPS Code Review — Action Plan & Next Steps

**Date**: 2026-04-15 | **Status**: 10 issues identified, 4 CRITICAL

---

## QUICK ACTION ITEMS (This Week)

### 🔴 CRITICAL FIXES (Start Today)

**Task 1: Fix Webhook Idempotency** (2-3 hours)
- [ ] Add `WebhookLog` model to track processed webhooks
- [ ] Update `/api/payments/webhook/route.ts` with transaction + idempotency check
- [ ] Add test for duplicate webhook handling
- [ ] Command: `npm run db:migrate` after schema update

**Task 2: Fix Decimal Serialization** (1 hour)
- [ ] Create `serialization.ts` utility with `serializePayment()` function
- [ ] Update `/api/payments/route.ts` to use serialization utility
- [ ] Test: `JSON.stringify(payment).amount` should be `number`, not `{}`
- [ ] Verify: `npm run typecheck` returns 0 errors

**Task 3: Fix IDOR in Permit Release** (2-3 hours)
- [ ] Add `CheckInRecord` model to schema
- [ ] Update `/api/claims/route.ts` with ownership verification
- [ ] Add permission check: only allow release if applicant verified
- [ ] Add audit trail: log who released and when
- [ ] Test: STAFF can't release permit for wrong applicant

**Task 4: Fix Race Condition in Slot Reservation** (1-2 hours)
- [ ] Update `/api/schedules/route.ts` to use `$transaction()`
- [ ] Move all checks INSIDE transaction
- [ ] Add `currentCount` check WITHIN transaction
- [ ] Test: Send 2 concurrent requests to same slot, one must fail

### 🔧 Files to Modify (CRITICAL)

```bash
1. web/prisma/schema.prisma
   - Add: WebhookLog model (line ~500)
   - Add: CheckInRecord model (line ~520)
   - Run: npx prisma migrate dev --name add_webhook_tracking

2. web/src/app/api/payments/webhook/route.ts
   - Rewrite webhook handler with idempotency
   - ~80 lines total

3. web/src/app/api/payments/route.ts
   - Add: serializePayment() call on response
   - ~10 lines changed

4. web/src/app/api/claims/route.ts
   - Add: Ownership verification
   - Add: Check-in validation
   - ~40 lines added

5. web/src/app/api/schedules/route.ts
   - Wrap in $transaction()
   - ~10 lines changed
```

---

## TESTING CHECKLIST

### Test Webhook Idempotency
```typescript
// Run this test after fix
const webhook1 = { id: "webhook-123", data: { id: "payment-123" } };
const res1 = await POST(webhook1);
const res2 = await POST(webhook1);  // Same webhook

// Expectations:
// res1.status === 200
// res2.status === 200 (both success!)
// permit_count === 1 (only one permit created)
```

### Test Decimal Serialization
```typescript
const payment = await POST(createPaymentRequest());
const json = JSON.stringify(payment);
const parsed = JSON.parse(json);

// Should NOT be empty object
expect(parsed.amount).toBe(5000);
expect(typeof parsed.amount).toBe("number");
```

### Test IDOR Permit Release
```typescript
const staff = await createUser({ role: "STAFF" });
const victimClaim = await createClaim({ applicantId: "victim" });

const res = await POST({
  claimId: victimClaim.id,
  userId: staff.id
});

// Should fail without check-in
expect(res.status).toBe(400);
expect(res.body).toContain("check in");
```

### Test Race Condition
```typescript
const slot = await createSlot({ maxCapacity: 1 });

const [res1, res2] = await Promise.all([
  PUT({ timeSlotId: slot.id, appId: app1.id }),
  PUT({ timeSlotId: slot.id, appId: app2.id })  // Same time!
]);

// One succeeds, one fails
expect([res1.status, res2.status]).toContain(200);
expect([res1.status, res2.status]).toContain(400);

// Only 1 reservation in DB
const count = await prisma.slotReservation.count();
expect(count).toBe(1);
```

---

## PRIORITY 2: HIGH SEVERITY FIXES (Next Week)

**Issue #5**: Add permission check to `generateClearancePackages()` (30 min)
**Issue #6**: Validate application state before approval (30 min)
**Issue #7**: Batch queries in cron job (1 hour)
**Issue #8**: Add account lockout mechanism (1 hour)
**Issue #9**: Explicit document type instead of inference (2 hours)

**Total for Priority 2**: 5 hours

---

## PRIORITY 3: MEDIUM FIXES (Week 2)

**Issue #10**: Move renewal eligibility check to middleware (30 min)

---

## VALIDATION CHECKLIST AFTER FIXES

```bash
# Before committing any changes:

1. TypeScript Check
   npm run typecheck  # Should: 0 errors

2. Build Check
   npm run build  # Should: Complete successfully

3. Unit Tests
   npm test  # Should: All existing tests pass

4. Run Seed
   npm run db:seed  # Should: Complete without errors

5. Dev Server
   npm run dev  # Should: Start on port 3000

6. Quick Manual Tests
   - Create payment → Check Decimals serialize correctly
   - Book 2 slots concurrently → One should fail
   - Try to release permit without check-in → Should fail
   - Retry webhook with same ID → Should idempotent
```

---

## ESTIMATED TIMELINE

| Phase | Issues | Est. Time | Completion |
|-------|--------|-----------|------------|
| **Phase 1** | CRITICAL (1-4) | 6-8 hours | This week |
| **Phase 2** | HIGH (5-9) | 6-8 hours | Next week |
| **Phase 3** | MEDIUM (10) | 1 hour | Week 2 |
| **Testing** | All (1-10) | 4-6 hours | Ongoing |
| **Total** | All | 17-23 hours | ~2 weeks |

---

## GIT WORKFLOW

When ready to implement:

```bash
# Create feature branch
git checkout -b fix/code-review-issues

# For each issue:
# 1. Create commit after fix + tests pass
git add .
git commit -m "fix: webhook idempotency (#1)"

# 2. Run checks
npm run typecheck
npm test

# 3. When all CRITICAL issues done
git push origin fix/code-review-issues

# 4. Create PR with this checklist:
# [ ] All TypeScript errors resolved (0)
# [ ] All tests pass
# [ ] Webhook idempotency tested
# [ ] IDOR checked
# [ ] Race condition tested
# [ ] Decimal serialization verified
```

---

## DOCUMENTATION UPDATES NEEDED

After fixes, update:

1. **Code comments**:
   - Add `// Idempotent webhook handling` comments
   - Add `// Atomic transaction for data consistency` comments
   - Add `// IDOR prevention: verify ownership` comments

2. **API documentation**:
   - Document that POST /api/payments/webhook is idempotent
   - Document that POST /api/claims requires check-in
   - Document that PUT /api/schedules uses optimistic locking

3. **README**:
   - Add "Code Review Fixes Applied" section
   - List all issues resolved + dates

---

## DEPLOYMENT ORDER

When all issues fixed:

1. ✅ Test locally: `npm run dev` → manual testing (2 hours)
2. ✅ Staging deploy: Push to staging branch (if you have staging)
3. ✅ Staging tests: Run payment test, slot booking test, etc.
4. ✅ Production deploy: Merge to main, deploy
5. ✅ Monitor: Watch logs for errors, webhook retries, slot bookings

---

## QUESTIONS & NEXT STEPS

Should I:
1. **Implement the fixes** for you? (Start with CRITICAL issues)
2. **Create unit tests** for each fix?
3. **Create a workaround** for production while you're fixing? (Add feature flags?)
4. **Review other areas** (i18n, SSE, caching, etc.)?

Let me know which phase to start with!

---

## Full Issue Details

See `CODE-REVIEW-ANALYSIS.md` for complete technical details, code examples, and test cases for all 10 issues.

