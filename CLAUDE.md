# HoardNest - Agentic Workflow Guide

## Project Overview

**HoardNest** is a community-based marketplace platform for Silay City, Negros Occidental, Philippines. It connects local buyers, sellers, and delivery riders with a tiered commission system.

| Aspect         | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| **Frontend**   | React 18 + TypeScript                                            |
| **UI Library** | Material-UI (MUI) v5                                             |
| **Backend**    | Express.js 5 + TypeScript                                        |
| **ORM**        | Prisma (PostgreSQL)                                              |
| **Database**   | PostgreSQL                                                       |
| **Auth**       | JWT httpOnly cookies + refresh token rotation (bcrypt 12 rounds) |
| **State**      | React Context API                                                |
| **Routing**    | React Router v7                                                  |
| **Charts**     | Recharts                                                         |
| **Build**      | Create React App (react-scripts)                                 |

---

## Code Quality Standards

- **TypeScript**: Strict mode, 0 production errors (`npx tsc --noEmit`)
- **No debug console.logs**: All emoji/debug console.logs must be removed
- **Security**: No OAuth tokens, API keys, or secrets in code
- **Auth pattern**: Multi-method login via `identifier` field (email / phone / Messenger ID). JWT access tokens (15min httpOnly) + opaque refresh tokens (7d, SHA-256 hashed)
- **Soft delete**: `users`, `items`, `orders` have `deletedAt` field — always filter with `deletedAt: null` in queries
- **Null safety**: Always use optional chaining (`user?.id`) for nullable references
- **Type casting**: Use `as unknown as Type` for incompatible type conversions

### Code Quality Mandate

**All code must meet Grade A quality (9/10 minimum) per category.** Assessed via `/codebase-assessment` skill.

| Category                  | Minimum | Standard                                                                                                                                                |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security                  | 9/10    | No hardcoded secrets, JWT via env vars, `verifyToken` + `requireAdmin` on all protected routes, parameterized Prisma queries, explicit CORS origins     |
| API & Data Integrity      | 9/10    | `express-validator` on all POST/PUT, try/catch on all handlers, `$transaction` for multi-table ops, Decimal(10,2) for financial amounts                 |
| TypeScript & Code Quality | 9/10    | 0 TS errors, no `as any` in API/service files, no god components >500 lines without decomposition, no TODO/FIXME in production code                     |
| Frontend Quality          | 9/10    | Loading states on all data-fetching components, `useEffect` cleanup on subscriptions/timers, no hardcoded API URLs, `key` props on all `.map()` renders |
| Testing                   | 8/10    | Test coverage for auth, financial, order, and delivery critical paths, no mock data in production components                                            |
| Architecture & Patterns   | 9/10    | No circular dependencies, no cross-layer imports, env config for all ports/URLs, WebSocket listeners cleaned up                                         |

### Enforcement Rules

- **No hardcoded API URLs** — use `apiClient` from `src/api/client.ts` (auto-prefixes base URL)
- **No direct Prisma imports in routes** — use repository pattern (or `(prisma as any)` for Prisma cache workaround only)
- **No `console.log` in production** — use proper error responses; `console.error` only in catch blocks
- **No empty catch blocks** — all exceptions must be logged or re-thrown
- **No `async` functions without `try/catch`** — all async route handlers and useEffect callbacks must handle errors
- **All route handlers must validate input** — use `express-validator` with `validationResult` check
- **All financial amounts must use Decimal(10,2)** — never store money as Float or Int
- **All WebSocket listeners must have cleanup** — return unsubscribe function from `useEffect`
- **Build must produce 0 errors** before any commit (`npx tsc --noEmit`)
- **All Prisma schema changes must validate** (`npx prisma validate --schema=backend/prisma/schema.prisma`)
- **Soft-delete queries must filter `deletedAt: null`** — User, Item, and Order queries must exclude soft-deleted records
- **Migration names must be descriptive** — name must reflect exactly what the migration does (not vague names like "update_schema")
- **Full-width primary action buttons** — all primary form submit buttons (login, signup, reset password, contact, etc.) must use `fullWidth` prop with `sx={{ py: 1.25 }}` for consistent sizing. Reference: `LoginPage.tsx` button pattern.
- **Auth page card layout** — auth pages (login, signup, forgot-password, reset-password) must wrap content in `<Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>` inside `<Container maxWidth="sm" sx={{ py: 8 }}>`. Use `variant="h4"` with `fontWeight="bold"` for headings. Reference: `LoginPage.tsx`, `SignupPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`.

---

## Project Structure

```
react-hoardnest/
├── .claude/                    # Agentic workflow configuration
│   ├── AVAILABLE_SKILLS.md    # Skill catalog
│   ├── commands/              # Skill definitions (17 total)
│   └── reference/             # Reference documentation
├── CLAUDE.md                  # This file (project guide)
├── .env                       # Single env config (frontend + backend)
├── .env.test                  # Test-only overrides (isolated DB, JWT)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (940+ lines, 22 models)
│   │   └── migrations/        # Prisma migrations (4 applied)
│   └── src/
│       ├── index.ts           # Express server entry point (+ httpServer for Socket.IO)
│       ├── config/            # Backend configuration
│       ├── middleware/         # Auth, validation middleware
│       ├── repositories/      # Data access layer
│       ├── routes/            # 24 route files
│       └── websocket/
│           └── socketServer.ts # Socket.IO server (auth, rooms, emit helpers)
├── src/
│   ├── api/                   # Frontend API clients (18 modules)
│   ├── components/            # Reusable React components
│   │   ├── admin/             # Admin-specific components
│   │   ├── buyer/             # Buyer components
│   │   ├── rider/             # Rider components (EarningsTracker, etc.)
│   │   ├── seller/            # Seller components
│   │   └── ...                # Shared components (Navbar, Footer, etc.)
│   ├── config/
│   │   └── environment.ts     # Centralized HoardNestConfig
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Auth provider (CANONICAL - single source)
│   │   └── SocketContext.tsx   # WebSocket provider + real-time hooks
│   ├── dashboard/             # Dashboard panels (10 modules)
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   │   ├── admin/             # Admin pages
│   │   ├── rider/             # Rider pages
│   │   └── seller/            # Seller pages
│   ├── services/              # Business logic services (19 files)
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── Docs/                      # Project documentation
│   ├── IMPLEMENTATION_PLAN.md # Master implementation plan
│   ├── API/                   # API documentation
│   ├── Architecture/          # Architecture docs
│   └── ...                    # Other doc categories
└── docker/                    # Docker configuration (PostgreSQL)
```

---

## User Roles

| Role       | Description                               | Key Pages                                |
| ---------- | ----------------------------------------- | ---------------------------------------- |
| **Buyer**  | Browse, purchase, track orders            | HomePage, MarketplacePage, DashboardPage |
| **Seller** | List items, manage orders, track earnings | UploadSellModal, seller/ pages           |
| **Rider**  | Accept deliveries, track earnings         | RiderDashboard, EarningsTracker          |
| **Admin**  | Manage users, finances, system config     | admin/ pages (FinancialManagement, etc.) |

---

## Business Rules

### City Restriction

- Operations restricted to **Silay City** only
- Configured via `REACT_APP_ALLOWED_CITY` and `REACT_APP_DEFAULT_CITY`
- City field is read-only on registration forms
- Barangay selection required for addresses

### 5-Tier Fee Structure

| Tier | Order Range      | Commission | Service Fee | Rider Earnings |
| ---- | ---------------- | ---------- | ----------- | -------------- |
| 1    | < ₱625           | 0%         | ₱85 fixed   | ₱60 fixed      |
| 2    | ₱625 – ₱2,500    | 20%        | ₱0          | 8% (min ₱80)   |
| 3    | ₱2,501 – ₱7,500  | 15%        | ₱0          | 10% (min ₱150) |
| 4    | ₱7,501 – ₱20,000 | 10%        | ₱0          | 12% (min ₱300) |
| 5    | > ₱20,000        | 5%         | ₱0          | 15% (min ₱500) |

### Order Limits

- Minimum order: ₱100
- Maximum order: ₱50,000
- Payment processing fee: 3% (online payments)
- Cancellation fee: ₱50

---

## Development Commands

```bash
# Frontend
yarn start                  # Start React dev server (port 3000)
yarn build                  # Production build
yarn test                   # Run tests
npx tsc --noEmit            # TypeScript type checking (must return 0 errors)

# Backend
yarn backend                # Start Express backend (port 3001)
yarn backend:build          # Build backend TypeScript
yarn dev:all                # Start both frontend and backend

# Database
yarn prisma:studio          # Open Prisma Studio
yarn prisma:generate        # Regenerate Prisma client
npx prisma migrate dev      # Run migrations (development only)
npx prisma migrate deploy   # Run migrations (production — NEVER use migrate dev in prod)

# Docker
docker-compose -f docker/docker-compose.postgres.yml up -d  # Start PostgreSQL
```

---

## Database & Migration Conventions

### Migration Naming

**Always use descriptive, accurate migration names.** The name should reflect exactly what the migration does.

```bash
# ✅ Good — describes exactly what changes
npx prisma migrate dev --name add_soft_delete_and_login_indexes
npx prisma migrate dev --name add_password_reset_fields
npx prisma migrate dev --name add_delivery_tracking_columns

# ❌ Bad — vague or misleading
npx prisma migrate dev --name update_schema
npx prisma migrate dev --name add_telemetry_fields  # if it actually creates the entire DB
```

### Applied Migrations (4 total)

| #   | Migration Name                                     | What It Does                                                                              |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | `20260228160303_add_telemetry_fields`              | **Initial schema** — creates all 22 tables, 3 enums, 80+ indexes, 25+ FKs                 |
| 2   | `20260228180846_add_security_fields`               | Adds account lockout, email verify, refresh token fields to User; delivery timestamps     |
| 3   | `20260228200622_add_password_reset_fields`         | Adds `passwordResetToken` + `passwordResetExpires` to User                                |
| 4   | `20260228205603_add_soft_delete_and_login_indexes` | Adds `deletedAt` to User/Item/Order; indexes on `phone`, `messengerUsername`, `deletedAt` |

### Soft-Delete Pattern

Three models support soft-delete: **User**, **Item**, **Order**. Records are never physically deleted — instead `deletedAt` is set to a timestamp.

**Rules:**

- All listing/search queries MUST include `deletedAt: null` in their `where` clause
- Raw SQL queries MUST include `AND deleted_at IS NULL`
- Auth routes exclude soft-deleted users from login and `/me`
- Registration checks exclude soft-deleted users (allows email re-use)
- Use `softDelete(id)` from BaseRepository instead of `delete(id)` for User/Item/Order
- Use `softDeleteUserAndData(userId)` in UserRepository for cascading soft-delete
- Hard delete (`delete()` / `deleteUserAndData()`) is still available for GDPR "right to erasure"

```typescript
// ✅ Correct — excludes soft-deleted records
const items = await prisma.item.findMany({
  where: { userId, deletedAt: null },
});

// ❌ Wrong — returns soft-deleted records too
const items = await prisma.item.findMany({
  where: { userId },
});

// ✅ Soft-delete via repository
await userRepository.softDelete(userId);
await userRepository.softDeleteUserAndData(userId); // cascades to items + orders

// ✅ Restore a soft-deleted record
await userRepository.restore(userId);
```

### Production Deployment

```bash
# ALWAYS use `migrate deploy` in production (NOT `migrate dev`)
# It skips shadow database creation and won't auto-generate migrations
npx prisma migrate deploy

# Verify after deployment
npx prisma migrate status
```

---

## Backend API Routes (24 Route Files)

| Route File                     | Base Path                 | Purpose                                |
| ------------------------------ | ------------------------- | -------------------------------------- |
| `auth.routes.ts`               | `/api/auth`               | Login, register, token refresh         |
| `auth-extended.routes.ts`      | `/api/auth`               | Password reset, email verification     |
| `user.routes.ts`               | `/api/users`              | User CRUD                              |
| `user-profile.routes.ts`       | `/api/profile`            | Profile management                     |
| `item.routes.ts`               | `/api/items`              | Item CRUD, search                      |
| `category.routes.ts`           | `/api/categories`         | Category management                    |
| `tag.routes.ts`                | `/api/tags`               | Tag management                         |
| `order.routes.ts`              | `/api/orders`             | Order lifecycle                        |
| `delivery.routes.ts`           | `/api/deliveries`         | Delivery management                    |
| `delivery-address.routes.ts`   | `/api/delivery-addresses` | Address CRUD                           |
| `rider.routes.ts`              | `/api/riders`             | Rider operations                       |
| `rider-application.routes.ts`  | `/api/rider-applications` | Rider registration                     |
| `payment-method.routes.ts`     | `/api/payment-methods`    | Payment methods                        |
| `notification.routes.ts`       | `/api/notifications`      | Notification system                    |
| `financial.routes.ts`          | `/api/financial`          | Financial management                   |
| `payout.routes.ts`             | `/api/payouts`            | Payout request/approve/reject/complete |
| `moderation.routes.ts`         | `/api/moderation`         | Moderation queue/review/history/flag   |
| `admin.routes.ts`              | `/api/admin`              | Admin operations                       |
| `analytics.routes.ts`          | `/api/analytics`          | Analytics & reporting                  |
| `listing-management.routes.ts` | `/api/listings`           | Listing moderation                     |
| `location.routes.ts`           | `/api/locations`          | Location services                      |
| `qa-workflow.routes.ts`        | `/api/qa`                 | QA workflow                            |
| `system-config.routes.ts`      | `/api/system-config`      | System configuration                   |
| `test-data.routes.ts`          | `/api/test-data`          | Test data generation                   |

---

## Frontend API Clients (18 Modules)

Located in `src/api/`:
`admin.ts`, `client.ts`, `contact.ts`, `deliveries.ts`, `deliveryAddresses.ts`, `financial.ts`, `items.ts`, `moderation.ts`, `notifications.ts`, `orders.ts`, `paymentMethods.ts`, `payouts.ts`, `riderApplications.ts`, `riders.ts`, `services/`, `systemConfig.ts`, `userProfile.ts`

---

## Key Patterns & Conventions

### Authentication

```typescript
import { useAuth } from "../contexts/AuthContext"; // ALWAYS use contexts/ (not context/)
const { currentUser, login, logout, register } = useAuth();
const userId = currentUser?.id;
// Login uses identifier field (email, phone, or Messenger ID):
// authService.login({ identifier: "user@email.com", password: "..." })
```

### API Calls

```typescript
import apiClient from "../api/client";
const response = await apiClient.get("/api/items");
const data = await apiClient.post("/api/orders", payload);
```

### Environment Config

```typescript
import config from "../config/environment";
config.business.defaultCity; // "Silay City"
config.delivery.city; // "Silay City"
config.api.baseUrl; // "http://localhost:3001"
config.business.minOrderAmount; // 100
config.business.maxOrderAmount; // 50000
```

### Fee Calculations

```typescript
import {
  calculateRevenueWithTieredFees,
  getFeeStructure,
} from "../services/feeService";
const feeStructure = await getFeeStructure();
const breakdown = calculateRevenueWithTieredFees(price, feeStructure);
```

---

## Current State (as of session)

### Working Features

- ✅ JWT httpOnly authentication (multi-method login: email/phone/Messenger ID)
- ✅ Password change, forgot-password, reset-password flows
- ✅ Account lockout (5 failed attempts / 15 min), email verification tokens
- ✅ Refresh token rotation (SHA-256 hashed, 7-day expiry)
- ✅ CSRF protection (double-submit cookie), Helmet CSP, rate limiting
- ✅ User registration with city/barangay/address fields
- ✅ Item listing and marketplace browsing
- ✅ Order creation and management
- ✅ Delivery address management
- ✅ Rider registration and application
- ✅ Rider earnings tracking with tiered fees
- ✅ Admin financial management page
- ✅ Dashboard with personal info, orders, payments
- ✅ Prisma ORM with PostgreSQL schema (940+ lines, 22 models)
- ✅ Soft-delete pattern on User, Item, Order (deletedAt field + indexes)
- ✅ Indexes on phone + messengerUsername for multi-method login lookups
- ✅ 24 backend route files with 95+ endpoints
- ✅ 0 TypeScript production errors (frontend + backend)
- ✅ All 5 frontend API clients fully wired to backend
- ✅ Console.log cleanup complete (0 debug logs)
- ✅ All API clients use centralized apiClient (riders.ts, notifications.ts refactored)
- ✅ WebSocket real-time notifications (Socket.IO v4.8.3)
- ✅ UI pages wired to real API calls (mock data removed)
- ✅ Rider payout system (Payout model, repository, 8 API endpoints, frontend client)
- ✅ RiderProfile.tsx de-mocked — fetches from API via getRiderByUserId
- ✅ RiderSettings.tsx de-mocked — persists via updateRider + real logout
- ✅ EnhancedProfile.tsx de-mocked — removed fake demo data fallback
- ✅ Admin moderation workflow (ModerationAction model, queue/review/history/flag endpoints, ModerationQueue component, AdminDashboard Moderation tab)

### WebSocket Architecture

| Component | File                                    | Purpose                                                                                                                                                                        |
| --------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Server    | `backend/src/websocket/socketServer.ts` | Socket.IO server with JWT auth, rooms, emit helpers                                                                                                                            |
| Context   | `src/contexts/SocketContext.tsx`        | SocketProvider + hooks (useSocket, useRealtimeNotifications, useDeliveryTracking, useAdminRealtime, useRealtimeModeration)                                                     |
| Rooms     | —                                       | `user:{id}`, `role:{role}`, `admin:dashboard`, `admin:financial`, `admin:moderation`, `riders:active`, `delivery:{id}`                                                         |
| Emitters  | —                                       | `emitNotification`, `emitDeliveryUpdate`, `emitOrderUpdate`, `emitFinancialUpdate`, `emitAdminStatsUpdate`, `emitRoleNotification`, `emitPayoutUpdate`, `emitModerationUpdate` |

### UI → API Wiring Status

| Page/Component                 | API Client                                              | Status                                             |
| ------------------------------ | ------------------------------------------------------- | -------------------------------------------------- |
| AdminOverview.tsx              | adminUtils → admin.ts                                   | ✅ Wired                                           |
| UserManagement.tsx             | adminUtils → admin.ts                                   | ✅ Wired                                           |
| RiderApplicationManagement.tsx | riderApplicationUtils → riderApplications.ts            | ✅ Wired                                           |
| ListingManagement.tsx          | listingManagementUtils → items.ts                       | ✅ Wired                                           |
| FinancialManagementPage.tsx    | financialService → financial.ts                         | ✅ Wired                                           |
| Notifications.tsx (dashboard)  | notifications.ts + WebSocket                            | ✅ Wired + real-time                               |
| Earnings.tsx (dashboard)       | financial.ts                                            | ✅ Wired                                           |
| RiderDeliveries.tsx            | riders.ts + WebSocket                                   | ✅ Wired (mock data removed)                       |
| RiderEarnings.tsx              | riders.ts (getRiderEarnings, requestPayout)             | ✅ Wired (mock data removed)                       |
| RiderProfile.tsx               | riders.ts (getRiderByUserId, updateRider)               | ✅ Wired (mock data removed, uses useAuth)         |
| RiderSettings.tsx              | riders.ts (getRiderByUserId, updateRider) + useAuth     | ✅ Wired (mock data removed, real logout)          |
| EnhancedProfile.tsx            | riderApplicationUtils + rider prop                      | ✅ De-mocked (no fake demo data fallback)          |
| ModerationQueue.tsx            | moderation.ts (queue, stats, review, history)           | ✅ Wired (queue + history views, review dialog)    |
| ManageListings.tsx             | items.ts (getSellerItems, updateItemStatus, deleteItem) | ✅ Wired (mock data removed)                       |
| riderUtils.ts                  | riders.ts + polling fallback                            | ✅ Upgraded (15s polling, WebSocket in components) |

### Frontend API Client Coverage

| API Client         | Functions | Backend Endpoints Covered |
| ------------------ | --------- | ------------------------- |
| `admin.ts`         | 21        | 20/20 admin routes        |
| `financial.ts`     | 14        | 14/14 financial routes    |
| `riders.ts`        | 17        | 17/17 rider routes        |
| `payouts.ts`       | 9         | 9/9 payout routes         |
| `moderation.ts`    | 6         | 6/6 moderation routes     |
| `items.ts`         | 14        | 13/13 item routes         |
| `notifications.ts` | 12        | 12/12 notification routes |

### Backend WebSocket Emit Integration

| Route File               | Emit Event                                                      | Purpose                                           |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------- |
| `notification.routes.ts` | `emitNotification`                                              | Real-time notification push on creation           |
| `delivery.routes.ts`     | `emitDeliveryUpdate`                                            | Delivery status update broadcast                  |
| `order.routes.ts`        | `emitOrderUpdate` + `emitNotification`                          | New order alerts to seller + all parties          |
| `payout.routes.ts`       | `emitPayoutUpdate` + `emitNotification` + `emitFinancialUpdate` | Payout lifecycle (create/approve/reject/complete) |
| `moderation.routes.ts`   | `emitModerationUpdate` + `emitNotification`                     | Moderation review + flag actions                  |

### Needs Implementation

- ✅ Advanced analytics engine (wired to Socket.IO + REST polling via `/api/analytics/*`)
- ✅ Email notification delivery (backend `email.routes.ts` + frontend service wired)
- ✅ Financial forecasting service (wired to existing `/api/financial/forecast` + `/api/analytics/revenue`)
- ✅ Automated reporting (backend `reports.routes.ts` + frontend service wired)

---

## Available Skills (invoke with `/skill-name`)

| Skill                     | Purpose                                                   |
| ------------------------- | --------------------------------------------------------- |
| `/backend-service`        | Express.js routes, controllers, services                  |
| `/database-query`         | Prisma queries for PostgreSQL                             |
| `/debug-issue`            | Diagnose and fix issues across the stack                  |
| `/frontend-design`        | React components with Material-UI                         |
| `/qa-testing`             | Test scenarios and verification                           |
| `/workflow-definitions`   | Machine-readable workflow specs                           |
| `/workflow-verificator`   | Pre-deployment validation                                 |
| `/cleanup-codebase`       | Console.log removal, dead code cleanup                    |
| `/fee-structure`          | 5-tier fee management and calculation                     |
| `/city-restriction`       | Silay City restriction and barangay management            |
| `/implementation-plan`    | Sprint planning and feature prioritization                |
| `/codebase-assessment`    | Quantitative dual-grading (F→A+, /10) across 6 categories |
| `/security-hardening`     | Auth audit, secret scan, input validation, OWASP Top 10   |
| `/performance-profiler`   | Prisma queries, React renders, bundle size, API response  |
| `/migration-helper`       | Prisma migrations, schema evolution, data transforms      |
| `/pwa-offline`            | Service worker, caching, offline queue, install prompt    |
| `/full-system-validation` | 6-phase cross-cutting validation (routes→types→WebSocket) |

---

## Reference Documentation

Located in `.claude/`:

- `AVAILABLE_SKILLS.md` — Full skill catalog with usage examples
- `commands/` — 17 skill definitions (`.md` files)
- `reference/CLAUDE.md` — Reference template (from SI360 project)
- `reference/commands/` — 26 reference command templates (SI360 patterns)
- `reference/docs/` — Setup and validation guides
- `workflows.json` — Machine-readable workflow definitions
- `Workflows.mermaid` — Visual workflow diagrams
