# Frontend Design — OBPS React 19 + Tailwind CSS v4 UI Builder

## Purpose

Create, modify, and debug React UI components and pages for the Online Business Permit System. Covers App Router pages, client/server components, form handling, state management, and responsive design.

## Usage

```
/frontend-design <description-of-ui-to-build>
```

## Context

- **Framework**: Next.js 16 App Router with React 19 + TypeScript 5.9
- **Styling**: Tailwind CSS v4 + CVA (class-variance-authority) + tailwind-merge + clsx
- **Forms**: React Hook Form 7 + Zod 4 resolver
- **State**: Zustand 5 (client) + TanStack React Query v5 (server state)
- **Components**: Custom UI library in `src/components/ui/`
- **i18n**: next-intl (English + Filipino) — messages in `src/messages/`

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (providers, metadata)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind v4 imports
│   ├── (auth)/                 # Auth route group (no dashboard nav)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── verify-otp/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/            # Dashboard route group (with sidebar)
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard home
│   │       ├── applications/   # Application management
│   │       ├── tracking/       # Real-time tracking
│   │       ├── claims/         # Claim scheduling
│   │       ├── review/         # Reviewer queue
│   │       ├── schedule/       # Schedule management
│   │       ├── issuance/       # Permit issuance
│   │       └── admin/          # Admin section
│   └── (public)/               # Public pages (no auth required)
│       ├── track/page.tsx      # Public status tracking
│       ├── verify-permit/page.tsx
│       ├── how-to-apply/page.tsx
│       ├── requirements/page.tsx
│       ├── faqs/page.tsx
│       └── contact/page.tsx
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── button.tsx          # CVA-based button variants
│   │   ├── card.tsx            # Card container
│   │   ├── input.tsx           # Form input with label/error
│   │   ├── alert.tsx           # Alert/notification banner
│   │   ├── badge.tsx           # Status badges
│   │   ├── skeleton.tsx        # Loading skeletons
│   │   └── file-upload.tsx     # Drag-and-drop file upload
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── sidebar.tsx         # Role-aware sidebar nav
│   │   ├── header.tsx          # Dashboard header
│   │   └── *-client.tsx        # Client components for interactivity
│   ├── public/                 # Public page components
│   ├── providers/              # Context providers (QueryProvider, ThemeProvider)
│   ├── seo/                    # JSON-LD structured data
│   ├── pwa/                    # PWA install prompt
│   └── privacy/                # Privacy consent components
└── hooks/
    └── use-sse.ts              # SSE client hook for real-time updates
```

## Component Patterns

### Server Component (default)

```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ApplicationsPage() {
  const session = await auth();
  const applications = await prisma.application.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Applications</h1>
      {/* Render data directly — no useState needed */}
    </div>
  );
}
```

### Client Component (for interactivity)

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({ businessName: z.string().min(2) });
type FormData = z.infer<typeof schema>;

export function ApplicationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // handle response
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Business Name"
        {...register("businessName")}
        error={errors.businessName?.message}
      />
      <Button type="submit">Submit Application</Button>
    </form>
  );
}
```

### CVA Button Variant Pattern

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
```

## Styling Rules

1. **Tailwind CSS v4** — use utility classes, no CSS modules
2. Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classes
3. Use CVA for component variants
4. Responsive: mobile-first (`sm:`, `md:`, `lg:`)
5. Dark mode: `dark:` prefix (if theme support enabled)
6. Spacing scale: `space-y-*`, `gap-*` for consistent rhythm
7. Colors: Use semantic tokens (`text-primary`, `bg-destructive`) not raw colors

## State Management

- **Server state**: TanStack React Query v5 — `useQuery`, `useMutation`, `useQueryClient`
- **Client state**: Zustand 5 stores in `src/lib/stores.ts`
- **Forms**: React Hook Form 7 with Zod resolver — never use uncontrolled `useState` for forms
- **Real-time**: `useSSE()` hook from `src/hooks/use-sse.ts`
- **URL state**: `useSearchParams()` for filters, pagination

## Checklist

- [ ] Correct use of `'use client'` directive (only when needed)
- [ ] Zod schema + React Hook Form for all forms
- [ ] Loading states (Skeleton components or Suspense boundaries)
- [ ] Error boundaries for client components
- [ ] Responsive layout (mobile-first Tailwind)
- [ ] Accessible: labels, ARIA attributes, keyboard navigation
- [ ] i18n: use `useTranslations()` for user-facing text
- [ ] TypeScript strict — no `any` types
- [ ] Role-aware rendering (check `session.user.role`)
