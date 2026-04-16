Phase 5 implementation
1. Add helper logic first

Implement these first because the routes and UI will depend on them:

web/src/lib/email.ts
add permit expiry email function
web/src/lib/sse.ts
add permit printed broadcast if missing
add permit expired broadcast if missing
web/src/lib/validations.ts
add permit list schema if still missing
2. Implement backend routes

After helpers are ready, build these routes:

web/src/app/api/permits/[id]/print/route.ts
auth
role check
fetch issuance
update printedAt
change status ISSUED -> RELEASED if applicable
log activity
broadcast SSE
return updated issuance
web/src/app/api/cron/expire-permits/route.ts
validate cron secret
find expired permits
update permit status to EXPIRED
send expiry email
broadcast SSE
log activity
return processed count
3. Connect frontend issuance actions

After the routes work, connect the UI:

web/src/components/dashboard/IssuanceClient.tsx
replace print stub with real POST request
replace download stub with real PDF fetch
add loading state
add toast success/error
refresh local data after success
4. Update test data

Then make sure your data supports Phase 5:

web/prisma/seed.js
add permits for issuance testing
add expired permits for cron testing
add applicants tied to those permits
5. Review existing prefill route

Check this route only after the main Phase 5 work:

web/src/app/api/permits/[id]/prefill/route.ts
verify role rules
verify only ACTIVE or EXPIRED
verify renewal prefill fields are complete
Phase 6 implementation
1. Add validation first

Before routes, expand validation:

web/src/lib/validations.ts
add checkInSchema
add verifyPermitSchema
add reportExportSchema
2. Implement backend routes

Then build the main Phase 6 APIs:

web/src/app/api/claims/[id]/check-in/route.ts
fetch reservation
verify status is valid
set checkedInAt
update issuance to COMPLETED
log activity
broadcast SSE
return permit + issuance data
web/src/app/api/public/verify-permit/route.ts
public access
parse reference or qrCode
fetch permit safely
return public-safe fields only
apply rate limiting
return 404 if invalid
web/src/app/api/admin/reports/analytics/route.ts
admin auth
optional date range
calculate application, payment, claim, revenue, slot metrics
cache result
return chart-ready JSON
3. Enhance existing export route

After analytics:

web/src/app/api/admin/reports/export/route.ts
verify admin auth
verify csv|pdf
verify applications|payments|claims
add date filters if missing
add rate limiting
add activity log
make sure download headers are correct
4. Connect reschedule UI

Then do the frontend piece:

web/src/components/dashboard/reschedule-button.tsx
open modal
load available schedules
show dates and slots
submit reschedule request
show success/error toast
trigger callback after success
5. Update test data

Then seed support data:

web/prisma/seed.js
add claims for check-in testing
add reservations for reschedule testing
add claim references or QR-linked permit data for verification testing
Best full order
Phase 5
email.ts
sse.ts
validations.ts
permits/[id]/print/route.ts
cron/expire-permits/route.ts
IssuanceClient.tsx
seed.js
review permits/[id]/prefill/route.ts
Phase 6
validations.ts
claims/[id]/check-in/route.ts
public/verify-permit/route.ts
admin/reports/analytics/route.ts
admin/reports/export/route.ts
reschedule-button.tsx
seed.js
After both phases
unit tests
e2e tests
typecheck
lint
manual testing
progress docs