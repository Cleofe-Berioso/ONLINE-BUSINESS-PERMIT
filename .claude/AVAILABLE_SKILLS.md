# HoardNest Available Skills/Commands

## Overview

This document catalogs all available skills and commands in the HoardNest codebase, organized by domain and functionality. These skills represent the capabilities that can be leveraged for development, debugging, and maintenance.

**Last Updated**: February 28, 2026  
**Total Skills**: 28 (17 Core + 11 Domain-Specific)

---

## Core Development Commands (17)

### 1. Backend Service (`/backend-service`)

**File**: `.claude/commands/backend-service.md`  
**Purpose**: Create and modify Express.js routes, controllers, and services

**Capabilities**:

- Create new API routes
- Add endpoints to existing routes
- Create service modules
- Add middleware
- Follow Express.js + Prisma patterns

**Example Use Cases**:

```
/backend-service create route reviews
/backend-service add endpoint orders/:id/cancel
/backend-service create service emailService
```

---

### 2. Database Query (`/database-query`)

**File**: `.claude/commands/database-query.md`  
**Purpose**: Generate and execute Prisma queries for PostgreSQL

**Capabilities**:

- Generate findMany/findUnique queries
- Create, update, delete operations
- Aggregation and groupBy queries
- Create/apply migrations
- Transaction handling

**Example Use Cases**:

```
/database-query find orders with status=pending
/database-query create notification for user
/database-query aggregate earnings by month
/database-query migrate add field phoneVerified to User
```

---

### 3. Debug Issue (`/debug-issue`)

**File**: `.claude/commands/debug-issue.md`  
**Purpose**: Diagnose and fix common issues across the stack

**Capabilities**:

- API/network issues (401, 404, 500 errors)
- Authentication problems
- React state management issues
- Prisma/database errors
- Build/compilation errors
- Runtime exceptions

**Example Use Cases**:

```
/debug-issue api 401 unauthorized on orders endpoint
/debug-issue auth user session not persisting
/debug-issue prisma foreign key constraint violation
/debug-issue state cart items not updating
```

---

### 4. Frontend Design (`/frontend-design`)

**File**: `.claude/commands/frontend-design.md`  
**Purpose**: Create and modify React components with Material-UI

**Capabilities**:

- Create page components
- Create reusable components
- Create modal/dialog components
- Add features to existing components
- Apply MUI styling and theming

**Example Use Cases**:

```
/frontend-design create page ReviewsPage
/frontend-design create component OrderStatusBadge
/frontend-design create modal ConfirmDeleteModal
/frontend-design add feature pagination to MyOrders
```

---

### 5. QA Testing (`/qa-testing`)

**File**: `.claude/commands/qa-testing.md`  
**Purpose**: Generate tests and validation strategies

**Capabilities**:

- Unit tests (Jest + React Testing Library)
- Integration tests (Supertest)
- E2E test scenarios
- Manual test checklists
- Test data generators

**Example Use Cases**:

```
/qa-testing unit CheckoutFlow component
/qa-testing integration orders API
/qa-testing e2e complete purchase flow
/qa-testing manual rider delivery workflow
```

---

### 6. Workflow Definitions (`/workflow-definitions`)

**File**: `.claude/commands/workflow-definitions.md`  
**Purpose**: Document and analyze application workflows

**Capabilities**:

- Explain workflows in detail
- Trace data flows
- List workflow components
- List API endpoints
- Generate workflow diagrams

**Example Use Cases**:

```
/workflow-definitions explain checkout
/workflow-definitions trace order from placement to delivery
/workflow-definitions components rider registration
/workflow-definitions endpoints admin management
```

---

### 7. Workflow Verificator (`/workflow-verificator`)

**File**: `.claude/commands/workflow-verificator.md`  
**Purpose**: Verify workflow implementations are complete and correct

**Capabilities**:

- Check workflow implementation
- Validate data flows
- Check test coverage
- Full workflow audit
- Generate verification reports

**Example Use Cases**:

```
/workflow-verificator check WF-ORDER-001
/workflow-verificator validate rider earnings calculation
/workflow-verificator coverage admin dashboard
/workflow-verificator audit all authentication
```

---

### 8. Cleanup Codebase (`/cleanup-codebase`)

**File**: `.claude/commands/cleanup-codebase.md`  
**Purpose**: Maintain code quality by cleaning migration artifacts, debug statements, and deprecated files

**Capabilities**:

- Archive migration backup files (\*.backup)
- Archive migration temp files (\*.new.ts)
- Scan for console.log debug statements
- Track TODO/FIXME comments
- Cleanup root scripts
- Safe archival workflow (archive before delete)
- Post-cleanup verification

**Cleanup Categories**:
| Category | Count | Status |
|----------|-------|--------|
| _.backup files | 12 | Ready to archive |
| _.new.ts files | 90 | Verify before archive |
| console.log statements | 50+ | Review required |
| TODO/FIXME comments | 2+ | Track in backlog |
| cleanup-\*.ps1 scripts | 10 | Consolidate |

**Example Use Cases**:

```
/cleanup-codebase scan all
/cleanup-codebase archive backup files
/cleanup-codebase report console logs
/cleanup-codebase verify post-cleanup
```

---

### 9. Fee Structure (`/fee-structure`)

**File**: `.claude/commands/fee-structure.md`  
**Purpose**: Manage the 5-tier commission and service fee structure

**Fee Tiers**:
| Tier | Order Range | Commission | Service Fee | Rider Earnings |
|------|-------------|------------|-------------|----------------|
| 1 | < ₱625 | 0% | ₱85 fixed | ₱60 fixed |
| 2 | ₱625 – ₱2,500 | 20% | ₱0 | 8% (min ₱80) |
| 3 | ₱2,501 – ₱7,500 | 15% | ₱0 | 10% (min ₱150) |
| 4 | ₱7,501 – ₱20,000 | 10% | ₱0 | 12% (min ₱300) |
| 5 | > ₱20,000 | 5% | ₱0 | 15% (min ₱500) |

**Key Files**: `src/services/feeService.ts`, `src/components/rider/EarningsTracker.tsx`, `src/config/environment.ts`

**Example Use Cases**:

```
/fee-structure calculate 1500
/fee-structure show-tiers
/fee-structure update-tier 2 625 2500 0.20
```

---

### 10. City Restriction (`/city-restriction`)

**File**: `.claude/commands/city-restriction.md`  
**Purpose**: Manage Silay City restriction, barangay addresses, and service area validation

**Configuration**:

- `REACT_APP_ALLOWED_CITY="Silay City"`
- `REACT_APP_DEFAULT_CITY="Silay City"`
- 17 barangays in Silay City

**Key Files**: `.env`, `src/config/environment.ts`, `src/pages/SignupPage.tsx`, `src/dashboard/DeliveryAddress.tsx`

**Example Use Cases**:

```
/city-restriction validate "123 Rizal St, Barangay I"
/city-restriction list-barangays
/city-restriction set-city "Silay City"
```

---

### 11. Implementation Plan (`/implementation-plan`)

**File**: `.claude/commands/implementation-plan.md`  
**Purpose**: Sprint planning, feature prioritization, and gap analysis for HoardNest development

**Plan Summary**: 81 API endpoints across 5 sprints (10 weeks), priorities P0–P3

**Key Files**: `Docs/IMPLEMENTATION_PLAN.md`, `Docs/Architecture/`, `Docs/API/`

**Example Use Cases**:

```
/implementation-plan status
/implementation-plan priorities
/implementation-plan gaps
/implementation-plan sprint 1
```

---

### 12. Codebase Assessment (`/codebase-assessment`)

**File**: `.claude/commands/codebase-assessment.md`  
**Purpose**: Comprehensive quantitative codebase assessment with dual grading (letter F→A+ and /10) across 6 categories

**Categories**:

1. **Security** — Hardcoded secrets, missing auth guards, CORS, JWT exposure
2. **API & Data Integrity** — Input validation, error handling, N+1 queries, transactions
3. **TypeScript & Code Quality** — TS errors, `any` usage, god components, TODOs
4. **Frontend Quality** — Error boundaries, loading states, memory leaks, key props
5. **Testing** — Coverage ratios, critical path tests, mock data in production
6. **Architecture & Patterns** — Circular deps, layer violations, dead code, schema drift

**Scoring Rubric**: Evidence-based with exact violation counts and `file:line` citations

**Output**: Composite score (avg of 6 categories), priority remediation tiers

**Example Use Cases**:

```
/codebase-assessment
/codebase-assessment security
/codebase-assessment full
```

---

### 13. Security Hardening (`/security-hardening`)

**File**: `.claude/commands/security-hardening.md`  
**Purpose**: Security audit and hardening following OWASP Top 10 for React + Express.js + PostgreSQL

**Audit Areas**:

1. **Authentication & Authorization** — verifyToken/requireAdmin on all routes, JWT expiration, session invalidation
2. **Secrets & Environment Variables** — Hardcoded secrets, env var usage, CORS origin, .gitignore
3. **Input Validation & Injection** — express-validator coverage, Prisma parameterization, XSS, rate limiting
4. **WebSocket Security** — JWT auth on connection, room isolation, admin room restriction
5. **Data Exposure & Privacy** — Password hash exclusion, Prisma select usage, error sanitization

**Key Files**: `backend/src/middleware/auth.middleware.ts`, `backend/src/routes/*.routes.ts`, `src/api/client.ts`, `backend/src/websocket/socketServer.ts`

**Example Use Cases**:

```
/security-hardening
/security-hardening auth
/security-hardening secrets
/security-hardening validation
```

---

### 14. Performance Profiler (`/performance-profiler`)

**File**: `.claude/commands/performance-profiler.md`  
**Purpose**: Identify and optimize performance bottlenecks across Prisma queries, React rendering, bundle size, and API responses

**Profiling Domains**:

1. **Prisma Query Optimization** — N+1 detection, missing select/pagination, index recommendations
2. **React Rendering** — Unnecessary re-renders, missing memo/useMemo, large list virtualization
3. **Bundle Size** — Code splitting, lazy loading, tree-shaking, admin route isolation
4. **API Response** — Over-fetching, caching headers, compression middleware
5. **WebSocket Performance** — Room-targeted emit, listener cleanup, payload size

**Key Files**: `backend/src/repositories/*.repository.ts`, `src/components/**/*.tsx`, `src/api/client.ts`

**Example Use Cases**:

```
/performance-profiler
/performance-profiler prisma
/performance-profiler bundle
/performance-profiler react
```

---

### 15. Migration Helper (`/migration-helper`)

**File**: `.claude/commands/migration-helper.md`  
**Purpose**: Prisma schema migrations, data transforms, index management, and safe field evolution

**Migration Types**:

1. **Add New Model** — Full workflow: schema → migration → repository → route → types → API client
2. **Add Field** — Safe patterns (nullable/default) vs. 3-step required field migration
3. **Enum Changes** — Adding values, renaming (requires manual SQL)
4. **Add Index** — Common index patterns for HoardNest models (Item, Order, Notification)
5. **Relation Changes** — New relations, self-referential patterns

**Key Files**: `backend/prisma/schema.prisma`, `backend/prisma/migrations/`, `backend/src/repositories/index.ts`

**Example Use Cases**:

```
/migration-helper add model Coupon
/migration-helper add field phoneVerified Boolean to User
/migration-helper add index on Order(buyerId, status)
/migration-helper check status
```

---

### 16. PWA & Offline Resilience (`/pwa-offline`)

**File**: `.claude/commands/pwa-offline.md`  
**Purpose**: Progressive Web App capabilities, service worker, caching, offline detection, and install prompts

**Components**:

1. **Service Worker** — `public/sw.js` with cache-first/network-first strategies
2. **PWA Manager** — `src/utils/pwaManager.ts` (373 lines) — registration, install prompt, push, background sync
3. **Offline Resilience** — Queue actions in IndexedDB/localStorage, sync on reconnect
4. **Manifest** — `public/manifest.json` + `manifest-pwa.json` with full icon set

**Key Files**: `src/utils/pwaManager.ts`, `public/sw.js`, `public/manifest.json`, `public/index.html`

**Example Use Cases**:

```
/pwa-offline audit
/pwa-offline caching
/pwa-offline offline-queue
/pwa-offline install-prompt
```

---

### 17. Full System Validation (`/full-system-validation`)

**File**: `.claude/commands/full-system-validation.md`  
**Purpose**: 6-phase cross-cutting validation ensuring all routes, APIs, components, types, WebSocket events, and auth flows are properly wired

**Validation Phases**:

1. **Backend Route Registration** — All 24 route files imported + registered in index.ts
2. **API Client ↔ Backend Wiring** — Every frontend API function maps to a backend endpoint
3. **Component ↔ API Client Wiring** — No hardcoded mock data in production components
4. **Type Consistency** — Frontend types match Prisma models and API responses
5. **WebSocket Event Wiring** — 8 emitters → hooks → consuming components
6. **Authentication Flow** — Token injection, protected routes, 401 handling

**Key Files**: `backend/src/index.ts`, `src/api/*.ts`, `backend/src/routes/*.routes.ts`, `src/contexts/SocketContext.tsx`

**Example Use Cases**:

```
/full-system-validation
/full-system-validation routes
/full-system-validation api-wiring
/full-system-validation websocket
```

---

## Domain-Specific Skills (11)

### 18. API Client Management (`/api-client`)

**Source Files**: `src/api/*.ts` (16 API client modules)

**Available Modules**:

- `orders.ts` - Order management
- `items.ts` - Marketplace items
- `deliveries.ts` - Delivery tracking
- `riders.ts` - Rider profiles
- `notifications.ts` - Notification system
- `financial.ts` - Financial data
- `admin.ts` - Admin operations
- `userProfile.ts` - User profiles
- `paymentMethods.ts` - Payment management
- `deliveryAddresses.ts` - Address management
- `riderApplications.ts` - Rider applications
- `systemConfig.ts` - System configuration
- `contact.ts` - Contact/support

**Capabilities**:

- Create new API client functions
- Add endpoints to existing clients
- Implement error handling
- Add TypeScript types
- Handle authentication headers

---

### 19. Fee Calculation System (`/fee-calculation`)

**Source Files**: `src/services/feeService.ts` (475 lines)

**Fee Tiers**:
| Price Range | Fee Type | Rate |
|-------------|----------|------|
| < ₱625 | Fixed service fee | ₱85 |
| ₱625 - ₱2,500 | Commission | 20% |
| ₱2,501 - ₱7,500 | Commission | 15% |
| ₱7,501 - ₱20,000 | Commission | 10% |
| > ₱20,000 | Commission | 5% |

**Capabilities**:

- Calculate tiered platform fees
- Calculate seller revenue
- Calculate rider earnings
- Calculate buyer total
- Generate revenue breakdowns

---

### 20. Rider Management System (`/rider-management`)

**Source Files**:

- Frontend: `src/components/rider/*.tsx` (20 components)
- Utils: `src/utils/rider*.ts` (3 utility files)
- API: `src/api/riders.ts`, `riderApplications.ts`
- Backend: `backend/src/routes/rider*.routes.ts` (2 files)

**Components**:

- DeliveryList, DeliveryModal, DeliveryCard
- EarningsTracker, AdvancedAnalytics
- EnhancedProfile, NotificationCenter
- QuickActions, PerformanceCard
- QAReviewModal, RouteOptimization

**Capabilities**:

- Rider registration workflow
- Delivery assignment and tracking
- Earnings calculation and display
- Performance metrics
- QA review process
- Route optimization

---

### 21. Admin Dashboard System (`/admin-dashboard`)

**Source Files**: `src/components/admin/*.tsx` (20 components)

**Major Dashboards**:

- AdminOverview - Platform statistics
- UserManagement - User CRUD operations
- RiderApplicationManagement - Rider approvals
- ListingManagement - Item moderation
- FinancialForecastingDashboard - Financial projections
- AdvancedAnalyticsDashboard - Data analytics
- RealTimeAnalyticsDashboard - Live metrics
- SystemConfigurationDashboard - Settings management
- DeletionManagementDashboard - Data cleanup
- SecurityMonitoringDashboard - Security alerts

**Capabilities**:

- Create admin UI components
- Implement management interfaces
- Build analytics visualizations
- Configure system settings
- Generate reports

---

### 22. Notification System (`/notification-system`)

**Source Files**:

- API: `src/api/notifications.ts`
- Utils: `src/utils/notificationUtils.ts`
- Components: `src/components/QANotificationCenter.tsx`, `src/components/rider/NotificationCenter.tsx`
- Backend: `backend/src/routes/notification.routes.ts`

**Notification Types**:

- `order_placed` - New order created
- `order_confirmed` - Order approved
- `delivery_assigned` - Rider assigned
- `delivery_completed` - Delivery done
- `payment_received` - Payment processed
- `qa_approved` - QA passed
- `qa_rejected` - QA failed

**Capabilities**:

- Create notifications
- Send user alerts
- Mark as read/unread
- Delete notifications
- Filter by type/status
- Real-time updates

---

### 23. Context Provider Management (`/context-provider`)

**Source Files**: `src/context/*.tsx` (5 context providers)

**Available Contexts**:

- **AuthContext** - User authentication state
- **CartContext** - Shopping cart management
- **ShopContext** - Marketplace/items state
- **ErrorContext** - Global error handling
- **LoadingContext** - Loading state management

**Capabilities**:

- Create new context providers
- Add state management logic
- Implement context hooks
- Handle side effects
- Persist state to localStorage

---

### 24. Financial Service System (`/financial-service`)

**Source Files**: `src/services/financial*.ts` (6 service files)

**Services**:

- `financialService.ts` - Core financial operations
- `financialAlertService.ts` - Alert generation
- `financialForecastingService.ts` - Revenue forecasting
- `src/api/financial.ts` - Financial API client
- `backend/src/routes/financial.routes.ts` - Backend routes

**Capabilities**:

- Calculate earnings (seller/rider)
- Generate financial reports
- Forecast revenue
- Create financial alerts
- Track transactions
- Analyze trends

---

### 25. Analytics & Reporting (`/analytics-engine`)

**Source Files**:

- Services: `src/services/realTimeAnalyticsEngine.ts`, `automatedReportingService.ts`
- Utils: `src/utils/analyticsUtils.ts`
- Components: `src/components/admin/*AnalyticsDashboard.tsx` (5 dashboards)
- Backend: `backend/src/routes/analytics.routes.ts`

**Analytics Types**:

- Real-time metrics
- Historical data analysis
- Comparative analytics
- Data visualization
- Business intelligence
- Custom reports

**Capabilities**:

- Track platform metrics
- Generate automated reports
- Create visualizations (charts/graphs)
- Export data
- Schedule reports

---

### 26. Delivery Management (`/delivery-system`)

**Source Files**:

- API: `src/api/deliveries.ts`, `deliveryAddresses.ts`
- Utils: `src/utils/deliveryAddressUtils.ts`
- Components: `src/components/rider/Delivery*.tsx` (3 components)
- Backend: `backend/src/routes/delivery*.routes.ts` (2 files)

**Delivery Status Flow**:

```
assigned → pickup_confirmed → in_transit → delivered
```

**Capabilities**:

- Assign riders to orders
- Track delivery status
- Manage delivery addresses
- Update delivery progress
- Calculate delivery fees
- Handle delivery proofs

---

### 27. QA Workflow System (`/qa-workflow`)

**Source Files**:

- Utils: `src/utils/qaWorkflowUtils.ts`
- Pages: `src/pages/QARiderPage.tsx`
- Components: `src/components/rider/QAReviewModal.tsx`, `src/components/BuyerOrderQAStatus.tsx`
- Backend: `backend/src/routes/qa-workflow.routes.ts`

**QA States**:

```
pending → under_review → [approved OR rejected]
rejected → resubmitted → pending
```

**Capabilities**:

- Submit orders for QA
- Review order details
- Approve/reject orders
- Provide rejection reasons
- Handle resubmissions
- Track QA metrics

---

### 28. Custom React Hooks (`/custom-hooks`)

**Source Files**: `src/hooks/*.ts` (8 custom hooks)

**Available Hooks**:

- `useApi.ts` - Generic API request handler
- `useCurrentUser.ts` - Current user state
- `useFeeStructure.ts` - Fee calculation hook
- `useOrderManagement.ts` - Order operations
- `useRiderEarnings.ts` - Rider earnings data
- `useModalManager.ts` - Modal state management
- `useEnhancedFeedback.tsx` - Feedback notifications
- `useFeedbackSnackbar.tsx` - Snackbar notifications

**Capabilities**:

- Create reusable hooks
- Handle side effects
- Manage component state
- Implement custom logic
- Share logic across components

---

## Skill Coverage Matrix

| Domain                | API Client          | Backend Route             | Frontend UI      | Utilities               | Services                   |
| --------------------- | ------------------- | ------------------------- | ---------------- | ----------------------- | -------------------------- |
| **Orders**            | ✅ orders.ts        | ✅ order.routes.ts        | ✅ Multiple      | ✅ orderUtils.ts        | ✅ orderTrackingService.ts |
| **Items/Marketplace** | ✅ items.ts         | ✅ item.routes.ts         | ✅ Multiple      | ✅ listingUtils.ts      | -                          |
| **Riders**            | ✅ riders.ts        | ✅ rider.routes.ts        | ✅ 20 components | ✅ riderUtils.ts        | -                          |
| **Deliveries**        | ✅ deliveries.ts    | ✅ delivery.routes.ts     | ✅ 3 components  | ✅ deliveryUtils.ts     | ✅ orderTrackingService.ts |
| **Admin**             | ✅ admin.ts         | ✅ admin.routes.ts        | ✅ 20 components | ✅ adminUtils.ts        | -                          |
| **Financial**         | ✅ financial.ts     | ✅ financial.routes.ts    | ✅ Multiple      | -                       | ✅ 3 services              |
| **Notifications**     | ✅ notifications.ts | ✅ notification.routes.ts | ✅ 2 components  | ✅ notificationUtils.ts | -                          |
| **Analytics**         | -                   | ✅ analytics.routes.ts    | ✅ 5 dashboards  | ✅ analyticsUtils.ts    | ✅ 2 services              |
| **Auth**              | -                   | ✅ auth.routes.ts         | ✅ 2 pages       | ✅ authUtils.ts         | ✅ accessControlService.ts |
| **QA Workflow**       | -                   | ✅ qa-workflow.routes.ts  | ✅ 3 components  | ✅ qaWorkflowUtils.ts   | -                          |

---

## Technology Stack Coverage

### Frontend

- **Framework**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Context API + Custom Hooks
- **Routing**: React Router v6
- **API Client**: Axios (in apiClient)

### Backend

- **Framework**: Express.js
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (httpOnly cookies)
- **Validation**: express-validator

### DevOps/Tools

- **Build Tool**: Create React App
- **Package Manager**: npm
- **Version Control**: Git
- **Containerization**: Docker

---

## Usage Guidelines

### Selecting the Right Skill

1. **Development Tasks**:
   - New feature → `/frontend-design` + `/backend-service`
   - API integration → `/api-client`
   - Database operations → `/database-query`

2. **Debugging**:
   - Runtime errors → `/debug-issue`
   - Workflow issues → `/workflow-verificator`

3. **Testing**:
   - Unit/Integration → `/qa-testing`
   - Workflow validation → `/workflow-verificator`

4. **Documentation**:
   - Understanding flows → `/workflow-definitions`
   - System overview → This document

### Best Practices

1. **Start Specific**: Use domain-specific skills (18-28) when working in a particular area
2. **Fall Back to Core**: Use core skills (1-17) for general development tasks
3. **Combine Skills**: Many tasks require multiple skills (e.g., frontend + backend + database)
4. **Verify Implementation**: Always use `/workflow-verificator` or `/full-system-validation` after major changes
5. **Document Changes**: Update `/workflow-definitions` when modifying flows
6. **Security Check**: Run `/security-hardening` before any deployment
7. **Assess Quality**: Run `/codebase-assessment` periodically to maintain Grade A standards

---

## Skill Priority Levels

| Priority     | Skills             | Use Case                          |
| ------------ | ------------------ | --------------------------------- |
| **Critical** | 1-12, 17           | Daily development, quality gates  |
| **High**     | 13, 14, 15, 18, 19 | Security, performance, migrations |
| **Medium**   | 16, 20-24          | PWA, domain features              |
| **Low**      | 25-28              | Analytics, advanced features      |

---

## Future Skill Additions

Potential skills to add based on codebase growth:

1. `/email-service` - Email notifications and templates (emailDeliveryService.ts exists)
2. `/payment-integration` - Payment gateway integration (GCash, Maya)
3. `/image-optimization` - Cloudinary/image processing
4. `/seo-optimization` - SEO best practices
5. `/accessibility` - WCAG compliance (SkipLink.tsx exists)
6. `/localization` - Multi-language support (Filipino/English)

---

## Related Documentation

- **workflows.json** - Complete workflow definitions (45 workflows)
- **WORKFLOWS_SUMMARY.md** - Workflow overview and diagrams
- **command-reference.md** - Command usage reference
- **BACKEND_ENDPOINTS_COMPLETE.md** - Full API documentation
- **DATABASE_ARCHITECTURE.md** - Database schema details

---

## Maintenance

This document should be updated when:

- New skills/commands are added
- Major refactoring changes file structure
- New domains/features are introduced
- Technology stack changes

**Document Owner**: Development Team  
**Review Frequency**: Monthly or after major releases
