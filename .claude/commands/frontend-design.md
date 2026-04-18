# Frontend Design Skill (`/frontend-design`)

**Purpose**: Create and modify React 19 components with Tailwind CSS v4 and CVA.

## UI Components (src/components/ui/)
- `button.tsx` - Variants: primary, secondary, danger, outline
- `input.tsx` - Text/email/password/number inputs
- `card.tsx` - Container with padding
- `alert.tsx` - Info, warning, error, success
- `badge.tsx` - Status indicators
- `modal.tsx` - Dialog overlay
- `select.tsx` - Dropdown selector
- `textarea.tsx` - Multi-line text
- `data-table.tsx` - Sortable/filterable table
- `file-upload.tsx` - Drag-and-drop uploader
- `loading.tsx`, `skeleton.tsx`, `empty-state.tsx`
- `language-switcher.tsx` - English/Filipino

## Tailwind CSS v4 - Utility-first

```tsx
className="flex items-center justify-center gap-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
```

## CVA for Component Variants

```typescript
const buttonVariants = cva("px-4 py-2 rounded-lg font-medium", {
  variants: {
    variant: {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-200 text-gray-900",
      danger: "bg-red-600 text-white",
    },
  },
  defaultVariants: { variant: "primary" },
});
```

## Page Component Pattern

```typescript
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await prisma.application.findMany({
    where: { applicantId: session.user.id },
    include: { documents: true },
  });

  return (
    <div className="p-6">
      <ClientComponent initialData={data} />
    </div>
  );
}
```

## Client Component Pattern

```typescript
"use client";
import { useState } from "react";
import { toast } from "sonner";

export function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/endpoint", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed");
      toast.success("Success!");
    } catch (error) {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  return <></>;
}
```

## Form with React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema } from "@/lib/validations";

export function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(applicationSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Business Name</label>
        <Input {...register("businessName")} />
        {errors.businessName && <p className="text-red-500">{errors.businessName.message}</p>}
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Responsive Grid

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>Left</div>
  <div>Right</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

## Loading States

```typescript
{loading ? (
  <Loader2 className="h-8 w-8 animate-spin" />
) : data.length === 0 ? (
  <p className="text-gray-500">No data</p>
) : (
  <DataTable data={data} />
)}
```

## Icons (Lucide React)

```typescript
import { AlertTriangle, CheckCircle, Loader2, MapPin } from "lucide-react";
<AlertTriangle className="h-6 w-6 text-yellow-600" />
```

## Toast Notifications (sonner)

```typescript
import { toast } from "sonner";
toast.success("Success!");
toast.error("Error occurred");
```

## Best Practices

1. Server components by default - client only when needed
2. Fetch in server components - no waterfall fetching
3. Use controlled inputs with React Hook Form
4. Show loading/error states always
5. Keyboard navigation - all elements focusable
6. Accessibility - labels, alt text, aria
7. Responsive - mobile-first with Tailwind
8. No hardcoded data - fetch from API
9. Use `key` prop on all `.map()` renders
10. Extract components - break apart >500 lines

