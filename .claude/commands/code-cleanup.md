# Code Cleanup Skill (`/code-cleanup`)

**Purpose**: Systematic code quality improvements and refactoring.

## Focus Areas

### 1. Dead Code Removal
**Find**: Unreachable or unused code

```bash
grep -r "// {" src/ --include="*.ts" --include="*.tsx"
```

**Action**: Delete commented blocks (preserved in git history)

### 2. TODO/FIXME Resolution
**Find**: Outstanding items

```bash
grep -r "TODO\|FIXME\|XXX\|HACK" src/
```

**Action**: Create issue, implement fix, remove comment

### 3. Naming Convention Fixes
**Check**:
- Functions: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case

**Command**: `npm run lint`

### 4. Unused Imports Cleanup
**Command**: `npm run lint -- --fix` (auto-fixes unused)

### 5. Type Narrowing
Replace `any` types with proper types

```bash
grep -r " as any" src/
grep -r ": any" src/
```

### 6. Large Component Refactoring
**Find**: Files >500 lines

```bash
find src/ -name "*.tsx" -exec wc -l {} + | sort -rn | head
```

**Action**: Break into smaller components

### 7. Simplification
**Find**: Over-engineered patterns
- Simplify boolean logic
- Reduce nesting
- Extract reusable functions
- Use destructuring

## Cleanup Workflow

```bash
# 1. Run linter
npm run lint

# 2. Auto-fix
npm run lint -- --fix

# 3. Manual review
nano src/[file]

# 4. Type check
npm run typecheck

# 5. Test
npm test
npm run test:e2e
```

## Refactoring Patterns

### Before
```typescript
export function ApplicationForm({ app }: any) {
  // 200 lines of logic
  // Multiple renders
  // Nested conditions
}
```

### After
```typescript
// Extract validation
function validateApplication(app: Application): string[] {
  return errors;
}

// Extract form handling
function useApplicationForm(initialApp: Application) {
  return { formData, errors, handleChange };
}

// Extracted component
export function ApplicationForm({ initialApp }: Props) {
  const { formData, errors, handleChange } = useApplicationForm(initialApp);
  // 50 lines
}
```

## Commit Message

```
refactor: improve code quality and maintainability

- Remove dead code from [files]
- Simplify complex logic in [function]
- Extract [component] from [parent]
- Rename [variable] to [newName] for clarity
- Fix linting issues

Closes #[issue]
```

