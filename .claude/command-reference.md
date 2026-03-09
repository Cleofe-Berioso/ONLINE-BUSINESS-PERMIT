# HoardNest Command Reference

## Overview

This document provides a quick reference for all Claude commands available in the HoardNest codebase. These commands help with development, debugging, and maintenance tasks.

---

## Available Commands

### 1. Backend Service (`/backend-service`)

**Purpose**: Create or modify backend services, routes, and controllers.

**Usage**:

```
/backend-service [action] [entity]
```

**Actions**:

- `create route` - Create a new API route
- `add endpoint` - Add endpoint to existing route
- `create service` - Create a new service module
- `add middleware` - Add middleware to route

**Examples**:

```
/backend-service create route reviews
/backend-service add endpoint orders/:id/cancel
/backend-service create service emailService
```

---

### 2. Database Query (`/database-query`)

**Purpose**: Generate Prisma queries and manage database operations.

**Usage**:

```
/database-query [operation] [model]
```

**Operations**:

- `find` - Generate findMany/findUnique queries
- `create` - Generate create query
- `update` - Generate update query
- `delete` - Generate delete query
- `aggregate` - Generate aggregation query
- `migrate` - Create/apply migrations

**Examples**:

```
/database-query find orders with status=pending
/database-query create notification for user
/database-query aggregate earnings by month
/database-query migrate add field phoneVerified to User
```

---

### 3. Debug Issue (`/debug-issue`)

**Purpose**: Diagnose and fix common issues in the codebase.

**Usage**:

```
/debug-issue [category] [description]
```

**Categories**:

- `api` - API/network issues
- `auth` - Authentication problems
- `state` - React state management
- `prisma` - Database query errors
- `build` - Build/compilation errors
- `runtime` - Runtime exceptions

**Examples**:

```
/debug-issue api 401 unauthorized on orders endpoint
/debug-issue auth user session not persisting
/debug-issue prisma foreign key constraint violation
/debug-issue state cart items not updating
```

---

### 4. Frontend Design (`/frontend-design`)

**Purpose**: Create and modify React components with Material-UI.

**Usage**:

```
/frontend-design [action] [component-type]
```

**Actions**:

- `create page` - Create new page component
- `create component` - Create reusable component
- `create modal` - Create modal/dialog component
- `add feature` - Add feature to existing component
- `style` - Add/modify MUI styling

**Examples**:

```
/frontend-design create page ReviewsPage
/frontend-design create component OrderStatusBadge
/frontend-design create modal ConfirmDeleteModal
/frontend-design add feature pagination to MyOrders
```

---

### 5. QA Testing (`/qa-testing`)

**Purpose**: Generate tests and validate functionality.

**Usage**:

```
/qa-testing [type] [target]
```

**Types**:

- `unit` - Unit test for component/function
- `integration` - Integration test for API
- `e2e` - End-to-end test scenario
- `manual` - Manual test checklist

**Examples**:

```
/qa-testing unit CheckoutFlow component
/qa-testing integration orders API
/qa-testing e2e complete purchase flow
/qa-testing manual rider delivery workflow
```

---

### 6. Workflow Definitions (`/workflow-definitions`)

**Purpose**: Document and analyze application workflows.

**Usage**:

```
/workflow-definitions [action] [workflow]
```

**Actions**:

- `explain` - Explain workflow in detail
- `trace` - Trace data flow through workflow
- `components` - List all components in workflow
- `endpoints` - List all API endpoints in workflow
- `diagram` - Generate workflow diagram

**Examples**:

```
/workflow-definitions explain checkout
/workflow-definitions trace order from placement to delivery
/workflow-definitions components rider registration
/workflow-definitions endpoints admin management
```

---

### 7. Workflow Verificator (`/workflow-verificator`)

**Purpose**: Verify workflow implementations are complete and correct.

**Usage**:

```
/workflow-verificator [action] [workflow-id]
```

**Actions**:

- `check` - Verify workflow implementation
- `validate` - Validate data flows
- `coverage` - Check test coverage
- `audit` - Full audit of workflow

**Examples**:

```
/workflow-verificator check WF-ORDER-001
/workflow-verificator validate rider earnings calculation
/workflow-verificator coverage admin dashboard
/workflow-verificator audit all authentication
```

---

### 8. Cleanup Codebase (`/cleanup-codebase`)

**Purpose**: Maintain code quality by cleaning migration artifacts and deprecated files.

**Usage**:

```
/cleanup-codebase [action] [target]
```

**Actions**:

- `scan` - Scan for cleanup targets
- `archive` - Archive files to archives/
- `report` - Generate cleanup report
- `verify` - Verify post-cleanup
- `console-logs` - Find debug statements
- `todos` - Find TODO/FIXME comments

**Examples**:

```
/cleanup-codebase scan all
/cleanup-codebase archive backup files
/cleanup-codebase report console logs
/cleanup-codebase verify post-cleanup
/cleanup-codebase todos in src/pages
```

---

## Quick Command Summary

| Command                 | Purpose             | Common Use Case           |
| ----------------------- | ------------------- | ------------------------- |
| `/backend-service`      | Backend development | Add new API endpoints     |
| `/database-query`       | Database operations | Generate Prisma queries   |
| `/debug-issue`          | Troubleshooting     | Fix errors and bugs       |
| `/frontend-design`      | UI development      | Create React components   |
| `/qa-testing`           | Testing             | Generate test cases       |
| `/workflow-definitions` | Documentation       | Understand workflows      |
| `/workflow-verificator` | Validation          | Verify implementations    |
| `/cleanup-codebase`     | Maintenance         | Clean migration artifacts |

---

## Context-Aware Features

All commands are context-aware and will:

1. Analyze the current file/folder context
2. Use appropriate patterns from the codebase
3. Follow established coding conventions
4. Reference related components/services

---

## Related Documentation

- **workflows.json** - Complete workflow definitions
- **WORKFLOWS_SUMMARY.md** - Workflow overview
- **Workflows.mermaid** - Visual diagrams
- **BACKEND_ENDPOINTS_COMPLETE.md** - Full API documentation
- **DATABASE_ARCHITECTURE.md** - Database schema

---

## Best Practices

1. **Be specific**: Include relevant details in commands
2. **Check context**: Ensure you're in the right file/folder
3. **Review output**: Verify generated code matches requirements
4. **Test changes**: Always test after making modifications
5. **Follow patterns**: Use established codebase patterns
