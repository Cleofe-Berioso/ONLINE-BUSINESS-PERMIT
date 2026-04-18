# Code-Behind Extractor Skill (`/code-behind-extractor`)

**Purpose**: Extract inline business logic from page components into lib modules.

## Extraction Patterns

### 1. Data Fetching Logic
**Before**: Server component fetching in page

```typescript
// app/dashboard/applications/page.tsx
export default async function Page() {
  const apps = await prisma.application.findMany({
    where: { applicantId: userID },
    include: { documents: true, clearances: true },
  });
  return <ApplicationsClient apps={apps} />;
}
```

**After**: Extract to lib
```typescript
// lib/application-queries.ts
export async function getUserApplications(userId: string) {
  return await prisma.application.findMany({
    where: { applicantId: userId },
    include: { documents: true, clearances: true },
  });
}

// page.tsx
import { getUserApplications } from "@/lib/application-queries";

export default async function Page() {
  const apps = await getUserApplications(sessionUser.id);
  return <ApplicationsClient apps={apps} />;
}
```

### 2. Form Logic
**Before**: Form handling inline

```typescript
export function ApplicationForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (e) => {
    // 50 lines of form logic
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**After**: Extract hook
```typescript
// hooks/useApplicationForm.ts
export function useApplicationForm(initialData?) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (e) => {
    // Form logic
  };
  
  return { formData, errors, handleSubmit };
}

// Component: 20 lines
export function ApplicationForm() {
  const { formData, errors, handleSubmit } = useApplicationForm();
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Business Logic
**Before**: Logic in component

```typescript
function ReviewApplicationPage({ app }) {
  const checkEligibility = () => {
    if (!app.documents.some(d => d.verified)) return false;
    if (app.clearances.some(c => c.status === "PENDING")) return false;
    // ... 20 more lines
    return true;
  };
  
  return <div>{checkEligibility() && <ApproveButton />}</div>;
}
```

**After**: Extract lib
```typescript
// lib/eligibility.ts
export function checkApplicationEligibility(app: Application): boolean {
  if (!app.documents.some(d => d.verified)) return false;
  if (app.clearances.some(c => c.status === "PENDING")) return false;
  // ... logic
  return true;
}

// Component
import { checkApplicationEligibility } from "@/lib/eligibility";

function ReviewApplicationPage({ app }) {
  return (
    <div>
      {checkApplicationEligibility(app) && <ApproveButton />}
    </div>
  );
}
```

## Extraction Targets

| Type | From | To |
|------|------|-----|
| Server queries | page.tsx | lib/queries.ts |
| Client forms | component.tsx | hooks/useForm.ts |
| Business rules | component.tsx | lib/business.ts |
| Helpers | component.tsx | lib/utils.ts |
| Validation | component.tsx | lib/validations.ts |

## Refactoring Checklist

- [ ] Identify repeated logic
- [ ] Move to appropriate lib module
- [ ] Export function from lib
- [ ] Import and use in component
- [ ] Test extracted function
- [ ] Verify component still works
- [ ] Remove old logic from component

## Benefits

- Components stay <200 lines
- Logic reusable across components
- Easier to test
- Cleaner component code
- Functions are composable

