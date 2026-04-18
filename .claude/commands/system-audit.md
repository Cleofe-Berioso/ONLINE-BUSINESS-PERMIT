# System Audit Skill (`/system-audit`)

**Purpose**: Comprehensive codebase health check across infrastructure, dependencies, security, code quality, and configuration.

## 6 Audit Phases

### 1. Code Quality & TypeScript
**Check**: Codebase compiles without errors and follows standards.

```bash
cd web

# TypeScript strict check
npm run typecheck

# ESLint rules
npm run lint

# Search for anti-patterns
grep -r "console.log" src/app/api src/lib --include="*.ts" --include="*.tsx"
grep -r " as any" src/app/api src/lib --include="*.ts" --include="*.tsx"
grep -r "// TODO\|// FIXME\|XXX" src --include="*.ts" --include="*.tsx"
```

Expected results:
- `npm run typecheck`: 0 errors
- `npm run lint`: All rules pass
- No `console.log` in API/lib (only `console.error` in catch blocks)
- No `as any` type assertions in core code
- No unresolved TODOs in production code

### 2. Security & Configuration
**Check**: No hardcoded secrets, all required env vars present, security headers configured.

```bash
# Search for hardcoded secrets
grep -r "password\|secret\|apiKey\|token" src --include="*.ts" --include="*.tsx" | grep -v "NEXT_PUBLIC\|process.env" | grep -v "\.test\|\.spec"

# Check env variables
grep -r "process.env\." src/app/api src/lib | cut -d: -f2 | sed 's/.*process\.env\.\([A-Z_]*\).*/\1/' | sort -u > /tmp/env-used.txt
cat web/.env.example | grep "^[A-Z_]" | cut -d= -f1 | sort -u > /tmp/env-defined.txt
comm -23 /tmp/env-used.txt /tmp/env-defined.txt

# Verify next.config.js has security headers
grep -A20 "Content-Security-Policy\|X-Frame-Options\|X-Content-Type-Options" next.config.js
```

Expected results:
- 0 hardcoded secrets in source code
- All used `process.env.*` defined in `.env.example`
- Security headers configured (CSP, HSTS, X-Frame-Options, etc.)
- auth.ts and auth.config.ts properly split (no Node.js imports in config.ts)

### 3. Database & Prisma
**Check**: Schema is valid, migrations are current, no uncommitted schema changes.

```bash
# Validate schema
npx prisma validate

# Check migration status
npx prisma migrate status

# List all models
grep "^model " prisma/schema.prisma | wc -l

# Check for orphaned migrations
ls prisma/migrations | wc -l
```

Expected results:
- `npx prisma validate`: Schema is valid
- `npx prisma migrate status`: All migrations applied (0 pending)
- 16 models defined in schema
- No orphaned migration files

### 4. Dependencies & Build
**Check**: No outdated packages, no vulnerabilities, build succeeds, no unused dependencies.

```bash
# Check for outdated packages (run from web/)
npm outdated

# Audit for vulnerabilities
npm audit

# Verify build succeeds
npm run build

# Check build output size
du -sh .next/

# Search for unused imports (rough check)
grep -r "^import.*from" src | grep -v "import.*from '[./]" | cut -d: -f1 | sort -u
```

Expected results:
- No critical or high vulnerabilities (medium/low OK if patching not available)
- Production build succeeds with 0 errors
- `.next/` folder < 500MB
- All serverExternalPackages listed in next.config.js are actually used in Node.js only code

### 5. API Routes & Handlers
**Check**: All routes have proper auth guards, validation, and status codes.

```bash
# Find all API routes
find src/app/api -name "route.ts" -type f

# Count routes by method
grep -h "export async function" src/app/api/*/route.ts | cut -d' ' -f4 | sort | uniq -c

# Check auth guards (should see "await auth()" in protected routes)
grep -l "export async function" src/app/api/*/route.ts | xargs -I {} grep -L "await auth()" {} | grep -v "public\|health"

# Verify status codes
grep -r "status:" src/app/api --include="*.ts" | grep -v "400\|401\|403\|404\|409\|500" | head -10
```

Expected results:
- 18 route groups with proper HTTP methods
- Protected routes check `await auth()`
- Public routes explicitly documented (health, track, verify-permit)
- Responses use proper status codes (200, 201, 400, 401, 403, 404, 500)

### 6. Frontend & Components
**Check**: Components are properly imported, no missing dependencies, styles applied.

```bash
# Find all component files
find src/components -name "*.tsx" -type f | wc -l

# Check for missing key props on .map()
grep -r "\.map(" src/components --include="*.tsx" | grep -v 'key=' | head -10

# Verify UI components use CSS variables
grep -r "bg-\[var(" src/components/ui --include="*.tsx" | wc -l
grep -r "text-\[var(" src/components/ui --include="*.tsx" | wc -l

# Check for unresolved node_modules imports
grep -r "from '\.\./\.\./node_modules" src --include="*.tsx"
```

Expected results:
- All `.map()` renders have `key` prop (for lists, tables, grids)
- UI components use CSS variables for theming (--background, --surface, --accent, etc.)
- No direct node_modules imports (all from /node_modules via npm)
- Dashboard uses updated light theme styles

## Audit Checklist

### Security
- [ ] 0 hardcoded secrets in code
- [ ] 0 high/critical vulnerabilities in `npm audit`
- [ ] CSP headers configured in next.config.js
- [ ] HSTS, X-Frame-Options, X-Content-Type-Options headers present
- [ ] Rate limiting configured in middleware.ts
- [ ] CASL permissions properly enforced
- [ ] All Decimal fields used for financial amounts (never Float)

### Code Quality
- [ ] `npm run typecheck`: 0 errors
- [ ] `npm run lint`: All rules pass
- [ ] No `console.log` in API/lib code
- [ ] No `as any` type assertions in core code
- [ ] All TODO/FIXME comments resolved
- [ ] Max component size < 500 lines
- [ ] Max function size < 50 lines

### Database
- [ ] `npx prisma validate`: Schema valid
- [ ] `npx prisma migrate status`: All migrations applied
- [ ] 16 models defined
- [ ] All relations properly defined (with cascade deletes where needed)
- [ ] All enum types match code constants

### Dependencies
- [ ] `npm audit`: Critical/high vulnerabilities < 3
- [ ] `npm run build`: Succeeds with 0 errors
- [ ] `.next/` folder < 500MB
- [ ] No unused dependencies (check package.json vs actual imports)
- [ ] Core packages up to date: Next.js, React, Prisma, NextAuth

### API Routes
- [ ] 18 route groups defined
- [ ] 100% of protected routes check `await auth()`
- [ ] 100% of POST/PUT/DELETE validate with Zod schema
- [ ] All error handlers return proper HTTP status codes
- [ ] No empty catch blocks

### Frontend
- [ ] All `.map()` renders have `key` prop
- [ ] No missing component imports
- [ ] Light theme CSS variables applied (all UI components)
- [ ] Loading states visible on all async operations
- [ ] Error boundaries configured (error.tsx, global-error.tsx)

### Real-Time & Data Integrity
- [ ] SSE endpoints properly connected
- [ ] All SSE listeners have cleanup functions
- [ ] No memory leaks from setInterval/setTimeout
- [ ] No circular dependencies between modules
- [ ] Database transactions used for multi-table operations

---

## Quick Audit Commands

```bash
# All-in-one audit
cd web
npm run typecheck && npm run lint && npm run build && npx prisma validate

# Security scan
npm audit
grep -r "process.env\." src/app/api src/lib | cut -d: -f2 | sed 's/.*process\.env\.\([A-Z_]*\).*/\1/' | sort -u

# Code quality
grep -r "console.log\| as any\|// TODO\|// FIXME" src/app/api src/lib --include="*.ts" --include="*.tsx"

# Component health
find src/components -name "*.tsx" -type f -exec wc -l {} + | sort -n | tail -20

# Database
npx prisma migrate status
npx prisma studio  # Visual inspection
```

---

## Report Format

```
System Audit Report
===================

✓ Code Quality:         0 TypeScript errors, 0 lint issues
✓ Security:             0 high/critical vulnerabilities, secrets clean
✓ Database:             16 models, all migrations applied
✓ Dependencies:         build succeeds, .next/ 293MB
✓ API Routes:           18 groups, 100% auth guarded
✓ Frontend:             92 components, all theme variables applied
✓ Real-Time:            SSE properly wired, cleanup functions present

OVERALL: PASS ✓

Recommendations:
- None (system healthy)
```

---

## Common Issues & Fixes

| Issue | Detection | Fix |
|-------|-----------|-----|
| **TypeScript Errors** | `npm run typecheck` returns errors | Run `npm run typecheck` locally; fix or suppress with `// @ts-expect-error` comment |
| **Lint Failures** | `npm run lint` fails | Run `npm run lint -- --fix` to auto-fix, or manually correct violations |
| **Build Failure** | `npm run build` fails with errors | Check error output; likely missing dependency or syntax error |
| **Orphaned Imports** | ESLint `unused-imports` rule | Remove unused imports reported by linter |
| **Missing Key Props** | Component list doesn't re-render correctly | Add `key={id}` to `.map()` JSX elements |
| **Theme Not Applied** | Components use hardcoded colors | Update to `bg-[var(--surface)]`, `text-[var(--text-primary)]` etc. |
| **Memory Leaks** | App slows down over time | Check useEffect cleanup functions, SSE listeners, timers |
| **Unhandled Promise** | Warning in console | Add `.catch()` to Promise chains or use try/catch |
| **Env Var Missing** | `process.env.NEXT_PUBLIC_* is undefined` | Add to `.env.local` and `.env.example` |
| **Auth Guard Missing** | Unauthenticated user can access protected route | Add `const session = await auth(); if (!session) return 401` to route handler |

---

## Success Criteria

A system passes audit when:

1. **Build**: `npm run typecheck && npm run build` succeeds
2. **Security**: `npm audit` shows 0 high/critical vulnerabilities
3. **Database**: `npx prisma validate` and `npx prisma migrate status` both pass
4. **Tests**: `npm test` and `npm run test:e2e` pass (if test suite enabled)
5. **Lint**: `npm run lint` returns 0 errors
6. **Code**: No `console.log`, `as any`, or unresolved TODOs in production code
7. **API**: All protected routes check auth, all inputs validated
8. **Frontend**: All theme variables applied, all `.map()` elements have keys

---

## Integration with CI/CD

Add to `.github/workflows/ci.yml`:

```yaml
- name: TypeScript Check
  run: npm run typecheck

- name: Lint
  run: npm run lint

- name: Security Audit
  run: npm audit --audit-level=moderate

- name: Database Validation
  run: npx prisma validate

- name: Build
  run: npm run build
```

Pass the audit before merging any PR.
