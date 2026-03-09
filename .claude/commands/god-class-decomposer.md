# God Class Decomposer — OBPS Large Module Refactoring

## Purpose

Identify and break down overly large or complex modules in the Online Business Permit System into smaller, focused, testable units.

## Usage

```
/god-class-decomposer <file-path-or-module-name>
```

## Detection Criteria

A module needs decomposition if it has:

- **> 300 lines** of code
- **> 5 exported functions** with different responsibilities
- **Multiple concerns** (e.g., auth + validation + email in one file)
- **Many dependencies** imported (> 10 imports)
- **Low testability** — hard to mock or test in isolation

## Common Candidates in OBPS

### 1. `src/lib/validations.ts`

If it grows beyond 500 lines, split into:

```
src/lib/validations/
├── auth.ts          # registerSchema, loginSchema, otpSchema
├── application.ts   # applicationSchema, reviewSchema
├── document.ts      # documentUploadSchema
├── payment.ts       # paymentSchema
├── schedule.ts      # scheduleSchema, reservationSchema
└── index.ts         # Re-export all schemas
```

### 2. `src/lib/permissions.ts`

If RBAC rules grow complex, split by role:

```
src/lib/permissions/
├── applicant.ts     # Applicant abilities
├── staff.ts         # Staff abilities
├── reviewer.ts      # Reviewer abilities
├── admin.ts         # Administrator abilities
└── index.ts         # defineAbilityFor(role) router
```

### 3. Large Page Components

If a dashboard page exceeds 200 lines, extract:

```
// Before: one large page.tsx with everything
// After:
page.tsx                    # Server Component — data fetching only
application-list.tsx        # Client Component — interactive table
application-filters.tsx     # Client Component — search/filter
application-actions.tsx     # Client Component — buttons/modals
```

### 4. Large API Routes

If a route handler > 100 lines, extract business logic:

```
// Before: all logic in route.ts
// After:
route.ts                        # Thin handler — validate, call service, respond
src/lib/services/application.ts  # Business logic — testable without HTTP
```

## Decomposition Process

1. **Map responsibilities** — List every function and what it does
2. **Group by concern** — Auth, validation, business logic, data access
3. **Extract to modules** — One concern per file
4. **Create barrel export** — `index.ts` re-exports for backward compatibility
5. **Update imports** — Find all usages and update import paths
6. **Verify** — Run `npx tsc --noEmit` and `npm test`

## Refactoring Patterns

### Extract Service Layer

```typescript
// src/lib/services/application.ts
export async function submitApplication(
  userId: string,
  data: ApplicationInput,
) {
  const application = await prisma.application.update({
    where: { id: data.id, userId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
  await prisma.applicationHistory.create({
    data: {
      applicationId: application.id,
      status: "SUBMITTED",
      changedById: userId,
    },
  });
  await notifyReviewers(application);
  return application;
}

// src/app/api/applications/[id]/submit/route.ts
import { submitApplication } from "@/lib/services/application";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  // validate, then:
  const result = await submitApplication(session!.user.id, { id: params.id });
  return NextResponse.json({ data: result });
}
```

### Extract Hook from Component

```typescript
// Before: all logic in component
// After: custom hook
function useApplicationForm(applicationId: string) {
  const form = useForm<ApplicationData>({ resolver: zodResolver(schema) });
  const mutation = useMutation({ mutationFn: submitApplication });
  // ... logic
  return { form, mutation, isSubmitting: mutation.isPending };
}
```

## Checklist

- [ ] Module identified as too large (>300 lines or >5 concerns)
- [ ] Responsibilities mapped and grouped
- [ ] New files created with single responsibility
- [ ] Barrel exports maintain backward compatibility
- [ ] All imports updated
- [ ] TypeScript compiles clean
- [ ] Tests still pass
- [ ] No circular dependencies introduced
