# Codebase Assessment — OBPS Quality Grading Rubric

## Purpose

Perform a comprehensive quality assessment of the Online Business Permit System codebase, producing a graded report across architecture, code quality, testing, security, performance, and documentation.

## Usage

```
/codebase-assessment
```

## Grading Scale

- **A (90-100)**: Production-ready, exemplary code
- **B (80-89)**: Good quality, minor improvements needed
- **C (70-79)**: Acceptable, several improvements needed
- **D (60-69)**: Below standard, significant issues
- **F (<60)**: Critical issues, needs major rework

## Assessment Categories

### 1. Architecture (20%)

| Criteria               | Weight | Check                                      |
| ---------------------- | ------ | ------------------------------------------ |
| App Router structure   | 4%     | Route groups, layouts, pages organized     |
| API route design       | 4%     | RESTful, consistent patterns               |
| Separation of concerns | 4%     | Server/client components, lib modules      |
| State management       | 4%     | Zustand for client, React Query for server |
| Database schema        | 4%     | Normalized, proper relations, indexes      |

### 2. Code Quality (20%)

| Criteria              | Weight | Check                                    |
| --------------------- | ------ | ---------------------------------------- |
| TypeScript strictness | 5%     | No `any`, strict mode, proper types      |
| Naming conventions    | 3%     | Consistent file/function/variable naming |
| Error handling        | 4%     | try/catch, user-friendly messages        |
| DRY principle         | 4%     | No duplicate logic, shared utilities     |
| Code organization     | 4%     | Clean imports, logical file placement    |

### 3. Testing (15%)

| Criteria           | Weight | Check                               |
| ------------------ | ------ | ----------------------------------- |
| Unit test coverage | 5%     | Components, utils, validations      |
| Integration tests  | 3%     | API routes with mocked dependencies |
| E2E tests          | 4%     | Critical user flows                 |
| Test quality       | 3%     | Meaningful assertions, edge cases   |

### 4. Security (15%)

| Criteria         | Weight | Check                              |
| ---------------- | ------ | ---------------------------------- |
| Authentication   | 4%     | NextAuth properly configured       |
| Authorization    | 4%     | RBAC enforced on all routes        |
| Input validation | 4%     | Zod on all inputs, sanitization    |
| Headers & CSP    | 3%     | Security headers in next.config.js |

### 5. Performance (15%)

| Criteria         | Weight | Check                          |
| ---------------- | ------ | ------------------------------ |
| Bundle size      | 4%     | Tree-shaking, dynamic imports  |
| Database queries | 4%     | Efficient Prisma, no N+1       |
| Caching          | 4%     | Redis, React Query stale times |
| Loading states   | 3%     | Skeletons, Suspense boundaries |

### 6. Documentation & DX (15%)

| Criteria             | Weight | Check                             |
| -------------------- | ------ | --------------------------------- |
| README / setup guide | 4%     | START_HERE.md completeness        |
| Code comments        | 3%     | JSDoc on public APIs              |
| API documentation    | 4%     | Route contracts documented        |
| Task tracking        | 4%     | tasks.md, MISSING_REQUIREMENTS.md |

## Assessment Commands

```bash
# Type check
npx tsc --noEmit 2>&1 | tail -5

# Lint
npx eslint src/ --max-warnings 0

# Test coverage
npm test -- --run --coverage

# Bundle analysis
npm run build 2>&1 | grep -E "Route|Size|First"

# Dependency audit
npm audit --audit-level moderate
```

## Output Format

```
## OBPS Codebase Assessment Report

### Overall Grade: [A-F] ([score]/100)

| Category | Grade | Score | Notes |
|----------|-------|-------|-------|
| Architecture | | /20 | |
| Code Quality | | /20 | |
| Testing | | /15 | |
| Security | | /15 | |
| Performance | | /15 | |
| Documentation | | /15 | |

### Top Issues
1. ...
2. ...
3. ...

### Recommendations
1. ...
2. ...
3. ...
```
