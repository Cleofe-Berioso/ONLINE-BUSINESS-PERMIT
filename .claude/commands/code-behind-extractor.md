# Code-Behind Extractor — OBPS Component Logic Extraction

## Purpose

Extract business logic, data fetching, and state management from React components into reusable hooks, services, and utilities. Keeps components focused on rendering.

## Usage

```
/code-behind-extractor <component-file-path>
```

## Extraction Patterns

### 1. Extract to Custom Hook

**When**: Component has complex state logic, effects, or data fetching

```typescript
// Before: all logic in component
'use client';
export function ApplicationList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetch('/api/applications?' + new URLSearchParams(filters))
      .then(res => res.json())
      .then(data => { setApplications(data); setLoading(false); });
  }, [filters]);

  // 50 more lines of logic...
  return <div>{/* render */}</div>;
}

// After: hook extracted
// hooks/use-applications.ts
export function useApplications(filters: Filters) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => fetch('/api/applications?' + new URLSearchParams(filters)).then(r => r.json()),
  });
}

// components/application-list.tsx
'use client';
export function ApplicationList() {
  const [filters, setFilters] = useState({});
  const { data: applications, isLoading } = useApplications(filters);
  return <div>{/* render — much simpler */}</div>;
}
```

### 2. Extract to Server Component

**When**: Component only displays data with no interactivity

```typescript
// Before: client component fetching data
'use client';
export function ApplicationDetails({ id }: { id: string }) {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(`/api/applications/${id}`).then(/*...*/); }, [id]);
  return <div>{/* render data */}</div>;
}

// After: server component (no 'use client')
export default async function ApplicationDetails({ id }: { id: string }) {
  const application = await prisma.application.findUnique({ where: { id } });
  return <div>{/* render directly — no loading state needed */}</div>;
}
```

### 3. Extract to Service Module

**When**: Business logic is reused across API routes or components

```typescript
// Before: logic duplicated in multiple API routes
// api/applications/route.ts has fee calculation
// api/payments/route.ts has same fee calculation

// After: shared service
// src/lib/services/fee-calculator.ts
export function calculatePermitFee(
  applicationType: ApplicationType,
  businessSize: string,
): number {
  const baseFee = applicationType === "NEW" ? 500 : 300;
  const sizeFactor = { SMALL: 1, MEDIUM: 1.5, LARGE: 2 }[businessSize] ?? 1;
  return baseFee * sizeFactor;
}
```

### 4. Extract Form Logic to Schema + Hook

**When**: Form has complex validation and submission logic

```typescript
// Before: all in one component
// After:
// 1. Schema in validations.ts
export const applicationSchema = z.object({ businessName: z.string().min(2) });

// 2. Custom hook
export function useApplicationForm(applicationId?: string) {
  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
  });
  const mutation = useMutation({
    mutationFn: (data) => fetch('/api/applications', { method: 'POST', body: JSON.stringify(data) }),
  });
  return { form, mutation };
}

// 3. Clean component
export function ApplicationForm() {
  const { form, mutation } = useApplicationForm();
  return <form onSubmit={form.handleSubmit(mutation.mutate)}>{/* fields */}</form>;
}
```

## Decision Matrix

| Condition               | Extract To                               |
| ----------------------- | ---------------------------------------- |
| Complex state + effects | Custom hook (`hooks/use-*.ts`)           |
| Data display only       | Server Component (remove `'use client'`) |
| Reused business logic   | Service module (`lib/services/*.ts`)     |
| Form validation         | Zod schema + hook                        |
| API call pattern        | React Query hook                         |
| Utility function        | `lib/utils.ts` or dedicated util file    |

## Checklist

- [ ] Component is < 150 lines after extraction
- [ ] Extracted hook/service is independently testable
- [ ] No prop drilling — use hooks or context
- [ ] Server Components used where possible
- [ ] `'use client'` only on interactive components
- [ ] TypeScript types exported for reuse
- [ ] Imports updated everywhere
