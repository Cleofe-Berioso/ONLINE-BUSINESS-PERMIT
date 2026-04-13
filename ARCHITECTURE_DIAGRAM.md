# Claim Schedule Management - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD (React)                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Calendar   │  │ Blocked Dates│  │ Appointments │    │
│  │  Component   │  │   Component  │  │     Table    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│          │                 │                 │             │
│          └─────────────────┼─────────────────┘             │
│                            ↓                               │
│                  React Query Hooks                         │
│         (useScheduleData, useBlockDate, etc)             │
│                  (Auto-refresh: 30 sec)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────────────────────┐
            │    REST API Endpoints         │
            │                               │
            │ GET    /api/admin/schedules   │
            │ POST   /block-dates           │
            │ DELETE /block-dates/:id       │
            │ PATCH  /appointments/:id      │
            │                               │
            │  + Zod Validation             │
            │  + RBAC Authorization         │
            │  + Error Handling             │
            └───────────────────────────────┘
                            ↓
            ┌───────────────────────────────┐
            │   Prisma ORM Layer            │
            │                               │
            │  ✓ Optimized queries          │
            │  ✓ Select-based (no Decimals) │
            │  ✓ Database transactions      │
            │  ✓ Relation loading           │
            └───────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │     PostgreSQL Database Models        │
        │                                       │
        │ ┌─────────────────────────────────┐  │
        │ │ ClaimSchedule                   │  │
        │ │ ├─ id (CUID)                    │  │
        │ │ ├─ date (unique index)          │  │
        │ │ ├─ isBlocked (boolean)          │  │
        │ │ └─ blockReason (text)           │  │
        │ └─────────────────────────────────┘  │
        │                                       │
        │ ┌─────────────────────────────────┐  │
        │ │ SlotReservation                 │  │
        │ │ ├─ id (CUID)                    │  │
        │ │ ├─ status (indexed)             │  │
        │ │ │  CONFIRMED/COMPLETED/CANCEL   │  │
        │ │ ├─ timeSlot (FK)                │  │
        │ │ ├─ application (FK)             │  │
        │ │ └─ user (FK)                    │  │
        │ └─────────────────────────────────┘  │
        │                                       │
        │ ┌─────────────────────────────────┐  │
        │ │ ActivityLog                     │  │
        │ │ ├─ userId                       │  │
        │ │ ├─ action (BLOCK_DATE, etc)     │  │
        │ │ ├─ entityId                     │  │
        │ │ └─ details (JSON)               │  │
        │ └─────────────────────────────────┘  │
        │                                       │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │        Redis Cache Layer              │
        │  (5-30 min TTL, in-memory fallback)   │
        │                                       │
        │  Keys:                                │
        │  ├─ schedule:stats                    │
        │  ├─ schedule:blocked-dates            │
        │  ├─ schedule:slots:{date}             │
        │  └─ (other app caches)                │
        │                                       │
        └───────────────────────────────────────┘
```

---

## 🔄 Data Flow - Block Date

```
USER ACTION: Click "Block Date" → Opens Modal
                    ↓
        Modal Component (form)
                    ↓
User Enters: date + reason
                    ↓
        Form Validation (Zod)
            ├─ date: valid ISO format
            └─ reason: min 3 characters
                    ↓
        POST /api/admin/schedules/blocked-dates
                    ↓
    API Route (Auth + RBAC Check)
        ├─ Validate session exists
        └─ Ensure user.role = ADMINISTRATOR
                    ↓
        Zod Validation (second check)
                    ↓
Query Database:
├─ Check if schedule exists for date
├─ If yes: Update (isBlocked=true, blockReason)
└─ If no: Create new (date, isBlocked=true)
                    ↓
Create ActivityLog Entry:
├─ userId: current user
├─ action: BLOCK_DATE
├─ entityId: schedule.id
└─ details: { date, reason }
                    ↓
Return Response: { blockedDate }
                    ↓
React Query Invalidates Cache
                    ↓
Auto-refetch GET /api/admin/schedules
                    ↓
Update State: blockedDates + calendar
                    ↓
Close Modal + Show Success Alert
```

---

## 🔄 Data Flow - Complete Appointment

```
USER ACTION: Click "Complete" button
                    ↓
        Confirm before proceeding
                    ↓
        PATCH /api/admin/schedules/appointments/{id}
            Body: { status: "completed" }
                    ↓
    API Route (Auth + RBAC Check)
        ├─ Validate session
        └─ Ensure user.role in [STAFF, ADMINISTRATOR]
                    ↓
    Zod Validation
        └─ status: enum ["completed", "cancelled"]
                    ↓
Query Database:
├─ Find SlotReservation by ID
└─ Verify status = CONFIRMED (cannot redo)
                    ↓
Database TRANSACTION:
├─ Update SlotReservation
│  └─ status: COMPLETED
│  └─ confirmedAt: now()
│
├─ Check if ClaimReference exists
│
├─ If not, create ClaimReference
│  ├─ referenceNumber: generated
│  ├─ applicationId: from reservation
│  ├─ applicantName: from user
│  ├─ businessName: from application
│  └─ status: GENERATED
│
└─ Commit all or rollback
                    ↓
Create ActivityLog Entry:
├─ userId: current user
├─ action: COMPLETE_APPOINTMENT
├─ entityId: reservation.id
└─ details: { applicationId, previousStatus, newStatus }
                    ↓
Return Response: { message, appointment }
                    ↓
React Query Invalidates Cache
                    ↓
Auto-refetch GET /api/admin/schedules
                    ↓
Update State:
├─ Update appointment status
├─ Update stats (completed count +1)
└─ Remove from scheduled list
                    ↓
Show Success Alert
```

---

## 🔄 Data Flow - Display Dashboard

```
USER NAVIGATES TO: /dashboard/admin/schedules
                    ↓
    Browser Loads React Page Component
                    ↓
useScheduleData Hook Initializes:
├─ Query key: ["admin", "schedules"]
├─ Query function: fetch /api/admin/schedules
├─ Refetch interval: 30000 ms
├─ Stale time: 10000 ms
└─ Status: "loading"
                    ↓
API Request Sent:
    GET /api/admin/schedules
                    ↓
    API Route Processing:
    ├─ Auth: check session
    ├─ RBAC: ensure ADMINISTRATOR
    │
    ├─ Fetch stats:
    │  ├─ count CONFIRMED → scheduled
    │  ├─ count COMPLETED → completed
    │  └─ count CANCELLED → cancelled
    │
    ├─ Fetch blocked dates:
    │  └─ select from ClaimSchedule where isBlocked=true
    │
    ├─ Fetch appointments:
    │  ├─ select from SlotReservation (limited to 50)
    │  ├─ include user info
    │  └─ include timeSlot + application
    │
    └─ Transform & return
                    ↓
Response Received: { stats, blockedDates, appointments }
                    ↓
React Query Caches Response:
├─ Store in query cache
├─ Mark as fresh (not stale)
└─ Schedule next refetch in 30 sec
                    ↓
Component Re-renders with Data:
├─ Stats Cards display numbers
├─ Calendar marks blocked dates (red)
├─ Blocked Dates List populated
└─ Appointments Table populated
                    ↓
Auto-refetch Scheduled:
├─ Every 30 seconds
├─ On window focus
├─ On window reconnect
└─ On mutation completion
                    ↓
DISPLAY COMPLETE - READY FOR USER INTERACTION
```

---

## 🛡️ Security Layers

```
Request Arrives at API Route
            ↓
    [LAYER 1] Middleware
├─ Rate limiting (100 req/min)
├─ CSRF protection
└─ Security headers
            ↓
    [LAYER 2] NextAuth Session
├─ Check session exists
├─ Validate JWT token
└─ Extract user info
            ↓
    [LAYER 3] Role-Based Access Control
├─ Check user.role
├─ Verify required role (ADMINISTRATOR)
└─ Reject if unauthorized (403)
            ↓
    [LAYER 4] Input Validation (Zod)
├─ Validate request body structure
├─ Check field types
├─ Verify required fields
└─ Validate field formats & ranges
            ↓
    [LAYER 5] Database Permissions
├─ Prisma queries use parameterized inputs
├─ Prevents SQL injection
└─ Uses Row Level Security (if configured)
            ↓
    [LAYER 6] Activity Logging
├─ Log every action
├─ Record who, what, when, why
└─ For audit & compliance
            ↓
Response Sent with Data
        + Security Headers
```

---

## 📊 Cache Strategy

```
┌────────────────────────────────────┐
│     React Query Client Cache       │
│  (In-Browser, 10 sec stale time)   │
│                                    │
│  Key: ["admin", "schedules"]       │
│  ├─ stats                          │
│  ├─ blockedDates                   │
│  └─ appointments                   │
│                                    │
│  Invalidation Triggers:            │
│  ├─ Block date mutation            │
│  ├─ Unblock date mutation          │
│  ├─ Appointment status change      │
│  └─ Manual refetch (every 30 sec)  │
└────────────────────────────────────┘
            ↓
┌────────────────────────────────────┐
│      Redis Cache Layer             │
│  (Server-side, 5-30 min TTL)       │
│                                    │
│  Keys:                             │
│  ├─ schedule:stats (5 min)         │
│  ├─ schedule:blocked-dates (10 min)│
│  └─ user:permissions (30 min)      │
│                                    │
│  Fallback: In-Memory Cache         │
│  (if Redis unavailable)            │
└────────────────────────────────────┘
            ↓
┌────────────────────────────────────┐
│    PostgreSQL Database             │
│  (Source of Truth)                 │
│                                    │
│  Queries:                          │
│  ├─ Count queries (fast)           │
│  ├─ Indexed lookups (fast)         │
│  └─ Multi-table joins (optimized)  │
└────────────────────────────────────┘
```

---

## 🔌 Component Composition

```
ClaimScheduleManagementPage (Client Component)
├─ useScheduleData() [Hook]
│  ├─ Fetch data (GET /api/admin/schedules)
│  └─ Auto-refresh every 30 sec
│
├─ useBlockDate() [Hook]
│  └─ Mutation: POST /block-dates
│
├─ useRemoveBlockedDate() [Hook]
│  └─ Mutation: DELETE /block-dates/:id
│
├─ useUpdateAppointmentStatus() [Hook]
│  └─ Mutation: PATCH /appointments/:id
│
└─ Renders:
   ├─ Header (title + "Block Date" button)
   ├─ Stats Cards (scheduled, completed, cancelled)
   ├─ StatsCard Sub-component (reusable)
   ├─ Grid Container (responsive)
   │  ├─ CalendarComponent
   │  │  ├─ Month navigation
   │  │  ├─ Calendar grid
   │  │  └─ Legend (today, blocked)
   │  │
   │  └─ BlockedDatesList Component
   │     └─ Maps blocked dates to UI
   │
   ├─ AppointmentsTable Component
   │  └─ Table with action buttons
   │
   └─ BlockDateModal Component
      ├─ Date input
      ├─ Reason textarea
      └─ Submit/Cancel buttons
```

---

## ✨ Performance Flow

```
User loads dashboard
       ↓
Component mounts → useScheduleData triggered
       ↓
Check React Query cache:
├─ If fresh (< 10 sec): Use cached data
└─ If stale (> 10 sec): Fetch from server
       ↓
Request hits Redis cache:
├─ If hit: Return cached (5-30 min)
└─ If miss: Query database
       ↓
Database query (optimized):
├─ Indexes on date, status, userId
├─ Select-based (no extra data)
└─ Limit to 50 records
       ↓
Response cached in Redis (5-30 min)
       ↓
Response cached in React Query (10 sec)
       ↓
Render UI instantly
       ↓
Every 30 sec: Auto-refetch (background)
├─ Check cache first
└─ If fresh, skip fetch
```

---

## 📋 Summary

This architecture ensures:
- ✅ **Speed**: Multi-layer caching (React Query → Redis → DB)
- ✅ **Safety**: RBAC + Zod validation + SQL injection prevention
- ✅ **Safety**: Database transactions for atomic operations
- ✅ **Scalability**: Pagination + indexed queries
- ✅ **Auditability**: Complete activity logging
- ✅ **UX**: Real-time updates (auto-refresh)
- ✅ **Reliability**: Error handling + fallbacks
- ✅ **Maintainability**: Modular components + reusable hooks

