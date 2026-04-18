# Cleanup Codebase Skill (`/cleanup-codebase`)

**Purpose**: Maintain code quality by removing debug code and dead code.

## Cleanup Categories

### 1. Console Statements
Remove all except console.error() in try-catch blocks

```bash
grep -r "console.log\|console.warn\|console.debug" src/
```

### 2. TODO/FIXME Comments
Resolve or create GitHub issue, then remove

```bash
grep -r "TODO\|FIXME" src/
```

### 3. Unused Imports
ESLint will flag - remove unused imports

```bash
npm run lint -- --fix
```

### 4. Dead Code
Delete unreachable or commented-out code blocks

### 5. Unused Variables
Remove or prefix with `_` if intentional

### 6. Unused Functions
Delete if never called, move to test if useful

### 7. Dead Routes
Delete API routes with no callers, or document as internal

## Cleanup Workflow

```bash
# Find issues
npm run lint

# Auto-fix
npm run lint -- --fix

# Manual cleanup
grep -r "console.log" src/
grep -r "TODO\|FIXME" src/

# Verify
npm run typecheck
npm test
npm run test:e2e
```

## After Cleanup Checklist

- npm run typecheck passes (0 errors)
- npm run lint passes
- npm test passes
- npm run test:e2e passes
- No console.log in production
- All imports used
- No dead functions/routes

## Commit Message

```
chore: cleanup dead code and debug statements

- Remove console.log from [files]
- Remove unused imports from [files]
- Delete dead [component/function/route]
- Resolve TODOs related to [issue]
```

