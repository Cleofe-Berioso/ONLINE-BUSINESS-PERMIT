# Online Business Permit System — Command Reference

## Overview

Quick reference for all Claude skills available in the OBPS codebase. Each command maps to a `.md` file in `.claude/commands/`.

**Tech Stack**: Next.js 16 · React 19 · Prisma 7 · PostgreSQL 16 · Tailwind CSS v4 · TypeScript 5.9

---

## Development Commands

### `/backend-service` — API Route & Server Module Development

```
/backend-service create api route [entity]
/backend-service add endpoint [path]
/backend-service create lib module [name]
```

### `/database-query` — Prisma Queries & Schema Management

```
/database-query find [model] with [conditions]
/database-query create [model] for [entity]
/database-query aggregate [model] by [field]
/database-query migrate add field [field] to [model]
```

### `/debug-issue` — Troubleshooting

```
/debug-issue api [status-code] [description]
/debug-issue auth [description]
/debug-issue prisma [error-type]
/debug-issue sse [description]
/debug-issue build [error-message]
```

### `/frontend-design` — React + Tailwind Components

```
/frontend-design create page [name]
/frontend-design create component [name]
/frontend-design create modal [name]
/frontend-design add feature [feature] to [component]
```

### `/qa-testing` — Test Generation

```
/qa-testing unit [component-or-function]
/qa-testing e2e [user-flow]
/qa-testing a11y [page-or-component]
/qa-testing performance [endpoint]
```

---

## Workflow Commands

### `/workflow-definitions` — Workflow Documentation

```
/workflow-definitions explain [workflow]
/workflow-definitions trace [data-flow]
/workflow-definitions diagram [lifecycle]
```

### `/workflow-verificator` — Implementation Verification

```
/workflow-verificator check [workflow]
/workflow-verificator validate [feature]
/workflow-verificator audit [module]
```

---

## Quality & Maintenance Commands

### `/cleanup-codebase` — Code Cleanup

```
/cleanup-codebase scan all
/cleanup-codebase report console logs
/cleanup-codebase find unused imports
/cleanup-codebase verify post-cleanup
```

### `/codebase-assessment` — Quality Grading

```
/codebase-assessment
/codebase-assessment [category]   # security, api, typescript, frontend, testing, architecture
/codebase-assessment full
```

### `/security-hardening` — Security Audit

```
/security-hardening
/security-hardening auth
/security-hardening headers
/security-hardening validation
/security-hardening secrets
```

### `/performance-profiler` — Performance Analysis

```
/performance-profiler
/performance-profiler prisma
/performance-profiler bundle
/performance-profiler api
```

### `/code-cleanup` — Targeted Cleanup

```
/code-cleanup todos
/code-cleanup dead-code
/code-cleanup any-types
/code-cleanup naming
```

### `/god-class-decomposer` — Refactoring

```
/god-class-decomposer analyze [file-path]
/god-class-decomposer split [component]
```

### `/memory-leak-detector` — Leak Detection

```
/memory-leak-detector scan
/memory-leak-detector sse-connections
/memory-leak-detector timers
```

### `/code-behind-extractor` — Logic Extraction

```
/code-behind-extractor analyze [page-path]
/code-behind-extractor extract [logic-type]
```

---

## Domain Commands

### `/implementation-plan` — Project Planning

```
/implementation-plan status
/implementation-plan priorities
/implementation-plan gaps
```

### `/payment-integration` — Payment Gateway

```
/payment-integration gcash flow
/payment-integration webhook handling
/payment-integration otc recording
```

### `/accessibility-auditor` — WCAG Compliance

```
/accessibility-auditor full
/accessibility-auditor contrast
/accessibility-auditor keyboard-nav
```

### `/test-gap-filler` — Test Coverage

```
/test-gap-filler scan
/test-gap-filler api routes
/test-gap-filler critical paths
```

### `/pwa-offline` — PWA & Offline

```
/pwa-offline audit
/pwa-offline caching
/pwa-offline install-prompt
```

### `/full-system-validation` — Cross-Cutting Validation

```
/full-system-validation
/full-system-validation routes
/full-system-validation api-wiring
/full-system-validation sse
```

### `/migration-helper` — Prisma Migrations

```
/migration-helper add model [ModelName]
/migration-helper add field [field] [type] to [Model]
/migration-helper add index on [Model](field1, field2)
/migration-helper check status
```

---

## Quick Command Summary

| Command                   | Purpose                     | Common Use Case                    |
| ------------------------- | --------------------------- | ---------------------------------- |
| `/backend-service`        | API route development       | Add new endpoints                  |
| `/database-query`         | Prisma queries & migrations | Generate queries, modify schema    |
| `/debug-issue`            | Troubleshooting             | Fix errors and bugs                |
| `/frontend-design`        | React + Tailwind components | Create pages/components            |
| `/qa-testing`             | Test generation             | Unit, E2E, a11y tests              |
| `/workflow-definitions`   | Workflow documentation      | Understand application flows       |
| `/workflow-verificator`   | Implementation validation   | Verify feature completeness        |
| `/cleanup-codebase`       | Broad cleanup               | Dead code, console.logs            |
| `/codebase-assessment`    | Quality grading             | 6-category assessment              |
| `/security-hardening`     | Security audit              | OWASP Top 10, auth, headers        |
| `/performance-profiler`   | Performance optimization    | Prisma, bundle, API speed          |
| `/pwa-offline`            | PWA capabilities            | Service worker, offline            |
| `/full-system-validation` | Cross-cutting check         | Pre-deployment validation          |
| `/implementation-plan`    | Project planning            | Sprint planning, gap analysis      |
| `/payment-integration`    | PayMongo/GCash/Maya         | Payment flows, webhooks            |
| `/accessibility-auditor`  | WCAG 2.1 AA                 | Contrast, keyboard, screen readers |
| `/test-gap-filler`        | Test coverage analysis      | Find untested paths                |
| `/code-cleanup`           | Targeted cleanup            | TODOs, dead code, types            |
| `/god-class-decomposer`   | Refactoring large files     | Split oversized components         |
| `/memory-leak-detector`   | Memory leak prevention      | SSE, timers, subscriptions         |
| `/code-behind-extractor`  | Logic extraction            | Move logic to hooks/lib            |
| `/migration-helper`       | Schema evolution            | Add models, fields, indexes        |

---

## Context-Aware Features

All commands are context-aware and will:

1. Analyze the current file/folder context
2. Use established patterns from the OBPS codebase
3. Follow Next.js App Router conventions
4. Reference Prisma schema models and Zod validation schemas
5. Apply Tailwind CSS v4 styling patterns
6. Respect the 4-role RBAC system (APPLICANT, STAFF, REVIEWER, ADMINISTRATOR)
