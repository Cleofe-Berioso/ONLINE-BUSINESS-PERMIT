# Full System Validation Skill (`/full-system-validation`)

**Purpose**: Cross-cutting validation ensuring routes, APIs, components are wired correctly.

## 7 Validation Phases

### 1. API Route Registration
**Check**: All routes export correct HTTP methods

```bash
# List all routes
find src/app/api -name "route.ts" -exec grep -l "export async function" {} \;

# Verify each has method
grep "export async function GET\|POST\|PUT\|DELETE" src/app/api/*/route.ts
```

Expected: 18 route groups × 1-3 methods each

### 2. Page ↔ API Wiring
**Check**: Every form component calls correct endpoint

```bash
# Find all fetch calls
grep -r "fetch.*api" src/components --include="*.tsx"

# Cross-check against API routes
ls src/app/api/*/route.ts
```

### 3. Component ↔ Data Wiring
**Check**: No hardcoded mock data in production

```bash
# Search for mock data
grep -r "mockData\|TEST_\|FAKE_" src/components --include="*.tsx"
```

Should return 0 results in components (only in tests)

### 4. Type Consistency
**Check**: Frontend types match Prisma models

```bash
# Verify no type mismatches
npm run typecheck
```

Must return 0 errors

### 5. SSE Event Wiring
**Check**: Events broadcast and listened correctly

```bash
# Find broadcast calls
grep -r "broadcast(" src/

# Find SSE listeners
grep -r "addEventListener.*message" src/
grep -r "subscribe.*events" src/
```

Each broadcast should have matching listeners

### 6. Authentication Flow
**Check**: All protected routes require auth

```bash
# Find protected routes
grep -r "protected.*route" src/app/api --include="*.md"

# Check each has auth guard
grep -A5 "export async function GET" src/app/api/*/route.ts | grep "await auth()"
```

All non-public routes should check `await auth()`

### 7. Validation Coverage
**Check**: All form inputs validated server-side

```bash
# Find all POST/PUT handlers
grep -r "export async function POST\|PUT" src/app/api

# Check each validates input
grep -B5 -A10 "export async function POST" src/app/api/*/route.ts | grep "Schema\|schema"
```

All POST/PUT should call `schema.safeParse(body)`

## Validation Checklist

### API Routes
- [ ] All 18 route groups have correct methods
- [ ] All protected routes check auth
- [ ] All mutations validate with Zod
- [ ] All responses return proper status codes
- [ ] Error handling consistent

### Pages & Components
- [ ] Page components fetch in server
- [ ] Client components call correct API
- [ ] Forms use correct Zod schemas
- [ ] Loading states visible
- [ ] Errors shown with toast/alert

### Database
- [ ] All queries use Prisma
- [ ] Relations fetched with include:
- [ ] Transactions for multi-step ops
- [ ] Sensitive data sanitized
- [ ] Migrations current

### Real-time
- [ ] SSE events broadcast on changes
- [ ] Component listeners subscribed
- [ ] Cleanup functions prevent leaks
- [ ] Data updates immediately

### Types
- [ ] npm run typecheck passes (0 errors)
- [ ] No `as any` in API/lib
- [ ] Component props typed
- [ ] Response types match schemas

## Validation Commands

```bash
# Full system check
npm run typecheck
npm run lint
npm run test:e2e
npx prisma validate

# Quick checks
grep -r "fetch(" src/components
grep -r "export async function" src/app/api
grep -r "SafeParse\|safeParse" src/app/api
```

## Report Format

```
Full System Validation Report
=============================

API Routes: 18/18 ✓
  - 7 auth routes with GET,POST,DELETE
  - 9 application routes with GET,POST,PUT
  - 2 payment routes with POST
  
Auth Guards: 15/15 ✓
  - All protected routes check session
  - All enforce role-based access
  
Data Validation: 23/23 ✓
  - All POST/PUT validate with Zod
  - All validation schemas exist
  
Type System: 0 errors ✓
  - npm run typecheck passes
  
SSE Wiring: 12/12 ✓
  - 12 events broadcast correctly
  - All component listeners connected

OVERALL: PASS ✓
```

