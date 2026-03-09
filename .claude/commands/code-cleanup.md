# Code Cleanup — OBPS TypeScript & Next.js Code Quality

## Purpose

Enforce consistent code style, naming conventions, and best practices across the Online Business Permit System TypeScript/Next.js codebase.

## Usage

```
/code-cleanup <file-or-area-to-clean>
```

## TypeScript Conventions

### Naming

| Element            | Convention                    | Example                          |
| ------------------ | ----------------------------- | -------------------------------- |
| Files              | kebab-case                    | `application-form.tsx`           |
| Components         | PascalCase                    | `ApplicationForm`                |
| Functions          | camelCase                     | `createApplication`              |
| Hooks              | camelCase with `use` prefix   | `useSSE`                         |
| Constants          | UPPER_SNAKE_CASE              | `MAX_FILE_SIZE`                  |
| Types/Interfaces   | PascalCase                    | `ApplicationData`                |
| Enums (Prisma)     | PascalCase name, UPPER values | `ApplicationStatus.UNDER_REVIEW` |
| API route handlers | UPPER (HTTP method)           | `GET`, `POST`, `PATCH`, `DELETE` |

### Import Order

```typescript
// 1. External packages
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 2. Internal libraries
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// 3. Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 4. Types (type-only imports)
import type { Application, User } from "@prisma/client";
```

### Type Patterns

```typescript
// Prefer type-only imports for types
import type { Application } from "@prisma/client";

// Use Zod inference for form types
const schema = z.object({ name: z.string() });
type FormData = z.infer<typeof schema>;

// Use Prisma-generated types for DB models
// Don't manually recreate interfaces that Prisma provides

// Use discriminated unions for state
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

## Next.js Patterns

### Server Components (default)

```typescript
// No 'use client' → Server Component
// Can: use async/await, access Prisma directly, read session
// Cannot: use hooks, event handlers, browser APIs
export default async function Page() {
  const data = await prisma.application.findMany();
  return <div>{/* render data */}</div>;
}
```

### Client Components (when needed)

```typescript
"use client"; // MUST be first line

// Needed for: hooks, event handlers, browser APIs, forms
// Keep as small as possible — extract to *-client.tsx
```

### Error Handling

```typescript
// API Routes: always try/catch
try {
  // operation
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.errors }, { status: 400 });
  }
  logger.error("Operation failed:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

## Anti-Patterns to Fix

| Bad                  | Good                     | Why                  |
| -------------------- | ------------------------ | -------------------- |
| `any` type           | Proper type or `unknown` | Type safety          |
| `console.log`        | `logger.info/warn/error` | Structured logging   |
| `// @ts-ignore`      | Fix the type error       | Tech debt            |
| Hardcoded strings    | i18n or constants        | Maintainability      |
| `useState` for forms | React Hook Form          | Validation           |
| Inline SQL           | Prisma methods           | Injection prevention |
| `var`                | `const` / `let`          | Scoping              |
| Nested ternaries     | Early returns / switch   | Readability          |

## Checklist

- [ ] No `any` types
- [ ] No `console.log` (use logger)
- [ ] No `@ts-ignore` or `@ts-expect-error`
- [ ] Consistent naming conventions
- [ ] Imports ordered correctly
- [ ] No unused variables or imports
- [ ] Error handling in all async operations
- [ ] `'use client'` only where needed
