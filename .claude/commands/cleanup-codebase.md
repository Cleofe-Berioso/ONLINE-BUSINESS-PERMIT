# Cleanup Codebase — OBPS Code Quality & Dead Code Removal

## Purpose

Identify and remove dead code, unused imports, stale configurations, and technical debt from the Online Business Permit System codebase.

## Usage

```
/cleanup-codebase [area-to-clean]
```

## Cleanup Categories

### 1. Unused Imports & Variables

```bash
# ESLint will catch these
npx eslint src/ --ext .ts,.tsx --fix

# TypeScript strict check
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
```

### 2. Dead Code Detection

- Unreachable code after return statements
- Functions/components never imported anywhere
- Unused Prisma models (defined but never queried)
- API routes with no corresponding UI
- Environment variables referenced but never set

### 3. Dependency Audit

```bash
# Check for unused dependencies
npx depcheck

# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated
```

### 4. Configuration Cleanup

| File                 | Check For                          |
| -------------------- | ---------------------------------- |
| `next.config.js`     | Unused experimental flags          |
| `tsconfig.json`      | Unnecessary compiler options       |
| `package.json`       | Unused scripts, stale dependencies |
| `.env.local`         | Variables no longer referenced     |
| `docker-compose.yml` | Unused services or volumes         |

### 5. File Organization

- Components in wrong directory (dashboard component in ui/)
- Duplicate utility functions across files
- Inconsistent file naming (kebab-case for files, PascalCase for components)
- Missing barrel exports (`index.ts`) for component directories

### 6. TypeScript Strictness

```bash
npx tsc --noEmit
```

- Remove `any` types — replace with proper types
- Remove `@ts-ignore` / `@ts-expect-error` where possible
- Ensure strict mode enabled in `tsconfig.json`

## Code Style Standards

- **File naming**: kebab-case (`application-form.tsx`)
- **Component naming**: PascalCase (`ApplicationForm`)
- **Function naming**: camelCase (`createApplication`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Enum values**: UPPER_SNAKE_CASE (`UNDER_REVIEW`)
- **Imports**: Group by: external → internal → components → types

## Quick Cleanup Commands

```bash
# Fix all auto-fixable lint issues
npx eslint src/ --fix

# Format with Prettier (if configured)
npx prettier --write "src/**/*.{ts,tsx}"

# Remove unused imports (via ESLint)
npx eslint src/ --rule '{"no-unused-vars": "error"}' --fix
```

## Checklist

- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No unused dependencies (`npx depcheck`)
- [ ] No `any` types in production code
- [ ] No commented-out code blocks
- [ ] No `console.log` in production (use `logger` instead)
- [ ] No hardcoded strings (use i18n or constants)
- [ ] All TODO/FIXME comments tracked in tasks.md
